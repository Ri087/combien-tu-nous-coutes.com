# Implement Linear Issue

Fetch a Linear issue and implement it in the current repo.

## Usage

```
/implement-issue LKFL-200
```

`$ARGUMENTS` = Linear issue identifier (e.g. LKFL-200, ALTF4-42)

## Process

### 1 — Fetch the Issue

1. Fetch the issue via MCP Linear (or `gh` if MCP unavailable)
2. Display: identifier, title, description, priority, status, labels
3. If no `$ARGUMENTS`, ask the user for the issue ID

### 2 — Understand the Codebase

1. Read `CLAUDE.md` for repo conventions
2. Read `.claude/resources/impulse-repos.md` if it exists
3. Read `convex_rules.txt` or `.cursorrules` if they exist
4. Explore the codebase structure (`ls`, key files)

### 3 — Create a Branch

```bash
# Detect base branch
BASE=$(git rev-parse --verify origin/dev 2>/dev/null && echo dev || echo main)
git checkout $BASE && git pull origin $BASE

# Create feature branch
gt create "feat/{issue-id-lowercase}-{slug}" -m "feat({issue-id}): {title}"
```

If Graphite (`gt`) is not available, use plain git:
```bash
git checkout -b feat/{issue-id-lowercase}-{slug}
```

### 4 — Implement

1. **Plan** before coding — outline what files need changes
2. **Implement** the feature/fix following repo conventions
3. **Backend first** if both backend + frontend needed:
   - Schema / DB changes
   - Validators (Zod)
   - API routes (oRPC / tRPC / Convex)
4. **Frontend second**:
   - Use ONLY the project's component library (AlignUI if applicable)
   - Follow existing patterns in the codebase
5. **Commit** incrementally with clear messages referencing the issue:
   ```
   feat({ISSUE-ID}): {what was done}
   ```

### 5 — Validate

1. **Type check**: `pnpm typecheck` or `npx tsc --noEmit`
2. **Lint**: `pnpm lint` or `pnpm checks` (whatever exists)
3. **Build**: `pnpm build` (if feasible)
4. Fix any errors before finishing

### 6 — Update Linear

If MCP Linear is available:
1. Move issue to "In Progress" at start
2. Move issue to "Done" when complete
3. Add a comment summarizing what was implemented

### 7 — Summary

Print a summary:
```
✅ {ISSUE-ID}: {title}
Branch: feat/{issue-id}-{slug}
Commits: {count}
Files changed: {count}

Ready for PR — run /open-pr to submit.
```

## Rules

- **1 branch = 1 issue** (keep it focused)
- **Always reference the issue** in commit messages
- **Don't open the PR** — that's `/open-pr`'s job
- **Don't push** unless asked — `/open-pr` handles that
- **Self-heal**: if typecheck/lint fails, fix it before finishing
- **Ask if unclear** — don't guess on ambiguous requirements
