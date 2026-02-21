# Validate Input with Zod in oRPC

## When to use

When an oRPC procedure accepts input from the client. Input validation ensures type safety and data integrity. Use Zod schemas either inline in the procedure or imported from `/validators/`.

## Steps

### 1. Inline validation (simple cases)

For procedures with simple, one-off input schemas, define them inline:

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      // input is typed as { id: string }
      return context.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });
    }),
};
```

### 2. Shared validators (recommended for forms)

When a schema is used by both the frontend (React Hook Form) and the backend (oRPC), define it in `/validators/`:

#### Create the validator file

```typescript
// /validators/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

// Export inferred types for use in components and handlers
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

#### Use in the router

```typescript
// /server/routers/projects.ts
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/validators/project";

export const projectsRouter = {
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      // input is typed as CreateProjectInput
      const { db, session } = context;
      const [project] = await db
        .insert(projects)
        .values({ ...input, userId: session.user.id })
        .returning();
      return project;
    }),

  update: protectedProcedure
    .input(updateProjectSchema)
    .handler(async ({ context, input }) => {
      // input is typed as UpdateProjectInput
      const { db, session } = context;
      const { id, ...data } = input;
      const [updated] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return updated;
    }),
};
```

### 3. Common Zod patterns for oRPC input

#### Pagination input

```typescript
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});
```

#### ID input

```typescript
export const idSchema = z.object({
  id: z.string().uuid(),
});
```

#### Search/filter input

```typescript
export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
```

#### Combining schemas

```typescript
// Merge for extending
export const listProjectsSchema = paginationSchema.merge(searchSchema);

// Partial for optional update fields
export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid(),
});

// Pick for subset
export const projectNameSchema = createProjectSchema.pick({ name: true });

// Omit for excluding fields
export const projectWithoutStatusSchema = createProjectSchema.omit({
  status: true,
});
```

### 4. Complex validation patterns

#### Refine for cross-field validation

```typescript
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
```

#### Transform for data normalization

```typescript
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.toLowerCase().replace(/\s+/g, "-")),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
});
```

#### Array input

```typescript
export const bulkActionSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "Select at least one item")
    .max(50, "Cannot process more than 50 items at once"),
});
```

## How oRPC validation works

1. When `.input(schema)` is called, oRPC parses the incoming request body (POST) or query params (GET) through the Zod schema
2. If validation fails, oRPC automatically returns a **422 Unprocessable Entity** error with the Zod error details
3. If validation passes, the `input` parameter in `.handler()` is fully typed according to the schema
4. The same schema can be used with React Hook Form on the frontend via `zodResolver(schema)`

## Validator file naming convention

Follow the existing pattern from `/validators/auth.ts`:

```
/validators/
  auth.ts         -- Authentication-related schemas (exists)
  project.ts      -- Project feature schemas
  task.ts         -- Task feature schemas
  comment.ts      -- Comment feature schemas
```

## Rules

- ALWAYS validate input with `.input(zodSchema)` when a procedure accepts parameters
- ALWAYS define shared schemas in `/validators/[feature].ts` when used by both frontend and backend
- ALWAYS export the inferred TypeScript type: `export type X = z.infer<typeof xSchema>`
- ALWAYS add user-facing error messages to validation rules (`.min(1, "Name is required")`)
- NEVER use `.any()` in Zod schemas -- use specific types
- NEVER trust client input -- always validate server-side even if validated on the client
- Keep GET route input schemas simple (primitives, enums) -- complex objects do not serialize well as query params
- Use `.default()` for optional fields with sensible defaults
- Use `.trim()` on string fields to prevent whitespace issues
- The `.input()` call MUST come before `.handler()`

## Related skills

- See `create-router.md` for the full router pattern
- See `get-routes.md` for GET route input patterns
- See `mutation-routes.md` for mutation input patterns
- See `error-handling.md` for handling validation errors
