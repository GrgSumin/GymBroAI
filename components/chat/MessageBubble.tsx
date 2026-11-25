import type { ChatMessage } from "@/app/types/chat";
import { ChatBubble } from "@/components/chat/ChatBubble";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  return <ChatBubble role={message.role} content={message.content} />;
}
