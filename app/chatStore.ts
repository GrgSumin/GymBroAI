import { create } from "zustand";
import type { ChatMessage, ChatPreview } from "@/app/types/chat";

/**
 * Client state for the chat console. The active chat deliberately lives here
 * rather than in the URL, and there is no `/chat/[id]` route.
 *
 * Consumers should prefer the granular selector hooks at the bottom of this
 * file over `useChatStore()` with no selector: subscribing to the whole store
 * re-renders on every unrelated slice change (a `delta` token bumps
 * `streamDraft` many times per turn).
 */

/** The data slices. */
export type ChatStateData = {
  chats: ChatPreview[];
  messages: ChatMessage[];
  activeChatId: string | null;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  streamDraft: string;
  error: string | null;
};

/** The mutators. Identities are stable for the lifetime of the store. */
export type ChatStateActions = {
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

type ChatState = ChatStateData & ChatStateActions;

const initialChatState: ChatStateData = {
  chats: [],
  messages: [],
  activeChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
  isStreaming: false,
  streamDraft: "",
  error: null,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialChatState,
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
  resetChatState: () => set({ ...initialChatState }),
}));

/**
 * The action set, captured once. Actions are never replaced, so this object is
 * referentially stable and safe to use outside React or as an effect dep —
 * unlike an object rebuilt per render from individual selectors.
 */
export const chatActions: ChatStateActions = (() => {
  const {
    setChats,
    addChat,
    removeChat,
    setMessages,
    appendMessage,
    setActiveChatId,
    setIsLoadingChats,
    setIsLoadingMessages,
    setIsStreaming,
    setStreamDraft,
    appendStreamDraft,
    setError,
    resetChatState,
  } = useChatStore.getState();

  return {
    setChats,
    addChat,
    removeChat,
    setMessages,
    appendMessage,
    setActiveChatId,
    setIsLoadingChats,
    setIsLoadingMessages,
    setIsStreaming,
    setStreamDraft,
    appendStreamDraft,
    setError,
    resetChatState,
  };
})();

/** Granular selectors — each subscribes to exactly one slice. */
export const useChatList = () => useChatStore((state) => state.chats);
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useActiveChatId = () => useChatStore((state) => state.activeChatId);
export const useIsLoadingChats = () => useChatStore((state) => state.isLoadingChats);
export const useIsLoadingMessages = () => useChatStore((state) => state.isLoadingMessages);
export const useIsStreaming = () => useChatStore((state) => state.isStreaming);
export const useStreamDraft = () => useChatStore((state) => state.streamDraft);
export const useChatError = () => useChatStore((state) => state.error);

/** Stable action set; never triggers a re-render. */
export const useChatActions = (): ChatStateActions => chatActions;
