# File Naming Conventions

## Golden Rule

**All file names use kebab-case. Always. No exceptions.**

```
project-card.tsx       # CORRECT
ProjectCard.tsx        # WRONG
projectCard.tsx        # WRONG
project_card.tsx       # WRONG
```

## File Naming Rules

### 1. Components (`.tsx`)

```
kebab-case.tsx

# Examples
project-card.tsx
create-project-modal.tsx
sign-in-form.tsx
staggered-fade-loader.tsx
```

- Export name uses **PascalCase**: `export function ProjectCard() {}`
- One primary component per file (can have small helper components)
- File name matches the primary export name (kebab-case version)

### 2. Hooks (`.ts`)

```
use-[name].ts

# Examples
use-projects.ts
use-create-project.ts
use-debounce.ts
```

- Always prefixed with `use-`
- Export name uses **camelCase**: `export function useProjects() {}`

### 3. Server Actions (`.ts`)

```
[verb]-[noun].ts

# Examples
create-project.ts
delete-project.ts
sign-out.ts
update-settings.ts
```

- Name describes the action being performed
- Export name uses **camelCase**: `export async function createProject() {}`

### 4. Validators (`.ts`)

```
/validators/[feature].ts

# Examples
/validators/auth.ts
/validators/projects.ts
/validators/settings.ts
```

- One file per feature
- Export names use **camelCase** with `Schema` suffix: `export const createProjectSchema = z.object({...})`
- Type exports use **PascalCase** with `Input` or `Output` suffix: `export type CreateProjectInput = z.infer<typeof createProjectSchema>`

### 5. Database Schema Files

```
/db/schema/[feature]/
  schema.ts
  relations.ts
  types.ts
  index.ts

# Examples
/db/schema/auth/schema.ts
/db/schema/projects/schema.ts
```

- Feature folder name is the plural noun in kebab-case
- Internal files always use the fixed names: `schema.ts`, `relations.ts`, `types.ts`, `index.ts`

### 6. Server Routers (`.ts`)

```
/server/routers/[feature].ts

# Examples
/server/routers/projects.ts
/server/routers/settings.ts
```

- File name matches the feature name (plural)
- Export name uses **camelCase** with `Router` suffix: `export const projectsRouter = {...}`

### 7. Constants (`.ts`)

```
/constants/[name].ts

# Examples
/constants/pages.ts
/constants/project.ts
/constants/auth-errors.ts
/constants/label-colors.ts
```

- kebab-case file name
- Export names use **SCREAMING_SNAKE_CASE** for constant objects: `export const PAGES = {...}`
- Export names use **camelCase** for arrays/functions

### 8. Utility Files (`.ts` / `.tsx`)

```
/lib/utils/[name].ts
/lib/utils/[domain]/[name].ts

# Examples
/lib/utils/cn.ts
/lib/utils/get-base-url.ts
/lib/utils/dates/format-relative-date.ts
/lib/utils/table/sorting-state.ts
```

- kebab-case file name
- Export name uses **camelCase**: `export function formatRelativeDate() {}`

### 9. Email Templates (`.tsx`)

```
/emails/[name].tsx

# Examples
/emails/verify-email.tsx
/emails/reset-password.tsx
/emails/2fa-otp.tsx
```

- kebab-case file name

### 10. Page Files

```
page.tsx           # Always "page.tsx" (Next.js convention)
layout.tsx         # Always "layout.tsx"
loading.tsx        # Always "loading.tsx"
error.tsx          # Always "error.tsx"
not-found.tsx      # Always "not-found.tsx"
search-params.ts   # nuqs search params definition
```

## Directory Naming Rules

### Feature directories

```
kebab-case/

# Examples
/app/(application)/projects/
/app/(application)/team-settings/
/app/(application)/billing-history/
```

### Private directories (underscore prefix)

```
_components/
_hooks/
_actions/
_lib/

# These are private to the parent route segment
# Next.js ignores them for routing
```

### Route groups (parentheses)

```
(auth)/           # Authentication pages
(application)/    # Authenticated app pages
(marketing)/      # Public marketing pages
(mockups)/        # Mockup/prototype pages
```

- Route groups do NOT affect the URL path
- They are used purely for organizational purposes and shared layouts

### Dynamic routes (square brackets)

```
[id]/             # Dynamic segment: /projects/abc-123
[slug]/           # Dynamic segment: /blog/my-post
[...rest]/        # Catch-all: /api/rpc/any/path
[[...rest]]/      # Optional catch-all: /api/rpc or /api/rpc/any/path
```

## Barrel Exports (index.ts)

Use `index.ts` files for clean re-exports in these locations:

```typescript
// /db/schema/[feature]/index.ts
export * from "./schema";
export * from "./relations";
export * from "./types";

// /db/schema/index.ts
export * from "./auth";
export * from "./projects";

// /components/form/index.ts
export { FormInput } from "./form-input";
export { FormSelect } from "./form-select";
// ... named exports only
```

### When to create index.ts

- `/db/schema/[feature]/` -- Always
- `/db/schema/` -- Always (root barrel)
- `/components/form/` -- Always
- `/lib/utils/` -- Always for root utils, optional for subdirectories

### When NOT to create index.ts

- `_components/` -- Import directly from the file
- `_hooks/` -- Import directly from the file
- `_actions/` -- Import directly from the file
- Feature page directories -- Never

## Import/Export Name Mapping

| File Name | Export Style | Example |
|-----------|-------------|---------|
| `project-card.tsx` | `export function ProjectCard()` | PascalCase for components |
| `use-projects.ts` | `export function useProjects()` | camelCase with `use` prefix |
| `create-project.ts` (action) | `export async function createProject()` | camelCase |
| `projects.ts` (validator) | `export const createProjectSchema` | camelCase + Schema suffix |
| `projects.ts` (router) | `export const projectsRouter` | camelCase + Router suffix |
| `pages.ts` (constant) | `export const PAGES` | SCREAMING_SNAKE_CASE |
| `cn.ts` (utility) | `export function cn()` | camelCase |

## Common Mistakes to Avoid

```
# WRONG: PascalCase file names
ProjectCard.tsx        -> project-card.tsx
UseProjects.ts         -> use-projects.ts

# WRONG: camelCase file names
projectCard.tsx        -> project-card.tsx
useProjects.ts         -> use-projects.ts

# WRONG: snake_case file names
project_card.tsx       -> project-card.tsx
use_projects.ts        -> use-projects.ts

# WRONG: Inconsistent naming
projectsList.tsx       -> project-list.tsx
Projects_list.tsx      -> project-list.tsx

# WRONG: Missing "use-" prefix on hooks
projects.ts (hook)     -> use-projects.ts

# WRONG: Generic file names
helpers.ts             -> [specific-name].ts
utils.ts               -> [specific-name].ts
types.ts (at root)     -> [feature]-types.ts
```
