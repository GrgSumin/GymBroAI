export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  chatId: string;
  role: ChatRole;
  content: string;
  /** ISO 8601 — dates cross the wire as strings. */
  createdAt: string;
};

export type ChatPreview = {
  id: string;
  title: string;
  preview: string;
  /** ISO 8601 — dates cross the wire as strings. */
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
};

/* ---------------------------------------------------------------------------
 * `/api/chats/*` payloads (the `data` half of the `{ success, data }` envelope)
 * ------------------------------------------------------------------------- */

export type ChatListPayload = { chats: ChatPreview[] };
export type ChatPayload = { chat: ChatPreview };
export type ChatMessagesPayload = { messages: ChatMessage[] };
export type ChatDeletedPayload = { deleted: boolean };

/* ---------------------------------------------------------------------------
 * The SSE protocol of `/api/chats/[chatId]/stream` (frozen — both sides are
 * hand-written). The stream always terminates with `done` or `error`.
 * ------------------------------------------------------------------------- */

/** User message persisted, echoed back with its DB id. */
export type ChatStreamAckEvent = {
  event: "ack";
  data: { userMessage: ChatMessage };
};

/** Token chunk. */
export type ChatStreamDeltaEvent = {
  event: "delta";
  data: { delta: string };
};

/** Full assistant text, already persisted. */
export type ChatStreamDoneEvent = {
  event: "done";
  data: { content: string };
};

/** Stream failed; any partial text was still persisted. */
export type ChatStreamErrorEvent = {
  event: "error";
  data: { message: string };
};

export type ChatStreamEvent =
  | ChatStreamAckEvent
  | ChatStreamDeltaEvent
  | ChatStreamDoneEvent
  | ChatStreamErrorEvent;

export type ChatStreamEventName = ChatStreamEvent["event"];
