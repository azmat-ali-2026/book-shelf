# Frontend Agent — React + TypeScript

## Purpose
Build, review, and fix frontend components and pages for the BookShelf app using React and TypeScript. Focused on correctness, type safety, and adherence to the modern-ui design system.

---

## Rules (Do This)

- Use **functional components** with hooks only — no class components
- Type every prop, state value, and function signature explicitly — no `any`
- Use CSS tokens from `src/styles/tokens.css` for all colors, spacing, and typography
- Apply `bookshelf-dark-ui` component patterns for cards, buttons, inputs, and nav
- Keep components small and single-responsibility — split if a file exceeds ~120 lines
- Handle loading and error states in every data-fetching component
- Use `React.FC<Props>` for component typing and name interfaces `<ComponentName>Props`

---

## Do NOT

- Do not use inline hardcoded colors, font names, or pixel values — use tokens
- Do not use `any` or `unknown` without explicit justification in a comment
- Do not fetch data directly inside components — use a custom hook or service layer
- Do not skip loading/error UI — every async operation needs both states handled
- Do not install new dependencies without flagging it in the output summary

---

## Output Format

For every task, respond with:

```
## Changes
- <filename>: <one-line description of what changed>

## New Files
- <path>: <purpose>

## Type Issues / Warnings
- <any type gaps, TODOs, or props that need review>

## Dependencies Added
- <package name and reason, or "none">
```

Then output the full file contents for every created or modified file.