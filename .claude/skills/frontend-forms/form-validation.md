# Skill: Form Validation with Zod

## When to Use

Use this skill whenever you need to define validation rules for a form, handle field-level or form-level errors, or implement cross-field validation.

## Prerequisites

- Zod v4.3+ is installed
- `@hookform/resolvers/zod` is installed
- Validators live in `/validators/<feature>.ts`

## Step-by-Step Instructions

### Step 1: Define the Zod Schema

Create or update the schema in `/validators/<feature>.ts`:

```typescript
// validators/projects.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  age: z.number().min(18, "Must be at least 18").max(120),
  status: z.enum(["draft", "active", "archived"]),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Step 2: Connect the Schema to the Form

Use `zodResolver` in `useForm()`:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { createProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof createProjectSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(createProjectSchema),
  defaultValues: {
    name: "",
    email: "",
    age: undefined,
    status: "draft",
    description: "",
    startDate: undefined,
    tags: [],
    website: "",
  },
});
```

### Step 3: Handle Field-Level Errors

When using form wrapper components, errors are displayed automatically:

```tsx
<FormInput
  control={form.control}
  label="Name"
  name="name"
  placeholder="Project name"
  required
/>
// Error message appears below the input automatically via FormField
```

When using `register()` directly, display errors manually:

```tsx
import { FormMessage } from "@/components/ui/form";

<div className="flex flex-col gap-1">
  <Label.Root htmlFor="name">
    Name <Label.Asterisk />
  </Label.Root>
  <Input.Root hasError={!!form.formState.errors.name}>
    <Input.Wrapper>
      <Input.Input {...form.register("name")} id="name" placeholder="Name" />
    </Input.Wrapper>
  </Input.Root>
  <FormMessage>{form.formState.errors.name?.message}</FormMessage>
</div>
```

### Step 4: Cross-Field Validation with .refine()

Use `.refine()` or `.superRefine()` for validation that depends on multiple fields:

```typescript
// validators/auth.ts
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This targets the error to the confirmPassword field
  });
```

For multiple cross-field validations, use `.superRefine()`:

```typescript
export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
    budget: z.number(),
    maxBudget: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
    if (data.budget > data.maxBudget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Budget exceeds maximum allowed",
        path: ["budget"],
      });
    }
  });
```

### Step 5: Form-Level Errors (Global Errors)

For errors that do not belong to a specific field (e.g., server errors), use `FormGlobalMessage`:

```tsx
import { RiErrorWarningFill } from "@remixicon/react";
import { FormGlobalMessage } from "@/components/ui/form";

const [error, setError] = useState<string | null>(null);

// In onSubmit:
const onSubmit = form.handleSubmit(async (data) => {
  setError(null);
  try {
    await createProject(data);
  } catch {
    setError("Failed to create project. Please try again.");
  }
});

// In JSX:
<FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
  {error}
</FormGlobalMessage>
```

## Common Zod Patterns

### String Validations
```typescript
z.string().min(1, "Required")              // Required string
z.string().email("Invalid email")          // Email
z.string().url("Invalid URL")             // URL
z.string().uuid()                           // UUID
z.string().regex(/^[A-Z]/, "Must start with uppercase")
z.string().trim()                           // Auto-trim whitespace
z.string().min(1).max(255)                 // Length constraints
```

### Number Validations
```typescript
z.number().min(0, "Must be positive")
z.number().max(100, "Must be 100 or less")
z.number().int("Must be a whole number")
z.number().positive("Must be greater than 0")
z.coerce.number()                          // Coerce string to number (useful for HTML inputs)
```

### Optional Fields with Fallback
```typescript
z.string().optional()                      // string | undefined
z.string().nullable()                      // string | null
z.string().default("untitled")             // Provides default if missing
z.string().optional().or(z.literal(""))    // Allow empty string
```

### Enum and Union
```typescript
z.enum(["draft", "active", "archived"])
z.union([z.string(), z.number()])
z.literal("specific-value")
```

### Date
```typescript
z.date()                                    // Must be a Date object
z.date({ required_error: "Date is required" })
z.coerce.date()                            // Coerce string/number to Date
```

### Array
```typescript
z.array(z.string())                        // Array of strings
z.array(z.string()).min(1, "At least one required")
z.array(z.string()).max(5, "Maximum 5 items")
```

### Conditional / Transform
```typescript
// Transform: trim and lowercase
z.string().trim().toLowerCase()

// Conditional validation
z.string().refine((val) => val !== "admin", {
  message: "Cannot use reserved name",
})
```

## Critical Rules

1. **Always define schemas in `/validators/`** -- they are shared between frontend and backend
2. **Always export the schema AND the inferred type** -- use `z.infer<typeof schema>`
3. **Always provide human-readable error messages** -- never rely on Zod defaults
4. **Use `.refine()` with `path`** to target cross-field errors to specific fields
5. **Use `z.coerce.number()`** when the input comes from an HTML `<input type="number">` and you want automatic string-to-number coercion
6. **Never use `any`** -- Zod schemas provide complete type inference
7. **Keep schemas flat** -- avoid deeply nested objects unless the domain requires it
8. **Match `defaultValues` types to schema types** -- a `z.number()` field should default to `undefined`, not `""` (unless using `z.coerce.number()`)
