"use client";

import { useCallback, useRef } from "react";
import { chatActions, useIsStreaming } from "@/app/chatStore";
import * as chatApi from "@/app/lib/chat-client/api";
import { readSseStream } from "@/app/lib/chat-client/sse";
import { loadMessages } from "./loadMessages";

export type ChatStreamController = {
  isStreaming: boolean;
  /** Send a turn and consume the SSE response. No-op while a turn is in flight. */
  send: (text: string) => Promise<void>;
  /** Abort the in-flight turn; the server still persists the partial reply. */
  stop: () => void;
};

/**
 * Owns a chat turn's lifecycle: the request, the SSE consumption and the
 * `AbortController` behind the composer's stop button.
 */
export function useChatStream(activeChatId: string | null): ChatStreamController {
  const isStreaming = useIsStreaming();
  // A ref, not state: aborting must not depend on a re-render landing first.
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    chatActions.setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!activeChatId || isStreaming) {
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      chatActions.setIsStreaming(true);
      chatActions.setError(null);
      chatActions.setStreamDraft("");
      let shouldRefreshMessages = false;
      let wasStopped = false;

      try {
        const body = await chatApi.openChatStream(activeChatId, text, controller.signal);

        for await (const event of readSseStream(body)) {
          switch (event.event) {
            case "ack":
              chatActions.appendMessage(event.data.userMessage);
              break;
            case "delta":
              chatActions.appendStreamDraft(event.data.delta);
              break;
            case "done": {
              // Optimistic: the server already persisted this text, but the
              // reconciling reload below happens after the stream closes.
              if (event.data.content.trim()) {
                chatActions.appendMessage({
                  id: crypto.randomUUID(),
                  chatId: activeChatId,
                  role: "assistant",
                  content: event.data.content,
                  createdAt: new Date().toISOString(),
                });
              }
              chatActions.setStreamDraft("");
              break;
            }
            case "error":
              chatActions.setError(event.data.message);
              break;
          }
        }

        chatActions.setChats(await chatApi.fetchChats());
        await loadMessages(activeChatId);
      } catch (sendError) {
        shouldRefreshMessages = true;

        if (controller.signal.aborted) {
          wasStopped = true;
        } else {
          const message = sendError instanceof Error ? sendError.message : "Unable to send message.";
          chatActions.setError(message);
        }
      } finally {
        // Re-read from the DB so a failed or stopped turn still shows whatever
        // the server persisted.
        if (shouldRefreshMessages) {
          await loadMessages(activeChatId);
        }

        if (wasStopped) {
          chatActions.setError("Response stopped.");
        }

        abortControllerRef.current = null;
        chatActions.setIsStreaming(false);
        chatActions.setStreamDraft("");
      }
    },
    [activeChatId, isStreaming]
  );

  return { isStreaming, send, stop };
}
