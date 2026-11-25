import type { ApiResponse } from "@/app/types/api";
import type {
  ChatDeletedPayload,
  ChatListPayload,
  ChatMessage,
  ChatMessagesPayload,
  ChatPayload,
  ChatPreview,
} from "@/app/types/chat";

/**
 * Typed `fetch` wrappers for `/api/chats/*`. Every call unwraps the frozen
 * `{ success, data } | { success, error }` envelope and throws an `Error`
 * carrying the server's user-safe message, so callers only deal with payloads.
 */

async function unwrap<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.success ? fallbackMessage : body.error.message);
  }

  return body.data;
}

export async function fetchChats(): Promise<ChatPreview[]> {
  const response = await fetch("/api/chats", {
    method: "GET",
    cache: "no-store",
  });

  const data = await unwrap<ChatListPayload>(response, "Unable to load chats.");
  return data.chats;
}

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await unwrap<ChatMessagesPayload>(response, "Unable to load messages.");
  return data.messages;
}

export async function createChat(): Promise<ChatPreview> {
  const response = await fetch("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await unwrap<ChatPayload>(response, "Unable to create chat.");
  return data.chat;
}

export async function deleteChat(chatId: string): Promise<boolean> {
  const response = await fetch(`/api/chats/${chatId}`, {
    method: "DELETE",
  });

  const data = await unwrap<ChatDeletedPayload>(response, "Unable to delete chat.");
  return data.deleted;
}

/**
 * Open the SSE turn for `chatId` and return its body. The request shape
 * (`{ message }`) is frozen. A non-streaming failure response is unwrapped for
 * its error message before throwing.
 */
export async function openChatStream(
  chatId: string,
  message: string,
  signal: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`/api/chats/${chatId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok || !response.body) {
    const fallback = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    throw new Error(
      fallback && !fallback.success ? fallback.error.message : "Unable to send message."
    );
  }

  return response.body;
}
