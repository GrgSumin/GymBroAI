import { create } from "zustand";
import type { ChatMessage, ChatPreview } from "@/app/types/chat";

type ChatState = {
  chats: ChatPreview[];
  messages: ChatMessage[];
  activeChatId: string | null;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  streamDraft: string;
  error: string | null;
  setChats: (chats: ChatPreview[]) => void;
  addChat: (chat: ChatPreview) => void;
  removeChat: (chatId: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  setActiveChatId: (chatId: string | null) => void;
  setIsLoadingChats: (value: boolean) => void;
  setIsLoadingMessages: (value: boolean) => void;
  setIsStreaming: (value: boolean) => void;
  setStreamDraft: (value: string) => void;
  appendStreamDraft: (delta: string) => void;
  setError: (value: string | null) => void;
  resetChatState: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  messages: [],
  activeChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
  isStreaming: false,
  streamDraft: "",
  error: null,
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  removeChat: (chatId) => set((state) => ({ chats: state.chats.filter((chat) => chat.id !== chatId) })),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setIsLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setStreamDraft: (streamDraft) => set({ streamDraft }),
  appendStreamDraft: (delta) =>
    set((state) => ({
      streamDraft: state.streamDraft + delta,
    })),
  setError: (error) => set({ error }),
  resetChatState: () =>
    set({
      chats: [],
      messages: [],
      activeChatId: null,
      isLoadingChats: false,
      isLoadingMessages: false,
      isStreaming: false,
      streamDraft: "",
      error: null,
    }),
}));
