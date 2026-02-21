# Add Feature - Complete End-to-End Workflow

> This skill guides the AI through every step of adding a new feature to the codebase.
> Follow steps in EXACT order. Do NOT skip steps. Do NOT ask the user questions.

## Prerequisites

Before starting, determine the following from the user's request:
- **Feature name** (e.g., "projects", "tasks", "invoices")
- **Feature fields** (what data the feature stores)
- **Feature relationships** (does it belong to a user? to another feature?)
- **Feature UI** (list page, detail page, create form, edit form)

If the user has not specified details, make reasonable assumptions based on the feature name and proceed without asking.

---

## Step 1: Create the Database Schema

Create the schema directory and files following the existing pattern from `/db/schema/auth/`.

### 1a. Create the schema directory

```
/db/schema/[feature]/
  schema.ts
  relations.ts
  types.ts
  index.ts
```

### 1b. Create `schema.ts`

```typescript
// /db/schema/[feature]/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const [feature] = pgTable("[feature]", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Add feature-specific columns here
  name: text("name").notNull(),
  description: text("description"),
  // Always include userId if the feature belongs to a user
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Always include timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Important notes:**
- Use `uuid` for IDs with `.defaultRandom()` for new features, or `text` if referencing Better Auth entities (auth uses `text` IDs)
- The `userId` field should use `text` type to match the auth `user.id` type (which is `text`, not `uuid`)
- Always include `createdAt` and `updatedAt` timestamps
- Use `.references()` for foreign keys with `onDelete: "cascade"` for user-owned data

### 1c. Create `relations.ts`

```typescript
// /db/schema/[feature]/relations.ts
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { [feature] } from "./schema";

export const [feature]Relations = relations([feature], ({ one }) => ({
  user: one(user, {
    fields: [[feature].userId],
    references: [user.id],
  }),
}));
```

### 1d. Create `types.ts`

```typescript
// /db/schema/[feature]/types.ts
import type { [feature] } from "./schema";

export type [Feature] = typeof [feature].$inferSelect;
export type New[Feature] = typeof [feature].$inferInsert;
```

### 1e. Create `index.ts`

```typescript
// /db/schema/[feature]/index.ts
export * from "./relations";
export * from "./schema";
export * from "./types";
```

### 1f. Export from main schema index

Add to `/db/schema/index.ts`:

```typescript
export * from "./auth";
export * from "./[feature]";  // ADD THIS LINE
```

---

## Step 2: Push the Schema

Run:

```bash
pnpm db:push
```

If the command fails, check:
- Column type mismatches (e.g., `uuid` vs `text` for foreign keys)
- Missing imports
- Circular references

---

## Step 3: Create Validators

Create `/validators/[feature].ts`:

```typescript
// /validators/[feature].ts
import { z } from "zod";

export const create[Feature]Schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  // Add validation for each user-editable field
});

export const update[Feature]Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().optional(),
});

export type Create[Feature]Input = z.infer<typeof create[Feature]Schema>;
export type Update[Feature]Input = z.infer<typeof update[Feature]Schema>;
```

---

## Step 4: Create the oRPC Router

Create `/server/routers/[feature].ts`:

```typescript
// /server/routers/[feature].ts
import { eq } from "drizzle-orm";
import { [feature] } from "@/db/schema/[feature]/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import {
  create[Feature]Schema,
  update[Feature]Schema,
} from "@/validators/[feature]";
import { z } from "zod";

