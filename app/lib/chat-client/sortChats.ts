import type { ChatPreview } from "@/app/types/chat";

/**
 * Most recently active chat first, falling back to `updatedAt` for chats that
 * have no messages yet. Returns a new array; the input is left untouched.
 */
export function sortChatsByRecency(chats: ChatPreview[]): ChatPreview[] {
  return [...chats].sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.updatedAt;
    const bTime = b.lastMessageAt ?? b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}
