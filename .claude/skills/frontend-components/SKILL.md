---
name: frontend-components
description: |
  React component development guide for this codebase. Use when creating new components, splitting large components, deciding between client and server components, following naming conventions, importing components, typing props, or using forwardRef.
---

# React Component Development

This skill covers the patterns and conventions for creating React components in this codebase. It includes guidance on when to use server vs client components, how to split large components into smaller focused pieces, naming conventions, prop typing with TypeScript, import patterns, and the use of `forwardRef` for components that need to expose DOM refs.

## Reference Files

- **create-component.md** -- How to create a new component with the standard file structure and exports
- **split-components.md** -- When and how to split a large component into smaller, focused sub-components
- **client-components.md** -- When to use the `'use client'` directive and what it implies
- **server-components.md** -- Best practices for server components including data fetching and async patterns
- **naming-conventions.md** -- File and component naming rules (kebab-case files, PascalCase components)
- **import-patterns.md** -- How to import components using the `@/` alias and barrel exports
- **props-typing.md** -- How to type component props with TypeScript interfaces and extending HTML elements
- **forward-ref.md** -- How to use `forwardRef` for components that need to expose a DOM ref

## Key Rules

1. **Use kebab-case for file names and PascalCase for component names.** Example: `project-card.tsx` exports `ProjectCard`.
2. **Default to server components.** Only add `'use client'` when the component genuinely needs interactivity, hooks, or browser APIs.
3. **Co-locate feature components** in `_components/` next to their page, not in the global `/components/` directory.
4. **Always type props explicitly** using a TypeScript interface or type alias at the top of the file.
5. **Never put business logic in UI components.** Extract logic into hooks (`_hooks/`) or utility functions.

## Related Skills

- **frontend-ui** -- AlignUI design system components to use as building blocks
- **frontend-pages** -- Page-level component patterns and feature-first structure
- **frontend-forms** -- Form-specific component patterns
- **architecture-skills** -- File naming and code organization conventions