export const [feature]Router = {
  // READ operations MUST have .route({ method: "GET" })
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return context.db.query.[feature].findMany({
        where: eq([feature].userId, context.session.user.id),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });
    }),

  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      return context.db.query.[feature].findFirst({
        where: eq([feature].id, input.id),
      });
    }),

  // WRITE operations do NOT have .route() (defaults to POST)
  create: protectedProcedure
    .input(create[Feature]Schema)
    .handler(async ({ context, input }) => {
      const [result] = await context.db
        .insert([feature])
        .values({
          ...input,
          userId: context.session.user.id,
        })
        .returning();
      return result;
    }),

  update: protectedProcedure
    .input(update[Feature]Schema)
    .handler(async ({ context, input }) => {
      const { id, ...data } = input;
      const [result] = await context.db
        .update([feature])
        .set({ ...data, updatedAt: new Date() })
        .where(eq([feature].id, id))
        .returning();
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      await context.db.delete([feature]).where(eq([feature].id, input.id));
      return { success: true };
    }),
};
```

**Critical oRPC rules:**
- READ operations (list, get, find, search) MUST have `.route({ method: "GET" })`
- WRITE operations (create, update, delete) do NOT have `.route()` (POST by default)
- Use `.handler()` -- never `.query()` or `.mutation()` (those do not exist in oRPC)
- The server uses `StrictGetMethodPlugin`: a GET without `.route({ method: "GET" })` causes a 405 error
- Access context via `context` (not `ctx`) -- check the actual middleware to confirm the parameter name

---

## Step 5: Register the Router

Edit `/server/routers/_app.ts`:

```typescript
import { base } from "@/server/context";
import { [feature]Router } from "./[feature]";

export const appRouter = base.router({
  [feature]: [feature]Router,
  // Keep any existing routers
});
```

---

## Step 6: Add Page Constant

Edit `/constants/pages.ts` -- add the new page to `APPLICATION_PAGES`:

```typescript
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  [FEATURE_UPPER]: "/[feature]",  // ADD THIS LINE
};
```

Use SCREAMING_SNAKE_CASE for the key, matching existing patterns.

---

## Step 7: Create the Page

### 7a. Create the page file

Create `/app/(application)/[feature]/page.tsx`:

```tsx
import { [Feature]PageContent } from "./_components/[feature]-page-content";

export default function [Feature]Page() {
  return <[Feature]PageContent />;
}
```

### 7b. Create the `_components/` directory

All feature-specific components go in `/app/(application)/[feature]/_components/`.

### 7c. Create the main page content component

Create `/app/(application)/[feature]/_components/[feature]-page-content.tsx`:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { [Feature]List } from "./[feature]-list";
import { Create[Feature]Dialog } from "./create-[feature]-dialog";

export function [Feature]PageContent() {
  const { data: items, isLoading } = useQuery(
    orpc.[feature].list.queryOptions()
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header - match existing page headers */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-label-xl text-text-strong-950">[Feature]s</h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Manage your [feature]s
          </p>
        </div>
        <Create[Feature]Dialog />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-text-soft-400">Loading...</div>
      ) : (
        <[Feature]List items={items ?? []} />
      )}
    </div>
  );
}
```

### 7d. Create the list component

Create `/app/(application)/[feature]/_components/[feature]-list.tsx`:

```tsx
"use client";

import type { [Feature] } from "@/db/schema/[feature]/types";
import { [Feature]Card } from "./[feature]-card";

interface [Feature]ListProps {
  items: [Feature][];
}

export function [Feature]List({ items }: [Feature]ListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 py-16">
        <p className="text-paragraph-sm text-text-soft-400">
          No [feature]s yet. Create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <[Feature]Card key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### 7e. Create the card component

Create `/app/(application)/[feature]/_components/[feature]-card.tsx`:

```tsx
"use client";

import type { [Feature] } from "@/db/schema/[feature]/types";

interface [Feature]CardProps {
  item: [Feature];
}

export function [Feature]Card({ item }: [Feature]CardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm">
      <h3 className="text-label-md text-text-strong-950">{item.name}</h3>
      {item.description && (
        <p className="text-paragraph-sm text-text-sub-600">
          {item.description}
        </p>
      )}
    </div>
  );
}
```

### 7f. Create the create dialog

Create `/app/(application)/[feature]/_components/create-[feature]-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "@remixicon/react";

import * as Button from "@/components/ui/button";
import * as Modal from "@/components/ui/modal";
import { FormInput } from "@/components/form/form-input";
import { orpc, orpcClient } from "@/orpc/client";
import {
  create[Feature]Schema,
  type Create[Feature]Input,
} from "@/validators/[feature]";

