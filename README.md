<p align="center">
  <a href="https://impulselab.ai">
    <img src="./public/favicon.png" height="96">
    <h3 align="center">Impulse Minimal Boilerplate</h3>
  </a>
  <p align="center">Rapidly build lead magnets and proof of concepts</p>
</p>

[Join the Impulse Community](https://discord.gg/impulselab)

# Impulse Minimal Boilerplate

A streamlined [Next.js](https://nextjs.org) starter template optimized for quickly building high-converting lead magnets and proof of concepts using AlignUI design tokens and Tailwind CSS.

## Features

-   🔸 Lightning-fast setup for lead generation pages
-   🔸 AlignUI design tokens for consistent branding
-   🔸 Responsive layouts with Tailwind CSS
-   🔸 Pre-built conversion-focused components
-   🔸 Dark/light mode toggle included
-   🔸 Ready for analytics integration
-   🔸 Optimized for performance
-   🔸 Minimal dependencies for quick iteration

## Use Cases

-   Landing pages for lead capture
-   Email newsletter sign-up forms
-   Webinar/event registration pages
-   Product concept validation
-   Simple feature demonstrations
-   Micro-sites for marketing campaigns

## Getting Started

**Install dependencies**

```bash
pnpm i
```

**Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quick Setup Guide

**1. Pull environment variables (if using Vercel)**

```bash
pnpm env:pull
```

**2. Start the database (requires Docker)**

```bash
pnpm db:start
```

**3. Start development environment**

```bash
pnpm dev
```

This runs:

-   Next.js dev server with Turbo
-   Database management studio
-   Email preview server (at http://localhost:3001)

**Additional Commands**

```bash
pnpm db:studio    # Open database management UI
pnpm db:push      # Push schema changes to database
pnpm format       # Format code with Prettier
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
```

## Customization

Modify design tokens in the `tailwind.config.ts` file to match your brand. The boilerplate leverages AlignUI's design system for rapid styling while maintaining visual consistency.
