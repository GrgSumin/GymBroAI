import { render, screen } from "@testing-library/react";
import { MessageList } from "@/components/chat/MessageList";
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

describe("MessageList", () => {
  it("shows a loading note while messages are loading", () => {
    render(<MessageList messages={[]} streamDraft="" loading isStreaming={false} />);

    expect(screen.getByText("Loading messages…")).toBeInTheDocument();
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
  });

  it("shows the empty state when there is nothing to render", () => {
    render(<MessageList messages={[]} streamDraft="" loading={false} isStreaming={false} />);

    expect(screen.getByRole("heading", { name: "Build Momentum" })).toBeInTheDocument();
  });

  it("renders every message in a log region", () => {
    render(
      <MessageList
        messages={[message(), message({ id: "m2", role: "assistant", content: "squat deeper" })]}
        streamDraft=""
        loading={false}
        isStreaming={false}
      />,
    );

    expect(screen.getByRole("log", { name: "Conversation" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("renders the streaming draft as an assistant bubble with a typing status", () => {
    render(<MessageList messages={[message()]} streamDraft="warming up" loading={false} isStreaming />);

    expect(screen.getByRole("article", { name: "Coach" })).toHaveTextContent("warming up");
    expect(screen.getByText("Coach is typing…")).toBeInTheDocument();
  });

  it("renders the draft alone when no messages have loaded yet", () => {
    render(<MessageList messages={[]} streamDraft="warming up" loading={false} isStreaming />);

    expect(screen.queryByRole("heading", { name: "Build Momentum" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Coach" })).toHaveTextContent("warming up");
  });

  it("hides the typing status once streaming stops", () => {
    render(<MessageList messages={[message()]} streamDraft="" loading={false} isStreaming={false} />);

    expect(screen.queryByText("Coach is typing…")).not.toBeInTheDocument();
  });
});
