# BookShelf Backend — Implementation Plan

## Context
Building the backend for a simplified Goodreads-like app: a personal book catalogue where users can browse, search, shelve, and review books. Today's scope is the Express + TypeScript REST API only. Data lives in JSON files (no database). The project uses an npm workspaces monorepo so the frontend can be added later.

---

## Directory Structure to Create

```
bookshelf/
├── apps/api/
│   ├── src/
│   │   ├── data/           # FileStore class + 3 singletons
│   │   ├── services/       # Business logic
│   │   ├── routes/         # Express routers + Zod schemas
│   │   ├── middleware/     # errorHandler, validate, notFound, requestLogger
│   │   ├── errors/         # AppError base + NotFoundError, ValidationError, ConflictError
│   │   ├── app.ts          # Express factory (no listen — exports `app` for tests)
│   │   └── index.ts        # Entry point: calls createApp().listen()
│   ├── tests/
│   │   ├── helpers/testDataDir.ts   # Copies seed data to tmp dir, sets DATA_DIR env var
│   │   ├── books.test.ts
│   │   ├── shelves.test.ts
│   │   └── reviews.test.ts
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
├── packages/shared/
│   ├── src/
│   │   ├── types.ts        # Book, Shelf, Review, ApiResponse, ApiError interfaces
│   │   ├── utils.ts        # nowIso() helper
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
├── data/
│   ├── books.json          # ~50 seed books (6 genres)
│   ├── shelves.json        # []
│   └── reviews.json        # []
├── tsconfig.base.json
├── package.json            # root workspace config
└── .gitignore
```

---

## Key Implementation Decisions

### Data layer (`apps/api/src/data/FileStore.ts`)
- `FileStore<T extends { id: string }>` loads the JSON file into a `Map<string, T>` in its constructor
- All reads come from memory; all writes call `fs.writeFileSync` (synchronous write-through — acceptable for single-user JSON store)
- `DATA_DIR` env var controls which directory to read from (default: `path.resolve(process.cwd(), 'data')`) — critical for test isolation
- Three singleton instances: `bookStore`, `shelfStore`, `reviewStore`

### Services layer (`apps/api/src/services/`)
- Pure business logic, no `req`/`res` — throws `AppError` subclasses on failures
- `bookService.deleteBook(id)`: cascades — removes bookId from all shelves, deletes all reviews for the book
- `bookService.searchBooks(q)`: case-insensitive match on title, author, genre
- `bookService.getBookWithReviews(id)`: returns `{ book, reviews }` combined object

### Routes — critical ordering in `apps/api/src/routes/books.ts`
```
router.get('/search', ...)          // MUST be before /:id
router.get('/:id/reviews', ...)
router.post('/:id/reviews', ...)
router.get('/:id', ...)
router.put('/:id', ...)
router.delete('/:id', ...)
router.get('/', ...)
router.post('/', ...)
```

### Middleware stack in `app.ts`
```
express.json() → requestLogger → /api router → notFound → errorHandler
```
`errorHandler` must be last and have four parameters `(err, req, res, next)`.

### ID generation
Use `crypto.randomUUID()` — built into Node 14.17+, avoids the nanoid v5 ESM-only incompatibility with CommonJS ts-jest setup.

### TypeScript config
- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- `paths` alias in `apps/api/tsconfig.json` maps `@bookshelf/shared` to `../../packages/shared/src` for dev (tsx doesn't need the package built first)
- CommonJS modules throughout (simplifies ts-jest)

---

## Dependencies

### Root `package.json`
```json
{ "workspaces": ["packages/*", "apps/*"] }
```

### `packages/shared`
Only `typescript` devDependency — no runtime deps.

### `apps/api` runtime
- `express ^4.19`
- `zod ^3.23`

### `apps/api` devDependencies
- `typescript ^5.4`, `tsx ^4.7` (dev server)
- `jest ^29`, `ts-jest ^29`, `supertest ^7`
- `@types/express`, `@types/node`, `@types/jest`, `@types/supertest`

---

## API Endpoints (all implemented today)

```
GET    /api/books              ?genre= ?year=
GET    /api/books/search       ?q=
GET    /api/books/:id          (returns book + reviews)
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id          (cascades to shelves + reviews)

GET    /api/shelves
POST   /api/shelves
POST   /api/shelves/:id/books
DELETE /api/shelves/:id/books/:bookId

GET    /api/books/:id/reviews
POST   /api/books/:id/reviews
```

---

## Seed Data
~50 books in `data/books.json` across: Technology (10), Fiction (12), Science (8), Non-Fiction (8), Philosophy (6), History (6). `shelves.json` and `reviews.json` start as `[]`.

---

## Test Strategy
- `tests/helpers/testDataDir.ts`: `beforeAll` copies seed JSON to `os.tmpdir()`, sets `process.env.DATA_DIR`. `afterAll` cleans up.
- `jest --runInBand` (sequential) to prevent concurrent JSON file writes
- Integration tests via `supertest(app)` — never calls `listen`
- Cover: list all, filter, search, create, update, delete, 404 handling, 400 validation errors, shelf add/remove, reviews

---

## Verification

```bash
npm install              # install all workspace deps
npm run dev              # tsx watch on apps/api/src/index.ts → http://localhost:3000
npm run test             # jest --runInBand

# Smoke tests
curl http://localhost:3000/api/books
curl "http://localhost:3000/api/books?genre=Fiction"
curl "http://localhost:3000/api/books/search?q=tolkien"
curl -X POST http://localhost:3000/api/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Dune","author":"Frank Herbert","genre":"Fiction","year":1965}'
```
