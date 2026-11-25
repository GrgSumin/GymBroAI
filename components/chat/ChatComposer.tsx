"use client";

import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useRef, useState } from "react";

type ChatComposerProps = {
  disabled: boolean;
  isStreaming: boolean;
  onSend: (text: string) => Promise<void>;
  onStop: () => void;
};

/** Grow the textarea with its content, capped by the `max-h-40` class. */
function autoResize(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function ChatComposer({ disabled, isStreaming, onSend, onStop }: ChatComposerProps) {
  // Controlled on purpose: the send button's enabled state is derived from the
  // trimmed value during render, so there is no mirrored state to keep in sync.
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = !disabled && value.trim().length > 0;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
    autoResize(event.target);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = value.trim();

    if (!text || disabled) {
      return;
    }

    setValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "";
    }

    await onSend(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // While an IME candidate window is open, Enter commits the composition.
    if (event.nativeEvent.isComposing) {
      return;
    }

    // Enter sends, Shift+Enter inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-zinc-900 p-2 shadow-[0_14px_28px_rgba(0,0,0,0.35)]">
      <label htmlFor="chat-input" className="sr-only">
        Message GymBroAI
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="chat-input"
          name="chatInput"
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask for your next session plan…"
          autoComplete="off"
          enterKeyHint="send"
          className="max-h-40 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-300/60 focus-visible:outline-none"
        />

        {isStreaming ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onStop}
            aria-label="Stop response"
            className="h-11 w-11 rounded-2xl bg-zinc-950 text-slate-100 hover:bg-zinc-800"
          >
            <Square aria-hidden="true" size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="h-11 w-11 rounded-2xl bg-orange-300 text-zinc-950 hover:bg-orange-200"
            size="icon"
          >
            <Send aria-hidden="true" size={16} />
          </Button>
        )}
      </div>
    </form>
  );
}
