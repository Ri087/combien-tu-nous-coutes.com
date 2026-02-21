# Skill: Create a Form with React Hook Form

## When to Use

Use this skill whenever you need to create a new form in the application. This covers any user input scenario: creating/editing entities, settings pages, profile updates, search filters, etc.

## Prerequisites

- React Hook Form v7.62+ is already installed
- Zod v4.3+ is already installed
- `@hookform/resolvers/zod` is already installed
- Form wrapper components are available in `/components/form/`
- AlignUI components are available in `/components/ui/`

## Step-by-Step Instructions

### Step 1: Create the Zod Validator

Create the validation schema in `/validators/<feature>.ts`. This file is owned by the backend-dev role, but if it does not exist yet, create it following this pattern:

```typescript
// validators/projects.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  startDate: z.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Step 2: Create the Form Component

Create the form component in `app/(application)/<feature>/_components/<feature>-form.tsx`.

#### Complete Template (using form wrapper components)

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@remixicon/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FormInput } from "@/components/form";
import { FormSelect } from "@/components/form";
import { FormTextarea } from "@/components/form";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import { createProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof createProjectSchema>;

export function CreateProjectForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    try {
      // Call your API here (oRPC mutation, authClient, etc.)
      console.log(data);
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        label="Project Name"
        name="name"
        placeholder="My awesome project"
        required
      />

      <FormTextarea
        control={form.control}
        label="Description"
        maxLength={500}
        name="description"
        placeholder="Describe your project..."
      />

      <FormSelect
        control={form.control}
        label="Status"
        name="status"
        options={[
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
        required
      />

      <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
        {error}
      </FormGlobalMessage>

      <FancyButton.Root
        disabled={isSubmitting}
        size="medium"
        variant="primary"
      >
        {isSubmitting && <StaggeredFadeLoader variant="muted" />}
        {isSubmitting ? "Creating..." : "Create Project"}
      </FancyButton.Root>
    </form>
  );
}
```

#### Alternative: Using register() Instead of Controller

For simple text inputs, you can use `register()` directly with AlignUI components (this is the pattern used in auth forms):

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiMailLine } from "@remixicon/react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import * as FancyButton from "@/components/ui/fancy-button";
import { FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import { mySchema } from "@/validators/my-feature";

export function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    // ...
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="email">
          Email <Label.Asterisk />
        </Label.Root>
        <Input.Root hasError={!!formState.errors.email}>
          <Input.Wrapper>
            <Input.Icon as={RiMailLine} />
            <Input.Input
              {...register("email")}
              id="email"
              placeholder="hello@example.com"
              type="email"
            />
          </Input.Wrapper>
        </Input.Root>
        <FormMessage>{formState.errors.email?.message}</FormMessage>
      </div>

      <FancyButton.Root size="medium" variant="primary">
        Submit
      </FancyButton.Root>
    </form>
  );
}
```

### Step 3: File Structure

Follow the feature-first architecture:

```
app/(application)/projects/
  page.tsx                          --> Server Component (page shell)
  _components/
    create-project-form.tsx         --> The form component
    project-list.tsx                --> List component
  _hooks/
    use-projects.ts                 --> React Query hooks
  _actions/
    create-project.ts               --> Server actions (if needed)
validators/
  projects.ts                       --> Zod schemas (shared)
```

## Critical Rules

1. **Always use `"use client"`** at the top of form components -- forms are interactive
2. **Always provide `defaultValues`** to `useForm()` -- prevents uncontrolled-to-controlled warnings
3. **Always use `zodResolver`** -- never validate manually
4. **Prefer form wrapper components** (`FormInput`, `FormSelect`, etc.) from `/components/form/` -- they handle error display, labels, and Controller wiring automatically
5. **Use `register()` only** when you need direct control over the AlignUI Input component (e.g., custom icons, autoComplete attributes)
6. **Type the form values** with `z.infer<typeof schema>` -- never use `any`
7. **The `onSubmit` function** is always wrapped by `form.handleSubmit()` -- never call it directly
8. **Default value types must match schema types**: strings default to `""`, booleans to `false`, optional fields to `undefined` or `""`
9. **Never modify** files in `/components/ui/` -- use them as-is
