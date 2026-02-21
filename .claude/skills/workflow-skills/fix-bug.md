# Fix Bug - Complete Workflow

> This skill guides the AI through investigating and fixing a bug.
> Focus on minimal, targeted changes. Do NOT refactor or add features.

## Phase 1: Understand the Bug

### 1a. Gather information

From the user's report, identify:
- **What is broken?** (error message, unexpected behavior, missing data)
- **Where does it happen?** (page, component, API endpoint)
- **When does it happen?** (on load, on click, on submit, always vs sometimes)

### 1b. Read the error

If there is an error message or stack trace:
1. Read the exact error message
2. Identify the file and line number from the stack trace
3. Read that file to understand the context

### 1c. Trace the data flow

For most bugs, trace the data flow from source to display:

1. **Database schema**: Check `/db/schema/[feature]/schema.ts` -- are the columns correct?
2. **oRPC router**: Check `/server/routers/[feature].ts` -- is the query correct? Are filters right?
3. **Client hook/query**: Check the `useQuery` or `useMutation` call -- are the options correct?
4. **Component**: Check the component rendering -- is it using the data correctly?

### 1d. Reproduce mentally

Before making any change, understand:
- What the code currently does (the bug)
- What the code should do (the expected behavior)
- Why the current code is wrong (the root cause)

---

## Phase 2: Fix the Bug

### 2a. Make the minimal change

- Fix ONLY the root cause
- Do NOT refactor surrounding code
- Do NOT add new features
- Do NOT change unrelated files
- Do NOT rename variables or reorganize code

### 2b. Common bug categories and fixes

#### TypeScript type errors
- Read the error message carefully -- it tells you exactly what is wrong
- Check that types match between schema, validators, and components
- Check that foreign key types match (auth uses `text` IDs, not `uuid`)

#### oRPC 405 errors
- Read operations MUST have `.route({ method: "GET" })`
- If a GET endpoint returns 405, add `.route({ method: "GET" })`

#### "Cannot read properties of undefined"
- Check that optional chaining is used where data might be undefined
- Check that `useQuery` data is handled when loading (`data` is `undefined` until loaded)
- Add null checks or default values

#### Form validation errors
- Check that the Zod schema in `/validators/` matches what the form sends
- Check that the resolver is correctly wired: `zodResolver(schema)`
- Check that field names match between form and schema

#### Database errors
- Check column types match between schema and data
- Check foreign key references point to correct tables
- Run `pnpm db:push` if the schema was changed

#### Import errors
- Check that the import path is correct (use `@/` prefix)
- Check that the export exists in the source file
- Check for circular imports

#### Component rendering errors
- Check that `"use client"` is present for interactive components
- Check that server components do not use hooks or browser APIs
- Check that props match the expected interface

---

## Phase 3: Verify the Fix

### 3a. Run checks

```bash
# Always run these after a fix
pnpm checks    # Biome lint + TypeScript type checking
pnpm build     # Full production build
```

### 3b. If the schema was changed

```bash
pnpm db:push   # Push schema changes to the database
```

### 3c. Check for side effects

After making the fix:
1. Read the file you changed -- does it still make sense?
2. Search for other uses of the function/component you changed -- are they still correct?
3. If you changed a type, check all files that import that type

---

## What NOT to Do

- **Do NOT refactor** code while fixing a bug. One change at a time.
- **Do NOT add features** to the fix. If you notice a missing feature, tell the user.
- **Do NOT change code style** or formatting. Biome handles that.
- **Do NOT modify `/components/ui/`** -- those are AlignUI design system components.
- **Do NOT change unrelated files** -- only touch files directly related to the bug.
- **Do NOT guess** -- if you are unsure about the root cause, read more code first.
- **Do NOT add console.log statements** and leave them in. If you add them for debugging, remove them.

---

## Debugging Checklist

When stuck, go through this checklist:

1. [ ] Re-read the exact error message -- what does it say?
2. [ ] Is the file that errors actually the root cause, or is it a symptom?
3. [ ] Are all imports correct and resolving?
4. [ ] Are types consistent across the chain (schema -> validator -> router -> component)?
5. [ ] Is `"use client"` present where needed?
6. [ ] Are oRPC read operations using `.route({ method: "GET" })`?
7. [ ] Does the database schema match what the code expects?
8. [ ] Are optional fields handled with proper null/undefined checks?
9. [ ] Does `pnpm checks` pass?
10. [ ] Does `pnpm build` pass?
