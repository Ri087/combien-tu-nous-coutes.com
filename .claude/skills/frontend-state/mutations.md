# Skill: Mutations with oRPC

## Purpose

Complete guide to performing data mutations (create, update, delete) using TanStack Query's `useMutation` with oRPC. Covers basic mutations, error handling, optimistic updates, and form integration.

## Prerequisites

- An oRPC mutation procedure exists in `/server/routers/` (without `.route({ method: 'GET' })`)
- The procedure is registered in `/server/routers/_app.ts`
- A Zod validator exists in `/validators/` if the mutation takes complex input

## Key Imports

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";
```

**Important distinction:**
- `orpc` -- TanStack Query utils (generates `queryOptions`, `queryKey`)
- `orpcClient` -- raw oRPC client (used as `mutationFn` for direct procedure calls)

## Pattern 1: Basic Mutation

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";
import { toast } from "sonner";

export function CreateProjectButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      orpcClient.projects.create(input),
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  return (
    <Button.Root
      variant="primary"
      size="medium"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ name: "New Project" })}
    >
      {mutation.isPending ? "Creating..." : "Create Project"}
    </Button.Root>
  );
}
```

## Pattern 2: Mutation with React Hook Form

The most common pattern in this codebase -- combine `useMutation` with `react-hook-form` and Zod validation.

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAddLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";

import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { orpc, orpcClient } from "@/orpc/client";
import { createProjectSchema } from "@/validators/project";

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateProjectInput) =>
      orpcClient.projects.create(input),
    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  const onSubmit = (values: CreateProjectInput) => {
    mutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="name">
          Name <Label.Asterisk />
        </Label.Root>
        <Input.Root hasError={!!formState.errors.name}>
          <Input.Wrapper>
            <Input.Input
              {...register("name")}
              id="name"
              placeholder="Project name"
            />
          </Input.Wrapper>
        </Input.Root>
        <FormMessage>{formState.errors.name?.message}</FormMessage>
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="description">Description</Label.Root>
        <Input.Root hasError={!!formState.errors.description}>
          <Input.Wrapper>
            <Input.Input
              {...register("description")}
              id="description"
              placeholder="Optional description"
            />
          </Input.Wrapper>
        </Input.Root>
        <FormMessage>{formState.errors.description?.message}</FormMessage>
      </div>

      <Button.Root
        type="submit"
        variant="primary"
        size="medium"
        disabled={mutation.isPending}
      >
        <Button.Icon as={RiAddLine} />
        {mutation.isPending ? "Creating..." : "Create Project"}
      </Button.Root>
    </form>
  );
}
```

## Pattern 3: Delete Mutation with Confirmation

```tsx
"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import * as Button from "@/components/ui/button";
import { orpc, orpcClient } from "@/orpc/client";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => orpcClient.projects.delete({ id: projectId }),
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button.Root
          variant="error"
          size="small"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Deleting..." : "Confirm"}
        </Button.Root>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="small"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button.Root>
      </div>
    );
  }

  return (
    <Button.Root
      variant="error"
      mode="ghost"
      size="small"
      onClick={() => setConfirming(true)}
    >
      <Button.Icon as={RiDeleteBinLine} />
    </Button.Root>
  );
}
```

## Pattern 4: Update Mutation

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc, orpcClient } from "@/orpc/client";

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; name: string; description?: string }) =>
      orpcClient.projects.update(input),
    onSuccess: (_data, variables) => {
      toast.success("Project updated");

      // Invalidate the specific project
      queryClient.invalidateQueries({
        queryKey: orpc.projects.get.queryOptions({
          input: { id: variables.id },
        }).queryKey,
      });

      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}
```

## Pattern 5: Optimistic Updates

Use optimistic updates for instant UI feedback while the mutation is in-flight.

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";

type Project = { id: string; name: string; description?: string };

export function useToggleProjectFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; isFavorite: boolean }) =>
      orpcClient.projects.toggleFavorite(input),

    onMutate: async (variables) => {
      const queryKey = orpc.projects.list.queryOptions({ input: {} }).queryKey;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(queryKey);

      // Optimistically update
      queryClient.setQueryData<Project[]>(queryKey, (old) =>
        old?.map((project) =>
          project.id === variables.id
            ? { ...project, isFavorite: variables.isFavorite }
            : project
        )
      );

      // Return context with snapshot for rollback
      return { previousProjects };
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        const queryKey = orpc.projects.list.queryOptions({ input: {} }).queryKey;
        queryClient.setQueryData(queryKey, context.previousProjects);
      }
    },

    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
    },
  });
}
```

## Pattern 6: Mutation with Meta-Based Invalidation

Use `meta.invalidateQueries` for simple, declarative invalidation (handled by MutationCache).

```tsx
const mutation = useMutation({
  mutationFn: (input: { name: string }) => orpcClient.projects.create(input),
  meta: {
    invalidateQueries: [
      orpc.projects.list.queryOptions({ input: {} }).queryKey,
    ],
  },
  onSuccess: () => {
    toast.success("Project created");
  },
});
```

## Pattern 7: Extracting Mutations into Custom Hooks

For reusable mutations, extract into `_hooks/` files.

```tsx
// /app/(application)/projects/_hooks/use-create-project.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc, orpcClient } from "@/orpc/client";

export function useCreateProject(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      orpcClient.projects.create(input),
    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}
```

Usage:

```tsx
// In a component
const createProject = useCreateProject({
  onSuccess: () => setModalOpen(false),
});

createProject.mutate({ name: "My Project" });
```

## Mutation State Reference

```tsx
const mutation = useMutation({ ... });

mutation.mutate(input);       // Fire mutation
mutation.mutateAsync(input);  // Fire mutation (returns Promise)
mutation.isPending;           // true while in-flight
mutation.isSuccess;           // true after success
mutation.isError;             // true after error
mutation.error;               // Error object (if failed)
mutation.data;                // Return data (if succeeded)
mutation.reset();             // Reset to idle state
```

## Rules

- ALWAYS use `orpcClient.routerName.procedureName(input)` as the `mutationFn` (direct call, not queryOptions)
- ALWAYS handle `onError` with a toast or user-visible feedback
- ALWAYS invalidate affected queries after successful mutations (see `query-invalidation.md`)
- ALWAYS use `mutation.isPending` to disable buttons and show loading text
- PREFER extracting reusable mutations into `_hooks/use-[action]-[entity].ts`
- PREFER Zod schemas from `/validators/` for mutation input types
- USE `meta.invalidateQueries` for simple, static invalidation patterns
- USE manual `onSuccess` when invalidation depends on mutation variables
- USE optimistic updates only for toggle/boolean/reorder operations where instant feedback matters
- NEVER call `orpc.routerName.procedureName.queryOptions()` as a mutation -- use `orpcClient` directly
- NEVER forget to show loading state during mutations
