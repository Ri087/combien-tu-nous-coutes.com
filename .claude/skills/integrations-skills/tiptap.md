# Tiptap - Rich Text Editor

## When to use
- Blog posts / articles
- Comments with formatting
- Note-taking features
- Any rich text input

## Setup

**Already installed.** No API key needed.

## Usage

### Basic Editor

```tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });
  return <EditorContent editor={editor} />;
}
```

### With Placeholder

```tsx
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: 'Start writing...' }),
  ],
});
```

### Get/Set Content

```tsx
// Get
const html = editor.getHTML();
const json = editor.getJSON();

// Set
editor.commands.setContent('<p>New content</p>');
```

### Toolbar Actions

```tsx
editor.chain().focus().toggleBold().run();
editor.chain().focus().toggleItalic().run();
editor.chain().focus().toggleBulletList().run();
```

## Installed Extensions
- @tiptap/starter-kit (bold, italic, lists, etc.)
- @tiptap/extension-link
- @tiptap/extension-highlight
- @tiptap/extension-placeholder
- @tiptap/extension-typography
- @tiptap/extension-underline

## Docs

https://tiptap.dev/docs
