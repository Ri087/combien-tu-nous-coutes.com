# Skill: Form Reset

## When to Use

Use this skill whenever you need to reset a form to its default or initial values, implement a "Discard Changes" button, or reset the form after a successful submission.

## Prerequisites

- React Hook Form's `form.reset()` and `form.formState.isDirty`
- `Button` or `FancyButton` components from `/components/ui/`

## Step-by-Step Instructions

### Step 1: Basic Form Reset

Call `form.reset()` to reset all fields to their `defaultValues`:

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: "",
    description: "",
    status: "draft",
  },
});

// Reset to defaultValues
form.reset();
```

### Step 2: Reset After Successful Submission

Reset the form in the mutation's `onSuccess` or after a successful async operation:

```tsx
// Pattern 1: With TanStack Query mutation
const mutation = useMutation({
  mutationFn: (data: FormValues) => orpc.projects.create(data),
  onSuccess: () => {
    form.reset(); // Resets to defaultValues
    toast.success("Project created");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  },
});

// Pattern 2: With async try/catch
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await orpc.projects.create(data);
    form.reset();
    toast.success("Created successfully");
  } catch {
    setError("Failed to create");
  }
});
```

### Step 3: Reset to Specific Values

You can reset to values different from the original `defaultValues`:

```tsx
// Reset to specific values
form.reset({
  name: "New Name",
  description: "",
  status: "active",
});

// Reset a single field without affecting others
form.resetField("name");

// Reset a single field to a specific value
form.resetField("name", { defaultValue: "New Default" });
```

### Step 4: Edit Forms with Dynamic Initial Values

When editing an existing entity, use `useMemo` to compute `defaultValues` and call `form.reset()` when the data changes:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { updateProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof updateProjectSchema>;

interface EditProjectFormProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  };
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  // Memoize defaultValues to prevent unnecessary resets
  const defaultValues = useMemo<FormValues>(
    () => ({
      name: project.name,
      description: project.description ?? "",
      status: project.status,
    }),
    [project.name, project.description, project.status]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues,
  });

  // Reset form when project data changes (e.g., after refetch)
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  // ...
}
```

### Step 5: Discard Changes Button

Use `form.formState.isDirty` to enable/disable a "Discard" button:

```tsx
import * as Button from "@/components/ui/button";

const { isDirty } = form.formState;

<div className="flex items-center gap-3">
  <Button.Root
    disabled={!isDirty}
    mode="stroke"
    onClick={() => form.reset()}
    size="md"
    type="button"
    variant="neutral"
  >
    Discard
  </Button.Root>

  <FancyButton.Root
    disabled={isSubmitting || !isDirty}
    size="medium"
    variant="primary"
  >
    {isSubmitting && <StaggeredFadeLoader variant="muted" />}
    {isSubmitting ? "Saving..." : "Save Changes"}
  </FancyButton.Root>
</div>
```

Key behaviors:
- `isDirty` is `true` when any field differs from its default value
- `isDirty` becomes `false` after `form.reset()` is called
- The Discard button should have `type="button"` to prevent form submission

### Step 6: Confirmation Before Discard

For forms with important data, add a confirmation dialog:

```tsx
import { useState } from "react";

const [showDiscardDialog, setShowDiscardDialog] = useState(false);

const handleDiscard = () => {
  if (form.formState.isDirty) {
    setShowDiscardDialog(true);
  }
};

const confirmDiscard = () => {
  form.reset();
  setShowDiscardDialog(false);
};
```

### Step 7: Reset Options

`form.reset()` accepts options as a second argument:

```tsx
// Reset and keep errors visible
form.reset(defaultValues, {
  keepErrors: true,
});

// Reset but keep dirty fields tracked
form.reset(defaultValues, {
  keepDirty: true,
});

// Reset but keep touched state
form.reset(defaultValues, {
  keepTouched: true,
});

// Reset but keep submitted state
form.reset(defaultValues, {
  keepIsSubmitted: true,
});

// Keep all states except values
form.reset(defaultValues, {
  keepDirtyValues: true, // Only reset non-dirty fields
});
```

## Complete Edit Form Example

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";

import { FormInput, FormTextarea } from "@/components/form";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Button from "@/components/ui/button";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import { orpc } from "@/lib/orpc/client";
import { updateProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof updateProjectSchema>;

interface EditProjectFormProps {
  project: { id: string; name: string; description: string | null };
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(
    () => ({
      name: project.name,
      description: project.description ?? "",
    }),
    [project.name, project.description]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      orpc.projects.update({ id: project.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Project updated");
      // Reset to new values so isDirty becomes false
      form.reset(form.getValues());
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    mutation.mutate(data);
  });

  const { isDirty } = form.formState;
  const isSubmitting = mutation.isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        label="Name"
        name="name"
        placeholder="Project name"
        required
      />

      <FormTextarea
        control={form.control}
        label="Description"
        name="description"
        placeholder="Describe the project..."
      />

      <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
        {error}
      </FormGlobalMessage>

      <div className="flex items-center gap-3">
        <Button.Root
          disabled={!isDirty}
          mode="stroke"
          onClick={() => form.reset()}
          size="md"
          type="button"
          variant="neutral"
        >
          Discard
        </Button.Root>

        <FancyButton.Root
          disabled={isSubmitting || !isDirty}
          size="medium"
          variant="primary"
        >
          {isSubmitting && <StaggeredFadeLoader variant="muted" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </FancyButton.Root>
      </div>
    </form>
  );
}
```

## Critical Rules

1. **Always provide `defaultValues` to `useForm()`** -- `reset()` relies on them
2. **Use `useMemo` for computed defaultValues** -- prevents infinite re-render loops with `useEffect`
3. **Call `form.reset(defaultValues)` in `useEffect`** when the source data changes -- keeps the form in sync
4. **Use `isDirty` to gate the Discard button** -- `disabled={!isDirty}`
5. **After a successful edit, reset to current values** -- `form.reset(form.getValues())` marks the form as clean
6. **Discard button must have `type="button"`** -- prevents unintended form submission
7. **Never call `form.reset()` during render** -- only in event handlers or effects
