import { chatActions } from "@/app/chatStore";
import { fetchMessages } from "@/app/lib/chat-client/api";

/**
 * Load a chat's messages into the store, surfacing failures as the store's
 * `error` and clearing the list so the UI never shows another chat's history.
 *
 * Plain module function rather than a hook: `chatActions` is referentially
 * stable, so there is nothing React-shaped to capture.
 */
export async function loadMessages(chatId: string): Promise<void> {
  const { setIsLoadingMessages, setError, setMessages } = chatActions;

  setIsLoadingMessages(true);
  setError(null);

  try {
    setMessages(await fetchMessages(chatId));
  } catch (fetchError) {
    const message = fetchError instanceof Error ? fetchError.message : "Unable to load messages.";
    setError(message);
    setMessages([]);
  } finally {
    setIsLoadingMessages(false);
  }
}
