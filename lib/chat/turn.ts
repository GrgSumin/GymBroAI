import { generateText, type CoachTurn } from "@/lib/llama";
import { prisma } from "@/lib/prisma";
import {
  CHAT_HISTORY_LIMIT,
  DEFAULT_CHAT_TITLE,
  MAX_GENERATED_TITLE_LENGTH,
  TITLE_INSTRUCTIONS,
} from "@/lib/chat/constants";

export type PersistedUserMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

/** Ask the model for a title, falling back to the caller's own default. */
async function generateChatTitleFromMessage(message: string, signal: AbortSignal) {
  const raw = await generateText(
    `User message: ${message}\n\nChat title:`,
    TITLE_INSTRUCTIONS,
    signal
  );

  const firstLine = raw.split("\n")[0]?.trim() ?? "";
  const withoutQuotes = firstLine.replace(/^['\"`]+|['\"`]+$/g, "").trim();
  return withoutQuotes.slice(0, MAX_GENERATED_TITLE_LENGTH);
}

export function fallbackChatTitle(message: string) {
  return message.slice(0, MAX_GENERATED_TITLE_LENGTH);
}

export async function persistUserMessage(
  chatId: string,
  content: string
): Promise<PersistedUserMessage> {
  return prisma.chatMessage.create({
    data: { chatId, role: "user", content },
  });
}

export async function persistAssistantMessage(chatId: string, content: string) {
  await prisma.chatMessage.create({
    data: { chatId, role: "assistant", content },
  });

  await touchChat(chatId);
}

export async function touchChat(chatId: string) {
  await prisma.chat.update({
    where: { id: chatId },
    data: { lastMessageAt: new Date() },
  });
}

/**
 * Title a chat that still carries the placeholder title, from its first message.
 * A failed or aborted title call is never fatal: the message's first characters
 * are used instead.
 */
export async function autoTitleChat(
  chatId: string,
  currentTitle: string,
  message: string,
  signal: AbortSignal
) {
  if (currentTitle !== DEFAULT_CHAT_TITLE) return;

  let nextTitle = fallbackChatTitle(message);

  try {
    const aiTitle = await generateChatTitleFromMessage(message, signal);

    if (aiTitle) {
      nextTitle = aiTitle;
    }
  } catch {
    nextTitle = fallbackChatTitle(message);
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: { title: nextTitle },
  });
}

/**
 * The last `CHAT_HISTORY_LIMIT` messages in chronological order. This already
 * includes the just-persisted user message, so it *is* the whole prompt.
 */
export async function loadRecentHistory(chatId: string): Promise<CoachTurn[]> {
  const recentHistory = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: CHAT_HISTORY_LIMIT,
    select: { role: true, content: true },
  });

  return recentHistory.reverse() as CoachTurn[];
}
