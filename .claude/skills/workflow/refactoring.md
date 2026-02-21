# Refactoring - Safe Code Transformation Guide

> This skill guides the AI through refactoring code safely.
> Refactoring means changing code structure WITHOUT changing behavior.
> ONLY refactor when explicitly asked by the user.

## When to Refactor

Refactor ONLY when:
- The user explicitly asks for a refactor
- The user asks to "clean up" or "reorganize" code
- The user asks to "extract" a component or function
- The user asks to "rename" something
- The user asks to "split" a file

Do NOT refactor:
- While fixing a bug (fix the bug only)
- While adding a feature (add the feature only)
- Because you think the code "could be better"
- To match a pattern you prefer

---

## Refactoring Types

### 1. Extract Component

When a component is too large, extract parts into separate components.

**Before:**
```tsx
// big-page.tsx -- 200+ lines with mixed concerns
export function BigPage() {
  // ... lots of state
  return (
    <div>
      {/* header section -- 30 lines */}
      {/* list section -- 50 lines */}
      {/* form section -- 80 lines */}
    </div>
  );
}
```

**After:**
```tsx
// big-page.tsx -- clean composition
export function BigPage() {
  return (
    <div>
      <PageHeader />
      <ItemList />
      <CreateForm />
    </div>
  );
}
```

**Steps:**
1. Identify the section to extract
2. Determine what props it needs (data, callbacks)
3. Create a new file in the same `_components/` directory
4. Move the JSX and related state/hooks to the new component
5. Import and use the new component in the original file
6. Run `pnpm checks && pnpm build` to verify

### 2. Extract Hook

When component logic is complex, extract it into a custom hook.

**Before:**
```tsx
export function ProjectList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(orpc.projects.list.queryOptions());
  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.projects.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions().queryKey,
      });
    },
  });
  // ... render
}
```

**After:**
```tsx
// _hooks/use-projects.ts
export function useProjects() {
  const queryClient = useQueryClient();
  const query = useQuery(orpc.projects.list.queryOptions());
  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.projects.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions().queryKey,
      });
    },
  });
  return { ...query, deleteMutation };
}

// _components/project-list.tsx
export function ProjectList() {
  const { data, isLoading, deleteMutation } = useProjects();
  // ... render
}
```

**Steps:**
1. Create a new file in `_hooks/` following the naming convention `use-[name].ts`
2. Move the hook logic (useQuery, useMutation, useState, etc.) into the custom hook
3. Return the values the component needs
4. Import and use the hook in the component
5. Run `pnpm checks && pnpm build` to verify

### 3. Split File

When a file handles multiple concerns, split it into separate files.

**Steps:**
1. Identify logical groupings within the file
2. Create new files for each group
3. Move code to the new files
4. Update imports in all affected files
5. Verify there are no circular imports
6. Run `pnpm checks && pnpm build` to verify

### 4. Rename

When renaming a variable, function, component, or file.

**Steps:**
1. Find ALL usages of the old name across the codebase
   ```bash
   grep -rn "oldName" app/ components/ server/ lib/ validators/ orpc/
   ```
2. Rename in the definition file first
3. Update all import statements
4. Update all usages
5. If renaming a file, update all imports that reference the old file path
6. Run `pnpm checks && pnpm build` to verify

### 5. Move to Feature-First Structure

When code is not following the feature-first architecture.

**Steps:**
1. Identify which feature the code belongs to
2. Create the proper directory structure:
   ```
   app/(application)/[feature]/
     page.tsx
     _components/
     _hooks/
     _actions/
   ```
3. Move files to their new locations
4. Update all imports
5. Run `pnpm checks && pnpm build` to verify

---

## Safety Rules

### Before refactoring:

1. **Read all the code** you plan to refactor
2. **Understand what it does** -- you cannot safely change what you do not understand
3. **Identify all usages** -- search the codebase for every reference

### During refactoring:

1. **Do NOT change behavior** -- the app should work identically after refactoring
2. **Do NOT add features** -- refactoring is purely structural
3. **Do NOT fix bugs** -- if you find a bug, note it and tell the user
4. **Move one thing at a time** -- small steps, verify each one
5. **Keep the same exports** -- if a module exported something, the new structure must too

### After refactoring:

1. **Run `pnpm checks`** -- must pass with zero errors
2. **Run `pnpm build`** -- must build successfully
3. **Search for old references** -- nothing should reference moved/renamed items
   ```bash
   grep -rn "old-file-name" app/ components/ server/ lib/
   ```

---

## Common Mistakes

| Mistake | Why it is wrong | What to do instead |
|---------|----------------|-------------------|
| Changing logic while refactoring | Mixes two concerns, harder to debug | Do refactoring and logic changes in separate steps |
| Not updating all imports | Causes runtime errors | Search entire codebase for old references |
| Renaming without searching | Misses usages in other files | Always `grep` for the old name first |
| Moving server code to client | Breaks server/client boundary | Check `"use client"` and server-only imports |
| Breaking circular import | Causes build errors | Check that new file structure has no cycles |
| Not running build after refactor | Misses errors only visible in build | Always run `pnpm checks && pnpm build` |

---

## Verification Checklist

After every refactoring session:

- [ ] `pnpm checks` passes (zero errors)
- [ ] `pnpm build` passes (zero errors)
- [ ] No references to old file names or paths remain
- [ ] No circular imports introduced
- [ ] All exports are preserved (nothing that was public became inaccessible)
- [ ] Feature-first structure is maintained
- [ ] `"use client"` directives are present where needed
- [ ] Behavior is identical to before (no features added, no bugs fixed)
