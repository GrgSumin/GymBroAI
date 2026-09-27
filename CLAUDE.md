# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

GymBroAI is an AI fitness coaching app: Next.js 16 App Router + React 19 (React Compiler on), Clerk auth,
Prisma 7 + Postgres, and Google Gemini streamed to the browser over SSE. See `README.md` for setup/env vars
and `AGENTS.md` for the detailed style/convention guide.

## Commands

Package manager is **yarn** — `yarn.lock` is the only committed lockfile. Do not create `package-lock.json`.

```bash
yarn dev                              # dev server
yarn build                            # = prisma generate && next build; run after routing/API/schema changes
yarn lint                             # eslint over the repo
yarn eslint app/api/chats/route.ts    # lint a single file
docker compose up -d postgres         # local Postgres on :5432
yarn prisma generate                  # regenerate client into lib/generated/prisma (also runs on postinstall)
yarn prisma migrate dev --name <name>
yarn prisma studio
```

No test runner is configured and there are no test files. Do not invent a test command.

## Architecture

### Request path for a chat turn

1. `app/(app)/chat/page.tsx` is a single 440-line client component that owns the whole chat UI — there is no
   `/chat/[id]` route. Active chat lives in the Zustand store (`app/chatStore.ts`), not the URL.
2. It POSTs `{ message }` to `app/api/chats/[chatId]/stream/route.ts`, which persists the user message,
   lazily auto-titles the chat (only when `title === "New Plan"`, via a one-shot Gemini call, falling back
   to the message's first 60 chars), bumps `lastMessageAt`, then loads the **last 24 messages** as history.
3. That history — already including the just-persisted user message — is the entire prompt passed to
   `streamCoachReply`; there is no separate "current message" argument. `COACH_INSTRUCTIONS` in the route is
   the system prompt.
4. `lib/llama.ts` — **Gemini, despite the filename** — exposes `streamCoachReply` (async generator over
   Gemini's `?alt=sse` endpoint) and `generateText`, both retrying 429/500/502/503/504 with jittered
   backoff, 4 attempts. `buildContents` maps our `assistant` role to Gemini's `model`.
5. The route re-encodes deltas as its own SSE protocol; the page hand-parses it in `parseSseChunk` and
   cancels in-flight turns through an `AbortController` ref.

### The SSE contract (both sides are hand-written — change them together)

| Event | Payload | Meaning |
| --- | --- | --- |
| `ack` | `{ userMessage }` | user message persisted, echoed with its DB id |
| `delta` | `{ delta }` | token chunk |
| `done` | `{ content }` | full assistant text, already persisted |
| `error` | `{ message }` | stream failed; any partial text was still persisted |

The route always closes with `done` or `error`, and persists partial assistant output on abort/failure so
DB history stays consistent with what the user saw.

### Auth and API envelope

- `proxy.ts` (Next 16's rename of `middleware.ts` — `AGENTS.md` and the `next.config.ts` comment still say
  `middleware.ts`) protects every route except `/`, `/sign-in(.*)`, `/sign-up(.*)`.
- Route handlers additionally call `requireUserId()` from `lib/api.ts` and scope every Prisma query by
  `userId`. `ChatMessage` has **no** `userId` column — message ownership exists only through its `Chat`, so
  every handler must first do `chat.findFirst({ where: { id, userId } })` and 404 before any read/write.
  The middleware alone does not stop cross-user access.
- All `/api/chats/*` responses use `ok(data)` / `fail({ code, message }, status)` →
  `{ success: true, data }` or `{ success: false, error }`. Codes in use: `UNAUTHORIZED`, `BAD_REQUEST`,
  `NOT_FOUND`, `INTERNAL_ERROR`.
- Input caps live in the handlers: message ≤ 4000 chars, generated title ≤ 60, client-supplied title ≤ 80.

### Routing layout

- `app/(app)/` is the only group with a `Navbar` (from its `layout.tsx`): `/chat`, `/profile`.
- `/coaching`, `/programs`, `/transformations` sit outside that group under the root layout, so they render
  without the navbar — intentional, don't "fix" by moving them unless asked.
- The root layout hardcodes `<html className="dark">` and exposes fonts as `--font-display-sans`,
  `--font-display-heading`, `--font-display-mono`.

### Prisma

- The client is generated to `lib/generated/prisma`, **not** `@prisma/client`. Always import the shared
  instance from `@/lib/prisma`, which wires a `pg` `Pool` through `@prisma/adapter-pg` and throws at import
  time if `DATABASE_URL` is missing. It creates the Pool/client at module scope with no `globalThis`
  singleton guard, so dev HMR can accumulate connections — worth knowing when debugging pool exhaustion.
- `schema.prisma`'s `datasource db` block has no `url`; it comes from `prisma.config.ts`, which reads
  `DATABASE_URL` and `DIRECT_URL` (shadow DB) via `dotenv/config`.
- `ChatMessage.chat` cascades on delete, so deleting a `Chat` clears its messages.
- Run `yarn prisma generate` after any schema edit.

### Legacy surface

The app was originally built on OpenAI Assistants. Leftovers, kept but inert:

- `app/api/assistant/*`, `app/api/thread`, `app/api/run/*`, `app/api/message/*` return **410** with raw
  `{ error }` bodies (not the `ok`/`fail` envelope) whose text still references `llama3.2` — stale wording
  from an intermediate Ollama phase.
- `app/api/user-thread/route.ts` and the `Assistant` / `UserThread` models are unused by the chat flow.
- `Chat.openaiThreadId`, `ChatMessage.openaiMessageId`, `ChatMessage.openaiResponseId` are never written.
- `jotai` and `axios` are in `package.json` but imported nowhere — use Zustand and `fetch`.

New work belongs in `app/api/chats/**`. Don't extend the legacy routes.

## Conventions

- Path alias `@/*` maps to the project root.
- TypeScript strict; type API request/response payloads explicitly (see the local `type Params` /
  `type StreamRequest` pattern in each route) and avoid `any`.
- Server Components by default; `"use client"` only where interactivity is needed.
- Shared client types live in `app/types/chat.ts` (`ChatMessage`, `ChatPreview`); dates cross the wire as
  ISO strings, so handlers map Prisma `Date`s with `.toISOString()`.
- Reuse `components/ui` primitives (shadcn new-york, slate base) and `cn()` from `lib/utils.ts`.
- Match file-local formatting — most app files use semicolons and double quotes; some shadcn-style files
  omit semicolons. Don't reformat unrelated code.
- Gemini's free tier is per API key, so the whole userbase shares one quota; there is no per-user rate
  limiting yet. Model override via `GEMINI_MODEL` (default `gemini-2.0-flash`).
