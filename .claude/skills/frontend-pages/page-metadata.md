# Skill: How to Set Page Metadata

## Purpose

Guide to setting page metadata in Next.js 16 for SEO, social sharing, and browser tab titles. Covers static metadata exports, dynamic `generateMetadata`, title templates, and OpenGraph configuration.

## Static Metadata Export

The simplest approach. Use when the metadata is known at build time and does not depend on dynamic data.

```tsx
// /app/(application)/projects/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return <div>...</div>;
}
```

### Common Static Metadata Fields

```tsx
export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your projects and track progress.",
};
```

For most application pages, `title` is sufficient. The description is more important for public/marketing pages.

## Dynamic Metadata with `generateMetadata`

Use when metadata depends on route params, search params, or fetched data.

```tsx
// /app/(application)/projects/[id]/page.tsx
import type { Metadata } from "next";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;

  // Option 1: Simple metadata from params
  return {
    title: `Project ${id}`,
  };
}

// Option 2: Fetch data for metadata
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;

  // Fetch project data (this is deduplicated by Next.js if the page also fetches it)
  const project = await getProject(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return <ProjectDetail projectId={id} />;
}
```

### With Search Params

```tsx
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { tab } = await searchParams;

  return {
    title: `Project ${id} - ${tab ?? "Overview"}`,
  };
}
```

## Title Templates

Define a title template in a layout to automatically format all child page titles.

### In Root Layout

```tsx
// /app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "My App",        // Fallback if no child page sets a title
    template: "%s | My App",  // Template for child pages
  },
  description: "My application description",
};
```

With this template:
- A child page with `title: "Projects"` becomes `"Projects | My App"`
- A child page with `title: "Dashboard"` becomes `"Dashboard | My App"`
- If no child sets a title, it shows `"My App"`

### In Route Group Layout

You can override the template in a route group layout:

```tsx
// /app/(application)/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s - Dashboard | My App",
  },
};
```

### Absolute Titles

To ignore the parent template and set an exact title:

```tsx
export const metadata: Metadata = {
  title: {
    absolute: "Custom Page Title",  // Ignores parent template
  },
};
```

## OpenGraph Metadata

For social media sharing previews. Most important for public/marketing pages.

### Basic OpenGraph

```tsx
export const metadata: Metadata = {
  title: "My Project",
  description: "A project management tool",
  openGraph: {
    title: "My Project",
    description: "A project management tool",
    url: "https://myapp.com/projects",
    siteName: "My App",
    type: "website",
    images: [
      {
        url: "https://myapp.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "My App",
      },
    ],
  },
};
```

### Dynamic OpenGraph

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  return {
    title: project?.name ?? "Project",
    openGraph: {
      title: project?.name ?? "Project",
      description: project?.description ?? "",
      images: project?.coverImage
        ? [{ url: project.coverImage, width: 1200, height: 630 }]
        : [],
    },
  };
}
```

## Twitter Card Metadata

```tsx
export const metadata: Metadata = {
  title: "My App",
  twitter: {
    card: "summary_large_image",
    title: "My App",
    description: "A project management tool",
    images: ["https://myapp.com/twitter-image.png"],
    creator: "@myapp",
  },
};
```

## Common Metadata Patterns

### Application Page (authenticated)

```tsx
// Minimal -- just title is needed for tab display
export const metadata: Metadata = {
  title: "Projects",
};
```

### Marketing/Public Page

```tsx
// Full metadata for SEO
export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of all sizes.",
  openGraph: {
    title: "Pricing - My App",
    description: "Simple, transparent pricing for teams of all sizes.",
    type: "website",
  },
};
```

### Auth Page

```tsx
// Existing pattern in the codebase
export const metadata: Metadata = {
  title: "Sign In",
};
```

### Dynamic Detail Page

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Project ${id}`,
  };
}
```

## Robots and Indexing

For pages that should not be indexed:

```tsx
export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,    // Don't index this page
    follow: false,   // Don't follow links
  },
};
```

This is typically set at the layout level for all application pages:

```tsx
// /app/(application)/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

## Icons and Favicon

Set in the root layout:

```tsx
// /app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
```

## Metadata File Conventions

Next.js also supports file-based metadata:

| File | Purpose |
|------|---------|
| `favicon.ico` | Browser tab icon (in `/app/`) |
| `icon.png` | App icon |
| `apple-icon.png` | Apple touch icon |
| `opengraph-image.png` | Default OG image |
| `twitter-image.png` | Default Twitter card image |
| `sitemap.ts` | Dynamic sitemap generation |
| `robots.ts` | Dynamic robots.txt |
| `manifest.ts` | PWA manifest |

## Rules

- Every page should have at least a `title` metadata export
- Use static `export const metadata` when possible (simpler and faster)
- Use `generateMetadata` only when metadata depends on dynamic data
- Set a title template in the root layout for consistent formatting
- Application pages typically only need `title`
- Marketing pages need full SEO metadata (title, description, OpenGraph)
- Mark authenticated pages as `robots: { index: false }` to prevent indexing
- `generateMetadata` must be an `async` function and `params` must be awaited
- Never use `"use client"` in files that export metadata -- metadata is server-only