export function Create[Feature]Dialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<Create[Feature]Input>({
    resolver: zodResolver(create[Feature]Schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Create[Feature]Input) =>
      orpcClient.[feature].create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.[feature].list.queryOptions().queryKey,
      });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <>
      <Button.Root onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        New [Feature]
      </Button.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Create [Feature]</Modal.Title>
            <Modal.Description>
              Add a new [feature] to your workspace.
            </Modal.Description>
          </Modal.Header>

          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
            <Modal.Body className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter a name"
                required
              />
              <FormInput
                control={form.control}
                name="description"
                label="Description"
                placeholder="Enter a description"
              />
            </Modal.Body>

            <Modal.Footer>
              <Button.Root
                type="button"
                variant="neutral"
                mode="stroke"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button.Root>
              <Button.Root
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
```

---

## Step 8: Create Hooks (if needed)

For complex data fetching, create hooks in `/app/(application)/[feature]/_hooks/`:

```tsx
// /app/(application)/[feature]/_hooks/use-[feature]s.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function use[Feature]s() {
  return useQuery(orpc.[feature].list.queryOptions());
}
```

---

## Step 9: Add Sidebar Entry (if sidebar exists)

If the application has a sidebar, add the feature link. Check for sidebar in:
- `/app/(application)/layout.tsx`
- `/components/sidebar.tsx` or similar

Add an entry matching the existing sidebar pattern with an appropriate Remix icon from `@remixicon/react`.

---

## Step 10: Verify Everything

Run the following commands in order:

```bash
# 1. Push the schema
pnpm db:push

# 2. Run full checks (biome lint + TypeScript)
pnpm checks

# 3. Build the project
pnpm build
```

Fix any errors before considering the feature complete.

---

## Common Pitfalls

1. **Foreign key type mismatch**: Auth user IDs are `text`, not `uuid`. Always use `text("user_id")` for `userId` fields referencing auth users.

2. **Missing `.route({ method: "GET" })` on read operations**: The server uses `StrictGetMethodPlugin`. Forgetting this causes 405 errors.

3. **Using `.query()` or `.mutation()` in oRPC**: These do not exist. Always use `.handler()`.

4. **Forgetting to export from `/db/schema/index.ts`**: Drizzle needs all schemas exported to generate proper queries.

5. **Not registering the router in `_app.ts`**: The feature API will not be available without registration.

6. **Forgetting `"use client"` directive**: All interactive components (forms, buttons with onClick, hooks) need this.

7. **Using `any` type**: TypeScript strict mode is enabled. Use proper types or `unknown`.

8. **Not using AlignUI components**: Always import from `@/components/ui/` for buttons, inputs, modals, etc.

---

## File Checklist

After completing all steps, you should have created/modified these files:

- [ ] `/db/schema/[feature]/schema.ts` -- Created
- [ ] `/db/schema/[feature]/relations.ts` -- Created
- [ ] `/db/schema/[feature]/types.ts` -- Created
- [ ] `/db/schema/[feature]/index.ts` -- Created
- [ ] `/db/schema/index.ts` -- Modified (added export)
- [ ] `/validators/[feature].ts` -- Created
- [ ] `/server/routers/[feature].ts` -- Created
- [ ] `/server/routers/_app.ts` -- Modified (registered router)
- [ ] `/constants/pages.ts` -- Modified (added page constant)
- [ ] `/app/(application)/[feature]/page.tsx` -- Created
- [ ] `/app/(application)/[feature]/_components/[feature]-page-content.tsx` -- Created
- [ ] `/app/(application)/[feature]/_components/[feature]-list.tsx` -- Created
- [ ] `/app/(application)/[feature]/_components/[feature]-card.tsx` -- Created
- [ ] `/app/(application)/[feature]/_components/create-[feature]-dialog.tsx` -- Created
- [ ] Sidebar entry -- Modified (if sidebar exists)
