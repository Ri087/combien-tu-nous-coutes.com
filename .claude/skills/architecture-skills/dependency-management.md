# Dependency and Package Management

## Package Manager: pnpm ONLY

This project uses **pnpm** exclusively. Never use npm or yarn.

```bash
# CORRECT
pnpm install
pnpm add [package]
pnpm dev

# WRONG -- Never use these
npm install
yarn add
npx [command]    # Use pnpm dlx instead
```

## Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies from lockfile |
| `pnpm add [package]` | Add a production dependency |
| `pnpm add -D [package]` | Add a dev dependency |
| `pnpm remove [package]` | Remove a dependency |
| `pnpm dev` | Start development server (Next.js + Drizzle Studio) |
| `pnpm build` | Build for production |
| `pnpm checks` | Run lint + TypeScript type checking |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm dlx [package]` | Execute a package without installing (replaces npx) |

## Before Adding a New Package

### Step 1: Check if it already exists

Always check `package.json` before adding a new dependency:

```bash
# Check if a package is already installed
cat package.json | grep "[package-name]"

# Or check the full dependency list
pnpm list
pnpm list [package-name]
```

### Step 2: Check if the codebase already solves the need

Before adding a package, verify that the existing codebase does not already provide the functionality:

| Need | Already provided by |
|------|-------------------|
| Class merging | `cn()` from `@/lib/utils` (uses `tailwind-merge` + `clsx`) |
| Component variants | `tv()` from `@/lib/utils` (uses `tailwind-variants`) |
| Form management | `react-hook-form` + `@hookform/resolvers` (already installed) |
| Validation | `zod` (already installed) |
| API calls | `@orpc/client` + `@tanstack/react-query` (already installed) |
| Icons | `@remixicon/react` (already installed) |
| Date picker | `@/components/ui/datepicker` (AlignUI) |
| Charts | Check if `recharts` is installed |
| Toast/notifications | `sonner` via `@/components/ui/sonner` (already installed) |
| Tooltips | `@/components/ui/tooltip` (AlignUI) |
| Modals/Dialogs | `@/components/ui/dialog` (AlignUI) |
| Dropdowns | `@/components/ui/dropdown` (AlignUI) |
| Tables | `@tanstack/react-table` (if installed) + `@/components/ui/table` |
| Email sending | `resend` (already installed) |
| Email templates | `@react-email/*` (already installed) |
| Auth | `better-auth` (already installed) |
| Date formatting | `date-fns` (if installed), or native `Intl.DateTimeFormat` |
| URL state | `nuqs` (already installed) |
| Env validation | `@t3-oss/env-nextjs` (already installed) |
| File uploads | Check for `@vercel/blob` |

### Step 3: Evaluate the package

Before adding, consider:

1. **Is it actively maintained?** Check npm downloads and last publish date
2. **Is it tree-shakeable?** Prefer packages with ES module exports
3. **Does it support React Server Components?** Needed for Server Components
4. **What is the bundle size impact?** Check on bundlephobia.com
5. **Is there a lighter alternative?** Prefer smaller focused packages

## Adding Dependencies

### Production dependencies

Packages used at runtime:

```bash
pnpm add [package-name]

# Examples
pnpm add @tanstack/react-table
pnpm add recharts
pnpm add date-fns
```

### Dev dependencies

Packages used only during development/build:

```bash
pnpm add -D [package-name]

# Examples
pnpm add -D @types/[package]
pnpm add -D prettier
pnpm add -D eslint-plugin-[name]
```

### When to use `-D` (devDependencies)

| Dev dependency | Production dependency |
|----------------|----------------------|
| Type definitions (`@types/*`) | Runtime libraries |
| Linters and formatters | UI component libraries |
| Testing frameworks | API clients |
| Build tools | Database drivers |
| Code generators | Auth libraries |

## Current Project Dependencies

These are the core packages already installed in this project. Always check `package.json` for the complete and current list.

### Core Framework
- `next` -- Next.js 16 (App Router)
- `react`, `react-dom` -- React 19
- `typescript` -- TypeScript

### Database
- `drizzle-orm` -- ORM
- `drizzle-kit` -- CLI for migrations
- `pg` -- PostgreSQL driver

### Auth
- `better-auth` -- Authentication

### API
- `@orpc/client`, `@orpc/server` -- Type-safe RPC
- `@orpc/tanstack-query` -- TanStack Query integration

### State & Data
- `@tanstack/react-query` -- Server state management
- `nuqs` -- URL search params state

### Forms & Validation
- `react-hook-form` -- Form management
- `@hookform/resolvers` -- Zod resolver for forms
- `zod` -- Schema validation

### UI
- `@remixicon/react` -- Icons
- `tailwindcss` -- Utility CSS
- `tailwind-merge` -- Class merging
- `tailwind-variants` -- Component variants
- `clsx` -- Conditional classes
- `sonner` -- Toast notifications
- `next-themes` -- Theme management

### Email
- `resend` -- Email sending
- `@react-email/components` -- Email components

### Environment
- `@t3-oss/env-nextjs` -- Env variable validation
- `dotenv` -- Env file loading

## Version Management

### Lock file

The `pnpm-lock.yaml` file is the source of truth for dependency versions. Never delete or manually edit it.

```bash
# Regenerate lock file from package.json
pnpm install

# Update a specific package
pnpm update [package-name]

# Update a specific package to latest
pnpm update [package-name] --latest
```

### Checking for outdated packages

```bash
# List outdated packages
pnpm outdated

# Interactive update
pnpm update --interactive
```

### Version pinning

The project uses caret ranges (`^`) by default in `package.json`. This allows minor and patch updates while locking the major version:

```json
{
  "dependencies": {
    "next": "^15.0.0",     // Allows 15.x.x
    "react": "^19.0.0"     // Allows 19.x.x
  }
}
```

## After Installing Packages

1. **Verify the install succeeded:** Check for errors in the terminal output
2. **Check TypeScript types:** Run `pnpm checks` to ensure no type errors
3. **Check for peer dependency warnings:** Resolve any peer dependency conflicts
4. **Import and use correctly:** Follow the package's documentation for the correct import style

```bash
# Full verification after adding a package
pnpm add [package] && pnpm checks
```

## Monorepo Considerations

This project is NOT a monorepo. All dependencies are at the root level. If the project ever becomes a monorepo:

- Use `pnpm` workspaces
- Dependencies shared across packages go in root `package.json`
- Package-specific dependencies go in each package's `package.json`

## Scripts Reference

Check `package.json` for the full list of available scripts:

```bash
# View all available scripts
cat package.json | grep -A 50 '"scripts"'

# Run a script
pnpm [script-name]
```

## Common Mistakes

### 1. Using npm or yarn

```bash
# WRONG
npm install lodash
yarn add lodash

# CORRECT
pnpm add lodash
```

### 2. Using npx instead of pnpm dlx

```bash
# WRONG
npx create-next-app

# CORRECT
pnpm dlx create-next-app
```

### 3. Adding a package that already exists

```bash
# Before adding, CHECK FIRST
cat package.json | grep "date-fns"
# If it exists, don't add it again
```

### 4. Adding to wrong dependency type

```bash
# WRONG -- @types packages should be devDependencies
pnpm add @types/node

# CORRECT
pnpm add -D @types/node
```

### 5. Forgetting to install after cloning

```bash
# After cloning or pulling changes with new dependencies
pnpm install
```

### 6. Committing without lock file

Always commit `pnpm-lock.yaml` alongside `package.json` changes. The lock file ensures reproducible installs across all environments.

### 7. Installing multiple packages that do the same thing

```bash
# BAD -- Don't install competing packages
pnpm add axios   # We already have @orpc/client for API calls
pnpm add moment  # We already have date-fns (or use native Intl)
pnpm add styled-components  # We use Tailwind CSS

# GOOD -- Use what's already in the stack
# For API calls: use oRPC client
# For dates: use date-fns or native Intl
# For styling: use Tailwind CSS + AlignUI
```
