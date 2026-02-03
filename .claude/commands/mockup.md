# Generate Mockups

Tu vas générer des maquettes fonctionnelles (composants React) à partir des user stories ou du FEATURES.md.

## Objectif

Créer des **previews visuelles rapides** pour valider avec le client AVANT de coder la logique.

## Process

1. Lis `USER-STORIES.md` ou `FEATURES.md`
2. Pour chaque écran principal, génère un composant React :
   - Utilise les composants AlignUI (`/components/ui/`)
   - Données mockées (pas de vraie logique)
   - Layout responsive
   - États principaux (vide, loading, rempli)

3. Crée les fichiers dans `/app/(mockups)/`

## Output

```
/app/(mockups)/
  /page.tsx           → Index des maquettes
  /feed/page.tsx      → Maquette du feed
  /profile/page.tsx   → Maquette du profil
  /upload/page.tsx    → Maquette de l'upload
```

## Exemple de maquette

```tsx
// app/(mockups)/feed/page.tsx
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Données mockées
const MOCK_POSTS = [
  { id: 1, author: 'Marie', image: '/placeholder.jpg', votes: 42 },
  { id: 2, author: 'Jean', image: '/placeholder.jpg', votes: 28 },
];

export default function FeedMockup() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>
      
      {MOCK_POSTS.map((post) => (
        <div key={post.id} className="border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar name={post.author} />
            <span>{post.author}</span>
          </div>
          <div className="bg-gray-200 h-64 rounded-lg mb-3" />
          <div className="flex justify-between">
            <Button variant="ghost">❤️ {post.votes}</Button>
            <Button variant="ghost">💬 Commenter</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Important

- Les maquettes sont dans `/(mockups)/` pour être séparées du vrai code
- Utilise UNIQUEMENT les composants AlignUI
- Pas de logique, pas d'API calls
- Le but est de voir le rendu visuel rapidement

Dis-moi quelles pages tu veux maquetter !
