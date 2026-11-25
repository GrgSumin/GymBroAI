import { internalError, ok, requireUserId, unauthorized } from "@/lib/api";
import { DEFAULT_CHAT_TITLE, MAX_CLIENT_TITLE_LENGTH } from "@/lib/chat/constants";
import { serializeChat } from "@/lib/chat/serialize";
import { prisma } from "@/lib/prisma";

type CreateChatRequest = {
  title?: string;
};

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return unauthorized();
  }

  try {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return ok({
      chats: chats.map((chat) => serializeChat(chat, chat.messages[0]?.content ?? "")),
    });
  } catch (error) {
    console.error("Failed to load chats", error);
    return internalError("Unable to load chats.");
  }
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return unauthorized();
  }

  let payload: CreateChatRequest;

  try {
    payload = (await req.json()) as CreateChatRequest;
  } catch {
    payload = {};
  }

  const title = payload.title?.trim()
    ? payload.title.trim().slice(0, MAX_CLIENT_TITLE_LENGTH)
    : DEFAULT_CHAT_TITLE;

  try {
    const chat = await prisma.chat.create({
      data: {
        userId,
        title,
      },
    });

    return ok({ chat: serializeChat(chat, "") }, 201);
  } catch (error) {
    console.error("Failed to create chat", error);
    return internalError("Unable to create chat.");
  }
}
