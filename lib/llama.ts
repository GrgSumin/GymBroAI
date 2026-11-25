// Google Gemini REST client. The filename is a leftover from the Ollama phase;
// every export here talks to Gemini's `v1beta` generateContent endpoints.
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const CHAT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiStreamChunk = { candidates?: GeminiCandidate[] };
type GeminiGenerateResponse = { candidates?: GeminiCandidate[] };

/** Gemini calls the assistant side of a conversation "model". */
type GeminiRole = "user" | "model";
type GeminiContent = { role: GeminiRole; parts: GeminiPart[] };
type GeminiRequestBody = {
  system_instruction: { parts: GeminiPart[] };
  contents: GeminiContent[];
};

export type CoachTurn = {
  role: "user" | "assistant";
  content: string;
};

export type LlmDelta = {
  delta: string;
  done: boolean;
};

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return key;
}

function toGeminiRole(role: CoachTurn["role"]): GeminiRole {
  return role === "assistant" ? "model" : "user";
}

function buildContents(history: CoachTurn[]): GeminiContent[] {
  return history.map((turn) => ({
    role: toGeminiRole(turn.role),
    parts: [{ text: turn.content }],
  }));
}

function extractText(candidates: GeminiCandidate[] | undefined) {
  if (!candidates?.length) return "";
  const parts = candidates[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("");
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const BACKOFF_BASE_MS = 500;
const BACKOFF_JITTER_MS = 250;

// Gemini delimits SSE events with CRLF; accept LF too so either wire format works.
const SSE_EVENT_DELIMITER = /\r?\n\r?\n/;
const SSE_LINE_DELIMITER = /\r?\n/;

function readEventText(event: string) {
  const dataLine = event
    .split(SSE_LINE_DELIMITER)
    .find((line) => line.startsWith("data:"));
  if (!dataLine) return "";

  const payload = dataLine.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";

  try {
    const chunk = JSON.parse(payload) as GeminiStreamChunk;
    return extractText(chunk.candidates);
  } catch {
    // A truncated frame is not fatal; the next read will carry the rest.
    return "";
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Exponential backoff with jitter, so a shared quota does not retry in lockstep. */
function backoffDelay(attempt: number) {
  return BACKOFF_BASE_MS * 2 ** attempt + Math.floor(Math.random() * BACKOFF_JITTER_MS);
}

/**
 * POST a Gemini request, retrying transient failures (429 plus 5xx) up to
 * `MAX_ATTEMPTS` times. Any other status fails immediately.
 */
async function postGemini(
  path: string,
  body: GeminiRequestBody,
  signal?: AbortSignal
): Promise<Response> {
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
    body: JSON.stringify(body),
    signal,
  };

  let lastDetail = "";
  let lastStatus = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await fetch(`${GEMINI_API_BASE}/${path}`, init);

    if (response.ok) return response;

    lastStatus = response.status;
    lastDetail = await response.text().catch(() => "");

    const isLastAttempt = attempt === MAX_ATTEMPTS - 1;

    if (!RETRYABLE_STATUSES.has(response.status) || isLastAttempt) {
      break;
    }

    await sleep(backoffDelay(attempt), signal);
  }

  throw new Error(`Gemini failed (${lastStatus}): ${lastDetail.slice(0, 400)}`);
}

function buildRequestBody(system: string, contents: GeminiContent[]): GeminiRequestBody {
  return {
    system_instruction: { parts: [{ text: system }] },
    contents,
  };
}

export async function* streamCoachReply(
  history: CoachTurn[],
  system: string,
  signal?: AbortSignal
): AsyncGenerator<LlmDelta> {
  const response = await postGemini(
    `models/${CHAT_MODEL}:streamGenerateContent?alt=sse`,
    buildRequestBody(system, buildContents(history)),
    signal
  );

  if (!response.body) {
    throw new Error("Gemini stream returned no body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (signal?.aborted) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(SSE_EVENT_DELIMITER);
      buffer = events.pop() ?? "";

      for (const event of events) {
        const text = readEventText(event);
        if (text) {
          yield { delta: text, done: false };
        }
      }
    }

    // Flush a final event that arrived without a trailing delimiter.
    const tail = readEventText(buffer);
    if (tail) {
      yield { delta: tail, done: false };
    }
  } finally {
    reader.releaseLock();
  }

  yield { delta: "", done: true };
}

export async function generateText(
  prompt: string,
  system: string,
  signal?: AbortSignal
) {
  const response = await postGemini(
    `models/${CHAT_MODEL}:generateContent`,
    buildRequestBody(system, [{ role: "user", parts: [{ text: prompt }] }]),
    signal
  );

  const data = (await response.json()) as GeminiGenerateResponse;
  return extractText(data.candidates).trim();
}
