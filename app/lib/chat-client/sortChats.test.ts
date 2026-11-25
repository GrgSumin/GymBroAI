import { sortChatsByRecency } from "@/app/lib/chat-client/sortChats";
import type { ChatPreview } from "@/app/types/chat";

function chat(id: string, updatedAt: string, lastMessageAt: string | null = null): ChatPreview {
  return {
    id,
    title: id,
    preview: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt,
    lastMessageAt,
  };
}

describe("sortChatsByRecency", () => {
  it("orders by lastMessageAt, falling back to updatedAt", () => {
    const chats = [
      chat("oldest", "2026-01-01T00:00:00.000Z"),
      chat("newest", "2026-01-02T00:00:00.000Z", "2026-01-05T00:00:00.000Z"),
      chat("middle", "2026-01-03T00:00:00.000Z"),
    ];

    expect(sortChatsByRecency(chats).map((entry) => entry.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
  });

  it("does not mutate the input", () => {
    const chats = [
      chat("a", "2026-01-01T00:00:00.000Z"),
      chat("b", "2026-01-02T00:00:00.000Z"),
    ];

    sortChatsByRecency(chats);

    expect(chats.map((entry) => entry.id)).toEqual(["a", "b"]);
  });
});
