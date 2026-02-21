# Column Types Reference

## When to Use

Use this reference when defining columns in a Drizzle schema. It covers every commonly used PostgreSQL column type available in `drizzle-orm/pg-core`.

## Import

All column types are imported from `drizzle-orm/pg-core`:

```typescript
import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  integer,
  serial,
  bigint,
  smallint,
  real,
  doublePrecision,
  numeric,
  varchar,
  char,
  json,
  jsonb,
  date,
  time,
  interval,
  pgEnum,
} from "drizzle-orm/pg-core";
```

## Column Types

### Text / String Types

#### `text(name)`
Variable-length string with no limit. The most common string type.

```typescript
name: text("name").notNull(),
description: text("description"), // nullable by default
```

#### `varchar(name, { length })`
Variable-length string with a max length constraint.

```typescript
code: varchar("code", { length: 10 }).notNull(),
slug: varchar("slug", { length: 255 }).notNull().unique(),
```

#### `char(name, { length })`
Fixed-length string padded with spaces.

```typescript
countryCode: char("country_code", { length: 2 }).notNull(),
```

### Numeric Types

#### `integer(name)`
32-bit signed integer (-2,147,483,648 to 2,147,483,647).

```typescript
quantity: integer("quantity").notNull().default(0),
sortOrder: integer("sort_order").notNull().default(0),
```

#### `smallint(name)`
16-bit signed integer (-32,768 to 32,767).

```typescript
rating: smallint("rating").notNull(),
```

#### `bigint(name, { mode })`
64-bit signed integer. Use `mode: "number"` for JS number or `mode: "bigint"` for BigInt.

```typescript
viewCount: bigint("view_count", { mode: "number" }).notNull().default(0),
```

#### `serial(name)`
Auto-incrementing 32-bit integer. Typically used for simple auto-increment IDs.

```typescript
id: serial("id").primaryKey(),
```

#### `real(name)`
32-bit floating point.

```typescript
latitude: real("latitude"),
longitude: real("longitude"),
```

#### `doublePrecision(name)`
64-bit floating point.

```typescript
price: doublePrecision("price").notNull(),
```

#### `numeric(name, { precision, scale })`
Exact numeric type. Use for money or precision-sensitive values.

```typescript
amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
```

### Boolean

#### `boolean(name)`
True/false value.

```typescript
isActive: boolean("is_active").notNull().default(true),
isArchived: boolean("is_archived").notNull().default(false),
```

### Date / Time Types

#### `timestamp(name, options?)`
Date and time. The most common date column type.

```typescript
// Without timezone (default)
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull(),

// With timezone
scheduledAt: timestamp("scheduled_at", { withTimezone: true }),

// With mode for string representation
eventDate: timestamp("event_date", { mode: "string" }),
```

#### `date(name, options?)`
Date only (no time component).

```typescript
birthDate: date("birth_date"),
dueDate: date("due_date", { mode: "string" }), // Returns as string
```

#### `time(name, options?)`
Time only (no date component).

```typescript
startTime: time("start_time"),
```

#### `interval(name)`
A time interval (e.g., "1 day", "2 hours").

```typescript
duration: interval("duration"),
```

### UUID

#### `uuid(name)`
UUID v4 column. The standard for primary keys in this project.

```typescript
id: uuid("id").primaryKey().defaultRandom(),
organizationId: uuid("organization_id").notNull(),
```

### JSON Types

#### `json(name)`
JSON column stored as text internally.

```typescript
metadata: json("metadata"),
```

#### `jsonb(name)`
Binary JSON. More efficient for querying. Preferred over `json()`.

```typescript
settings: jsonb("settings").$type<UserSettings>(),
tags: jsonb("tags").$type<string[]>().default([]),
```

Use `.$type<T>()` to provide TypeScript typing for JSON columns. See `json-columns.md` for details.

### Enums

#### `pgEnum(name, values)`
PostgreSQL enum type. Define once, use in multiple tables.

```typescript
export const statusEnum = pgEnum("status", [
  "draft",
  "published",
  "archived",
]);

export const article = pgTable("article", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: statusEnum("status").notNull().default("draft"),
});
```

## Column Modifiers

These modifiers can be chained on any column:

| Modifier | Description | Example |
|----------|-------------|---------|
| `.notNull()` | Column cannot be NULL | `text("name").notNull()` |
| `.default(value)` | Default value | `boolean("active").default(true)` |
| `.defaultNow()` | Default to `now()` (timestamps) | `timestamp("created_at").defaultNow()` |
| `.defaultRandom()` | Default to `gen_random_uuid()` (UUIDs) | `uuid("id").defaultRandom()` |
| `.primaryKey()` | Mark as primary key | `uuid("id").primaryKey()` |
| `.unique()` | Add unique constraint | `text("email").unique()` |
| `.references(() => table.col)` | Foreign key reference | `text("user_id").references(() => user.id)` |
| `.$defaultFn(() => value)` | JS-side default value | `text("id").$defaultFn(() => ulid())` |
| `.$type<T>()` | Override TypeScript type | `jsonb("data").$type<MyType>()` |

## Foreign Key References

Always specify `onDelete` behavior:

```typescript
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),

categoryId: uuid("category_id")
  .references(() => category.id, { onDelete: "set null" }),
```

Available `onDelete` options: `"cascade"`, `"set null"`, `"set default"`, `"restrict"`, `"no action"`.

## Common Patterns

### Standard timestamps

```typescript
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull(),
```

### Soft delete

```typescript
deletedAt: timestamp("deleted_at"),
```

### User ownership

```typescript
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

### Slug with unique constraint

```typescript
slug: varchar("slug", { length: 255 }).notNull().unique(),
```

## Rules

- ALWAYS use `text()` for general-purpose strings -- avoid `varchar()` unless a max length constraint is needed.
- ALWAYS use `uuid()` with `.defaultRandom()` or `text()` with `.$defaultFn()` for primary keys.
- ALWAYS use `jsonb()` over `json()` for JSON columns -- `jsonb` is more efficient for queries.
- ALWAYS add `.notNull()` unless the column is intentionally nullable.
- ALWAYS use `timestamp()` for date-time columns, not `date()`, unless only the date is needed.
- ALWAYS use `pgEnum()` when a column has a fixed set of values.
- NEVER use `serial()` for primary keys in this project -- use `uuid()` or `text()` with ULID.

## Related Skills

- `create-schema.md` -- Full schema creation workflow
- `json-columns.md` -- Typed JSON columns in depth
- `indexes.md` -- Adding indexes to columns
- `ulid-ids.md` -- ULID-based ID columns
