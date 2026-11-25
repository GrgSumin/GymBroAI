import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: ApiError, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export function unauthorized(message = "Sign in required.") {
  return fail({ code: "UNAUTHORIZED", message }, 401);
}

export function badRequest(message: string) {
  return fail({ code: "BAD_REQUEST", message }, 400);
}

export function notFound(message: string) {
  return fail({ code: "NOT_FOUND", message }, 404);
}

export function internalError(message: string) {
  return fail({ code: "INTERNAL_ERROR", message }, 500);
}

export async function requireUserId() {
  const { userId } = await auth();
  return userId;
}

/** The only chat fields the ownership check exposes; enough for every handler. */
export type OwnedChat = {
  id: string;
  title: string;
};

export type OwnedChatResult =
  | { chat: OwnedChat; error: null }
  | { chat: null; error: NextResponse };

/**
 * Resolve a chat that `userId` owns, or a ready-to-return 404.
 *
 * `ChatMessage` has no `userId` column — message ownership exists *only* through
 * its `Chat`. Clerk middleware proves the caller is signed in, not that they own
 * this chat, so every handler touching a chat or its messages must pass through
 * here (and return `error` when set) before any read or write.
 *
 *     const { chat, error } = await requireOwnedChat(chatId, userId);
 *     if (error) return error;
 */
export async function requireOwnedChat(
  chatId: string,
  userId: string
): Promise<OwnedChatResult> {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    select: { id: true, title: true },
  });

  if (!chat) {
    return { chat: null, error: notFound("Chat not found.") };
  }

  return { chat, error: null };
}
