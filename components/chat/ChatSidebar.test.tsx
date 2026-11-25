import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import type { ChatPreview } from "@/app/types/chat";

function chat(overrides: Partial<ChatPreview> = {}): ChatPreview {
  return {
    id: "c1",
    title: "Leg Day",
    preview: "Start with squats",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lastMessageAt: null,
    ...overrides,
  };
}

function setup(overrides: Partial<Parameters<typeof ChatSidebar>[0]> = {}) {
  const handlers = {
    onCreateChat: jest.fn(),
    onSelectChat: jest.fn(),
    onDeleteChat: jest.fn(),
  };

  render(
    <ChatSidebar
      chats={[chat(), chat({ id: "c2", title: "Pull Day", preview: "" })]}
      activeChatId="c1"
      loading={false}
      {...handlers}
      {...overrides}
    />,
  );

  return { ...handlers, user: userEvent.setup() };
}

describe("ChatSidebar", () => {
  it("renders one list item per chat", () => {
    setup();

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Leg Day")).toBeInTheDocument();
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("marks the active chat with aria-current", () => {
    setup();

    expect(screen.getByRole("button", { name: /^Leg Day/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /^Pull Day/ })).not.toHaveAttribute("aria-current");
  });

  it("selects a chat on click", async () => {
    const { user, onSelectChat } = setup();

    await user.click(screen.getByRole("button", { name: /^Pull Day/ }));

    expect(onSelectChat).toHaveBeenCalledWith("c2");
  });

  it("deletes a chat from its labelled icon button", async () => {
    const { user, onDeleteChat } = setup();

    await user.click(screen.getByRole("button", { name: "Delete Pull Day" }));

    expect(onDeleteChat).toHaveBeenCalledWith("c2");
  });

  it("creates a chat from the new chat button", async () => {
    const { user, onCreateChat } = setup();

    await user.click(screen.getByRole("button", { name: /New Chat/ }));

    expect(onCreateChat).toHaveBeenCalledTimes(1);
  });

  it("reaches every chat control by keyboard", async () => {
    const { user } = setup();

    await user.tab();
    expect(screen.getByRole("button", { name: /New Chat/ })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /^Leg Day/ })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Delete Leg Day" })).toHaveFocus();
  });

  it("shows loading and empty states instead of a list", () => {
    const { rerender } = render(
      <ChatSidebar
        chats={[]}
        activeChatId={null}
        loading
        onCreateChat={jest.fn()}
        onSelectChat={jest.fn()}
        onDeleteChat={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading chats…")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    rerender(
      <ChatSidebar
        chats={[]}
        activeChatId={null}
        loading={false}
        onCreateChat={jest.fn()}
        onSelectChat={jest.fn()}
        onDeleteChat={jest.fn()}
      />,
    );

    expect(screen.getByText("Start your first conversation.")).toBeInTheDocument();
  });
});
