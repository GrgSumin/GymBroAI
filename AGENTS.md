# AGENTS.md

Operational guide for coding agents working in this repository.

## Project Snapshot

- Framework: Next.js 16 (App Router) + React 19 + TypeScript (strict mode).
- Styling: Tailwind CSS v4 + `tw-animate-css` + utility helper `cn()`.
- Auth: Clerk (`@clerk/nextjs`) with route protection in `middleware.ts`.
- Data: Prisma 7 + PostgreSQL (`@prisma/adapter-pg`, `pg`).
- AI integration: Google Gemini REST API (`gemini-2.0-flash` by default) in API route handlers.
- State: local React state + Zustand store (`app/chatStore.ts`).

## Source of Truth Checked

- Checked for Cursor rules: no `.cursor/rules/` directory found.
- Checked for Cursor rules: no `.cursorrules` file found.
- Checked for Copilot rules: no `.github/copilot-instructions.md` found.
- If any of the above are added later, treat them as higher-priority constraints.

## Install and Run

Package manager is **yarn** (only `yarn.lock` is committed).

- Install deps: `yarn install`
- Start dev server: `yarn dev`
- Production build: `yarn build`
- Start production server: `yarn start`
- Lint entire repo: `yarn lint`

## Build, Lint, and Test Commands

### Build

- Validate production compile: `yarn build`
- Run build after structural routing/API/schema changes.

### Lint

- Full lint: `yarn lint`
- Lint a specific file: `yarn eslint app/api/user-thread/route.ts`
- Lint and auto-fix: `yarn eslint . --fix`

### Tests (Current State)

- There is currently no test runner configured in `package.json`.
- There are currently no `*.test.*` / `*.spec.*` files in the repo.
- Do not invent a test command like `npm test` unless a script is added.

### Single-Test Guidance (When Tests Exist)

- If project adopts Vitest, single file: `yarn vitest run path/to/file.test.ts`
- If project adopts Vitest, single test name: `yarn vitest run path/to/file.test.ts -t "case name"`
- If project adopts Jest, single file: `yarn jest path/to/file.test.ts`
- If project adopts Jest, single test name: `yarn jest path/to/file.test.ts -t "case name"`
- Prefer the script in `package.json` once it exists (for CI parity).

## Prisma and Database Commands

- Generate client: `yarn prisma generate`
- Create/apply local migration: `yarn prisma migrate dev --name <migration_name>`
- Apply migrations (non-interactive): `yarn prisma migrate deploy`
- Open Prisma Studio: `yarn prisma studio`
- Prisma config lives in `prisma.config.ts` and reads env vars.

## Environment Requirements

- Required for DB: `DATABASE_URL`
- Used by Prisma config: `DIRECT_URL` (shadow DB URL)
- Required for AI: `GEMINI_API_KEY` (get a free key at https://aistudio.google.com/apikey)
- Optional for model override: `GEMINI_MODEL` (defaults to `gemini-2.0-flash`)
- Required by Clerk runtime/middleware: Clerk environment variables.
- Never commit `.env` values or secrets to source control.

## Agent Working Rules

- Make focused, minimal changes; avoid broad refactors unless requested.
- Preserve App Router conventions (`app/**/page.tsx`, `layout.tsx`, `route.ts`).
- Keep auth protection assumptions in `middleware.ts` intact.
- Keep Prisma client output path stable unless explicitly migrating setup.
- Validate with lint/build after meaningful code changes.

## TypeScript Guidelines

- TS is strict; maintain explicit, safe types at boundaries.
- Type request/response payloads for API routes.
- Prefer `type` aliases for object shapes and unions in this codebase.
- Use `import type` for type-only imports where practical.
- Avoid `any`; if unavoidable, narrow quickly and document reason inline.
- Prefer null-safe checks for optional data and unauthenticated user states.

## Imports and Module Boundaries

- Use path alias `@/*` for internal imports from project root.
- Keep import groups readable: framework/vendor, then internal modules.
- Avoid deep relative traversals when alias import is available.
- Prefer named imports except where default export is framework convention.
- Do not import server-only modules into client components.

## Naming Conventions

- Components: PascalCase (`Navbar`, `Button`).
- Hooks/stores: `useXxx` for hooks (`useChatStore`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE only for true constants.
- Route handlers must export uppercase HTTP functions (`GET`, `POST`).
- Keep file names aligned with Next conventions (`page.tsx`, `route.ts`).

## Formatting and Style

- Follow existing file-local style when editing (do not reformat unrelated code).
- Most app files use semicolons; preserve semicolon usage in those files.
- Some generated/shadcn-style UI files omit semicolons; preserve local style.
- Use double quotes, matching repository majority.
- Keep lines readable; split long JSX props across lines.
- Prefer small functions and early returns over deep nesting.

## React and Next.js Practices

- Add `"use client"` only when client features are needed.
- Default to Server Components when interactivity is unnecessary.
- Keep client components focused on UI/state, not server secrets.
- Use route handlers in `app/api/**/route.ts` for server-side integrations.
- In layouts/pages, keep data flow predictable and avoid hidden global state.

## API Route and Error Handling Guidelines

- Validate request inputs before calling external services.
- Return structured JSON consistently (e.g., `{ success, data, error }`).
- Use appropriate status codes: 400/401/403/404/500.
- Prefer `console.error` for failures over `console.log` in catch blocks.
- Do not leak secrets or full upstream error objects to clients.
- Include user-safe error messages and keep internal details server-side.

## Data and Prisma Guidelines

- Query by indexed/unique fields where possible (`userId`, etc.).
- Keep schema formatting clean and consistently indented.
- Generate Prisma client after schema updates.
- Avoid schema-breaking changes without migration strategy.
- Keep DB writes inside guarded flows (authenticated user where required).

## UI and Tailwind Guidelines

- Reuse shared UI primitives from `components/ui` when available.
- Use `cn()` helper (`lib/utils.ts`) for conditional class composition.
- Keep Tailwind class lists intentional and maintainable.
- Prefer semantic structure and accessibility-friendly attributes.
- Preserve responsive behavior and avoid layout regressions.

## Pre-PR / Pre-Commit Checklist for Agents

- Run `yarn lint` and fix actionable issues.
- Run `yarn build` for significant routing/server/config/schema changes.
- If tests are added later, run the smallest relevant test scope first.
- Confirm no secrets, tokens, or `.env` values are included in diffs.
- Keep changes scoped to the requested task.

## High-Risk Areas

- `middleware.ts`: auth exposure risk if matcher/public routes change.
- `app/api/**`: external API and auth/data-leak risks.
- `lib/prisma.ts` and `prisma/schema.prisma`: runtime DB connectivity and schema integrity.
- `next.config.ts`: build/runtime behavior changes.

## When Unsure

- Prefer small, reversible changes.
- Document assumptions in PR/commit notes.
- Ask for clarification before destructive or schema-altering operations.
