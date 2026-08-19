const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const CHAT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiStreamChunk = { candidates?: GeminiCandidate[] };
type GeminiGenerateResponse = { candidates?: GeminiCandidate[] };

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

function buildContents(history: CoachTurn[]) {
  return history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
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

async function fetchGeminiWithRetry(
  url: string,
  init: RequestInit,
  signal?: AbortSignal
): Promise<Response> {
  let lastDetail = "";
  let lastStatus = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, init);

    if (response.ok) return response;

    lastStatus = response.status;
    lastDetail = await response.text().catch(() => "");

    if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS - 1) {
      break;
    }

    const backoff = 500 * 2 ** attempt + Math.floor(Math.random() * 250);
    await sleep(backoff, signal);
  }

  throw new Error(`Gemini failed (${lastStatus}): ${lastDetail.slice(0, 400)}`);
}

export async function* streamCoachReply(
  history: CoachTurn[],
  system: string,
  signal?: AbortSignal
): AsyncGenerator<LlmDelta> {
  const apiKey = getApiKey();

  const response = await fetchGeminiWithRetry(
    `${GEMINI_API_BASE}/models/${CHAT_MODEL}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: buildContents(history),
      }),
      signal,
    },
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
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const dataLine = event
          .split("\n")
          .find((line) => line.startsWith("data:"));
        if (!dataLine) continue;

        const payload = dataLine.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        const chunk = JSON.parse(payload) as GeminiStreamChunk;
        const text = extractText(chunk.candidates);
        if (text) {
          yield { delta: text, done: false };
        }
      }
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
  const apiKey = getApiKey();

  const response = await fetchGeminiWithRetry(
    `${GEMINI_API_BASE}/models/${CHAT_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
      signal,
    },
    signal
  );

  const data = (await response.json()) as GeminiGenerateResponse;
  return extractText(data.candidates).trim();
}
