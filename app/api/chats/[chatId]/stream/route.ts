import { badRequest, requireOwnedChat, requireUserId, unauthorized } from "@/lib/api";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/constants";
import { createCoachTurnStream } from "@/lib/chat/stream";
import {
  autoTitleChat,
  loadRecentHistory,
  persistUserMessage,
  touchChat,
} from "@/lib/chat/turn";
import { SSE_RESPONSE_HEADERS } from "@/lib/sse";

type Params = {
  params: Promise<{ chatId: string }>;
};

type StreamRequest = {
  message: string;
};

export async function POST(req: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return unauthorized();
  }

  const { chatId } = await params;

  let payload: StreamRequest;

  try {
    payload = (await req.json()) as StreamRequest;
  } catch {
    return badRequest("Invalid request body.");
  }

  const message = payload.message?.trim();

  if (!message) {
    return badRequest("Message is required.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return badRequest("Message is too long.");
  }

  const { chat, error } = await requireOwnedChat(chatId, userId);

  if (error) {
    return error;
  }

  const userMessage = await persistUserMessage(chatId, message);

  await autoTitleChat(chatId, chat.title, message, req.signal);
  await touchChat(chatId);

  const history = await loadRecentHistory(chatId);

  return new Response(
    createCoachTurnStream({
      chatId,
      userMessage,
      history,
      signal: req.signal,
    }),
    { headers: SSE_RESPONSE_HEADERS }
  );
}
