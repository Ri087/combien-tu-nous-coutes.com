---
name: architecture
description: |
  Project architecture and code organization guide. Use when organizing code by feature, following file naming conventions, understanding folder structure, splitting code/utils/components, understanding import aliases, server-client boundaries, or managing dependencies.
---

# Project Architecture and Code Organization

This skill covers the architectural decisions and code organization patterns used throughout the project. It enforces the feature-first structure, file naming conventions, folder hierarchy, code splitting strategies, import alias usage, server-client boundary rules, and dependency management. Read this before making structural decisions about where to place new code.

## Reference Files

- **feature-first.md** -- The feature-first organization principle: co-locate related code next to the page that uses it
- **folder-structure.md** -- Complete folder structure reference showing where every type of file belongs
- **file-naming.md** -- File naming conventions: kebab-case for files, PascalCase for components, camelCase for utilities
- **code-splitting.md** -- When and how to split code into separate files for maintainability
- **split-components.md** -- Guidelines for splitting large React components into focused sub-components
- **split-utils.md** -- Guidelines for extracting utility functions into shared or feature-specific modules
- **import-aliases.md** -- How to use the `@/` path alias for clean imports across the project
- **server-client-boundary.md** -- Rules for what code can run on the server vs client and how to handle the boundary
- **dependency-management.md** -- How to manage npm dependencies, when to add new packages, and version policies

## Key Rules

1. **Always follow feature-first organization.** Place `_components/`, `_hooks/`, and `_actions/` next to the page that uses them, not in global directories.
2. **Use kebab-case for all file names.** Example: `create-project-form.tsx`, not `CreateProjectForm.tsx`.
3. **Use the `@/` import alias for all cross-directory imports.** Never use relative paths that traverse more than one level up (`../../`).
4. **Respect the server-client boundary.** Do not import server-only code (database, auth) into client components.
5. **Do not add new dependencies without justification.** Check if the existing stack already provides the needed functionality.

## Related Skills

- **frontend-pages** -- Page structure that follows the feature-first pattern
- **frontend-components** -- Component naming and organization conventions
- **workflow-skills** -- Development workflow that incorporates these architectural rules
- **validation-skills** -- Validator file organization within the architecture
