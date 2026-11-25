"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageList } from "@/components/chat/MessageList";
import {
  useChatError,
  useChatMessages,
  useIsLoadingMessages,
  useStreamDraft,
} from "@/app/chatStore";
import { useChats } from "./useChats";
import { useChatStream } from "./useChatStream";

export default function ChatPage() {
  const { chats, activeChatId, isLoadingChats, selectChat, createChat, deleteChat } = useChats();
  const { isStreaming, send, stop } = useChatStream(activeChatId);

  const messages = useChatMessages();
  const streamDraft = useStreamDraft();
  const isLoadingMessages = useIsLoadingMessages();
  const error = useChatError();

  return (
    <div className="h-[calc(100dvh-56px)] bg-black p-3 sm:p-5">
      <div className="mx-auto grid h-full max-w-7xl gap-3 lg:grid-cols-[300px_1fr]">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          loading={isLoadingChats}
          onCreateChat={createChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
        />

        <section className="relative flex min-h-0 flex-col rounded-4xl bg-zinc-900 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.38)]">
          <div className="mb-3 rounded-2xl bg-zinc-950 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-100">Coach Console</p>
            <div aria-live="polite">{error ? <p className="mt-1 text-sm text-rose-300">{error}</p> : null}</div>
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <MessageList
              messages={messages}
              streamDraft={streamDraft}
              loading={isLoadingMessages}
              isStreaming={isStreaming}
            />
          </main>

          <div className="pt-3">
            <ChatComposer
              disabled={!activeChatId || isLoadingChats}
              isStreaming={isStreaming}
              onSend={send}
              onStop={stop}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
