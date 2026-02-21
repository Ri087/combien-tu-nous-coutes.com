# Import Alias Reference

## Configuration

The project uses a single path alias defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This means `@/` maps to the project root. All imports use this alias to reference files from anywhere in the codebase.

## Available Aliases

| Alias | Maps To | Description |
|-------|---------|-------------|
| `@/app` | `/app/` | Pages, layouts, route handlers |
| `@/components` | `/components/` | Shared components (UI, form, custom) |
| `@/constants` | `/constants/` | Application constants |
| `@/db` | `/db/` | Database instance and schemas |
| `@/emails` | `/emails/` | React Email templates |
| `@/lib` | `/lib/` | Utilities and auth helpers |
| `@/orpc` | `/orpc/` | oRPC client and query utilities |
| `@/providers` | `/providers/` | React context providers |
| `@/public` | `/public/` | Static assets |
| `@/server` | `/server/` | Server routers, procedures, middleware, actions |
| `@/validators` | `/validators/` | Zod validation schemas |
| `@/auth` | `/auth.ts` | Better Auth configuration |
| `@/env` | `/env.ts` | Environment variables |
| `@/types` | `/types/` | Global type definitions (if created) |
| `@/styles` | `/styles/` | Global styles (if created) |

## Import Rules

### Rule 1: ALWAYS use `@/` for cross-module imports

```typescript
// GOOD -- Always use alias for cross-module
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { createProjectSchema } from "@/validators/projects";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { PAGES } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { env } from "@/env";
import { auth } from "@/auth";

// BAD -- Never use relative paths to cross module boundaries
import { db } from "../../db";
import { Button } from "../../../components/ui/button";
```

### Rule 2: Use relative paths ONLY within the same feature

Relative imports are acceptable **only** within a feature's private folders:

```typescript
// GOOD -- Relative within the same feature
// File: /app/(application)/projects/_components/project-list.tsx
import { ProjectCard } from "./project-card";                     // Same _components/ folder
import { useProjects } from "../_hooks/use-projects";              // Sibling _hooks/ folder
import { createProject } from "../_actions/create-project";        // Sibling _actions/ folder

// GOOD -- Relative within the same _components/ folder
// File: /app/(application)/projects/_components/project-card.tsx
import { ProjectBadge } from "./project-badge";
```

### Rule 3: NEVER use relative paths across route groups or features

```typescript
// BAD -- Reaching into another feature
import { TaskCard } from "../../tasks/_components/task-card";

// GOOD -- If shared, it should be in /components/
import { TaskCard } from "@/components/task-card";

// BAD -- Reaching into another route group
import { SignInForm } from "../../(auth)/sign-in/_components/sign-in-form";

// GOOD -- This should never happen; auth components are private to auth
```

## Import Patterns by Context

### In a Page (Server Component)

```tsx
// /app/(application)/projects/page.tsx
import type { Metadata } from "next";                              // External package
import type { SearchParams } from "nuqs/server";                   // External package

import { ProjectList } from "./_components/project-list";           // Relative (same feature)
import { searchParamsCache } from "./search-params";                // Relative (same feature)
```

### In a Client Component

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useState } from "react";                                  // External
import { useQuery } from "@tanstack/react-query";                   // External

import * as Button from "@/components/ui/button";                   // AlignUI
import * as Dialog from "@/components/ui/dialog";                   // AlignUI
import { FormInput } from "@/components/form";                      // Form wrappers
import { orpc } from "@/orpc/client";                               // oRPC client

import { useProjects } from "../_hooks/use-projects";               // Relative (feature hook)
import { ProjectCard } from "./project-card";                       // Relative (sibling component)
```

### In a Server Action

```tsx
// /app/(application)/projects/_actions/create-project.ts
"use server";

import { revalidatePath } from "next/cache";                       // External (Next.js)

