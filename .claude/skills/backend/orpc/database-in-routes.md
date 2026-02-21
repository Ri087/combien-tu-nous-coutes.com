# Use the Database Within oRPC Routes

## When to use

When performing database operations (queries, inserts, updates, deletes) inside oRPC procedure handlers. The database is accessed through `context.db`, which is a Drizzle ORM instance connected to Neon Postgres.

## How the database is provided

The database instance is created in `/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool, { schema });

type Database = typeof db;
export { db, type Database };
```

It is injected into oRPC context via the API route handler:

```typescript
// /app/api/rpc/[[...rest]]/route.ts
const { response } = await handler.handle(request, {
  prefix: "/api/rpc",
  context: {
    headers: request.headers,
    db,  // <-- injected here
  },
});
```

Inside any handler, access it as `context.db`:

```typescript
.handler(async ({ context }) => {
  const { db } = context;
  // db is the Drizzle ORM instance with all schema relations loaded
})
```

## Query patterns

### 1. Find many records

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, desc } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const { db, session } = context;

      return db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
        orderBy: [desc(projects.createdAt)],
      });
    }),
};
```

### 2. Find one record

```typescript
import { z } from "zod";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

getById: protectedProcedure
  .route({ method: "GET" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    const { db } = context;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, input.id),
    });

    if (!project) {
      throw new ORPCError("NOT_FOUND", { message: "Project not found" });
    }

    return project;
  }),
```

### 3. Find with relations

Relations must be defined in the schema (see `/db/schema/auth/relations.ts` for an example). Then use `with`:

```typescript
getWithDetails: protectedProcedure
  .route({ method: "GET" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    const { db } = context;

    return db.query.projects.findFirst({
      where: eq(projects.id, input.id),
      with: {
        tasks: true,              // Load all tasks
        members: {
          with: { user: true },   // Load members with nested user
        },
      },
    });
  }),
```

### 4. Find with column selection

```typescript
list: protectedProcedure
  .route({ method: "GET" })
  .handler(async ({ context }) => {
    const { db, session } = context;

    return db.query.projects.findMany({
      where: eq(projects.userId, session.user.id),
      columns: {
        id: true,
        name: true,
        createdAt: true,
        // Only these columns are returned
      },
    });
  }),
```

### 5. Find with complex filters

```typescript
import { eq, and, or, ilike, gte, lte, inArray, isNull, isNotNull } from "drizzle-orm";

search: protectedProcedure
  .route({ method: "GET" })
  .input(
    z.object({
      query: z.string().optional(),
      status: z.enum(["active", "archived"]).optional(),
      createdAfter: z.string().datetime().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const conditions = [eq(projects.userId, session.user.id)];

    if (input.query) {
      conditions.push(
        or(
          ilike(projects.name, `%${input.query}%`),
          ilike(projects.description, `%${input.query}%`)
        )!
      );
    }

    if (input.status) {
      conditions.push(eq(projects.status, input.status));
    }

    if (input.createdAfter) {
      conditions.push(gte(projects.createdAt, new Date(input.createdAfter)));
    }

    return db.query.projects.findMany({
      where: and(...conditions),
      orderBy: [desc(projects.createdAt)],
    });
  }),
```

### 6. Pagination with limit/offset

```typescript
list: protectedProcedure
  .route({ method: "GET" })
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const items = await db.query.projects.findMany({
      where: eq(projects.userId, session.user.id),
      limit: input.limit,
      offset: input.offset,
      orderBy: [desc(projects.createdAt)],
    });

    return { items, limit: input.limit, offset: input.offset };
  }),
```

## Mutation patterns

### 7. Insert a record

```typescript
import { projects } from "@/db/schema";

create: protectedProcedure
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const [project] = await db
      .insert(projects)
      .values({
        name: input.name,
        userId: session.user.id,
      })
      .returning();

    return project;
  }),
```

### 8. Insert multiple records

```typescript
bulkCreate: protectedProcedure
  .input(z.object({ names: z.array(z.string().min(1)).min(1).max(50) }))
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const records = input.names.map((name) => ({
      name,
      userId: session.user.id,
    }));

    const created = await db.insert(projects).values(records).returning();
    return created;
  }),
