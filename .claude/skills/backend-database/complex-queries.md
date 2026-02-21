# Complex Queries: Joins, Aggregations, Subqueries

## When to Use

Use this skill when the relational query API (`db.query.table.findMany()`) is not sufficient. This covers joins, aggregations (count, sum, avg), groupBy, subqueries, and advanced SQL patterns using Drizzle's SQL-like query builder.

## Prerequisites

- Database instance imported from `/db/index.ts`
- Schema tables imported from `/db/schema/`
- SQL functions imported from `drizzle-orm`

## Import

```typescript
import { db } from "@/db";
import {
  eq, and, or, gt, lt, gte, lte, desc, asc, sql,
  count, sum, avg, min, max,
  inArray, isNull, isNotNull,
} from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
import { user } from "@/db/schema/auth/schema";
```

## Joins

### Inner Join

Returns only rows where both tables have matching records.

```typescript
const results = await db
  .select({
    projectId: project.id,
    projectName: project.name,
    userName: user.name,
    userEmail: user.email,
  })
  .from(project)
  .innerJoin(user, eq(project.userId, user.id));
```

### Left Join

Returns all rows from the left table, with NULL for non-matching right table rows.

```typescript
const results = await db
  .select({
    projectId: project.id,
    projectName: project.name,
    userName: user.name, // Can be null if no matching user
  })
  .from(project)
  .leftJoin(user, eq(project.userId, user.id));
```

### Multiple Joins

```typescript
import { projectMember } from "@/db/schema/projects/schema";

const results = await db
  .select({
    projectName: project.name,
    memberName: user.name,
    memberRole: projectMember.role,
  })
  .from(project)
  .innerJoin(projectMember, eq(project.id, projectMember.projectId))
  .innerJoin(user, eq(projectMember.userId, user.id))
  .where(eq(project.userId, ctx.user.id));
```

### Join with Conditions

```typescript
const results = await db
  .select()
  .from(project)
  .leftJoin(user, eq(project.userId, user.id))
  .where(
    and(
      eq(project.isArchived, false),
      isNotNull(user.id),
    ),
  )
  .orderBy(desc(project.createdAt));
```

## Aggregations

### Count

```typescript
// Count all records
const [result] = await db
  .select({ count: count() })
  .from(project)
  .where(eq(project.userId, ctx.user.id));

const totalProjects = result.count; // number
```

### Count with alias

```typescript
const [result] = await db
  .select({
    total: count(),
    active: count(sql`CASE WHEN ${project.isArchived} = false THEN 1 END`),
  })
  .from(project)
  .where(eq(project.userId, ctx.user.id));
```

### Sum

```typescript
const [result] = await db
  .select({ totalAmount: sum(invoice.amount) })
  .from(invoice)
  .where(eq(invoice.userId, ctx.user.id));
```

### Average

```typescript
const [result] = await db
  .select({ avgRating: avg(review.rating) })
  .from(review)
  .where(eq(review.productId, productId));
```

### Min and Max

```typescript
const [result] = await db
  .select({
    earliest: min(project.createdAt),
    latest: max(project.createdAt),
  })
  .from(project)
  .where(eq(project.userId, ctx.user.id));
```

## Group By

### Count per group

```typescript
const projectCounts = await db
  .select({
    userId: project.userId,
    projectCount: count(),
  })
  .from(project)
  .groupBy(project.userId);
```

### Group by with join

```typescript
const projectsPerUser = await db
  .select({
    userName: user.name,
    userEmail: user.email,
    projectCount: count(project.id),
  })
  .from(user)
  .leftJoin(project, eq(user.id, project.userId))
  .groupBy(user.id, user.name, user.email)
  .orderBy(desc(count(project.id)));
```

### Having (filter on aggregated values)

```typescript
const activeUsers = await db
  .select({
    userId: project.userId,
    projectCount: count(),
  })
  .from(project)
  .groupBy(project.userId)
  .having(gt(count(), 5)); // Only users with more than 5 projects
```

## Order By

### Single column

```typescript
const results = await db
  .select()
  .from(project)
  .orderBy(desc(project.createdAt));
```

### Multiple columns

```typescript
const results = await db
  .select()
  .from(project)
  .orderBy(asc(project.name), desc(project.createdAt));
```

### Order by expression

```typescript
const results = await db
  .select()
  .from(project)
  .orderBy(sql`${project.name} COLLATE "C"`);
```

