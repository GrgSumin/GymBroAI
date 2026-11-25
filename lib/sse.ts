const encoder = new TextEncoder();

/**
 * Encode one Server-Sent Event frame.
 *
 * The chat client in `app/(app)/chat/page.tsx` hand-parses this format, so the
 * exact bytes (`event:` line, single `data:` line, blank-line terminator) are
 * part of the wire contract — change both sides together.
 */
export function sseEvent(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export const SSE_RESPONSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
} as const;
