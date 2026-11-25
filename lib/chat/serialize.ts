import type { ChatMessage, ChatPreview } from "@/app/types/chat";

/** Shape of the Prisma `Chat` columns the API serializes. */
type ChatRow = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
};

/** Shape of the Prisma `ChatMessage` columns the API serializes. */
type ChatMessageRow = {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
};

/** Dates cross the wire as ISO strings; keep that in one place. */
export function serializeChat(chat: ChatRow, preview: string): ChatPreview {
  return {
    id: chat.id,
    title: chat.title,
    updatedAt: chat.updatedAt.toISOString(),
    createdAt: chat.createdAt.toISOString(),
    lastMessageAt: chat.lastMessageAt?.toISOString() ?? null,
    preview,
  };
}

export function serializeMessage(message: ChatMessageRow): ChatMessage {
  return {
    id: message.id,
    chatId: message.chatId,
    role: message.role as ChatMessage["role"],
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
