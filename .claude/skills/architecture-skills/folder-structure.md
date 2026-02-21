# Complete Folder Structure Reference

## Root Directory Overview

```
/home/user/minimal-boilerplate/
  /app/                  # Next.js App Router pages and routes
  /components/           # Shared components (UI, form, custom)
  /constants/            # Application-wide constants
  /db/                   # Database (Drizzle ORM + schemas)
  /emails/               # React Email templates
  /lib/                  # Utilities and helper libraries
  /orpc/                 # oRPC client configuration
  /providers/            # React context providers
  /server/               # Server-side logic (routers, procedures, middleware, actions)
  /validators/           # Zod validation schemas
  /public/               # Static assets
  auth.ts                # Better Auth configuration
  env.ts                 # Environment variable validation (t3-env)
  next.config.ts         # Next.js configuration
  tailwind.config.ts     # Tailwind CSS configuration
  drizzle.config.ts      # Drizzle ORM configuration
  tsconfig.json          # TypeScript configuration
  package.json           # Dependencies and scripts
```

## Detailed Folder Breakdown

### `/app/` -- Pages and Routes

```
/app/
  layout.tsx              # Root layout (html, body, fonts, Providers)
  page.tsx                # Landing page (/)
  providers.tsx           # Root providers assembly
  globals.css             # Global styles and Tailwind imports
  favicon.ico             # Site favicon
  /fonts/                 # Local font files

  /(auth)/                # Authentication route group
    layout.tsx            # Auth layout (shared for all auth pages)
    _components/          # Shared auth components (header, footer, password-input)
    _lib/                 # Auth-specific utilities (send-verification-otp)
    /sign-in/
      page.tsx
      search-params.ts
      _components/
    /sign-up/
      page.tsx
      _components/
    /verification/
      page.tsx
      _components/
    /forgot-password/
      page.tsx
      _components/
    /reset-password/
      page.tsx
      _components/

  /(application)/         # Authenticated app route group
    layout.tsx            # App layout (session check, redirect if not authed)
    /dashboard/
      page.tsx
    /[new-feature]/       # Future features go here
      page.tsx
      _components/
      _hooks/
      _actions/

  /(marketing)/           # Public marketing pages (future)
    /about/
    /contact/
    /privacy-policy/

  /(mockups)/             # Design mockups and prototypes (future)

  /api/
    /auth/[...all]/       # Better Auth API handler (catch-all)
      route.ts
    /rpc/[[...rest]]/     # oRPC API handler (optional catch-all)
      route.ts
```

**Key rules for `/app/`:**
- Route groups `(auth)`, `(application)`, `(marketing)` do NOT affect URLs
- `_components/`, `_hooks/`, `_actions/` are private (not routed)
- `page.tsx` is always a Server Component unless explicitly marked `"use client"`
- Each feature gets its own folder under the appropriate route group

### `/components/` -- Shared Components

```
/components/
  header.tsx                    # Application header
  logo.tsx                      # Logo component
  logout-button.tsx             # Logout button (uses server action)
  staggered-fade-loader.tsx     # Loading animation
  theme-switch.tsx              # Dark/light mode toggle

  /ui/                          # AlignUI Design System (DO NOT MODIFY)
    accordion.tsx
    alert.tsx
    avatar.tsx
    badge.tsx
    button.tsx
    checkbox.tsx
    datepicker.tsx
    dialog.tsx
    divider.tsx
    drawer.tsx
    dropdown.tsx
    input.tsx
    select.tsx
    table.tsx
    tabs.tsx
    textarea.tsx
    tooltip.tsx
    ... (58+ components)

  /form/                        # Form wrapper components
    index.ts                    # Barrel export
    form-checkbox.tsx
    form-date-input.tsx
    form-field.tsx
    form-file-upload.tsx
    form-image-upload.tsx
    form-input.tsx
    form-password.tsx
    form-rich-text-editor.tsx
    form-select.tsx
    form-textarea.tsx

  /custom/                      # Custom shared widgets
    rich-text-editor.tsx
    /floating-toolbar/
```

**Key rules for `/components/`:**
- `/ui/` is NEVER modified -- it is the AlignUI design system
- `/form/` contains React Hook Form wrapper components
- Root-level components are shared across multiple features
- If a component is only used by one feature, it belongs in that feature's `_components/`

### `/db/` -- Database

```
/db/
  index.ts                      # Database instance (drizzle + pool)
  /schema/
    index.ts                    # Root barrel: export * from "./auth"; export * from "./projects";
    /auth/
      schema.ts                 # Table definitions (user, session, account, verification)
      relations.ts              # Drizzle relations
      types.ts                  # Inferred types
      index.ts                  # Barrel export
    /[feature]/                 # One folder per feature
      schema.ts
      relations.ts
      types.ts
      index.ts
```

**Key rules for `/db/`:**
- One subfolder per feature under `/schema/`
- Every feature schema folder has exactly 4 files: `schema.ts`, `relations.ts`, `types.ts`, `index.ts`
- Root `index.ts` re-exports all feature schemas
- After schema changes: run `pnpm db:push` (dev) or `pnpm db:generate` (prod)

