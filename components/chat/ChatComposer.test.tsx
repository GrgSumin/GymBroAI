import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatComposer } from "@/components/chat/ChatComposer";

function setup(overrides: Partial<Parameters<typeof ChatComposer>[0]> = {}) {
  const onSend = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);
  const onStop = jest.fn();

  render(
    <ChatComposer disabled={false} isStreaming={false} onSend={onSend} onStop={onStop} {...overrides} />,
  );

  return {
    onSend,
    onStop,
    textarea: screen.getByLabelText("Message GymBroAI") as HTMLTextAreaElement,
    user: userEvent.setup(),
  };
}

describe("ChatComposer", () => {
  it("disables sending until there is non-whitespace text", async () => {
    const { user, textarea } = setup();

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();

    await user.type(textarea, "   ");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();

    await user.type(textarea, "plan");
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("sends the trimmed text and clears the textarea", async () => {
    const { user, textarea, onSend } = setup();

    await user.type(textarea, "  leg day  ");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).toHaveBeenCalledWith("leg day");
    expect(textarea).toHaveValue("");
  });

  it("sends on Enter", async () => {
    const { user, textarea, onSend } = setup();

    await user.type(textarea, "push day{Enter}");

    expect(onSend).toHaveBeenCalledWith("push day");
  });

  it("inserts a newline on Shift+Enter instead of sending", async () => {
    const { user, textarea, onSend } = setup();

    await user.type(textarea, "line one{Shift>}{Enter}{/Shift}line two");

    expect(onSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("does not send while an IME composition is active", async () => {
    const { textarea, onSend } = setup();

    await userEvent.setup().type(textarea, "かんじ");
    textarea.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send when disabled", async () => {
    const { user, textarea, onSend } = setup({ disabled: true });

    await user.type(textarea, "anything{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("swaps the send button for a stop button while streaming", async () => {
    const { user, onStop } = setup({ isStreaming: true });

    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stop response" }));

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
