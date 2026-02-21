---
name: validation
description: |
  Zod validation schema guide. Use when creating validators, organizing validation schemas, integrating Drizzle-Zod for database schemas, implementing custom refinements, or creating shared reusable schemas.
---

# Zod Validation Schemas

This skill covers creating and organizing Zod validation schemas that are shared between frontend forms and backend API routes. It includes standard validator creation, schema organization by feature, Drizzle-Zod integration for generating schemas from database tables, custom refinements for complex validation rules, and building shared reusable schema primitives.

## Reference Files

- **create-validator.md** -- How to create a new Zod validation schema with the standard structure and type exports
- **organization.md** -- How to organize validators by feature in `/validators/[feature].ts` with proper exports
- **drizzle-zod.md** -- How to generate Zod schemas from Drizzle table definitions using `createInsertSchema` and `createSelectSchema`
- **custom-refinements.md** -- How to add custom validation rules with `.refine()`, `.superRefine()`, and `.transform()`
- **shared-schemas.md** -- How to create reusable schema primitives (email, phone, pagination, etc.) for composition

## Key Rules

1. **Always place validators in `/validators/[feature].ts`.** Never define Zod schemas inline in route handlers or components.
2. **Always export the inferred TypeScript type** alongside the schema using `z.infer<typeof schema>`.
3. **Share the same schema between frontend and backend.** The form's `zodResolver` and the oRPC `.input()` must use the identical schema.
4. **Use Drizzle-Zod for insert/update schemas** when the validator closely mirrors the database table structure.
5. **Keep schemas composable.** Use `.pick()`, `.omit()`, `.extend()`, and `.merge()` to derive variants from a base schema.

## Related Skills

- **backend-orpc** -- API routes that consume validators via `.input()`
- **backend-database** -- Drizzle schemas that Drizzle-Zod generates validators from
- **frontend-forms** -- Forms that consume validators via `zodResolver`
- **architecture-skills** -- File organization conventions for validators
