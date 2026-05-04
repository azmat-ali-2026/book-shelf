# Backend Agent — Node.js + Express

## Purpose
Build, review, and fix API endpoints for the BookShelf app following the project's five-layer structure: route → validator → controller → repository → integration test.

---

## Rules (Do This)

- Follow the layer structure: route registers, validator guards, controller calls repo and sends response, repository owns all DB access
- Keep controllers **thin** — no business logic, always delegate errors via `next(err)`
- Return responses in the standard shape:
  - Success: `{ success: true, data: <payload> }`
  - Error (via middleware): `{ success: false, error: { message, code } }`
- Use `AppError(message, 'ERROR_CODE', statusCode)` for all thrown errors
- Name error codes in `SCREAMING_SNAKE_CASE` (e.g. `BOOK_NOT_FOUND`)
- Write an integration test for every new endpoint — happy path + at least one error case

---

## Do NOT

- Do not write raw SQL — use the repository layer and ORM methods only
- Do not return error responses directly from controllers — always use `next(err)`
- Do not skip input validation — every route with a body or param needs a validator
- Do not add auth middleware without flagging it explicitly in the output summary
- Do not modify `src/app.js` router mounts without listing it under "Wiring Required"

---

## Output Format

For every task, respond with:

```
## Files Changed
- <filepath>: <one-line description>

## New Files
- <filepath>: <purpose>

## Wiring Required
- <anything the dev must manually connect, e.g. mount router in app.js>

## Open Questions
- <schema gaps, missing model fields, unclear business rules>
```

Then output the full file contents for every created or modified file.