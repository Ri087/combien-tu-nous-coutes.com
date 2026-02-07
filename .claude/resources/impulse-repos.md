# Impulse Studio - Reference Repositories

Repositories internes à utiliser comme source d'inspiration et de patterns.

## Comment accéder aux repos

Utilise le **MCP DeepWiki** (Devin) pour explorer ces repositories :

```
# Lire la structure de la documentation
mcp__devin__read_wiki_structure(repoName: "impulse-studio/<repo>")

# Lire la documentation complète
mcp__devin__read_wiki_contents(repoName: "impulse-studio/<repo>")

# Poser une question spécifique (si disponible)
mcp__devin__ask_question(repoName: "impulse-studio/<repo>", question: "...")
```

---

## Repositories UI / Templates AlignUI

Ces templates sont la **référence absolue** pour le design et les patterns UI.
Il faut OBLIGATOIREMENT s'en inspirer pour toute interface.

### `impulse-studio/alignui-ai-template`
- **Type** : Template AI Chat
- **Usage** : Chat IA, projets, sidebar, modals
- **Patterns clés** : MainSidebar (forwardRef + imperative API), ChatInput (drag & drop, paste), ChatHeader (responsive desktop/mobile), Modal (animation 2 phases), Popover menus
- **Design tokens** : `text-text-strong-950`, `bg-bg-white-0`, `border-stroke-soft-200`, `shadow-complex`
- **Fichier patterns** : `.claude/resources/alignui-ai-template-patterns.md`

### `impulse-studio/marketing-template-alignui`
- **Type** : Template ERP / E-commerce / Marketing
- **Usage** : Dashboard analytics, products, commandes, widgets
- **Patterns clés** : Sidebar responsive (desktop fixe + mobile dropdown), WidgetBox container, Data tables avec TanStack Table, Multi-step forms, Badge/Avatar/StatusBadge system
- **State management** : Jotai atoms pour modals et formulaires
- **Styling** : tailwind-variants (tv) pour tous les composants
- **Fichier patterns** : `.claude/resources/alignui-ui-patterns.md`

### `impulse-studio/template-finance-alignui`
- **Type** : Template Dashboard Finance
- **Usage** : Cartes bancaires, transactions, budgets, transferts, charts
- **Patterns clés** : WidgetBox system, Grid responsive (1→2→3 cols), Card widget avec SegmentedControl, Transaction tables (TanStack Table), Chart system (Recharts + ChartContainer), Empty states avec illustrations
- **State management** : Jotai atoms pour drawers/modals/filtres
- **Charts** : Recharts (BarChart, PieChart, StepLine), D3.js pour custom
- **Fichier patterns** : `.claude/resources/finance-template-ui-patterns.md`

### `impulse-studio/template-hr-alignui`
- **Type** : Template RH / HR
- **Usage** : Dashboard employés, onboarding wizard, settings, courses
- **Patterns clés** : Multi-step onboarding (Jotai atoms pour steps), Dashboard widgets (TimeTracker, Courses, Projects), Button system (primary/neutral/error × filled/stroke/lighter/ghost), HorizontalStepper/VerticalStepper, Pagination variants
- **Form patterns** : Radix UI primitives, React Hook Form + Zod, error states via hasError prop

---

## Repositories Fonctionnels

### `impulse-studio/nextjs-boilerplate`
- **Type** : Boilerplate SaaS complet
- **Usage** : Architecture de référence (oRPC, Drizzle, Better Auth, Stripe, Organizations)
- **Patterns clés** :
  - **oRPC** : `base.router()`, `publicProcedure`, `protectedProcedure` (via authMiddleware), RPCHandler avec BatchPlugin + DedupePlugin
  - **Drizzle** : Schema par feature (`db/schema/[feature]/`), relations séparées, types inférés (`$inferSelect`)
  - **Better Auth** : `betterAuth()` config avec drizzleAdapter, emailOTP plugin, nextCookies, `getServerSession()` utilitaire
  - **Providers** : ThemeProvider → NuqsAdapter → TooltipProvider → QueryClientProvider
  - **Forms** : React Hook Form + zodResolver, pattern signIn/signUp
  - **Routes** : Constants centralisées (`PAGES.DASHBOARD`, etc.)
  - **Protection** : Layout-level session check avec redirect

### `impulse-studio/ai-platform`
- **Type** : Plateforme IA avec chat et workflows
- **Usage** : Système de chat IA avancé, flow editor, intégrations
- **Patterns clés** : Monorepo, realtime system, flow editor, node configuration

### `impulse-studio/agency-website`
- **Type** : Site agence avec CRM et proposals
- **Usage** : Landing pages, lead capture, proposals AI, email automation
- **Patterns clés** : i18n system, RBAC, TipTap editor, AI agents, Cal.com integration

### `impulse-studio/altf4`
- **Type** : App gaming avec landing page
- **Usage** : Landing page, organizations, draft system, payments
- **Patterns clés** : tRPC (pas oRPC), Better Auth avec organizations, Stripe

---

## Quand utiliser quel repo

| Besoin | Repo de référence |
|--------|------------------|
| Dashboard / Analytics | `marketing-template-alignui` ou `template-finance-alignui` |
| Chat IA / Sidebar | `alignui-ai-template` |
| Formulaires / Settings | `template-hr-alignui` |
| Transactions / Finance | `template-finance-alignui` |
| Architecture oRPC / Auth | `nextjs-boilerplate` |
| Landing page | `agency-website` ou `altf4` |
| Multi-step wizard | `template-hr-alignui` (onboarding) |
| Charts / Data viz | `template-finance-alignui` |
| Modals / Drawers | `alignui-ai-template` (modals) ou `template-finance-alignui` (drawers) |
