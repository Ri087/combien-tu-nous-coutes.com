# Generate and Run Migrations

## When to Use

Use migrations when deploying schema changes to production or when you need a versioned history of database changes. For local development, prefer `pnpm db:push` instead (see `push-schema.md`).

## Prerequisites

- Schema files are correctly defined in `/db/schema/`
- All schemas are exported from `/db/schema/index.ts`
- `DATABASE_URL` is set in `.env`
- `drizzle.config.ts` is configured (it already is in this project)

## Drizzle Configuration

The project's `drizzle.config.ts`:

```typescript
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
```

Key settings:
- `out: "./migrations"` -- migration files are stored in `/migrations/`
- `schema: "./db/schema/index.ts"` -- Drizzle reads all schemas from this barrel file

## Step-by-Step Instructions

### Step 1: Generate migration files

```bash
pnpm db:generate
```

This command:
1. Compares the current schema files against the previous migration state
2. Generates SQL migration files in the `/migrations/` directory
3. Runs Biome formatting on the generated files (configured in `package.json`)

The generated files will look like:
```
migrations/
  0000_initial.sql
  0001_add_projects_table.sql
  meta/
    _journal.json
    0000_snapshot.json
    0001_snapshot.json
```

### Step 2: Review the generated SQL

Always review the generated `.sql` file to ensure it matches your expectations:

```sql
-- migrations/0001_add_projects_table.sql
CREATE TABLE IF NOT EXISTS "project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### Step 3: Run migrations

```bash
pnpm db:migrate
```

This command:
1. Reads the migration journal to determine which migrations have been applied
2. Executes any pending migration SQL files in order
3. Updates the journal to record the applied migrations

### Step 4: Verify

Run `pnpm build` to ensure everything compiles correctly after the migration.

## Common Workflows

### Development: schema iteration

```bash
# Make schema changes, then:
pnpm db:push       # Quick push, no migration files
```

### Pre-production: create migration

```bash
# Finalize schema changes, then:
pnpm db:generate    # Generate migration SQL
# Review the generated SQL file
pnpm db:migrate     # Apply the migration
```

### Production deployment

```bash
# In CI/CD pipeline:
pnpm db:migrate     # Apply pending migrations
```

## Handling Migration Conflicts

If you need to regenerate migrations after changes:

1. Delete the latest migration file(s) from `/migrations/`
2. Update the journal in `/migrations/meta/_journal.json`
3. Run `pnpm db:generate` again

**Warning:** Only do this for migrations that have NOT been applied to production.

## Rules

- ALWAYS review generated SQL files before running `pnpm db:migrate`.
- ALWAYS commit migration files to version control.
- NEVER manually edit migration SQL files after they have been applied.
- NEVER delete migrations that have been applied to production.
- NEVER use `pnpm db:push` in production -- always use migrations.
- Use `pnpm db:push` for fast iteration during development.
- Use `pnpm db:generate && pnpm db:migrate` for production deployments.

## Related Skills

- `push-schema.md` -- Quick schema push for development
- `create-schema.md` -- Creating new schemas