import { db } from "@/db";                                          // Database
import { projects } from "@/db/schema";                             // Schema
import { PAGES } from "@/constants/pages";                          // Constants
import { createProjectSchema } from "@/validators/projects";        // Validators
```

### In an oRPC Router

```typescript
// /server/routers/projects.ts
import { eq } from "drizzle-orm";                                   // External

import { db } from "@/db";                                          // Database
import { projects } from "@/db/schema";                             // Schema
import { protectedProcedure } from "@/server/procedure/protected.procedure";  // Procedure
import { createProjectSchema } from "@/validators/projects";        // Validators
```

### In a Database Schema

```typescript
// /db/schema/projects/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";    // External

import { user } from "../auth/schema";                              // Relative (sibling schema)
```

### In a Hook

```typescript
// /app/(application)/projects/_hooks/use-projects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";  // External

import { orpc } from "@/orpc/client";                               // oRPC client
```

### In a Validator

```typescript
// /validators/projects.ts
import { z } from "zod";                                            // External (only dep needed)

export const createProjectSchema = z.object({
  name: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

## Import Order Convention

Organize imports in this order, with blank lines separating each group:

```typescript
// 1. External packages (react, next, third-party)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 2. Aliased internal imports (@/), alphabetical
import * as Button from "@/components/ui/button";
import { FormInput } from "@/components/form";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";
import { createProjectSchema } from "@/validators/projects";

// 3. Relative imports (./  ../)
import { useProjects } from "../_hooks/use-projects";
import { ProjectCard } from "./project-card";
```

### Type-only imports

Use `import type` when importing only types:

```typescript
import type { Metadata } from "next";
import type { Project } from "@/db/schema";

// Mixed imports: values and types
import { projects, type Project } from "@/db/schema";
```

## Specific Alias Usage Guide

### `@/components/ui/` -- AlignUI Components

```typescript
// Namespace import for compound components
import * as Button from "@/components/ui/button";
import * as Dialog from "@/components/ui/dialog";
import * as Input from "@/components/ui/input";
import * as Select from "@/components/ui/select";
import * as Table from "@/components/ui/table";

// Named import for simple components
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
```

### `@/components/form/` -- Form Wrappers

```typescript
// Import from barrel
import { FormInput, FormSelect, FormTextarea } from "@/components/form";
```

### `@/db` -- Database

```typescript
// Database instance
import { db } from "@/db";

// Schema tables and types
import { projects, type Project } from "@/db/schema";
```

### `@/lib/utils` -- Utilities

```typescript
// Core utilities (from barrel)
import { cn } from "@/lib/utils";

// Domain utilities (direct import)
import { formatRelativeDate } from "@/lib/utils/dates/format-relative-date";
import { getBaseUrl } from "@/lib/utils/get-base-url";
```

### `@/orpc/` -- oRPC

```typescript
// Client-side (in "use client" components)
import { orpc, orpcClient } from "@/orpc/client";
import type { RouterInput, RouterOutput } from "@/orpc/client";

// Server-side (in Server Components, Server Actions)
import { api } from "@/orpc/server";
```

### `@/server/` -- Server Logic

```typescript
// Procedures
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { publicProcedure } from "@/server/procedure/public.procedure";

// Context
import { base } from "@/server/context";

// Actions
import { signOut } from "@/server/actions/sign-out";
```

## Common Mistakes

```typescript
// WRONG: Relative path crossing module boundaries
import { db } from "../../db";
import { Button } from "../../../components/ui/button";

// WRONG: Missing @/ prefix
import { db } from "db";
import { Button } from "components/ui/button";

// WRONG: Using @/ for same-feature relative imports (works but unnecessary)
import { ProjectCard } from "@/app/(application)/projects/_components/project-card";
// BETTER: Use relative
import { ProjectCard } from "./project-card";

// WRONG: Importing from _components/ of another feature
import { TaskCard } from "@/app/(application)/tasks/_components/task-card";
// These are PRIVATE. Move to /components/ if shared.
```