## Limit and Offset (Pagination)

### Basic pagination

```typescript
const pageSize = 10;
const pageNumber = 2; // 0-indexed

const results = await db
  .select()
  .from(project)
  .where(eq(project.userId, ctx.user.id))
  .orderBy(desc(project.createdAt))
  .limit(pageSize)
  .offset(pageNumber * pageSize);
```

### Pagination with total count

```typescript
const pageSize = 10;
const page = 0;

const [items, [{ total }]] = await Promise.all([
  db
    .select()
    .from(project)
    .where(eq(project.userId, ctx.user.id))
    .orderBy(desc(project.createdAt))
    .limit(pageSize)
    .offset(page * pageSize),
  db
    .select({ total: count() })
    .from(project)
    .where(eq(project.userId, ctx.user.id)),
]);

return {
  items,
  total,
  pageSize,
  page,
  totalPages: Math.ceil(total / pageSize),
};
```

## Subqueries

### Subquery in WHERE

```typescript
const subquery = db
  .select({ userId: projectMember.userId })
  .from(projectMember)
  .where(eq(projectMember.projectId, projectId));

const members = await db
  .select()
  .from(user)
  .where(inArray(user.id, subquery));
```

### Subquery as a derived table

```typescript
const projectCountSubquery = db
  .select({
    userId: project.userId,
    projectCount: count().as("project_count"),
  })
  .from(project)
  .groupBy(project.userId)
  .as("project_counts");

const usersWithCounts = await db
  .select({
    userName: user.name,
    projectCount: projectCountSubquery.projectCount,
  })
  .from(user)
  .leftJoin(projectCountSubquery, eq(user.id, projectCountSubquery.userId));
```

## Raw SQL

For cases where the Drizzle API does not cover your needs:

### SQL expression in select

```typescript
const results = await db
  .select({
    id: project.id,
    name: project.name,
    daysSinceCreation: sql<number>`EXTRACT(DAY FROM NOW() - ${project.createdAt})`,
  })
  .from(project);
```

### SQL in where clause

```typescript
const results = await db
  .select()
  .from(project)
  .where(sql`${project.name} ILIKE ${"%" + searchTerm + "%"}`);
```

### Full raw query (escape hatch)

```typescript
const results = await db.execute(
  sql`SELECT * FROM project WHERE name ILIKE ${"%" + searchTerm + "%"} LIMIT 10`
);
```

## Distinct

```typescript
const uniqueStatuses = await db
  .selectDistinct({ status: project.status })
  .from(project);
```

### Distinct on (PostgreSQL-specific)

```typescript
const latestPerUser = await db
  .selectDistinctOn([project.userId], {
    id: project.id,
    name: project.name,
    userId: project.userId,
    createdAt: project.createdAt,
  })
  .from(project)
  .orderBy(project.userId, desc(project.createdAt));
```

## Transactions

For complex operations that must succeed or fail atomically:

```typescript
const result = await db.transaction(async (tx) => {
  const [newProject] = await tx
    .insert(project)
    .values({ name: "New Project", userId: ctx.user.id })
    .returning();

  await tx.insert(projectMember).values({
    projectId: newProject.id,
    userId: ctx.user.id,
    role: "owner",
  });

  const [projectCount] = await tx
    .select({ count: count() })
    .from(project)
    .where(eq(project.userId, ctx.user.id));

  return { project: newProject, totalProjects: projectCount.count };
});
```

## Rules

- ALWAYS use the SQL-like query builder (`db.select().from()`) for joins and aggregations -- the relational query API does not support these.
- ALWAYS use parameterized values in `sql` template literals (`sql`...${value}...``) -- never concatenate strings to prevent SQL injection.
- ALWAYS include `.groupBy()` when using aggregate functions alongside non-aggregated columns.
- ALWAYS type raw SQL expressions with `sql<Type>` for TypeScript safety.
- ALWAYS use `db.transaction()` when performing multiple dependent write operations.
- NEVER use `db.query.table` for joins or aggregations -- it only supports `with` for eager loading.
- Prefer the relational query API for simple reads with relations. Only use the SQL-like builder when you need features the relational API does not support.

## Related Skills

- `query-data.md` -- Simpler queries using the relational API
- `insert-data.md` -- Inserting data, including in transactions
- `update-data.md` -- Updating data with SQL expressions
- `indexes.md` -- Adding indexes to improve query performance
