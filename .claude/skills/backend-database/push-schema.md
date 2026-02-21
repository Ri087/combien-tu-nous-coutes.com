# Push Schema Changes to Database

## When to Use

Use this skill after creating or modifying any Drizzle schema file. The `db:push` command directly applies schema changes to the database without generating migration files. This is the standard approach during development.

## Prerequisites

- Schema files are correctly defined in `/db/schema/`
- All new schemas are exported from `/db/schema/index.ts`
- The `DATABASE_URL` environment variable is set in `.env`

## Step-by-Step Instructions

### Step 1: Verify the schema exports

Before pushing, make sure your new or modified schema is exported from the root barrel file:

```typescript
// db/schema/index.ts
export * from "./auth";
export * from "./projects"; // Your new feature must be here
```

If the schema is not exported here, Drizzle will not see it and will not create the table.

### Step 2: Push the schema

```bash
pnpm db:push
```

This command:
1. Reads all schemas from `./db/schema/index.ts` (as configured in `drizzle.config.ts`)
2. Compares them against the current database state
3. Generates and executes the necessary SQL statements
4. Reports what changes were applied

### Step 3: Verify the result

The command output will show which tables were created, altered, or left unchanged. Review the output to ensure the expected changes were applied.

If you want to visually inspect the database, open Drizzle Studio:

```bash
pnpm db:studio
```

### Step 4: Build check

After pushing, verify that the application still compiles:

```bash
pnpm build
```

## When to Use Push vs. Migrations

| Scenario | Command | Notes |
|----------|---------|-------|
| Local development | `pnpm db:push` | Fast, no migration files |
| Production deployment | `pnpm db:generate && pnpm db:migrate` | Creates migration SQL files |
| CI/CD pipeline | `pnpm db:migrate` | Runs existing migrations |

Use `db:push` for development. Use migrations for production. See `migrations.md` for the migration workflow.

## Troubleshooting

### "Table already exists" or conflicts

If `db:push` reports conflicts, it will prompt for confirmation before making destructive changes (dropping columns or tables). Review carefully before accepting.

### Schema not detected

If your table is not being created:
1. Check that the schema file exports the table variable.
2. Check that the feature's `index.ts` exports the schema file.
3. Check that `/db/schema/index.ts` exports the feature.

### Connection errors

Verify that `DATABASE_URL` is correctly set in your `.env` file and that the database is accessible.

## Rules

- ALWAYS run `pnpm db:push` after any schema change during development.
- ALWAYS verify that schemas are exported from `/db/schema/index.ts` before pushing.
- ALWAYS review the push output to confirm expected changes.
- NEVER use `db:push` in production -- use migrations instead.
- NEVER accept destructive changes (column/table drops) without explicit user confirmation.

## Related Skills

- `create-schema.md` -- Creating new schemas
- `migrations.md` -- Migration workflow for production
- `column-types.md` -- Column type reference
