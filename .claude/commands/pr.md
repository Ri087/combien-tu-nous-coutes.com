# Open PR

Submit the current branch as a Pull Request using Graphite (preferred) or GitHub CLI.

Works in any context:
- After `/implement-issue` on a regular branch
- In a **Conductor worktree** (branch already exists, just needs PR)
- On any feature branch with commits ready to submit

## Usage

```
/pr
/pr LKFL-200
```

`$ARGUMENTS` = (optional) Linear issue identifier for PR metadata. If omitted, inferred from branch name.

## Process

### 1 — Detect Context

1. **Current branch**: `git branch --show-current`
2. **Is this a worktree?** Check if `git rev-parse --git-common-dir` differs from `.git` — if yes, we're in a worktree (Conductor-style)
3. **Parse issue ID** from `$ARGUMENTS` or branch name:
   - `feat/lkfl-200-feedback-sharing` → `LKFL-200`
   - `issue-200-feedback-sharing` → issue 200 (need team key from repo context)
   - Direct argument: `LKFL-200`
4. **Detect base branch**:
   ```bash
   # PR always targets dev if it exists, otherwise main
   BASE=$(git rev-parse --verify origin/dev >/dev/null 2>&1 && echo dev || echo main)
   ```

### 2 — Pre-flight Checks

1. **Check for uncommitted changes**: `git status`
   - If dirty: stage + commit with a descriptive message
   - In worktree context: this is common (Conductor may leave uncommitted work)
2. **Run checks** if available:
   - `pnpm typecheck` or `npx tsc --noEmit`
   - `pnpm lint` or `pnpm checks`
   - If checks fail → fix them first, commit the fixes
3. **Ensure branch is pushed**:
   ```bash
   git push origin HEAD 2>/dev/null || git push --set-upstream origin $(git branch --show-current)
   ```

### 3 — Gather PR Info

1. **Fetch issue from Linear** (if MCP available or via API) for title + description
2. **Build PR title**:
   ```
   feat({ISSUE-ID}): {issue title}
   ```
3. **Build PR body**:
   ```markdown
   ## {Issue title}

   {Issue description}

   ### Changes
   - {summary of what was implemented — read git log for commits}

   Resolves {ISSUE-ID}
   ```

### 4 — Submit PR

#### Option A: Graphite (preferred)

```bash
# If there are unstaged changes, amend
git add -A && gt modify 2>/dev/null

# Submit PR — ALWAYS publish so review bots run
gt submit --publish --no-edit
```

**Note**: In a worktree, Graphite works normally — it sees the branch.

#### Option B: GitHub CLI (fallback)

If Graphite is not installed or fails:

```bash
# Ensure pushed
git push origin HEAD

# Check if PR already exists
EXISTING=$(gh pr view --json url --jq '.url' 2>/dev/null)
if [ -n "$EXISTING" ]; then
  echo "PR already exists: $EXISTING"
else
  gh pr create \
    --base "$BASE" \
    --title "feat({ISSUE-ID}): {title}" \
    --body "{pr body}" \
    --assignee @me
fi
```

### 5 — Post-PR

1. **Print the PR URL**
2. **Summary**:
   ```
   🚀 PR opened!
   URL: {pr_url}
   Base: {base_branch}
   Branch: {current_branch}
   Title: feat({ISSUE-ID}): {title}
   Context: {worktree | regular branch}
   
   Waiting for CI + code review bots.
   ```

## Rules

- **Always `--publish`** with Graphite (so review bots run)
- **Always `--no-edit`** to avoid interactive prompts
- **Target `dev`** if it exists, otherwise `main`
- **Don't merge** — just open the PR
- **Clean commits** — squash/amend messy WIP commits before submitting
- **If checks fail**, fix before opening PR (don't ship broken code)
- **Worktree-aware** — don't try to create/switch branches in a worktree, just use what's there
- **Check for existing PR** — don't create duplicates
