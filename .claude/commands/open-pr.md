# Open PR

Submit the current branch as a Pull Request using Graphite (preferred) or GitHub CLI.

## Usage

```
/open-pr
/open-pr LKFL-200
```

`$ARGUMENTS` = (optional) Linear issue identifier for PR metadata. If omitted, inferred from branch name.

## Process

### 1 — Pre-flight Checks

1. **Ensure clean state**: `git status` — no uncommitted changes
2. **Detect base branch**:
   ```bash
   # PR always targets dev if it exists, otherwise main
   BASE=$(git rev-parse --verify origin/dev 2>/dev/null && echo dev || echo main)
   ```
3. **Get branch info**: current branch name, commit count vs base
4. **Run checks** if available:
   - `pnpm typecheck` or `npx tsc --noEmit`
   - `pnpm lint` or `pnpm checks`
   - If checks fail, fix them first

### 2 — Gather PR Info

1. **Parse issue ID** from `$ARGUMENTS` or branch name (e.g. `feat/lkfl-200-feedback-sharing` → `LKFL-200`)
2. **Fetch issue from Linear** (if MCP available) for title + description
3. **Build PR title**:
   ```
   feat({ISSUE-ID}): {issue title}
   ```
4. **Build PR body**:
   ```markdown
   ## {Issue title}

   {Issue description}

   ### Changes
   - {summary of what was implemented}

   Resolves {ISSUE-ID}
   ```

### 3 — Submit with Graphite (preferred)

```bash
# Stage all relevant files if not already committed
git add -A  # Only if working tree is dirty
gt modify   # Amend if needed

# Submit PR
gt submit --publish --no-edit
```

If Graphite is not installed or fails, fallback to GitHub CLI:

```bash
git push origin HEAD

gh pr create \
  --base "$BASE" \
  --title "feat({ISSUE-ID}): {title}" \
  --body "{pr body}" \
  --assignee @me
```

### 4 — Post-PR

1. **Print the PR URL**
2. **Update Linear** (if MCP available):
   - Add PR link as comment on the issue
   - Move issue to "In Review" if that status exists
3. **Summary**:
   ```
   🚀 PR opened!
   URL: {pr_url}
   Base: {base_branch}
   Title: feat({ISSUE-ID}): {title}
   
   Waiting for CI + code review bots.
   ```

## Rules

- **Always `--publish`** with Graphite (so review bots run)
- **Always `--no-edit`** to avoid interactive prompts
- **Target `dev`** if it exists, otherwise `main`
- **Don't merge** — just open the PR
- **Clean commits** — squash/amend messy WIP commits before submitting
- **If checks fail**, fix before opening PR (don't ship broken code)
