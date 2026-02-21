# Code Review - Guidelines and Checklist

> This skill guides the AI through reviewing code for quality, consistency, and correctness.
> Use this when asked to review code, a PR, or when checking your own work.

## Review Process

### Step 1: Understand the Change

1. Read all modified files
2. Understand what the change is supposed to do
3. Identify the type of change: new feature, bug fix, refactor, or other

### Step 2: Check Against Standards

Run through each category below systematically.

### Step 3: Report Findings

Categorize issues as:
- **Blocker**: Must be fixed before merging (build breaks, security issues, data loss)
- **Warning**: Should be fixed but not blocking (inconsistency, missing edge case)
- **Suggestion**: Nice to have (better naming, simpler approach)

---

## Review Categories

### 1. TypeScript Strictness

| Check | What to look for |
|-------|-----------------|
| No `any` | Search for `: any`, `as any`, `<any>` in changed files |
| No `@ts-ignore` | Search for `@ts-ignore` or `@ts-expect-error` |
| Proper types | All function parameters and return values have inferable types |
| No type assertions | Avoid `as unknown as X` patterns unless truly necessary |
| Inferred types | Prefer `const x = getValue()` over `const x: Type = getValue()` when inference works |

```bash
# Quick search for type issues
grep -rn "any" app/(application)/[feature]/
grep -rn "@ts-ignore\|@ts-expect-error" app/(application)/[feature]/
```

### 2. AlignUI Component Usage

| Check | What to look for |
|-------|-----------------|
| No raw HTML UI | No `<button>`, `<input>`, `<select>`, `<textarea>` for interactive elements |
| AlignUI imports | Components imported from `@/components/ui/` |
| Form wrappers | Forms use `FormInput`, `FormSelect`, etc. from `@/components/form/` |
| Remix icons | Icons from `@remixicon/react`, not other icon libraries |
| Design tokens | Correct AlignUI tokens used (see consistency-guide.md) |

```bash
# Search for raw HTML elements that should use AlignUI
grep -rn "<button\b\|<input\b\|<select\b\|<textarea\b" app/(application)/[feature]/_components/
```

### 3. Feature-First Architecture

| Check | What to look for |
|-------|-----------------|
| Page location | `app/(application)/[feature]/page.tsx` |
| Components location | `app/(application)/[feature]/_components/` |
| Hooks location | `app/(application)/[feature]/_hooks/` |
| Actions location | `app/(application)/[feature]/_actions/` |
| No shared pollution | Feature code not placed in `/components/` or `/lib/` unless truly shared |
| Schema location | `db/schema/[feature]/` with proper file structure |

### 4. oRPC Patterns

| Check | What to look for |
|-------|-----------------|
| GET on reads | `.route({ method: "GET" })` on all list/get/find/search operations |
| No GET on writes | No `.route()` on create/update/delete (POST by default) |
| `.handler()` used | Never `.query()` or `.mutation()` (do not exist in oRPC) |
| Router registered | Router added to `appRouter` in `/server/routers/_app.ts` |
| User scoping | Queries filter by `context.session.user.id` for user-owned data |
| Protected procedures | `protectedProcedure` used for authenticated endpoints |

```bash
# Check router registration
cat server/routers/_app.ts
```

### 5. Database Schema

| Check | What to look for |
|-------|-----------------|
| Proper ID types | `text` for auth-related IDs, `uuid` for feature IDs |
| Foreign key match | `userId` is `text` type (matches auth `user.id`) |
| Timestamps | `createdAt` and `updatedAt` included |
| Cascade deletes | `onDelete: "cascade"` on user references |
| Schema export | Exported from `/db/schema/index.ts` |
| Relations defined | `relations.ts` created with proper relations |
| Types exported | `types.ts` with `$inferSelect` and `$inferInsert` types |

### 6. Validators

