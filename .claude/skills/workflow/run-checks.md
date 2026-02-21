# Run Checks - Complete Guide

> This skill explains every check/build command, when to run each, and how to fix common errors.

## Available Commands

| Command | What it does | When to run |
|---------|-------------|-------------|
| `pnpm checks` | Runs Biome linter + TypeScript type checker | After every code change |
| `pnpm build` | Next.js production build (with Turbopack) | Before considering a task done |
| `pnpm db:push` | Pushes Drizzle schema to the database | After modifying any file in `/db/schema/` |
| `pnpm db:generate` | Generates SQL migration files | Before deploying schema changes to production |
| `pnpm db:migrate` | Runs pending migrations | After generating migrations |

---

## Command Details

### `pnpm checks`

**What it runs:** `biome check --write . && tsc --noEmit`

This command does two things:
1. **Biome** (`biome check --write .`): Lints and auto-formats the entire codebase. The `--write` flag automatically fixes fixable issues (formatting, import organization, simple lint rules).
2. **TypeScript** (`tsc --noEmit`): Type-checks the entire project without emitting files. Catches type errors, missing imports, and type mismatches.

**When to run:**
- After every code change
- Before running `pnpm build`
- As a first debugging step when something seems wrong

**Common Biome errors and fixes:**

| Error | Fix |
|-------|-----|
| `Unexpected any. Specify a different type.` | Replace `any` with the correct type or `unknown` |
| `This import is unused.` | Auto-fixed by `--write`. If it persists, remove the import manually. |
| `Avoid the delete operator.` | Use object destructuring or `Reflect.deleteProperty` instead |
| `Don't use '{}' as a type.` | Use `Record<string, unknown>` or a specific interface |

**Common TypeScript errors and fixes:**

| Error | Fix |
|-------|-----|
| `Type 'X' is not assignable to type 'Y'` | Check that the types match. Often a `string` vs `uuid` mismatch in schema references. |
| `Property 'X' does not exist on type 'Y'` | Check the type definition. You may need to add the property or use optional chaining. |
| `Cannot find module '@/...'` | Check the import path. Verify the file exists and exports the symbol. |
| `'X' is declared but its value is never read.` | Remove the unused variable or use it. Prefix with `_` if intentionally unused. |
| `Argument of type 'X' is not assignable to parameter` | The function expects a different type. Check the function signature. |

---

### `pnpm build`

**What it runs:** `next build --turbopack`

Full production build of the Next.js application. This catches:
- All TypeScript errors
- Server/client component boundary violations
- Missing `"use client"` directives
- Invalid imports (importing server-only code in client components)
- Route and page configuration errors
- Dynamic import issues

**When to run:**
- Before considering ANY task done
- After making changes to page files
- After modifying server/client component boundaries
- After adding new routes

**Common build errors and fixes:**

| Error | Fix |
|-------|-----|
| `You're importing a component that needs "use client"` | Add `"use client"` at the top of the file that uses hooks or browser APIs |
| `Error: "X" is not exported from "Y"` | Check the export in the source file. May need to add `export` keyword. |
| `Module not found: Can't resolve '@/...'` | Check the import path and verify the file exists |
| `Error occurred prerendering page "/..."` | The page uses dynamic data (headers, cookies) without proper handling. Mark as dynamic if needed. |
| `"X" is a Server Component, but it uses hooks` | Move the hook usage to a Client Component with `"use client"` |

---

### `pnpm db:push`

**What it runs:** `drizzle-kit push`

Pushes the current Drizzle schema directly to the database. This is for development -- it applies schema changes without creating migration files.

**When to run:**
- After creating or modifying any file in `/db/schema/`
- After adding new tables, columns, or changing column types
- After adding or modifying relations

**Common errors and fixes:**

| Error | Fix |
|-------|-----|
| `relation "X" already exists` | The table already exists. If you renamed it, drop the old one first or use migrations. |
| `column "X" cannot be cast to type "Y"` | Cannot change column type with data. Drop the column and recreate, or use migrations. |
| `foreign key constraint "X" cannot be implemented` | The referenced column type does not match. Auth uses `text` IDs, not `uuid`. |
| `CONNECTION_ERROR` / `ECONNREFUSED` | Check that `DATABASE_URL` is set in `.env` and the database is running. |

---

### `pnpm db:generate`

**What it runs:** `drizzle-kit generate && biome check --write migrations`

Generates SQL migration files from schema changes, then formats them with Biome.

**When to run:**
- Before deploying schema changes to production
- NOT needed during development (use `db:push` instead)

---

## Recommended Workflow

### After modifying code (no schema changes):
```bash
pnpm checks   # Lint + TypeScript
pnpm build    # Full build
```

### After modifying database schema:
```bash
pnpm db:push  # Push schema to database
pnpm checks   # Lint + TypeScript
pnpm build    # Full build
```

### After a failed build:
```bash
# 1. Read the error message carefully
# 2. Fix the issue
# 3. Run checks first (faster feedback loop)
pnpm checks
# 4. If checks pass, try the build again
pnpm build
```

---

## Troubleshooting

### Build fails but checks pass

This usually means:
- A Server Component imports something that needs `"use client"`
- A dynamic import is misconfigured
- A page uses server-side APIs (headers, cookies) without being marked as dynamic

### Checks pass locally but build fails in CI

This usually means:
- Environment variables are missing in CI
- Database is not accessible from CI
- A dependency is not installed

### Everything passes but the page does not work

Check:
- Is the page route correct? (file path maps to URL)
- Is the page exported as `default`?
- Are oRPC endpoints registered in `_app.ts`?
- Is the page constant added to `/constants/pages.ts`?
