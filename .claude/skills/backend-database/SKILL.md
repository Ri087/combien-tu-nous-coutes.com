---
name: backend-database
description: |
  Drizzle ORM database development guide for PostgreSQL with Neon. Use when creating database schemas, defining relations, querying data, inserting/updating/deleting records, running migrations, pushing schema changes, adding indexes, working with JSON columns, exporting types, or using ULID/UUID for IDs.
---

# Drizzle ORM Database Development

This skill covers all database operations in this project using Drizzle ORM with Neon serverless Postgres. It includes schema creation, relation definitions, CRUD operations, complex queries, migrations, and type inference. All schemas follow a feature-first organization under `/db/schema/`.

## Reference Files

- **create-schema.md** -- How to create a new Drizzle schema table with standard columns (id, timestamps, foreign keys)
- **relations.md** -- How to define Drizzle relations (one-to-one, one-to-many, many-to-many)
- **column-types.md** -- Reference for all supported Drizzle column types (text, uuid, timestamp, boolean, integer, etc.)
- **query-data.md** -- How to read data using `db.query` and `db.select` with filters and joins
- **insert-data.md** -- How to insert single and multiple records with `.returning()`
- **update-data.md** -- How to update records with conditions using `db.update`
- **delete-data.md** -- How to delete records safely with `db.delete` and proper WHERE clauses
- **complex-queries.md** -- Advanced query patterns: subqueries, aggregations, raw SQL, conditional filters
- **push-schema.md** -- How to push schema changes to Neon in development with `pnpm db:push`
- **migrations.md** -- How to generate and run migrations for production deployments
- **indexes.md** -- How to add indexes for query performance optimization
- **json-columns.md** -- How to define and query JSON/JSONB columns
- **type-exports.md** -- How to export inferred types using `$inferSelect` and `$inferInsert`
- **ulid-ids.md** -- How to use ULID or UUID as primary key identifiers

## Key Rules

1. **Always run `pnpm db:push` after modifying any schema.** This synchronizes your schema with the Neon database.
2. **Always add `onDelete: 'cascade'` on user foreign keys.** This ensures user data is cleaned up on account deletion.
3. **Always export schemas from `/db/schema/index.ts`.** New tables must be re-exported so Drizzle can discover them.
4. **Always export inferred types** using `$inferSelect` and `$inferInsert` from the schema file.
5. **Use UUID with `.defaultRandom()` for primary keys** unless there is a specific reason to use ULID.

## Related Skills

- **backend-orpc** -- Using database queries inside oRPC route handlers
- **validation-skills** -- Drizzle-Zod integration for generating validators from schemas
- **backend-auth** -- Auth schema tables that your feature schemas may reference
- **architecture-skills** -- Feature-first file organization for schema files
