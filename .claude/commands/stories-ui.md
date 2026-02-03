# Generate User Stories UI

Tu vas créer une page web élégante pour visualiser et présenter les user stories au client.

## Objectif

Générer une page `/stories` qui affiche :
- Vue d'ensemble du projet
- Les personas
- Les user stories avec leur priorité et statut
- Un design professionnel pour présentation client

## Structure à créer

```
/app/(stories)/
  /layout.tsx      → Layout minimal (pas de sidebar)
  /page.tsx        → Page principale des user stories
  /_components/
    /story-card.tsx
    /persona-card.tsx
    /priority-badge.tsx
    /progress-bar.tsx
```

## Design Guidelines

Utilise les composants AlignUI + Tailwind pour un rendu pro :
- Cards avec ombres douces
- Badges colorés pour les priorités (P0=rouge, P1=orange, P2=vert)
- Progress bar pour montrer l'avancement
- Sections claires et espacées
- Mode sombre supporté

## Template de la page

```tsx
// app/(stories)/page.tsx
import { StoryCard } from './_components/story-card';
import { PersonaCard } from './_components/persona-card';
import { ProgressBar } from './_components/progress-bar';

// Ces données seront extraites de USER-STORIES.md
const PROJECT = {
  name: "Nom du Projet",
  description: "Description courte du projet",
  client: "Nom du Client",
  date: "Février 2026",
};

const PERSONAS = [
  { id: 1, name: "Admin", description: "Gère la plateforme", emoji: "👨‍💼" },
  { id: 2, name: "User", description: "Utilisateur final", emoji: "👤" },
];

const STORIES = [
  {
    id: "US-001",
    title: "Inscription utilisateur",
    asA: "visiteur",
    iWant: "créer un compte",
    soThat: "accéder à l'application",
    priority: "P0",
    status: "todo", // todo | in_progress | done
    criteria: [
      "Formulaire avec email/password",
      "Validation email",
      "Redirection vers dashboard",
    ],
  },
  // ...
];

export default function StoriesPage() {
  const totalStories = STORIES.length;
  const doneStories = STORIES.filter(s => s.status === 'done').length;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-500 mb-2">{PROJECT.client} • {PROJECT.date}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {PROJECT.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {PROJECT.description}
          </p>
          <div className="mt-6">
            <ProgressBar value={doneStories} max={totalStories} />
            <p className="text-sm text-gray-500 mt-2">
              {doneStories}/{totalStories} user stories complétées
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Personas */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Personas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PERSONAS.map(persona => (
              <PersonaCard key={persona.id} {...persona} />
            ))}
          </div>
        </section>

        {/* Stories by Priority */}
        <section>
          <h2 className="text-xl font-semibold mb-4">User Stories</h2>
          
          {/* P0 - Must Have */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-red-600 mb-3">
              🔴 Must Have (P0)
            </h3>
            <div className="space-y-4">
              {STORIES.filter(s => s.priority === 'P0').map(story => (
                <StoryCard key={story.id} {...story} />
              ))}
            </div>
          </div>

          {/* P1 - Should Have */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-orange-600 mb-3">
              🟠 Should Have (P1)
            </h3>
            <div className="space-y-4">
              {STORIES.filter(s => s.priority === 'P1').map(story => (
                <StoryCard key={story.id} {...story} />
              ))}
            </div>
          </div>

          {/* P2 - Nice to Have */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-green-600 mb-3">
              🟢 Nice to Have (P2)
            </h3>
            <div className="space-y-4">
              {STORIES.filter(s => s.priority === 'P2').map(story => (
                <StoryCard key={story.id} {...story} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        Généré par Impulse Studio • MVP Factory
      </footer>
    </div>
  );
}
```

## Composant StoryCard

```tsx
// app/(stories)/_components/story-card.tsx
interface StoryCardProps {
  id: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'todo' | 'in_progress' | 'done';
  criteria: string[];
}

export function StoryCard({ id, title, asA, iWant, soThat, status, criteria }: StoryCardProps) {
  const statusColors = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600',
  };

  const statusLabels = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminé',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono text-gray-400">{id}</span>
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
        <p><span className="font-medium">En tant que</span> {asA},</p>
        <p><span className="font-medium">Je veux</span> {iWant}</p>
        <p><span className="font-medium">Afin de</span> {soThat}</p>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-medium text-gray-500 mb-2">Critères d'acceptation</p>
        <ul className="text-sm space-y-1">
          {criteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-300">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Process

1. Lis USER-STORIES.md (s'il existe) ou demande les infos
2. Crée le layout et la page principale
3. Crée les composants (StoryCard, PersonaCard, ProgressBar)
4. Remplis avec les vraies données du projet
5. Vérifie avec `pnpm build`

## Résultat

Une page accessible sur `/stories` qui peut être partagée avec le client pour validation.

URL exemple : `https://mon-projet.vercel.app/stories`

Commence !