```

### 9. Update a record

```typescript
import { eq, and } from "drizzle-orm";

update: protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const { db, session } = context;
    const { id, ...data } = input;

    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(projects.id, id), eq(projects.userId, session.user.id))
      )
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Project not found" });
    }

    return updated;
  }),
```

### 10. Delete a record

```typescript
import { eq, and } from "drizzle-orm";

deleteProject: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const [deleted] = await db
      .delete(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.userId, session.user.id))
      )
      .returning();

    if (!deleted) {
      throw new ORPCError("NOT_FOUND", { message: "Project not found" });
    }

    return { success: true };
  }),
```

### 11. Upsert (insert or update on conflict)

```typescript
upsert: protectedProcedure
  .input(z.object({ externalId: z.string(), name: z.string() }))
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    const [result] = await db
      .insert(projects)
      .values({
        externalId: input.externalId,
        name: input.name,
        userId: session.user.id,
      })
      .onConflictDoUpdate({
        target: projects.externalId,
        set: { name: input.name, updatedAt: new Date() },
      })
      .returning();

    return result;
  }),
```

### 12. Transaction for multi-table operations

```typescript
import { ORPCError } from "@orpc/server";

createWithTasks: protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      tasks: z.array(z.object({ title: z.string().min(1) })),
    })
  )
  .handler(async ({ context, input }) => {
    const { db, session } = context;

    return db.transaction(async (tx) => {
      // Create the project
      const [project] = await tx
        .insert(projects)
        .values({ name: input.name, userId: session.user.id })
        .returning();

      // Create associated tasks
      if (input.tasks.length > 0) {
        const taskRecords = input.tasks.map((task) => ({
          title: task.title,
          projectId: project.id,
        }));
        await tx.insert(tasks).values(taskRecords);
      }

      // Return project with tasks
      return tx.query.projects.findFirst({
        where: eq(projects.id, project.id),
        with: { tasks: true },
      });
    });
  }),
```

## Importing Drizzle operators

Always import query operators from `drizzle-orm`:

```typescript
import {
  eq,       // Equal
  ne,       // Not equal
  gt,       // Greater than
  gte,      // Greater than or equal
  lt,       // Less than
  lte,      // Less than or equal
  and,      // AND condition
  or,       // OR condition
  not,      // NOT condition
  ilike,    // Case-insensitive LIKE
  like,     // Case-sensitive LIKE
  inArray,  // IN array
  isNull,   // IS NULL
  isNotNull, // IS NOT NULL
  desc,     // ORDER BY DESC
  asc,      // ORDER BY ASC
  sql,      // Raw SQL
  count,    // COUNT aggregate
} from "drizzle-orm";
```

## Schema imports

Always import table schemas from `@/db/schema`:

```typescript
import { projects, tasks, user } from "@/db/schema";
```

The schema barrel export is at `/db/schema/index.ts`. When you add a new schema file, export it from there:

```typescript
// /db/schema/index.ts
export * from "./auth";
export * from "./projects";
```

## Rules

- ALWAYS access the database through `context.db` -- never import `db` directly in router files
- ALWAYS use `.returning()` on insert/update/delete to get the affected records
- ALWAYS scope user-specific queries with `eq(table.userId, session.user.id)`
- ALWAYS use `and()` to combine multiple where conditions
- ALWAYS use transactions (`db.transaction()`) when modifying multiple tables atomically
- ALWAYS check if a record exists before updating/deleting (throw `ORPCError("NOT_FOUND")`)
- NEVER use raw SQL unless absolutely necessary -- use Drizzle's query builder
- NEVER return entire table contents without filtering by user
- Import Drizzle operators from `drizzle-orm`, NOT from `drizzle-orm/pg-core`
- Import table schemas from `@/db/schema`

## Related skills

- See `create-router.md` for the full router pattern
- See `error-handling.md` for handling database errors
- See `get-routes.md` for read operation patterns
- See `mutation-routes.md` for write operation patterns
- See `route-context.md` for accessing the db through context
