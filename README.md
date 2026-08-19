# GymBroAI

An AI fitness coaching app. Sign in, start a chat, and get streamed coaching replies from a Gemini-backed
assistant that keeps its answers concise, safety-first, and focused on long-term consistency. Chats are
persisted per user, auto-titled from your first message, and can be revisited or deleted from the sidebar.

Alongside the chat there are content pages for coaching, programs, and transformations. Only the landing
page and the sign-in/sign-up routes are public — everything else is behind Clerk auth.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript (strict), with the React Compiler enabled
- **Tailwind CSS v4** and shadcn-style UI primitives
- **Clerk** for authentication
- **Prisma 7** + **PostgreSQL**
- **Google Gemini** (`gemini-2.0-flash` by default) for chat, streamed to the browser over Server-Sent Events
- **Zustand** for client chat state

## Prerequisites

- Node.js 20+
- Yarn (this repo is yarn-only — `yarn.lock` is the committed lockfile)
- Docker, if you want to run Postgres locally
- A Clerk application (free tier is fine)
- A Gemini API key — free at https://aistudio.google.com/apikey

## Getting started

**1. Install dependencies**

```bash
yarn install
```

**2. Configure environment**

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | From your Clerk dashboard |
| `CLERK_SECRET_KEY` | yes | From your Clerk dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | yes | e.g. `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | yes | e.g. `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | yes | e.g. `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | yes | e.g. `/` |
| `DATABASE_URL` | yes | Postgres connection string — the app throws on startup without it |
| `DIRECT_URL` | yes | Shadow database URL used by Prisma migrations |
| `GEMINI_API_KEY` | yes | https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.0-flash` |

For local Postgres via Docker, both URLs can be:

```
postgresql://postgres:postgres@localhost:5432/gymbroai
```

**3. Start the database**

```bash
docker compose up -d postgres
```

**4. Set up Prisma**

```bash
yarn prisma generate
yarn prisma migrate dev
```

**5. Run the dev server**

```bash
yarn dev
```

Open http://localhost:3000. Everything except the landing page and the sign-in/sign-up routes requires
authentication, so create an account first, then head to `/chat`.

## Commands

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn build` | Production build — run this after routing, API, or schema changes |
| `yarn start` | Serve the production build |
| `yarn lint` | Lint the repo (`yarn eslint <path>` for a single file) |
| `yarn prisma generate` | Regenerate the Prisma client into `lib/generated/prisma` |
| `yarn prisma migrate dev --name <name>` | Create and apply a local migration |
| `yarn prisma migrate deploy` | Apply migrations non-interactively |
| `yarn prisma studio` | Browse the database |
| `docker compose up -d postgres` | Start local Postgres on port 5432 |

There is no test runner configured in this project.

## Project layout

```
app/(app)/          Authenticated shell — chat and profile
app/api/chats/      Chat CRUD plus the SSE streaming endpoint
app/coaching/       Content pages under the root layout
app/programs/
app/transformations/
components/chat/    Composer, sidebar, message list and bubbles
components/ui/      shadcn-style primitives
lib/llama.ts        Gemini client (streaming + one-shot). Filename is legacy.
lib/prisma.ts       Shared Prisma client
lib/api.ts          Auth helper and the { success, data | error } response envelope
proxy.ts            Clerk route protection (Next 16 renamed middleware to proxy)
prisma/schema.prisma
```

## Deploying to Vercel

The app is serverless-safe — Gemini is called over HTTPS, Postgres goes through a connection pool, and
Clerk handles auth.

1. Provision hosted Postgres (Neon, Supabase, or Vercel Postgres) and set `DATABASE_URL` / `DIRECT_URL`
   in your Vercel project environment.
2. Add the Clerk variables — use your **production** keys, not the `pk_test_` / `sk_test_` ones.
3. Add `GEMINI_API_KEY` (and `GEMINI_MODEL` if overriding).
4. Run `yarn prisma migrate deploy` once against the hosted database.
5. Deploy.

Note that Gemini's free tier is billed per API key, not per end user, so the whole userbase shares one
quota. Sign-in is required for every `/api/chats/*` route, but there is no per-user rate limiting yet.
