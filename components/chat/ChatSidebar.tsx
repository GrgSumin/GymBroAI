import type { ChatPreview } from "@/app/types/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

type ChatSidebarProps = {
  chats: ChatPreview[];
  activeChatId: string | null;
  loading: boolean;
  onCreateChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
};

type ChatSidebarItemProps = {
  chat: ChatPreview;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

function ChatSidebarItem({ chat, isActive, onSelect, onDelete }: ChatSidebarItemProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-2xl px-2 py-2 transition",
        isActive ? "bg-[#24170f]" : "bg-zinc-950 hover:bg-zinc-900",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
        className="min-w-0 flex-1 rounded-xl px-1 text-left text-slate-100 focus-visible:ring-2 focus-visible:ring-orange-200 focus-visible:outline-none"
      >
        <p className="truncate text-sm font-semibold">{chat.title}</p>
        <p className={cn("truncate text-xs", isActive ? "text-orange-100/85" : "text-slate-300/70")}>
          {chat.preview || "No messages yet"}
        </p>
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-zinc-800 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none"
        aria-label={`Delete ${chat.title}`}
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </li>
  );
}

export function ChatSidebar({
  chats,
  activeChatId,
  loading,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  return (
    <aside
      aria-label="Chat history"
      className="flex h-full w-full max-w-80 flex-col rounded-4xl bg-zinc-900 p-3 shadow-[0_16px_34px_rgba(0,0,0,0.38)]"
    >
      <Button
        type="button"
        onClick={onCreateChat}
        className="mb-3 h-11 justify-start gap-2 rounded-2xl bg-orange-300 px-4 text-zinc-950 hover:bg-orange-200 focus-visible:ring-orange-200"
      >
        <Plus aria-hidden="true" size={16} />
        New Chat
      </Button>

      {loading ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="px-3 py-6 text-sm text-slate-200/70">Loading chats…</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="px-3 py-6 text-sm text-slate-200/70">Start your first conversation.</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {chats.map((chat) => (
            <ChatSidebarItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              onSelect={() => onSelectChat(chat.id)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
