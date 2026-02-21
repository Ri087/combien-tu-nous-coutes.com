---
name: workflow
description: |
  Development workflow guide for adding features, fixing bugs, documenting code, running checks, ensuring consistency, following pre-commit checklists, refactoring, testing, and code review. THE MOST IMPORTANT SKILL - read workflow/add-feature.md before implementing any new feature.
---

# Development Workflow

This is the most important skill in the project. It defines the step-by-step workflows for common development tasks. **Before implementing any new feature, always read `add-feature.md` first** to follow the correct sequence of schema, validators, routes, pages, and verification steps. This skill also covers bug fixing, documentation, running checks, consistency enforcement, pre-commit checklists, refactoring, testing, and code review processes.

## Reference Files

- **add-feature.md** -- Step-by-step workflow for adding a new feature end-to-end (schema, validators, oRPC, pages, verification). READ THIS FIRST for any new feature.
- **fix-bug.md** -- Structured approach to diagnosing and fixing bugs with minimal regression risk
- **document-code.md** -- When and how to add documentation, comments, and JSDoc annotations
- **run-checks.md** -- How to run `pnpm checks` and `pnpm build` and interpret the results
- **consistency-guide.md** -- Style and consistency rules to follow across the entire codebase
- **pre-commit-checklist.md** -- Checklist to verify before considering any task complete
- **refactoring.md** -- Safe refactoring patterns: extract, rename, move, and simplify
- **testing.md** -- Testing approach, what to test, and how to write tests
- **code-review.md** -- Code review checklist and common issues to look for

## Key Rules

1. **Always read `add-feature.md` before implementing a new feature.** It defines the exact order of operations.
2. **Always run `pnpm build` before considering a task done.** The build must pass with zero errors.
3. **Always run `pnpm db:push` after any schema change.** Never skip this step.
4. **Always follow the pre-commit checklist** before finalizing any piece of work.
5. **Follow the consistency guide** to maintain uniform code style across the project.

## Related Skills

- **architecture-skills** -- Code organization rules enforced during feature development
- **backend-orpc** -- API route creation steps referenced in the add-feature workflow
- **backend-database** -- Schema creation steps referenced in the add-feature workflow
- **validation-skills** -- Validator creation steps referenced in the add-feature workflow
