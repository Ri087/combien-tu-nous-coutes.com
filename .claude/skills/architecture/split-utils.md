# How to Split Utility Files

## Utility File Organization

Utilities live in `/lib/utils/` and are organized by domain. The root `index.ts` barrel exports only the core utilities that are used pervasively across the codebase.

## Current Structure

```
/lib/
  /auth/
    utils.ts                          # getServerSession() -- auth-specific helper
  /utils/
    index.ts                          # Barrel: exports cn, polymorphic, recursive-clone-children, tv
    cn.ts                             # Tailwind class merge (cn function)
    tv.ts                             # Tailwind Variants
    polymorphic.ts                    # Polymorphic component utility
    recursive-clone-children.tsx      # React children cloning utility
    get-base-url.ts                   # Base URL resolution for API calls
    /dates/
      format-relative-date.ts         # Relative date formatting
    /email/
      resend.ts                       # Resend email client instance
    /table/
      get-sorting-icon.tsx            # Table sorting icon helper
      sorting-state.ts                # Table sorting state management
```

## Organization Rules

### Rule 1: One function per file (unless tightly coupled)

```typescript
// GOOD: /lib/utils/dates/format-relative-date.ts
export function formatRelativeDate(date: Date): string {
  // ...
}

// GOOD: /lib/utils/dates/format-date-range.ts
export function formatDateRange(start: Date, end: Date): string {
  // ...
}

// BAD: /lib/utils/dates.ts (catch-all)
export function formatRelativeDate() { ... }
export function formatDateRange() { ... }
export function isToday() { ... }
export function getWeekStart() { ... }
// This becomes a 500-line grab-bag
```

**Exception:** Tightly coupled functions can share a file:

```typescript
// OK: /lib/utils/table/sorting-state.ts
// These functions work together on the same data structure
export function createSortingState() { ... }
export function toggleSortingColumn() { ... }
export function getSortingDirection() { ... }
```

### Rule 2: Group by domain, not by type

```
# GOOD -- Organized by domain
/lib/utils/
  /dates/                    # All date-related utilities
    format-relative-date.ts
    format-date-range.ts
    is-same-day.ts
  /email/                    # All email-related utilities
    resend.ts
    validate-email-domain.ts
  /table/                    # All table-related utilities
    get-sorting-icon.tsx
    sorting-state.ts
  /currency/                 # All currency-related utilities
    format-currency.ts
    parse-currency.ts
  /string/                   # All string manipulation utilities
    truncate.ts
    slugify.ts

# BAD -- Organized by type
/lib/utils/
  /formatters/               # What domain? Everything?
    format-date.ts
    format-currency.ts
    format-name.ts
  /validators/               # Conflicts with /validators/
    validate-email.ts
  /helpers/                  # Too vague
    misc.ts
```

### Rule 3: Core utilities stay at root level

Core utilities used everywhere (by `/components/ui/` or across most files) stay at the root of `/lib/utils/`:

```
/lib/utils/
  cn.ts                      # Used by virtually every component
  tv.ts                      # Used by UI components for variants
  polymorphic.ts             # Used by UI components for "as" prop
  recursive-clone-children.tsx  # Used by compound components
  get-base-url.ts            # Used by API configuration
```

Domain-specific utilities go in subdirectories:

```
/lib/utils/
  /dates/format-relative-date.ts    # Only used where dates are displayed
  /email/resend.ts                  # Only used in email sending code
  /table/sorting-state.ts           # Only used in table components
```

### Rule 4: The barrel export includes ONLY core utilities

```typescript
// /lib/utils/index.ts
// ONLY export utilities that are used pervasively
export * from "./cn";
export * from "./polymorphic";
export * from "./recursive-clone-children";
export * from "./tv";

// DO NOT export domain utilities here
// They are imported directly from their files:
// import { formatRelativeDate } from "@/lib/utils/dates/format-relative-date";
// import { resend } from "@/lib/utils/email/resend";
```

### Rule 5: Domain utilities are imported directly

```typescript
// GOOD -- Direct import from domain file
import { formatRelativeDate } from "@/lib/utils/dates/format-relative-date";
import { resend } from "@/lib/utils/email/resend";
import { getSortingIcon } from "@/lib/utils/table/get-sorting-icon";

// BAD -- Importing everything through barrel
import { formatRelativeDate, resend, getSortingIcon } from "@/lib/utils";
```

