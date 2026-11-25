import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "node:util";
import { ReadableStream as NodeReadableStream } from "node:stream/web";
import { createSseParser, parseSseChunk, readSseStream } from "@/app/lib/chat-client/sse";

// jsdom ships none of the web streams/encoding globals the SSE reader uses;
// borrow Node's implementations for this suite only.
const globals = globalThis as Record<string, unknown>;
globals.TextEncoder ??= NodeTextEncoder;
globals.TextDecoder ??= NodeTextDecoder;
globals.ReadableStream ??= NodeReadableStream;

function sseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

describe("parseSseChunk", () => {
  it("parses each event type in the frozen protocol", () => {
    const chunk =
      sseEvent("ack", {
        userMessage: {
          id: "m1",
          chatId: "c1",
          role: "user",
          content: "hi",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      }) +
      sseEvent("delta", { delta: "Squat" }) +
      sseEvent("done", { content: "Squat 3x5" }) +
      sseEvent("error", { message: "upstream died" });

    expect(parseSseChunk(chunk)).toEqual([
      {
        event: "ack",
        data: {
          userMessage: {
            id: "m1",
            chatId: "c1",
            role: "user",
            content: "hi",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        },
      },
      { event: "delta", data: { delta: "Squat" } },
      { event: "done", data: { content: "Squat 3x5" } },
      { event: "error", data: { message: "upstream died" } },
    ]);
  });

  it("drops malformed, incomplete and unknown events", () => {
    const chunk =
      "event: delta\ndata: {nope\n\n" + // unparseable JSON
      "data: {\"delta\":\"orphan\"}\n\n" + // no event line
      "event: delta\n\n" + // no data line
      sseEvent("heartbeat", { tick: 1 }) + // not part of the protocol
      sseEvent("delta", { delta: "ok" });

    expect(parseSseChunk(chunk)).toEqual([{ event: "delta", data: { delta: "ok" } }]);
  });

  it("defaults missing payload fields instead of throwing", () => {
    expect(parseSseChunk(sseEvent("delta", {}))).toEqual([{ event: "delta", data: { delta: "" } }]);
    expect(parseSseChunk(sseEvent("done", {}))).toEqual([{ event: "done", data: { content: "" } }]);
    expect(parseSseChunk(sseEvent("error", {}))).toEqual([
      { event: "error", data: { message: "The response was interrupted." } },
    ]);
  });
});

describe("createSseParser", () => {
  it("buffers events split across chunks", () => {
    const parser = createSseParser();
    const wire = sseEvent("delta", { delta: "Squat" }) + sseEvent("delta", { delta: " 3x5" });
    const splitAt = 10;

    expect(parser.push(wire.slice(0, splitAt))).toEqual([]);
    expect(parser.push(wire.slice(splitAt))).toEqual([
      { event: "delta", data: { delta: "Squat" } },
      { event: "delta", data: { delta: " 3x5" } },
    ]);
  });

  it("holds back a trailing event until its blank line arrives", () => {
    const parser = createSseParser();

    expect(parser.push('event: done\ndata: {"content":"x"}')).toEqual([]);
    expect(parser.push("\n\n")).toEqual([{ event: "done", data: { content: "x" } }]);
  });
});

describe("readSseStream", () => {
  it("yields events across arbitrary chunk boundaries", async () => {
    const wire = sseEvent("delta", { delta: "a" }) + sseEvent("done", { content: "a" });
    const encoder = new TextEncoder();
    const chunks = [wire.slice(0, 7), wire.slice(7, 30), wire.slice(30)];

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    const events = [];
    for await (const event of readSseStream(body)) {
      events.push(event);
    }

    expect(events).toEqual([
      { event: "delta", data: { delta: "a" } },
      { event: "done", data: { content: "a" } },
    ]);
  });
});
