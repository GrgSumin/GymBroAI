"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ChatPreview } from "@/app/types/chat";
import {
  chatActions,
  useActiveChatId,
  useChatList,
  useIsLoadingChats,
} from "@/app/chatStore";
import * as chatApi from "@/app/lib/chat-client/api";
import { sortChatsByRecency } from "@/app/lib/chat-client/sortChats";
import { loadMessages } from "./loadMessages";

export type ChatsController = {
  /** Chats ordered most recently active first. */
  chats: ChatPreview[];
  activeChatId: string | null;
  isLoadingChats: boolean;
  selectChat: (chatId: string) => Promise<void>;
  createChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
};

/**
 * Owns the chat list: hydration on mount, selection, creation and deletion.
 *
 * The active chat lives in the store, not the URL; `?chat=` is kept in sync
 * purely as a shareable/bookmarkable hint and is read once on mount.
 */
export function useChats(): ChatsController {
  const router = useRouter();
  const chats = useChatList();
  const activeChatId = useActiveChatId();
  const isLoadingChats = useIsLoadingChats();

  const sortedChats = sortChatsByRecency(chats);

  /** Create a chat, make it active and clear the transcript. Throws on failure. */
  const createChat = useCallback(async () => {
    chatActions.setError(null);

    const chat = await chatApi.createChat();

    chatActions.addChat(chat);
    chatActions.setActiveChatId(chat.id);
    chatActions.setMessages([]);
    router.replace(`/chat?chat=${chat.id}`);

    return chat;
  }, [router]);

  /** Open `chatId`: activate it, mirror it into the URL, load its messages. */
  const activateChat = useCallback(
    async (chatId: string) => {
      chatActions.setActiveChatId(chatId);
      router.replace(`/chat?chat=${chatId}`);
      await loadMessages(chatId);
    },
    [router]
  );

  const hydrateChats = useCallback(async () => {
    chatActions.setIsLoadingChats(true);
    chatActions.setError(null);

    try {
      const fetchedChats = await chatApi.fetchChats();
      chatActions.setChats(fetchedChats);

      const requestedChatId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("chat")
          : null;

      const nextChatId = requestedChatId
        ? fetchedChats.find((chat) => chat.id === requestedChatId)?.id ?? null
        : fetchedChats[0]?.id ?? null;

      if (nextChatId) {
        await activateChat(nextChatId);
      } else {
        const createdChat = await createChat();
        await loadMessages(createdChat.id);
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load chats.";
      chatActions.setError(message);
    } finally {
      chatActions.setIsLoadingChats(false);
    }
  }, [activateChat, createChat]);

  useEffect(() => {
    hydrateChats();
  }, [hydrateChats]);

  const selectChat = useCallback(
    async (chatId: string) => {
      chatActions.setActiveChatId(chatId);
      router.replace(`/chat?chat=${chatId}`);
      chatActions.setStreamDraft("");
      await loadMessages(chatId);
    },
    [router]
  );

  const handleCreateChat = useCallback(async () => {
    try {
      await createChat();
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to create chat.";
      chatActions.setError(message);
    }
  }, [createChat]);

  const deleteChat = useCallback(
    async (chatId: string) => {
      const confirmed = window.confirm("Delete this chat permanently?");

      if (!confirmed) {
        return;
      }

      chatActions.setError(null);

      try {
        await chatApi.deleteChat(chatId);
        chatActions.removeChat(chatId);

        if (activeChatId !== chatId) {
          return;
        }

        // Fall through to the next most recent chat, or start a fresh one so
        // the console is never left without an active chat.
        const nextChat = sortedChats.filter((chat) => chat.id !== chatId)[0] ?? null;

        if (nextChat) {
          await activateChat(nextChat.id);
          return;
        }

        const createdChat = await createChat();
        await loadMessages(createdChat.id);
      } catch (deleteError) {
        const message = deleteError instanceof Error ? deleteError.message : "Unable to delete chat.";
        chatActions.setError(message);
      }
    },
    [activateChat, activeChatId, createChat, sortedChats]
  );

  return {
    chats: sortedChats,
    activeChatId,
    isLoadingChats,
    selectChat,
    createChat: handleCreateChat,
    deleteChat,
  };
}
