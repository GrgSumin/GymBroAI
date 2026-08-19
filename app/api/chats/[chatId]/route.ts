import { fail, ok, requireUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ chatId: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return fail({ code: "UNAUTHORIZED", message: "Sign in required." }, 401);
  }

  const { chatId } = await params;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: { id: true },
    });

    if (!chat) {
      return fail({ code: "NOT_FOUND", message: "Chat not found." }, 404);
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return ok({ deleted: true });
  } catch (error) {
    console.error("Failed to delete chat", error);
    return fail({ code: "INTERNAL_ERROR", message: "Unable to delete chat." }, 500);
  }
}
