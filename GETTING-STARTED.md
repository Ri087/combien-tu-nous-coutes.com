# Getting Started: Impulse Minimal Boilerplate

Welcome! This guide will help you set up your development and production environment for the Impulse Minimal Boilerplate.

---

## 1. Create Neon Database (Postgres) through Vercel

- Go to [Vercel](https://vercel.com/)
- In your project, navigate to **Storage** > **Create Database**
- Follow the prompts to create a new Neon Postgres database
- Once created, the integration will automatically link:
    - `DATABASE_URL`

## 2. Set Up Resend (Transactional Email)

- Go to [Vercel](https://vercel.com/)
- In your project, go to **Settings > Environment Variables**
- Link the shared environment variables for Resend:
    - `RESEND_API_KEY`
    - `RESEND_FROM_EMAIL`

## 3. Add Environment Variables to Vercel

- In your Vercel project, go to **Settings > Environment Variables**
- Add all required variables (see below)
- For local development, copy `.env.example` to `.env` and fill in the values

---

## 4. Required Environment Variables

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Dev tools (optional)
NEXT_PUBLIC_REACT_QUERY_DEVTOOLS=false
```

---

## 5. Run the Project

**Install dependencies:**

```bash
pnpm i
```

**Start the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## 6. Optional Extensions

See `.claude/skills/` for guides on activating optional features:

- **Vercel Blob** - File uploads (`.claude/skills/vercel-blob.md`)
- **AI SDK** - AI-powered features (`.claude/skills/ai-sdk.md`)
- **Tiptap** - Rich text editor (`.claude/skills/tiptap.md`)
- **PostHog** - Analytics (`.claude/skills/analytics.md`)
- **Upstash Redis** - Rate limiting & caching (`.claude/skills/redis.md`)

---

## 7. Useful Links

- [Resend](https://resend.com/)
- [Neon](https://neon.tech/)
- [Vercel](https://vercel.com/)

---

**Need help?**

- Join the [Impulse Community on Discord](https://discord.gg/impulselab)
- Email: support@impulse.com
