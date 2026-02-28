# Restack Branch with Migration Handling

Restack the current branch on dev while properly handling Drizzle migrations.

## Workflow

1. **Run `gt restack`**
   - This will attempt to rebase the current branch on dev
   - If already up to date (no restack needed), skip to step 7 — check `git status` and run `gt ss` if there are unpushed commits

2. **Handle conflicts**
   - If conflicts occur in migration files (`packages/database/migrations/`):
     - **ALWAYS keep dev's version** using `git checkout --theirs <file>`
     - Delete any migration `.sql` files from this branch (the ones not on dev)
     - For snapshots and `_journal.json`, use dev's version
   - For other conflicts (non-migration files):
     - Merge intelligently, keeping both changes where possible
     - Prioritize dev's structure but add this branch's new features

3. **Install dependencies**
   - Run `pnpm install` to pick up any new or changed packages from dev

4. **Mark resolved and continue**

   ```bash
   gt add -A
   gt continue
   ```

5. **Regenerate migration for this branch's schema changes**
   - First, ensure the 0018_snapshot.json (or latest) is clean from dev:
     ```bash
     git show origin/dev:packages/database/migrations/meta/<latest>_snapshot.json > packages/database/migrations/meta/<latest>_snapshot.json
     ```
   - Then generate:
     ```bash
     pnpm drizzle-kit generate
     ```
   - Verify the generated migration contains ONLY this branch's schema changes

6. **Stage migration files**

   ```bash
   git add packages/database/migrations/
   ```

7. **Submit stack**
   - Check `git status` — if there are unpushed commits, run:

   ```bash
   gt ss --no-edit --publish
   ```

   - Always run this at the end, even if no restack was needed

## Key Principles

- **Never mix migrations**: Each branch should have its own clean migration file
- **Dev migrations are authoritative**: When restacking, dev's migrations always win
- **Regenerate don't merge**: After restack, regenerate this branch's migration fresh
- **Verify before push**: Always check the generated migration contains only the expected changes

## Migration File Structure

```
packages/database/migrations/
├── 0000_xxx.sql          # Existing migrations (from dev)
├── ...
├── 00XX_latest_dev.sql   # Latest migration on dev
├── 00XY_your_feature.sql # Your new migration (generated after restack)
└── meta/
    ├── 00XX_snapshot.json
    ├── 00XY_snapshot.json
    └── _journal.json
```
