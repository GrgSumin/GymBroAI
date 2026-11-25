import {
  internalError,
  ok,
  requireOwnedChat,
  requireUserId,
  unauthorized,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ chatId: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
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

    // ChatMessage.chat cascades, so this clears the chat's messages too.
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return ok({ deleted: true });
  } catch (error) {
    console.error("Failed to delete chat", error);
    return internalError("Unable to delete chat.");
  }
}
