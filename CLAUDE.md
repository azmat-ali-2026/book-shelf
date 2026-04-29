# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookShelf is a Goodreads-like monorepo REST API + web frontend for browsing, searching, shelving, and reviewing books.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 |
| API framework | Express 4 + TypeScript (CommonJS) |
| Validation | Zod (API schemas) |
| Data | JSON files via in-memory FileStore |
| Tests | Jest + Supertest (`--runInBand` — mandatory) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Frontend data | TanStack Query + Axios |
| Frontend forms | Formik + Zod |

## Commands

```bash
# API (terminal 1)
npm run dev              # tsx watch on apps/api/src/index.ts → http://localhost:3000
npm run dev:web          # Vite dev server → http://localhost:3001 (proxies /api → :3000)

# Build
npm run build            # shared then API
npm run build:web        # Vite production build

# Tests — always sequential (concurrent writes corrupt JSON files)
npm run test                                                             # all tests
npm run test --workspace=apps/api -- --testPathPattern=books            # single file
```

## Architecture

**Monorepo** — npm workspaces: `packages/shared`, `apps/api`, `apps/web`.

`packages/shared` exports TypeScript types (`Book`, `Shelf`, `Review`, `ApiResponse`, `ApiError`) and `nowIso()`. The API imports it via a path alias (`../../packages/shared/src`) so the package never needs to be built first; Jest uses `moduleNameMapper` for the same reason.

### API layers (`apps/api/src/`)

**Data** → **Services** → **Routes** → Express

- `data/FileStore<T>` — loads JSON into `Map<string, T>` on construction; reads from memory; writes via `fs.writeFileSync`. Controlled by `DATA_DIR` env var.
- `data/GenreIndex` — inverted index for O(1) genre lookups; marks stale after writes and rebuilds lazily.
- `data/index.ts` — exports lazy singletons `bookStore`, `shelfStore`, `reviewStore`, `genreIndex`. **`resetStores()`** re-creates all of them — required in tests before each suite.
- `services/bookService` — `deleteBook` cascades: removes book from all shelves, deletes all its reviews. Genre mutations must call `genreIndex.invalidate()`.
- `services/shelfService` — `addBookToShelf` throws `ConflictError` (409) on duplicate.
- `routes/books.ts` — route order is load-bearing: `/search` and `/:id/reviews` must be registered **before** `/:id`.

**Error hierarchy:** `AppError` → `NotFoundError` (404) | `ValidationError` (400) | `ConflictError` (409). `errorHandler.ts` must remain the **last** middleware in `app.ts` (four-parameter signature).

### Frontend layers (`apps/web/src/`)

**API** → **Hooks** → **Pages / Components**

- `api/client.ts` — Axios instance; response interceptor converts HTTP errors into typed `ApiRequestError`.
- `api/books.ts` / `api/shelves.ts` — typed async functions; unwrap `{ data: T }` wrapper from every response.
- `hooks/queryKeys.ts` — single source of truth for all TanStack Query cache keys.
- `hooks/useBooks.ts` / `hooks/useShelves.ts` — all `useQuery` / `useMutation` definitions; mutations invalidate the relevant `queryKeys.*` on success.
- `lib/zodFormik.ts` — `toFormikValidate(schema)` bridges a Zod schema to Formik's `validate` prop.
- `schemas/` — one Zod schema per form (`bookFormSchema`, `shelfFormSchema`, `reviewFormSchema`).

## Conventions

- Arrow functions for all function declarations and component definitions — no `function` keyword.
- Early returns over nested if/else.
- API response shape: `{ data: T }` on success; `{ error: { code, message, details? } }` on failure.
- No `any` — use `unknown` and narrow (e.g. `axios.isAxiosError`, `instanceof`).
- Formik forms: bind inputs with `formik.getFieldProps(name)`; show errors only when `formik.touched[field]` is true; surface server errors via `formik.setStatus`.

## Data Layer

- All persistent data lives in `/data/*.json` (books, shelves, reviews).
- Access data **only** through `apps/api/src/data/` — never read/write JSON files directly from routes or services.
- IDs use `ulid()` — not `nanoid` (v5+ is ESM-only, incompatible with CommonJS Jest).

## Test Isolation

Every new test file must follow the pattern in `apps/api/tests/helpers/testDataDir.ts`:
1. `beforeAll` — copy seed JSON to a temp dir, set `DATA_DIR`, call `resetStores()`.
2. `afterAll` — delete temp dir, call `resetStores()`.

Skipping this causes tests to corrupt the real seed data and bleed state between suites.

## TypeScript Constraints

- `noUncheckedIndexedAccess: true` — all array/Map accesses return `T | undefined`; guard before use.
- All API modules are CommonJS (`"module": "CommonJS"`).
- `apps/api/tsconfig.json` covers `src/` only. Tests use `tsconfig.test.json` (configured in `jest.config.js` and used by the IDE for type checking inside `tests/`).

## What NOT to Do

- Don't add a real database — the JSON file store is intentional.
- Don't add npm dependencies without discussion.
- Don't use `console.log` — the API has a `requestLogger` middleware for HTTP logging.
- Don't modify `packages/shared` types without updating both `apps/api` and `apps/web` usages.
- Don't use `function` declarations — use arrow functions consistently.
- Don't skip `resetStores()` in new test files.
- Don't register new Express routes without checking order sensitivity in `books.ts`.