### `/server/` -- Server-Side Logic

```
/server/
  context.ts                    # oRPC base context definition

  /routers/
    _app.ts                     # Root app router (registers all feature routers)
    [feature].ts                # Feature router (e.g., projects.ts)

  /procedure/
    public.procedure.ts         # Public procedure (no auth required)
    protected.procedure.ts      # Protected procedure (auth required)

  /middleware/
    auth.middleware.ts           # Authentication middleware

  /actions/
    sign-out.ts                 # Global server actions (not feature-specific)
```

**Key rules for `/server/`:**
- `/routers/_app.ts` is the single entry point that registers all routers
- Feature routers go in `/routers/[feature].ts`
- Procedures chain: `base` -> `publicProcedure` -> `protectedProcedure` (via middleware)
- Global server actions go in `/actions/`; feature-specific actions go in the feature's `_actions/`

### `/orpc/` -- oRPC Client

```
/orpc/
  client.ts                     # Client-side oRPC client (browser)
  server.ts                     # Server-side oRPC client (SSR/RSC)
  serializer.ts                 # Serialization utilities
  /query/
    client.ts                   # TanStack Query client integration
    hydration.tsx               # Query hydration for SSR
```

**Key rules for `/orpc/`:**
- `client.ts` is used in `"use client"` components
- `server.ts` is used in Server Components and Server Actions
- Never import `client.ts` in server-side code

### `/validators/` -- Validation Schemas

```
/validators/
  auth.ts                       # Auth-related Zod schemas
  [feature].ts                  # Feature-specific Zod schemas
```

**Key rules for `/validators/`:**
- One file per feature
- Schemas are shared between frontend (forms) and backend (oRPC input validation)
- Export both the schema and the inferred TypeScript type

### `/lib/` -- Utilities

```
/lib/
  /auth/
    utils.ts                    # getServerSession() helper
  /utils/
    index.ts                    # Barrel export for core utilities
    cn.ts                       # Tailwind class merge utility
    tv.ts                       # Tailwind Variants utility
    polymorphic.ts              # Polymorphic component utility
    recursive-clone-children.tsx # React children cloning utility
    get-base-url.ts             # Base URL resolution
    /dates/
      format-relative-date.ts   # Date formatting
    /email/
      resend.ts                 # Resend email client
    /table/
      get-sorting-icon.tsx      # Table sorting icon helper
      sorting-state.ts          # Table sorting state utility
```

**Key rules for `/lib/`:**
- `/auth/` contains auth-specific helpers
- `/utils/` contains general utilities, organized by domain when needed
- Root `index.ts` exports only the core utilities used everywhere (cn, tv, polymorphic)
- Domain-specific utilities go in subdirectories

### `/constants/` -- Constants

```
/constants/
  pages.ts                      # Page URL constants (PAGES, AUTH_PAGES, APPLICATION_PAGES)
  project.ts                    # Project metadata constants
  auth-errors.ts                # Auth error message constants
  label-colors.ts               # Label color constants
```

### `/emails/` -- Email Templates

```
/emails/
  verify-email.tsx
  reset-password.tsx
  change-email.tsx
  2fa-otp.tsx
  waitlist-approved.tsx
  /common/                      # Shared email components
  /components/                  # Email-specific components
```

### `/providers/` -- React Providers

```
/providers/
  query-client.provider.tsx     # TanStack Query + oRPC provider
```

## When to Create New Folders

| Scenario | Where | Example |
|----------|-------|---------|
| New feature | `/app/(application)/[feature]/` | `/app/(application)/projects/` |
| New DB schema | `/db/schema/[feature]/` | `/db/schema/projects/` |
| New API router | `/server/routers/[feature].ts` | `/server/routers/projects.ts` |
| New validator | `/validators/[feature].ts` | `/validators/projects.ts` |
| New utility domain | `/lib/utils/[domain]/` | `/lib/utils/currency/` |
| New email template | `/emails/[name].tsx` | `/emails/invite-member.tsx` |
| New constant file | `/constants/[name].ts` | `/constants/permissions.ts` |
| Shared component | `/components/[name].tsx` | `/components/user-avatar.tsx` |
| New marketing page | `/app/(marketing)/[page]/` | `/app/(marketing)/pricing/` |

## Folders You Should NEVER Create

- `/components/ui/[anything]` -- AlignUI is read-only
- `/app/(application)/shared/` -- Use `/components/` instead
- `/types/` at root -- Types live next to their code or in `/db/schema/[feature]/types.ts`
- `/hooks/` at root -- Hooks live in feature `_hooks/` or are part of a component
- `/actions/` at root -- Use `/server/actions/` for global actions, feature `_actions/` for feature actions
- `/services/` -- Business logic goes in oRPC handlers or server actions
- `/store/` -- Use TanStack Query for server state, React state/context for client state
