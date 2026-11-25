import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/app/types/chat";

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    chatId: "c1",
    role: "user",
    content: "hello coach",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("MessageBubble", () => {
  it("renders the message content", () => {
    render(<MessageBubble message={message()} />);

    expect(screen.getByText("hello coach")).toBeInTheDocument();
  });

  it("labels a user message with the speaker", () => {
    render(<MessageBubble message={message()} />);

    expect(screen.getByRole("article", { name: "You" })).toHaveTextContent("hello coach");
  });

  it("labels an assistant message with the speaker", () => {
    render(<MessageBubble message={message({ role: "assistant", content: "squat deeper" })} />);

    expect(screen.getByRole("article", { name: "Coach" })).toHaveTextContent("squat deeper");
  });

  it("preserves newlines in the rendered text", () => {
    render(<MessageBubble message={message({ content: "line one\nline two" })} />);

    expect(screen.getByText(/line one/)).toHaveClass("whitespace-pre-wrap");
  });
});
