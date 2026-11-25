import type { ChatMessage, ChatStreamEvent } from "@/app/types/chat";

/**
 * Client half of the hand-written SSE protocol served by
 * `app/api/chats/[chatId]/stream/route.ts`. The wire format is frozen:
 *
 *   event: ack | delta | done | error
 *   data:  <JSON>
 *
 * Events are separated by a blank line and the stream always terminates with
 * `done` or `error`. Anything unrecognised or unparseable is dropped, exactly
 * as the previous inline parser did.
 */

/** One `event:`/`data:` block, before it is narrowed to a `ChatStreamEvent`. */
type RawSseEvent = {
  event: string;
  data: unknown;
};

function parseRawEvents(chunk: string): RawSseEvent[] {
  const events: RawSseEvent[] = [];

  for (const eventBlock of chunk.split("\n\n")) {
    const lines = eventBlock.split("\n");
    const event = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
    const dataText = lines.find((line) => line.startsWith("data:"))?.replace("data:", "").trim();

    if (!event || !dataText) {
      continue;
    }

    try {
      events.push({ event, data: JSON.parse(dataText) as unknown });
    } catch {
      // A truncated or malformed `data:` line is ignored, not fatal.
    }
  }

  return events;
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

/**
 * Narrow a raw block to a typed event, or `null` for event names we do not
 * handle. Payload fields are coerced the same way the page used to coerce them
 * inline, so a malformed payload degrades instead of throwing.
 */
function toChatStreamEvent(raw: RawSseEvent): ChatStreamEvent | null {
  const data = asRecord(raw.data);

  switch (raw.event) {
    case "ack":
      // Trusted: the server echoes the row it just persisted.
      return { event: "ack", data: { userMessage: data.userMessage as ChatMessage } };
    case "delta":
      return { event: "delta", data: { delta: String(data.delta ?? "") } };
    case "done":
      return { event: "done", data: { content: String(data.content ?? "") } };
    case "error":
      return {
        event: "error",
        data: { message: String(data.message ?? "The response was interrupted.") },
      };
    default:
      return null;
  }
}

/** Parse a chunk that already contains whole events. */
export function parseSseChunk(chunk: string): ChatStreamEvent[] {
  return parseRawEvents(chunk)
    .map(toChatStreamEvent)
    .filter((event): event is ChatStreamEvent => event !== null);
}

export type SseParser = {
  /** Feed decoded text; returns every event completed by this chunk. */
  push: (text: string) => ChatStreamEvent[];
};

/**
 * Stateful parser for a byte stream that splits events at arbitrary
 * boundaries: it buffers the trailing partial event until the next chunk.
 * A trailing event with no closing blank line is never emitted, matching the
 * previous behaviour (the route always writes the terminator).
 */
export function createSseParser(): SseParser {
  let buffer = "";

  return {
    push(text) {
      buffer += text;
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      return parts.flatMap((part) => parseSseChunk(`${part}\n\n`));
    },
  };
}

/** Decode and parse an SSE response body to completion. */
export async function* readSseStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser();

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    yield* parser.push(decoder.decode(value, { stream: true }));
  }
}
