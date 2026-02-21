# Skill: Form Submission Handling

## When to Use

Use this skill whenever you need to handle form submission, including loading states, success/error handling, API integration (oRPC mutations or authClient), redirects, and toast notifications.

## Prerequisites

- React Hook Form is set up with `useForm()` and `zodResolver`
- oRPC client is available via `@/lib/orpc/client` or the feature's `_hooks/` directory
- `authClient` is available at `@/lib/auth/client` for auth-related submissions
- `sonner` is available for toast notifications
- `StaggeredFadeLoader` is available at `@/components/staggered-fade-loader`
- `FancyButton` or `Button` is available from `/components/ui/`

## Step-by-Step Instructions

### Pattern 1: oRPC Mutation Submission

This is the standard pattern for submitting data to your API.

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";

import { FormInput } from "@/components/form";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import { orpc } from "@/lib/orpc/client";
import { createProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof createProjectSchema>;

export function CreateProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => orpc.projects.create(data),
    onSuccess: () => {
      // Invalidate related queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Show success toast
      toast.success("Project created successfully");

      // Reset the form
      form.reset();

      // Optionally redirect
      router.push("/projects");

      // Optionally call parent callback
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message || "Failed to create project");
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    mutation.mutate(data);
  });

  const isSubmitting = mutation.isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        label="Project Name"
        name="name"
        placeholder="My project"
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

### Pattern 2: authClient Submission (Auth Forms)

Used for sign-in, sign-up, password reset, and other auth flows.

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import { PAGES } from "@/constants/pages";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError(null);
    setIsLoading(true);

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: PAGES.DASHBOARD,
      },
      {
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message);
        },
        // onSuccess is handled by callbackURL redirect
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields... */}

      <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
        {error}
      </FormGlobalMessage>

      <FancyButton.Root
        disabled={isLoading}
        size="medium"
        variant="primary"
      >
        {isLoading && <StaggeredFadeLoader variant="muted" />}
        {isLoading ? "Signing in..." : "Sign in"}
      </FancyButton.Root>
    </form>
  );
}
```

### Pattern 3: Async handleSubmit with try/catch

For direct async operations without TanStack Query:

```tsx
const onSubmit = form.handleSubmit(async (data) => {
  setError(null);
  try {
    const result = await orpc.projects.create(data);
    toast.success("Created successfully");
    router.push(`/projects/${result.id}`);
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unexpected error occurred");
    }
  }
});
```

### Pattern 4: Server-Side Errors Mapped to Fields

When the server returns field-specific errors, use `form.setError()`:

```tsx
const onSubmit = form.handleSubmit(async (data) => {
  setError(null);

  const { error } = await authClient.forgetPassword.emailOtp({
    email: data.email,
  });

  if (error) {
    // Set error on a specific field
    form.setError("email", {
      message: error.message,
    });
  } else {
    setSuccess(true);
  }
});
```

## Loading State Pattern

The standard loading state pattern uses `StaggeredFadeLoader` inside the submit button:

```tsx
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";

// Using formState.isSubmitting (for async handleSubmit):
const { isSubmitting } = form.formState;

// Or using mutation.isPending (for TanStack Query):
const isSubmitting = mutation.isPending;

// Or using manual state (for authClient):
const [isLoading, setIsLoading] = useState(false);

<FancyButton.Root
  disabled={isSubmitting}
  size="medium"
  variant="primary"
>
  {isSubmitting && <StaggeredFadeLoader variant="muted" />}
  {isSubmitting ? "Saving..." : "Save Changes"}
</FancyButton.Root>
```

**Alternative with `Button.Root`:**

```tsx
import * as Button from "@/components/ui/button";

<Button.Root
  disabled={isSubmitting}
  mode="filled"
  size="md"
  type="submit"
  variant="primary"
>
  {isSubmitting && <StaggeredFadeLoader variant="muted" />}
  {isSubmitting ? "Saving..." : "Save"}
</Button.Root>
```

## Query Invalidation After Mutation

When a mutation changes data that is displayed in a list or detail view, invalidate the relevant queries:

```tsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// In mutation onSuccess:
onSuccess: () => {
  // Invalidate all queries with this key prefix
  queryClient.invalidateQueries({ queryKey: ["projects"] });

  // Or invalidate a specific query using queryOptions pattern
  queryClient.invalidateQueries(projectsQueryOptions());
},
```

## Toast Notifications

Use `sonner` for success/info/warning toasts:

```tsx
import { toast } from "sonner";

// Success
toast.success("Project created successfully");

// Error
toast.error("Failed to create project");

// With description
toast.success("Project created", {
  description: "You can now start adding tasks.",
});
```

## Critical Rules

1. **Always wrap onSubmit with `form.handleSubmit()`** -- this triggers validation before submission
2. **Always clear errors before submission** -- call `setError(null)` at the start
3. **Always disable the submit button during submission** -- prevents double submissions
4. **Always show loading state** -- use `StaggeredFadeLoader` inside the button
5. **Change button text during loading** -- e.g., "Save" becomes "Saving..."
6. **Invalidate queries after successful mutations** -- keeps lists and details in sync
7. **Use `form.setError()` for server-side field errors** -- maps backend errors to specific fields
8. **Use `FormGlobalMessage` for non-field errors** -- displayed as a banner above the submit button
9. **Use `toast.success()` for success feedback** -- quick, non-blocking notification
10. **Never use `form.formState.isSubmitting`** with synchronous `onSubmit` -- it only works when `onSubmit` returns a Promise
