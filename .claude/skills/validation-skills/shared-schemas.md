# Shared Validation Schemas

## When to Use

When multiple features need the same validation patterns (pagination, sorting, ID parameters) or when you need to compose schemas from existing ones using `.extend()`, `.merge()`, `.pick()`, `.omit()`, and `.partial()`.

## Shared Schemas File

Place reusable cross-feature schemas in `/validators/shared.ts`:

```typescript
// /validators/shared.ts
import { z } from "zod";

// --- Pagination ---
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// --- Cursor-based pagination ---
export const cursorPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;

// --- Sorting ---
export const sortingSchema = z.object({
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type SortingInput = z.infer<typeof sortingSchema>;

// --- ID parameter ---
export const idSchema = z.object({
  id: z.string().uuid(),
});

export type IdInput = z.infer<typeof idSchema>;

// --- Bulk IDs ---
export const bulkIdsSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "Select at least one item")
    .max(50, "Cannot process more than 50 items at once"),
});

export type BulkIdsInput = z.infer<typeof bulkIdsSchema>;

// --- Search ---
export const searchSchema = z.object({
  query: z.string().max(200).optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;

// --- Date range ---
export const dateRangeSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["to"],
    }
  );

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
```

## Composing Schemas

### .extend() -- Add fields to an existing schema

Creates a new schema with all fields from the original plus new ones. Does NOT mutate the original.

```typescript
import { paginationSchema, sortingSchema } from "@/validators/shared";
import { z } from "zod";

// Add search and filtering to pagination
export const listProjectsSchema = paginationSchema.extend({
  query: z.string().max(200).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  sortBy: z
    .enum(["createdAt", "name", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
```

### .merge() -- Combine two schemas

Merges all fields from two schemas into one. Both must be `z.object()` schemas.

```typescript
import { paginationSchema, searchSchema, sortingSchema } from "@/validators/shared";

// Combine pagination + search + sorting
export const listWithSearchSchema = paginationSchema
  .merge(searchSchema)
  .merge(sortingSchema);

export type ListWithSearchInput = z.infer<typeof listWithSearchSchema>;
```

**Difference between .extend() and .merge():**
- `.extend()` -- adds or overrides fields from a plain object of Zod types
- `.merge()` -- combines two `z.object()` schemas; if both have the same key, the second schema wins

### .pick() -- Select specific fields

Creates a new schema with only the specified fields.

```typescript
import { z } from "zod";

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  bio: z.string().optional(),
});

// Only name and email
export const updateProfileSchema = userSchema.pick({
  name: true,
  email: true,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
// { name: string; email: string }
```

### .omit() -- Exclude specific fields

Creates a new schema with all fields except the specified ones.

```typescript
// Everything except id and role
export const createUserSchema = userSchema.omit({
  id: true,
  role: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
// { name: string; email: string; bio?: string }
```

### .partial() -- Make all fields optional

Creates a new schema where every field becomes optional.

```typescript
const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(500),
  status: z.enum(["draft", "active", "archived"]),
});

// All fields optional -- useful for PATCH/update operations
export const updateProjectSchema = projectSchema.partial().extend({
  id: z.string().uuid(), // ID is still required
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
// { id: string; name?: string; description?: string; status?: "draft" | "active" | "archived" }
```

### .partial() with specific fields

Make only some fields optional:

```typescript
// Only name and description become optional
export const patchProjectSchema = projectSchema
  .partial({ name: true, description: true })
  .extend({ id: z.string().uuid() });
```

### .required() -- Make all fields required

Opposite of `.partial()`. Makes all optional fields required:

```typescript
const optionalSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
});

const requiredSchema = optionalSchema.required();
// { name: string; email: string }
```

## Real-World Composition Patterns

### List endpoint with pagination, search, and filters

```typescript
// /validators/project.ts
import { z } from "zod";
import { paginationSchema } from "@/validators/shared";

export const listProjectsSchema = paginationSchema.extend({
  query: z.string().max(200).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  sortBy: z
    .enum(["createdAt", "name", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
```

Usage in the router:

```typescript
// /server/routers/projects.ts
import { listProjectsSchema } from "@/validators/project";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .input(listProjectsSchema)
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const { limit, offset, query, status, sortBy, sortOrder } = input;
      // Build query with filters...
    }),
};
```

### Create and update from the same base

```typescript
// /validators/task.ts
import { z } from "zod";

// Base fields shared between create and update
const taskFieldsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().datetime().optional(),
});

// Create -- all base fields required (as defined)
export const createTaskSchema = taskFieldsSchema;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Update -- all base fields optional + required ID
export const updateTaskSchema = taskFieldsSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

### Feature-specific filter extending shared search

```typescript
// /validators/invoice.ts
import { z } from "zod";
import { paginationSchema, searchSchema, dateRangeSchema } from "@/validators/shared";

export const listInvoicesSchema = paginationSchema
  .merge(searchSchema)
  .extend({
    status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
    dateRange: dateRangeSchema.optional(),
  });

export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
```

### Reusing ID schema for single-resource operations

```typescript
// /validators/shared.ts
export const idSchema = z.object({
  id: z.string().uuid(),
});

// Usage in routers
export const projectsRouter = {
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(idSchema)
    .handler(async ({ context, input }) => {
      // input.id is typed as string
    }),

  delete: protectedProcedure
    .input(idSchema)
    .handler(async ({ context, input }) => {
      // input.id is typed as string
    }),
};
```

## Rules

- ALWAYS place reusable cross-feature schemas in `/validators/shared.ts`
- ALWAYS import shared schemas rather than redefining pagination/sorting/ID patterns
- ALWAYS export the inferred type alongside each composed schema
- ALWAYS use `.extend()` when adding fields to a schema from a plain object
- ALWAYS use `.merge()` when combining two existing `z.object()` schemas
- ALWAYS use `.partial().extend({ id: z.string().uuid() })` for update schemas derived from create schemas
- NEVER mutate existing schemas -- `.extend()`, `.pick()`, `.omit()`, `.partial()` all return new schemas
- NEVER duplicate shared patterns across feature files -- extract to `/validators/shared.ts`
- Keep composition chains readable -- break into intermediate variables if the chain exceeds 3 operations
- Prefer `.pick()` over `.omit()` when you need fewer than half the fields

## Related Skills

- See `create-validator.md` for basic Zod schema creation patterns
- See `organization.md` for validator file placement and naming
- See `custom-refinements.md` for adding `.refine()` and `.transform()` to composed schemas
- See `drizzle-zod.md` for composing on top of Drizzle-generated schemas
