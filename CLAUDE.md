# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start API with hot reload (tsx watch)
npm run build            # Build shared package then API

# Testing
npm run test             # Run all tests (jest --runInBand, must be sequential)
npm run test --workspace=apps/api -- --testPathPattern=books  # Single test file

# Per-workspace
npm run build --workspace=packages/shared
npm run build --workspace=apps/api
```

Tests run with `--runInBand` because all tests write to the filesystem and concurrent access causes corruption.

## Architecture

**Monorepo** with npm workspaces:
- `packages/shared` — `@bookshelf/shared`: shared TypeScript types (`Book`, `Shelf`, `Review`, `ApiResponse`, `ApiError`) and the `nowIso()` utility
- `apps/api` — Express REST API that imports from `@bookshelf/shared`
- `data/` — JSON seed files (books.json, shelves.json, reviews.json)

The API imports `@bookshelf/shared` via a TypeScript path alias (`../../packages/shared/src`) so the shared package doesn't need to be built first during development. Jest uses `moduleNameMapper` for the same reason.

### Data Layer (`apps/api/src/data/`)

- **FileStore\<T\>** — Generic JSON-file-backed store. Loads into `Map<string, T>` on construction; all reads hit memory; writes flush synchronously via `fs.writeFileSync`. `DATA_DIR` env var controls the directory (default: `<project>/data`).
- **GenreIndex** — Inverted Map index for O(g) genre queries instead of O(n). Supports exact, prefix, and partial case-insensitive matches. Marks itself stale after writes and rebuilds lazily.
- **data/index.ts** — Lazy singletons for `bookStore`, `shelfStore`, `reviewStore`, and `genreIndex`. `resetStores()` recreates all singletons — called by tests before each suite for isolation.

### Service Layer (`apps/api/src/services/`)

- **bookService**: `deleteBook` cascades — removes the book from all shelves and deletes all its reviews.
- **shelfService**: `addBookToShelf` throws `ConflictError` (409) for duplicate adds.
- **reviewService**: Validates the book exists before creating a review.

### Routes (`apps/api/src/routes/`)

Route order in `books.ts` is intentional: `/search` and `/:id/reviews` must be registered **before** `/:id` to avoid Express matching them as IDs.

```
GET  /api/books/search        — title/author/genre substring match
GET  /api/books/:id/reviews
POST /api/books/:id/reviews
GET  /api/books/:id           — returns book + reviews
PUT  /api/books/:id
DELETE /api/books/:id         — cascades to shelves and reviews
GET  /api/books               — filter by genre, year
POST /api/books

GET  /api/shelves             — optional ?userId filter
POST /api/shelves
POST /api/shelves/:id/books
DELETE /api/shelves/:id/books/:bookId
```

### Validation & Errors

- Zod schemas live in `apps/api/src/routes/schemas.ts`. The `validate(schema)` middleware parses `req.body` and attaches the coerced value; on failure it throws `ValidationError`.
- Error hierarchy: `AppError` (base) → `NotFoundError` (404), `ValidationError` (400, includes flattened Zod details), `ConflictError` (409).
- `errorHandler.ts` is a four-parameter Express middleware — it must remain last in `app.ts`.

### Test Isolation (`apps/api/tests/testDataDir.ts`)

Each test suite's `beforeAll` creates a temp directory, copies the seed JSON files there, sets `DATA_DIR`, and calls `resetStores()`. `afterAll` deletes the temp dir and resets again. This pattern must be used in any new test file.

## Key Constraints

- IDs are generated with `ulid()` (not `nanoid` — v5+ is ESM-only and incompatible with CommonJS).
- `noUncheckedIndexedAccess: true` is enabled — array/map accesses return `T | undefined` and must be guarded.
- All modules are CommonJS (`"module": "CommonJS"` in tsconfig).
