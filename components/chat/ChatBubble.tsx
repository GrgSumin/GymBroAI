import type { ChatMessage } from "@/app/types/chat";
import { cn } from "@/lib/utils";

type ChatBubbleProps = {
  role: ChatMessage["role"];
  content: string;
};

/**
 * Internal presentation of a single chat bubble. Kept separate from
 * `MessageBubble` so in-flight text (which has no persisted `ChatMessage` yet)
 * can reuse the exact same chrome without inventing a fake message object.
 */
export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <article
        aria-label={isUser ? "You" : "Coach"}
        className={cn(
          "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[75%]",
          isUser
            ? "bg-gradient-to-br from-orange-300 to-amber-300 text-zinc-950 shadow-[0_10px_24px_rgba(251,146,60,0.22)]"
            : "bg-zinc-950 text-slate-100",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </article>
    </div>
  );
}
