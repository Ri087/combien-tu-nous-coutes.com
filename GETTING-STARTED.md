# Getting Started: Impulse Minimal Boilerplate

Welcome! This guide will help you set up your development and production environment for the Impulse Minimal Boilerplate. Follow each step to ensure your project is ready to run locally and on Vercel.

---

## 1. Create a Project on PostHog (Analytics)

- Go to [PostHog](https://eu.posthog.com)
- Sign up or log in
- Create a new project (e.g., "Impulse App")
- In your project settings, find your **Project API Key** and **Host**
- You'll need these for your environment variables:
    - `NEXT_PUBLIC_POSTHOG_KEY`
    - `NEXT_PUBLIC_POSTHOG_HOST`

## 2. Create a Project on Arcjet (Security)

- Go to [Arcjet](https://app.arcjet.com/teams/team_01jer4hekke8hb4rz1wyeyp63z/new-site)
- Sign up or log in
- Create a new project
- Get your **Arcjet Key**
- You'll need this for your environment variables:
    - `ARCJET_KEY`

## 3. Set Up Resend (Transactional Email)

- Go to [Vercel](https://vercel.com/)
- In your project, go to **Settings > Environment Variables**
- Link the shared environment variables for Resend
    - `RESEND_API_KEY`
    - `RESEND_FROM_EMAIL`

## 4. Create and Link Redis on Vercel (Caching/Key-Value Store)

- Go to [Vercel](https://vercel.com/impulse-lab)
- In your project, navigate to **Storage** > **Create Database**
- Follow the prompts to create a new Upstash Redis database
- Once created, the integration will automatically link the necessary environment variables to your project:
    - `KV_REST_API_URL`
    - `KV_REST_API_TOKEN`

## 5. Create Neon Database (Postgres) through Vercel

- Go to [Vercel](https://vercel.com/impulse-lab)
- In your project, navigate to **Storage** > **Create Database**
- Follow the prompts to create a new Neon Postgres database
- Once created, the integration will automatically link the necessary environment variable to your project:
    - `DATABASE_URL`

## 6. Add Environment Variables to Vercel

- Go to [Vercel](https://vercel.com/)
- Import your GitHub repo or create a new project
- In your project, go to **Settings > Environment Variables**
- Add all required variables (see below)
- **Tip:** You can use the Vercel CLI to add variables:
    ```bash
    vercel env add
    ```
- For local development, copy `.env.example.dev` to `.env` and fill in the values

---

## 7. Required Environment Variables

Paste these into Vercel or your local `.env` file and fill in the values:

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Arcjet
ARCJET_KEY=

# Upstash Redis
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Blob Storage (optional)
BLOB_READ_WRITE_TOKEN=

# Node/Vercel
NODE_ENV=development
VERCEL_URL=

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Devtools (optional)
NEXT_PUBLIC_REACT_QUERY_DEVTOOLS=false
NEXT_PUBLIC_REACT_SCAN_DEVTOOLS=false
```

---

## 9. Run the Project

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

## 10. Useful Links

- [PostHog](https://posthog.com/)
- [Arcjet](https://arcjet.com/)
- [Resend](https://resend.com/)
- [Upstash](https://upstash.com/)
- [Neon](https://neon.tech/)
- [Vercel](https://vercel.com/)
- [Impulse Docs](https://docs.impulse-lab.com)
- [Impulse GitHub](https://github.com/impulse-lab)

---

**Need help?**

- Join the [Impulse Community on Discord](https://discord.gg/impulselab)
- Email: support@impulse.com
