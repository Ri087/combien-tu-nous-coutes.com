---
name: frontend-pages
description: |
  Next.js App Router page development guide. Use when creating new pages, setting up page layouts, adding headers, sidebar entries, loading states, error pages, handling search params, URL state with nuqs, route groups, dynamic routes, or page metadata.
---

# Next.js App Router Page Development

This skill covers creating and configuring pages in the Next.js App Router. It includes page creation with proper file conventions, layout setup, header components, sidebar navigation entries, loading and error states, search parameter handling, URL state management with nuqs, route groups, dynamic routes, and SEO metadata. Pages follow the feature-first structure with co-located `_components/`, `_hooks/`, and `_actions/` directories.

## Reference Files

- **create-page.md** -- How to create a new page with the standard `page.tsx` structure and feature-first organization
- **page-layout.md** -- How to set up layouts with `layout.tsx` for shared UI across related pages
- **page-header.md** -- How to add a page header using the shared header component
- **sidebar-entry.md** -- How to add a new entry to the application sidebar navigation
- **loading-states.md** -- How to implement loading states with `loading.tsx` and Suspense boundaries
- **error-pages.md** -- How to handle errors with `error.tsx` and `not-found.tsx` pages
- **search-params.md** -- How to read and use URL search parameters in server and client components
- **url-state.md** -- How to manage URL-based state using nuqs for type-safe query parameters
- **route-groups.md** -- How to organize routes using route groups like `(auth)` and `(application)`
- **dynamic-routes.md** -- How to create dynamic routes with `[slug]` and `[...catchAll]` segments
- **page-metadata.md** -- How to define page metadata for SEO using the `metadata` export or `generateMetadata`
- **server-vs-client.md** -- When to use server components vs client components in pages

## Key Rules

1. **Always follow feature-first structure.** Co-locate `_components/`, `_hooks/`, and `_actions/` next to the page file.
2. **Always add a sidebar entry** when creating a new top-level application page.
3. **Use server components by default.** Only add `'use client'` when the component needs interactivity or browser APIs.
4. **Always add loading states** with `loading.tsx` for pages that fetch data.
5. **Use `PAGES` constants** for page paths instead of hardcoding URL strings.

## Related Skills

- **frontend-components** -- Component patterns used inside pages
- **frontend-ui** -- AlignUI components for building page content
- **frontend-state** -- Data fetching and state management within pages
- **backend-auth** -- Protecting pages that require authentication
