# Create a Zod Validator

## When to Use

When a feature needs input validation -- for forms (React Hook Form), oRPC procedures, or any data that crosses a trust boundary. Every schema shared between frontend and backend lives in `/validators/`.

## Prerequisites

- The feature name is known (e.g., `project`, `invoice`, `task`)
- The fields and their constraints are defined
- You know whether the schema will be used in forms, oRPC, or both

## Step-by-Step Instructions

### Step 1: Create the validator file

Create `/validators/[feature].ts`. One file per feature, matching the feature name in singular or matching the existing convention.

```typescript
// /validators/project.ts
import { z } from "zod";
```

### Step 2: Define the schema

Build the schema using `z.object()` with field-level validation and user-facing error messages.

```typescript
// /validators/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});
```

### Step 3: Export the inferred TypeScript type

Always export a type derived from the schema so components and handlers can import it directly.

```typescript
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Step 4: Add additional schemas for the same feature

Group all schemas for a feature in the same file. Common patterns: create, update, and filter schemas.

```typescript
// /validators/project.ts
import { z } from "zod";

// --- Create ---
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// --- Update ---
export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

## Common Zod Field Patterns

### Strings

```typescript
z.string()                                    // Any string
z.string().min(1, "Required")                 // Non-empty string
z.string().min(3).max(100)                    // Length range
z.string().trim()                             // Auto-trim whitespace
z.string().toLowerCase()                      // Auto-lowercase (Zod v4+)
z.string().regex(/^[a-z0-9-]+$/, "Invalid slug") // Pattern match
```

### Email

```typescript
z.string().email("Please enter a valid email address")
```

### Password (project convention from `/validators/auth.ts`)

```typescript
z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number")
```

### Numbers

```typescript
z.number()                          // Any number
z.number().int()                    // Integer only
z.number().min(0, "Must be positive")
z.number().min(1).max(100)          // Range
z.number().positive()               // > 0
z.number().nonnegative()            // >= 0
```

### Booleans

```typescript
z.boolean()                         // true or false
z.boolean().default(false)          // Default value
```

### Enums

```typescript
z.enum(["draft", "active", "archived"])             // String enum
z.enum(["draft", "active", "archived"]).default("draft") // With default
```

### Arrays

```typescript
z.array(z.string())                                 // Array of strings
z.array(z.string().uuid())                          // Array of UUIDs
z.array(z.string()).min(1, "Select at least one")   // Non-empty array
z.array(z.string()).max(50, "Too many items")       // Max length
```

### Objects (nested)

```typescript
z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().regex(/^\d{5}$/, "Invalid zip code"),
})
```

### Dates

```typescript
z.string().datetime()               // ISO 8601 datetime string
z.string().date()                   // ISO 8601 date string (YYYY-MM-DD)
z.coerce.date()                     // Coerce to Date object
```

### UUIDs

```typescript
z.string().uuid()                   // UUID v4 format
```

### Optional and Nullable

```typescript
z.string().optional()               // string | undefined
z.string().nullable()               // string | null
z.string().nullish()                // string | null | undefined
z.string().optional().default("")   // Defaults to "" if undefined
```

## Usage in oRPC

```typescript
// /server/routers/projects.ts
import { createProjectSchema } from "@/validators/project";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      // input is fully typed as CreateProjectInput
    }),
};
```

## Usage in React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/validators/project";

const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
  defaultValues: {
    name: "",
    description: "",
    status: "draft",
  },
});
```

## Naming Conventions

| Schema purpose | Naming pattern | Example |
|---|---|---|
| Create / insert | `create[Feature]Schema` | `createProjectSchema` |
| Update / patch | `update[Feature]Schema` | `updateProjectSchema` |
| Filter / search | `filter[Feature]Schema` | `filterProjectSchema` |
| Single action | `[action][Feature]Schema` | `archiveProjectSchema` |
| Auth-related | `[action]Schema` | `signUpSchema`, `resetPasswordSchema` |

## Rules

- ALWAYS place shared validators in `/validators/[feature].ts`
- ALWAYS export the inferred TypeScript type alongside each schema: `export type X = z.infer<typeof xSchema>`
- ALWAYS add user-facing error messages to validation rules (`.min(1, "Name is required")`)
- ALWAYS use `.trim()` on user-entered string fields to prevent whitespace issues
- NEVER use `z.any()` -- use specific types or `z.unknown()` if truly unknown
- NEVER duplicate validation logic -- define once in `/validators/` and import everywhere
- Use `z.enum()` instead of union of literals for fixed sets of values
- Use `.default()` for fields with sensible defaults
- Keep one file per feature -- do not scatter schemas across multiple files for the same feature

## Related Skills

- See `organization.md` for how to organize and structure validator files
- See `custom-refinements.md` for `.refine()`, `.superRefine()`, and `.transform()` patterns
- See `shared-schemas.md` for reusable schemas and composition patterns
- See `drizzle-zod.md` for generating schemas from Drizzle table definitions
