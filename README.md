# BookShelf

A Goodreads-style book catalogue REST API built with Express and TypeScript. Books, shelves, and reviews are persisted in local JSON files — no database required.

## Prerequisites

- Node.js 18+
- npm 8+ (workspaces support)

## Setup

```bash
# Install all dependencies (root + all workspaces)
npm install

# Build the shared types package, then the API
npm run build
```

## Running the API

```bash
# Development — hot reload via tsx watch
npm run dev

# Production — runs compiled output
npm run start --workspace=apps/api
```

The server starts on `http://localhost:3000` by default. Override with the `PORT` environment variable.

### Data directory

By default the API reads and writes JSON files from the `data/` directory at the project root. Override with the `DATA_DIR` environment variable:

```bash
DATA_DIR=/tmp/my-data npm run dev
```

## Running Tests

```bash
# Run full test suite (must be sequential — tests write to the filesystem)
npm run test

# Run a single test file
npm run test --workspace=apps/api -- --testPathPattern=books
npm run test --workspace=apps/api -- --testPathPattern=shelves
npm run test --workspace=apps/api -- --testPathPattern=reviews
```

Tests copy the seed data into a temporary directory, set `DATA_DIR` to point there, and clean up after themselves — the files in `data/` are never touched.

## API Reference

All responses follow `{ data: T }` on success and `{ error: { code, message } }` on failure.

### Books — `/api/books`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/books` | List all books. Supports `?genre=` and `?year=` query params. |
| `GET` | `/api/books/search?q=` | Search by title, author, or genre (case-insensitive substring). |
| `GET` | `/api/books/:id` | Get a book and its reviews. |
| `POST` | `/api/books` | Create a book. |
| `PUT` | `/api/books/:id` | Update a book (all fields optional). |
| `DELETE` | `/api/books/:id` | Delete a book — cascades to shelves and reviews. |
| `GET` | `/api/books/:id/reviews` | Get all reviews for a book. |
| `POST` | `/api/books/:id/reviews` | Add a review to a book. |

**Create / update book body:**
```json
{
  "title": "string (required, max 200)",
  "author": "string (required, max 100)",
  "genre": "string (required)",
  "year": "number (required, 1000–current year)",
  "isbn": "string (optional)",
  "description": "string (optional, max 2000)",
  "coverUrl": "URL string (optional)"
}
```

**Create review body:**
```json
{
  "userId": "string (required)",
  "rating": "integer 1–5 (required)",
  "text": "string (optional, max 5000)"
}
```

### Shelves — `/api/shelves`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/shelves` | List all shelves. Supports `?userId=` filter. |
| `POST` | `/api/shelves` | Create a shelf. |
| `POST` | `/api/shelves/:id/books` | Add a book to a shelf. Returns 409 if already added. |
| `DELETE` | `/api/shelves/:id/books/:bookId` | Remove a book from a shelf. |

**Create shelf body:**
```json
{
  "userId": "string (required)",
  "name": "string (required, max 100)"
}
```

**Add book to shelf body:**
```json
{
  "bookId": "string (required)"
}
```

### Error codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body or query params failed validation. |
| 404 | `NOT_FOUND` | Resource does not exist. |
| 409 | `CONFLICT` | Duplicate operation (e.g. book already on shelf). |
| 500 | `INTERNAL_ERROR` | Unexpected server error. |

## Project Structure

```
bookshelf/
├── apps/
│   └── api/              # Express REST API
│       ├── src/
│       │   ├── data/     # FileStore (JSON persistence) + GenreIndex
│       │   ├── errors/   # AppError, NotFoundError, ValidationError, ConflictError
│       │   ├── middleware/
│       │   ├── routes/   # books.ts, shelves.ts, schemas.ts (Zod)
│       │   └── services/ # bookService, shelfService, reviewService
│       └── tests/
├── packages/
│   └── shared/           # @bookshelf/shared — shared types and utilities
├── data/                 # books.json, shelves.json, reviews.json (seed data)
└── package.json          # npm workspaces root
```

## Key Design Decisions

- **No database** — all data lives in JSON files managed by `FileStore<T>`, which keeps everything in a `Map` in memory and flushes synchronously on every write.
- **Genre index** — an inverted `Map` index enables fast genre filtering without scanning all books.
- **Cascading deletes** — deleting a book automatically removes it from every shelf and deletes all its reviews.
- **ULID IDs** — IDs are generated with `ulid()` for sortable, collision-free unique keys.
- **Shared types** — `packages/shared` is imported via a TypeScript path alias so it doesn't need to be compiled before the API during development.
