import { streamCoachReply, type CoachTurn } from "@/lib/llama";
import { sseEvent } from "@/lib/sse";
import { COACH_INSTRUCTIONS } from "@/lib/chat/constants";
import { persistAssistantMessage, type PersistedUserMessage } from "@/lib/chat/turn";

type CoachTurnStreamOptions = {
  chatId: string;
  userMessage: PersistedUserMessage;
  history: CoachTurn[];
  signal: AbortSignal;
};

/**
 * The response body for one coaching turn.
 *
 * Event sequence (the client parses this by hand — do not change it):
 *   `ack` { userMessage } → zero or more `delta` { delta } → `done` { content }
 * or, if the stream fails or the client aborts, `error` { message } instead of
 * `done`. Whatever partial assistant text was emitted is persisted either way,
 * so DB history always matches what the user saw.
 */
export function createCoachTurnStream({
  chatId,
  userMessage,
  history,
  signal,
}: CoachTurnStreamOptions) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        sseEvent("ack", {
          userMessage: {
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content,
            createdAt: userMessage.createdAt.toISOString(),
          },
        })
      );

      let assistantContent = "";

      const persistAssistant = async () => {
        if (!assistantContent.trim()) return;
        await persistAssistantMessage(chatId, assistantContent);
      };

      try {
        for await (const chunk of streamCoachReply(
          history,
          COACH_INSTRUCTIONS,
          signal
        )) {
          if (chunk.delta) {
            assistantContent += chunk.delta;
            controller.enqueue(sseEvent("delta", { delta: chunk.delta }));
          }
        }

        await persistAssistant();
        controller.enqueue(sseEvent("done", { content: assistantContent }));
        controller.close();
      } catch (error) {
        console.error("Streaming failed", error);

        try {
          await persistAssistant();
        } catch (persistError) {
          console.error("Failed to persist partial assistant message", persistError);
        }

        controller.enqueue(
          sseEvent("error", {
            message: "The response was interrupted. Please retry.",
          })
        );
        controller.close();
      }
    },
  });
}
