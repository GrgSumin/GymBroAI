import { chatActions, useChatStore } from "@/app/chatStore";
import type { ChatMessage, ChatPreview } from "@/app/types/chat";

// Runs before EVERY it() in this file — each test starts from a clean store.
beforeEach(() => {
  useChatStore.getState().resetChatState();
});

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    chatId: "c1",
    role: "user",
    content: "hello",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function chat(overrides: Partial<ChatPreview> = {}): ChatPreview {
  return {
    id: "c1",
    title: "New Plan",
    preview: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lastMessageAt: null,
    ...overrides,
  };
}

describe("chatStore", () => {
  it("appends a message to the list", () => {
    // getState() gives you the store outside of React.
    useChatStore.getState().appendMessage(message());

    const { messages } = useChatStore.getState();

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("hello");
  });

  it("keeps message order when appending", () => {
    chatActions.appendMessage(message({ id: "m1", content: "first" }));
    chatActions.appendMessage(message({ id: "m2", role: "assistant", content: "second" }));

    expect(useChatStore.getState().messages.map((entry) => entry.id)).toEqual(["m1", "m2"]);
  });

  it("adds new chats to the front of the list and removes by id", () => {
    chatActions.setChats([chat({ id: "c1" })]);
    chatActions.addChat(chat({ id: "c2" }));

    expect(useChatStore.getState().chats.map((entry) => entry.id)).toEqual(["c2", "c1"]);

    chatActions.removeChat("c2");

    expect(useChatStore.getState().chats.map((entry) => entry.id)).toEqual(["c1"]);
  });

  it("accumulates stream deltas and clears the draft", () => {
    chatActions.appendStreamDraft("Squat ");
    chatActions.appendStreamDraft("3x5");

    expect(useChatStore.getState().streamDraft).toBe("Squat 3x5");

    chatActions.setStreamDraft("");

    expect(useChatStore.getState().streamDraft).toBe("");
  });

  it("resets every slice", () => {
    chatActions.setChats([chat()]);
    chatActions.appendMessage(message());
    chatActions.setActiveChatId("c1");
    chatActions.setIsLoadingChats(true);
    chatActions.setIsLoadingMessages(true);
    chatActions.setIsStreaming(true);
    chatActions.appendStreamDraft("partial");
    chatActions.setError("boom");

    chatActions.resetChatState();

    expect(useChatStore.getState()).toMatchObject({
      chats: [],
      messages: [],
      activeChatId: null,
      isLoadingChats: false,
      isLoadingMessages: false,
      isStreaming: false,
      streamDraft: "",
      error: null,
    });
  });

  it("exposes a referentially stable action set", () => {
    const before = chatActions.appendMessage;

    chatActions.setError("boom");

    expect(useChatStore.getState().appendMessage).toBe(before);
  });
});
