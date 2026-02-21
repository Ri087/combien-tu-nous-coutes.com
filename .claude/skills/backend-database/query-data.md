# Query Data with Drizzle

## When to Use

Use this skill when you need to read data from the database. Drizzle provides two query APIs:
1. **Relational query API** (`db.query.table.findMany()`) -- preferred for reads with relations
2. **SQL-like query builder** (`db.select().from()`) -- for complex queries, joins, aggregations

## Prerequisites

- Database instance imported from `/db/index.ts`
- Schema tables imported from `/db/schema/`
- Relations defined if using `with` clauses

## Import

```typescript
import { db } from "@/db";
import { eq, and, or, ne, gt, gte, lt, lte, like, ilike, inArray, isNull, isNotNull, between, desc, asc } from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
```

## Relational Query API

This is the preferred API for most reads. It uses the relations defined in your schema.

### Find many records

```typescript
const projects = await db.query.project.findMany();
```

### Find many with filtering

```typescript
const userProjects = await db.query.project.findMany({
  where: eq(project.userId, userId),
});
```

### Find many with multiple conditions

```typescript
const activeUserProjects = await db.query.project.findMany({
  where: and(
    eq(project.userId, userId),
    eq(project.isArchived, false),
  ),
});
```

### Find many with relations (eager loading)

```typescript
const projectsWithUser = await db.query.project.findMany({
  where: eq(project.userId, userId),
  with: {
    user: true, // Load the related user
  },
});
```

### Nested relations

```typescript
const projectsWithDetails = await db.query.project.findMany({
  with: {
    user: true,
    projectTags: {
      with: {
        tag: true,
      },
    },
  },
});
```

### Select specific columns

```typescript
const projectNames = await db.query.project.findMany({
  columns: {
    id: true,
    name: true,
  },
});
```

### Exclude columns

```typescript
const projectsWithoutTimestamps = await db.query.project.findMany({
  columns: {
    createdAt: false,
    updatedAt: false,
  },
});
```

### Ordering

```typescript
const sortedProjects = await db.query.project.findMany({
  where: eq(project.userId, userId),
  orderBy: [desc(project.createdAt)],
});

// Multiple sort criteria
const sorted = await db.query.project.findMany({
  orderBy: [asc(project.name), desc(project.createdAt)],
});
```

### Pagination (limit and offset)

```typescript
const page = await db.query.project.findMany({
  where: eq(project.userId, userId),
  limit: 10,
  offset: 20, // Skip first 20 records (page 3)
  orderBy: [desc(project.createdAt)],
});
```

### Find first record

```typescript
const firstProject = await db.query.project.findFirst({
  where: eq(project.id, projectId),
});

// Returns the record or undefined
if (!firstProject) {
  throw new Error("Project not found");
}
```

### Find first with relations

```typescript
const projectWithUser = await db.query.project.findFirst({
  where: eq(project.id, projectId),
  with: {
    user: true,
  },
});
```

## SQL-Like Query Builder

Use this for complex queries, custom selects, or when you need more control.

### Basic select

```typescript
const projects = await db
  .select()
  .from(project)
  .where(eq(project.userId, userId));
```

### Select specific columns

```typescript
const projectNames = await db
  .select({
    id: project.id,
    name: project.name,
  })
  .from(project);
```

### Multiple where conditions

```typescript
const results = await db
  .select()
  .from(project)
  .where(
    and(
      eq(project.userId, userId),
      eq(project.isArchived, false),
      gte(project.createdAt, startDate),
    ),
  );
```

### OR conditions

```typescript
const results = await db
  .select()
  .from(project)
  .where(
    or(
      eq(project.status, "active"),
      eq(project.status, "pending"),
    ),
  );
```

### Ordering, limit, and offset

```typescript
const results = await db
  .select()
  .from(project)
  .where(eq(project.userId, userId))
  .orderBy(desc(project.createdAt))
  .limit(10)
  .offset(0);
```

## Where Clause Operators

| Operator | Usage | Description |
|----------|-------|-------------|
| `eq(col, value)` | `eq(project.id, id)` | Equal |
| `ne(col, value)` | `ne(project.status, "draft")` | Not equal |
| `gt(col, value)` | `gt(project.createdAt, date)` | Greater than |
| `gte(col, value)` | `gte(project.count, 5)` | Greater than or equal |
| `lt(col, value)` | `lt(project.createdAt, date)` | Less than |
| `lte(col, value)` | `lte(project.count, 10)` | Less than or equal |
| `like(col, pattern)` | `like(project.name, "%test%")` | Pattern match (case-sensitive) |
| `ilike(col, pattern)` | `ilike(project.name, "%test%")` | Pattern match (case-insensitive) |
| `inArray(col, values)` | `inArray(project.status, ["a", "b"])` | Value in array |
| `isNull(col)` | `isNull(project.deletedAt)` | Is NULL |
| `isNotNull(col)` | `isNotNull(project.deletedAt)` | Is not NULL |
| `between(col, a, b)` | `between(project.count, 1, 10)` | Between two values |
| `and(...conditions)` | `and(eq(...), gt(...))` | All conditions must match |
| `or(...conditions)` | `or(eq(...), eq(...))` | Any condition must match |

## Common Patterns

### Get by ID with ownership check

```typescript
const result = await db.query.project.findFirst({
  where: and(
    eq(project.id, projectId),
    eq(project.userId, ctx.user.id),
  ),
});

if (!result) {
  throw new Error("Project not found");
}
```

### Search with ILIKE

```typescript
const results = await db.query.project.findMany({
  where: ilike(project.name, `%${searchTerm}%`),
  limit: 20,
});
```

### Cursor-based pagination

```typescript
const results = await db.query.project.findMany({
  where: and(
    eq(project.userId, userId),
    cursor ? lt(project.createdAt, cursor) : undefined,
  ),
  orderBy: [desc(project.createdAt)],
  limit: 10,
});
```

## Rules

- ALWAYS prefer the relational query API (`db.query.table.findMany()`) for simple reads with relations.
- ALWAYS use the SQL-like builder (`db.select().from()`) for joins, aggregations, and complex queries.
- ALWAYS add ownership checks (`eq(table.userId, ctx.user.id)`) in protected procedures.
- ALWAYS use `findFirst()` (not `findMany()[0]`) when fetching a single record.
- ALWAYS import operators (`eq`, `and`, etc.) from `drizzle-orm`, not from `drizzle-orm/pg-core`.
- ALWAYS handle the `undefined` case when using `findFirst()`.
- NEVER use `db.query` for joins or aggregations -- use `db.select().from()` instead.

## Related Skills

- `complex-queries.md` -- Joins, aggregations, subqueries
- `relations.md` -- Defining relations for the `with` clause
- `insert-data.md` -- Inserting records
- `update-data.md` -- Updating records
- `delete-data.md` -- Deleting records
