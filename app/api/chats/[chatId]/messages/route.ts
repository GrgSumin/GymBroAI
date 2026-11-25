import {
  internalError,
  ok,
  requireOwnedChat,
  requireUserId,
  unauthorized,
} from "@/lib/api";
import { serializeMessage } from "@/lib/chat/serialize";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ chatId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return unauthorized();
  }

  const { chatId } = await params;

  try {
    const { error } = await requireOwnedChat(chatId, userId);

    if (error) {
      return error;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return ok({ messages: messages.map(serializeMessage) });
  } catch (error) {
    console.error("Failed to load messages", error);
    return internalError("Unable to load messages.");
  }
}
