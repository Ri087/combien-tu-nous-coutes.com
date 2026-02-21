# Pre-Commit Checklist

> Run through this checklist before considering any task done.
> Every item must pass. If any fails, fix it before finishing.

## Automated Checks

Run these commands and ensure they pass with zero errors:

```bash
# 1. Lint + TypeScript type checking
pnpm checks

# 2. Full production build
pnpm build

# 3. Push schema (only if you modified /db/schema/)
pnpm db:push
```

---

## Manual Checklist

### TypeScript Strict Mode

- [ ] **No `any` types** -- use proper types or `unknown`
- [ ] **No `@ts-ignore` or `@ts-expect-error`** -- fix the type error properly
- [ ] **No untyped function parameters** -- all parameters must have types
- [ ] **No implicit `any` returns** -- function return types should be inferable
- [ ] **No type assertions (`as any`)** -- find the correct type instead

How to check:
```bash
# TypeScript compiler catches all of these
pnpm checks
```

### AlignUI Components

- [ ] **All UI elements use AlignUI components** from `/components/ui/`
- [ ] **No raw HTML** for buttons, inputs, modals, selects, etc.
- [ ] **Form fields use form wrappers** from `/components/form/`
- [ ] **Icons use `@remixicon/react`**

How to check: Search your new files for raw HTML elements:
```bash
# These should NOT appear in your feature code
grep -n "<button " app/(application)/[feature]/**/*.tsx
grep -n "<input " app/(application)/[feature]/**/*.tsx
grep -n "<select " app/(application)/[feature]/**/*.tsx
```

### Feature-First Structure

- [ ] **Page is in `/app/(application)/[feature]/page.tsx`**
- [ ] **Components are in `/app/(application)/[feature]/_components/`**
- [ ] **Hooks are in `/app/(application)/[feature]/_hooks/`** (if any)
- [ ] **Actions are in `/app/(application)/[feature]/_actions/`** (if any)
- [ ] **No feature code in `/components/`** (that is for shared components only)

### Database Schema

- [ ] **Schema files in `/db/schema/[feature]/`** with `schema.ts`, `relations.ts`, `types.ts`, `index.ts`
- [ ] **Exported from `/db/schema/index.ts`**
- [ ] **Schema pushed** with `pnpm db:push`
- [ ] **Foreign key types match** (auth uses `text` IDs)
- [ ] **Timestamps included** (`createdAt`, `updatedAt`)

### oRPC Router

- [ ] **Router file in `/server/routers/[feature].ts`**
- [ ] **Router registered in `/server/routers/_app.ts`**
- [ ] **Read operations have `.route({ method: "GET" })`**
- [ ] **Write operations do NOT have `.route()`** (POST by default)
- [ ] **All operations use `.handler()`** (not `.query()` or `.mutation()`)
- [ ] **User-scoped queries** filter by `context.session.user.id`

### Validators

- [ ] **Validator file in `/validators/[feature].ts`**
- [ ] **Uses Zod schemas** with proper error messages
- [ ] **Types exported** (`Create[Feature]Input`, etc.)
- [ ] **Schema matches form fields** (same field names and types)

### Constants

- [ ] **Page constant added** to `/constants/pages.ts` in `APPLICATION_PAGES`
- [ ] **Uses SCREAMING_SNAKE_CASE** for the constant key

### Client Components

- [ ] **`"use client"` directive** on all interactive components (forms, modals, buttons with onClick)
- [ ] **No hooks in Server Components** (useState, useEffect, useQuery, etc.)
- [ ] **No browser APIs in Server Components** (window, document, localStorage, etc.)

### Data Fetching

- [ ] **`useQuery` used for read operations** with `orpc.[feature].[method].queryOptions()`
- [ ] **`useMutation` used for write operations** with `orpcClient.[feature].[method]`
- [ ] **Query invalidation after mutations** using `queryClient.invalidateQueries()`
- [ ] **Loading states handled** (data is undefined until loaded)
- [ ] **Error states handled** (display error message or fallback)

### Unused Code

- [ ] **No unused imports** (Biome catches this)
- [ ] **No unused variables** (Biome catches this)
- [ ] **No commented-out code** (remove it, git has history)
- [ ] **No console.log statements** (remove debug logging)

---

## Quick One-Liner

When in doubt, run this single command to verify everything:

```bash
pnpm checks && pnpm build
```

If both pass, the code is likely correct.

---

## Common Last-Minute Fixes

| Issue | Fix |
|-------|-----|
| Unused import | Remove the import line |
| Missing `"use client"` | Add `"use client"` at the top of the file |
| `any` type | Replace with the correct type from the schema or validator |
| Raw `<button>` | Replace with `<Button.Root>` from AlignUI |
| oRPC 405 | Add `.route({ method: "GET" })` to read operations |
| Missing schema export | Add `export * from "./[feature]"` to `/db/schema/index.ts` |
| Missing page constant | Add to `APPLICATION_PAGES` in `/constants/pages.ts` |
| Missing router registration | Add to `appRouter` in `/server/routers/_app.ts` |
