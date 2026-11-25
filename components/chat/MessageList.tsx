"use client";

import type { ChatMessage } from "@/app/types/chat";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useStickToBottom } from "@/components/chat/useStickToBottom";

type MessageListProps = {
  messages: ChatMessage[];
  streamDraft: string;
  loading: boolean;
  isStreaming: boolean;
};

export function MessageList({ messages, streamDraft, loading, isStreaming }: MessageListProps) {
  const hasContent = !loading && (messages.length > 0 || streamDraft.length > 0);

  // A string revision keeps the scroll effect from firing on unrelated
  // re-renders while still tracking appended messages and streamed tokens.
  const revision = `${messages.length}:${messages.at(-1)?.id ?? ""}:${streamDraft.length}`;
  const bottomRef = useStickToBottom(revision, hasContent);

  if (loading) {
    return <p className="p-4 text-sm text-slate-200/70">Loading messages…</p>;
  }

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div>
          <p className="text-4xl">🏋️</p>
          <h1 className="mt-3 text-3xl font-semibold uppercase text-orange-100">Build Momentum</h1>
          <p className="mt-2 text-sm text-slate-200/70">Ask for a plan, form cues, or recovery strategy.</p>
        </div>
      </div>
    );
  }

  return (
    <div role="log" aria-label="Conversation" className="space-y-4 px-2 py-2 sm:px-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      <div aria-live="polite" aria-atomic="false" className="space-y-4">
        {streamDraft ? <ChatBubble role="assistant" content={streamDraft} /> : null}
        {isStreaming ? <p className="px-2 text-xs text-orange-100/70">Coach is typing…</p> : null}
      </div>

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