## When to Create a New Domain Folder

Create a new domain folder under `/lib/utils/` when:

1. You have **2+ utility files** that belong to the same domain
2. The domain is **clearly defined** (dates, currency, email, table, etc.)
3. The utilities are **used by multiple features** (not just one)

If you only have one utility for a domain, keep it at root level until you need a second one:

```
# Only one date utility? Keep it at root
/lib/utils/format-relative-date.ts

# Two+ date utilities? Create a domain folder
/lib/utils/dates/
  format-relative-date.ts
  format-date-range.ts
```

## Naming Conventions

### File names

```
kebab-case.ts

# Function files: describe what the function does
format-relative-date.ts       # Contains formatRelativeDate()
get-base-url.ts               # Contains getBaseUrl()
parse-currency.ts             # Contains parseCurrency()

# Instance/config files: name of the thing
resend.ts                     # Contains resend instance
```

### Export names

```typescript
// Functions: camelCase
export function formatRelativeDate(date: Date): string { ... }
export function getBaseUrl(): string { ... }

// Instances: camelCase
export const resend = new Resend(env.RESEND_API_KEY);

// Types: PascalCase
export type DateRange = { start: Date; end: Date };

// Constants: SCREAMING_SNAKE_CASE (rare in utils, usually in /constants/)
export const DATE_FORMAT = "yyyy-MM-dd";
```

## Step-by-Step: Adding a New Utility

### Example: Adding currency formatting utilities

**Step 1:** Determine if a domain folder exists or is needed

```bash
ls /lib/utils/currency/
# Does not exist, and we plan to add 2+ utilities -> create it
```

**Step 2:** Create the domain folder and files

```
/lib/utils/currency/
  format-currency.ts
  parse-currency.ts
```

**Step 3:** Write each utility in its own file

```typescript
// /lib/utils/currency/format-currency.ts
type FormatCurrencyOptions = {
  locale?: string;
  currency?: string;
};

export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const { locale = "en-US", currency = "USD" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
```

```typescript
// /lib/utils/currency/parse-currency.ts
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}
```

**Step 4:** Do NOT add to the root barrel export (these are domain-specific)

**Step 5:** Import directly where needed

```typescript
import { formatCurrency } from "@/lib/utils/currency/format-currency";
import { parseCurrency } from "@/lib/utils/currency/parse-currency";
```

## Special Case: `/lib/auth/`

Auth utilities live in `/lib/auth/` (not `/lib/utils/auth/`) because they are a distinct category:

```
/lib/auth/
  utils.ts          # getServerSession() helper
```

This pattern exists because auth is fundamental infrastructure, not a general utility. The `getServerSession()` function wraps Better Auth's API and is used by middleware, layouts, and server components.

## Anti-Patterns

### 1. Giant utils.ts file

```
# BAD
/lib/utils.ts                    # 800 lines, 30 functions

# GOOD
/lib/utils/
  cn.ts
  /dates/format-relative-date.ts
  /currency/format-currency.ts
  # ... each with one focused responsibility
```

### 2. Duplicate utilities

```typescript
// BAD -- Same function in two places
// /lib/utils/format-date.ts
export function formatDate() { ... }
// /app/(application)/projects/_components/project-card.tsx
function formatDate() { ... }  // Duplicated!

// GOOD -- Single source of truth
// /lib/utils/dates/format-date.ts
export function formatDate() { ... }
// Import it everywhere it's needed
```

### 3. Feature-specific logic in /lib/utils/

```typescript
// BAD -- This is feature logic, not a general utility
// /lib/utils/project-helpers.ts
export function calculateProjectProgress(project: Project) { ... }

// GOOD -- Feature-specific logic stays in the feature
// /app/(application)/projects/_lib/calculate-progress.ts
// or inline in the component that uses it
```

### 4. Re-exporting third-party libraries

```typescript
// BAD -- Don't wrap third-party libs unless you add value
// /lib/utils/zod.ts
export { z } from "zod";

// GOOD -- Import zod directly where needed
import { z } from "zod";
```
