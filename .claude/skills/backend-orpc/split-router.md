# Split Large Routers into Sub-Routers

## When to use

When a router file grows beyond 150-200 lines or has more than 6-8 procedures, split it into logical sub-routers for maintainability.

## Steps

### 1. Identify logical groupings

Look at the procedures in your router and group them by sub-domain. For example, a `projects` router might have:

- CRUD operations (list, getById, create, update, delete)
- Member management (addMember, removeMember, listMembers)
- Settings (getSettings, updateSettings)

### 2. Create sub-router files

Create a directory for the feature and split into focused files:

```
/server/routers/projects/
  index.ts          -- Re-exports the combined router
  crud.ts           -- CRUD operations
  members.ts        -- Member management
  settings.ts       -- Settings procedures
```

#### `/server/routers/projects/crud.ts`

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsCrudRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const { db, session } = context;
      return db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
      });
    }),

  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      return db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const [project] = await db
        .insert(projects)
        .values({ name: input.name, userId: session.user.id })
        .returning();
      return project;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
};
```

#### `/server/routers/projects/members.ts`

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, and } from "drizzle-orm";
import { projectMembers } from "@/db/schema";

export const projectsMembersRouter = {
  listMembers: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ projectId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      return db.query.projectMembers.findMany({
        where: eq(projectMembers.projectId, input.projectId),
        with: { user: true },
      });
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        userId: z.string(),
        role: z.enum(["admin", "member", "viewer"]),
      })
    )
    .handler(async ({ context, input }) => {
      const { db } = context;
      const [member] = await db
        .insert(projectMembers)
        .values(input)
        .returning();
      return member;
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        userId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db } = context;
      await db
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, input.userId)
          )
        );
      return { success: true };
    }),
};
```

### 3. Combine in the index file

#### `/server/routers/projects/index.ts`

```typescript
import { projectsCrudRouter } from "./crud";
import { projectsMembersRouter } from "./members";

export const projectsRouter = {
  ...projectsCrudRouter,
  ...projectsMembersRouter,
};
```

### 4. Register in `_app.ts` (unchanged)

The import path changes to the directory (which uses `index.ts`):

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";

export const appRouter = base.router({
  projects: projectsRouter,
});
```

## Alternative: Nested sub-routers

Instead of spreading, you can nest sub-routers to create deeper API paths:

```typescript
// /server/routers/projects/index.ts
import { base } from "@/server/context";
import { projectsCrudRouter } from "./crud";
import { projectsMembersRouter } from "./members";

export const projectsRouter = {
  ...projectsCrudRouter,
  members: base.router(projectsMembersRouter),
};
```

This creates paths like:
- `/api/rpc/projects/list` (from crud)
- `/api/rpc/projects/members/listMembers` (nested under members)

Use nested sub-routers when you want explicit namespacing in the API path. Use the spread pattern when you want a flat structure.

## Rules

- ALWAYS keep the same procedure and router patterns (`.handler()`, `.route({ method: 'GET' })`, etc.)
- ALWAYS re-export the combined router from the `index.ts` file
- The `_app.ts` registration does NOT need to change when splitting -- it still imports from the feature directory
- Keep sub-router files focused: one logical group per file
- Name sub-router files descriptively: `crud.ts`, `members.ts`, `settings.ts`, etc.
- When using the spread pattern, ensure there are no duplicate procedure names across sub-routers
- When nesting with `base.router()`, import `base` from `/server/context`

## Related skills

- See `create-router.md` for the basic router pattern
- See `register-router.md` for registration details
