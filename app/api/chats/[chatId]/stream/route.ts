import { fail, requireUserId } from "@/lib/api";
import {
  generateText,
  streamCoachReply,
  type CoachTurn,
} from "@/lib/llama";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ chatId: string }>;
};

type StreamRequest = {
  message: string;
};

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const COACH_INSTRUCTIONS = [
  "You are GymBroAI, a supportive and disciplined fitness coach.",
  "Keep answers concise and practical.",
  "Prioritize safety, recovery, and long-term consistency.",
  "Never provide dangerous advice or medical diagnoses.",
].join(" ");

const DEFAULT_CHAT_TITLE = "New Plan";

const TITLE_INSTRUCTIONS = [
  "Generate a short title for a fitness coaching chat.",
  "Return only the title with no quotes.",
  "Keep it under 6 words and under 60 characters.",
].join(" ");

async function generateChatTitleFromMessage(message: string, signal: AbortSignal) {
  const raw = await generateText(
    `User message: ${message}\n\nChat title:`,
    TITLE_INSTRUCTIONS,
    signal
  );

  const firstLine = raw.split("\n")[0]?.trim() ?? "";
  const withoutQuotes = firstLine.replace(/^['\"`]+|['\"`]+$/g, "").trim();
  return withoutQuotes.slice(0, 60);
}

export async function POST(req: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return fail({ code: "UNAUTHORIZED", message: "Sign in required." }, 401);
  }

  const { chatId } = await params;

  let payload: StreamRequest;

  try {
    payload = (await req.json()) as StreamRequest;
  } catch {
    return fail({ code: "BAD_REQUEST", message: "Invalid request body." }, 400);
  }

  const message = payload.message?.trim();

  if (!message) {
    return fail({ code: "BAD_REQUEST", message: "Message is required." }, 400);
  }

  if (message.length > 4000) {
    return fail({ code: "BAD_REQUEST", message: "Message is too long." }, 400);
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!chat) {
    return fail({ code: "NOT_FOUND", message: "Chat not found." }, 404);
  }

  const userMessage = await prisma.chatMessage.create({
    data: {
      chatId,
      role: "user",
      content: message,
    },
  });

  if (chat.title === DEFAULT_CHAT_TITLE) {
    let nextTitle = message.slice(0, 60);

    try {
      const aiTitle = await generateChatTitleFromMessage(message, req.signal);

      if (aiTitle) {
        nextTitle = aiTitle;
      }
    } catch {
      nextTitle = message.slice(0, 60);
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: { title: nextTitle },
    });
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: { lastMessageAt: new Date() },
  });

  const recentHistory = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      role: true,
      content: true,
    },
  });
  const history = recentHistory.reverse() as CoachTurn[];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        sse("ack", {
          userMessage: {
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content,
            createdAt: userMessage.createdAt.toISOString(),
          },
        })
      );

      let assistantContent = "";

      const persistAssistant = async () => {
        if (!assistantContent.trim()) return;

        await prisma.chatMessage.create({
          data: {
            chatId,
            role: "assistant",
            content: assistantContent,
          },
        });

        await prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() },
        });
      };

      try {
        for await (const chunk of streamCoachReply(
          history,
          COACH_INSTRUCTIONS,
          req.signal
        )) {
          if (chunk.delta) {
            assistantContent += chunk.delta;
            controller.enqueue(sse("delta", { delta: chunk.delta }));
          }
        }

        await persistAssistant();
        controller.enqueue(sse("done", { content: assistantContent }));
        controller.close();
      } catch (error) {
        console.error("Streaming failed", error);

        try {
          await persistAssistant();
        } catch (persistError) {
          console.error("Failed to persist partial assistant message", persistError);
        }

        controller.enqueue(
          sse("error", {
            message: "The response was interrupted. Please retry.",
          })
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