| Check | What to look for |
|-------|-----------------|
| Zod schemas | All input validation uses Zod |
| Error messages | Human-readable error messages on constraints |
| Proper constraints | `.min()`, `.max()`, `.email()`, etc. as appropriate |
| Type exports | `z.infer<typeof schema>` types exported |
| Schema matches form | Validator fields match form fields exactly |
| Schema matches DB | Validator types compatible with database column types |

### 7. Client Components

| Check | What to look for |
|-------|-----------------|
| `"use client"` | Present on all components using hooks or event handlers |
| No server imports | Client components do not import `"server-only"` modules |
| Query patterns | `useQuery` with `orpc.[feature].queryOptions()` |
| Mutation patterns | `useMutation` with `orpcClient.[feature].[method]` |
| Query invalidation | Mutations invalidate related queries on success |
| Loading states | `isLoading` handled (loading indicator or skeleton) |
| Error states | Errors handled gracefully |

### 8. Constants and Configuration

| Check | What to look for |
|-------|-----------------|
| Page constant | Added to `APPLICATION_PAGES` in `/constants/pages.ts` |
| SCREAMING_SNAKE_CASE | Constant key follows convention |
| Sidebar entry | Added to sidebar navigation (if sidebar exists) |

### 9. Security

| Check | What to look for |
|-------|-----------------|
| Auth protection | Pages under `(application)` are protected by layout |
| User scoping | API queries filter by current user |
| Input validation | All user input validated with Zod before processing |
| No secrets in code | No API keys, passwords, or tokens hardcoded |
| No SQL injection | Using Drizzle ORM queries, not raw SQL |
| CSRF protection | Mutations use POST (oRPC default) |

### 10. Performance

| Check | What to look for |
|-------|-----------------|
| No unnecessary re-renders | State is scoped to the component that needs it |
| No N+1 queries | List queries use joins or `with` instead of per-item fetches |
| Proper query caching | `staleTime` is set appropriately |
| No blocking data fetches | Server Components do not block with unnecessary awaits |

---

## Common Mistakes to Look For

### Critical (Blockers)

1. **Missing `.route({ method: "GET" })` on read operations** -- causes 405 errors at runtime
2. **Using `any` type** -- violates TypeScript strict mode
3. **Missing `"use client"` on interactive components** -- causes build errors
4. **Router not registered in `_app.ts`** -- API endpoints will not work
5. **Schema not exported from index** -- Drizzle queries will fail
6. **Foreign key type mismatch** -- `uuid` vs `text` for user IDs

### Important (Warnings)

1. **No loading state** -- users see blank screen while data loads
2. **No empty state** -- users see nothing when no data exists
3. **No query invalidation after mutation** -- stale data shown after create/update/delete
4. **Raw HTML instead of AlignUI** -- inconsistent UI
5. **Missing form validation** -- users can submit invalid data
6. **No error handling** -- app crashes on API errors

### Minor (Suggestions)

1. **Inconsistent naming** -- file or variable names do not match conventions
2. **Missing page constant** -- page works but is not in the constants file
3. **Verbose code** -- could be simplified without changing behavior
4. **Inconsistent design tokens** -- wrong text color class or spacing

---

## Review Template

When reporting review findings, use this format:

```
## Code Review: [Feature/Change Name]

### Summary
[1-2 sentence summary of what the change does]

### Blockers
- [ ] [Issue description] -- [file:line]

### Warnings
- [ ] [Issue description] -- [file:line]

### Suggestions
- [ ] [Issue description] -- [file:line]

### Verified
- [x] TypeScript strict (no `any`)
- [x] AlignUI components used
- [x] Feature-first structure
- [x] oRPC patterns correct
- [x] Schema properly defined
- [x] Validators in place
- [x] Build passes
```

---

## Using the Code-Reviewer Agent

If the project has a code-reviewer agent configured, you can delegate the review:

1. Point the agent to the files that changed
2. Ask it to review against the checklist above
3. Review its findings and confirm or dismiss them
4. The agent focuses on automated checks; you focus on logic and architecture
