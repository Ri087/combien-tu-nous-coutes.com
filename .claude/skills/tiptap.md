# Tiptap - Rich Text Editor

## When to use
- Blog posts
- Comments with formatting
- Any rich text input

## Setup

Already installed. No API key needed.

## Usage
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: 'Hello World!',
  });

  return <EditorContent editor={editor} />;
}
```

## Installed extensions
- @tiptap/starter-kit (bold, italic, lists, etc.)
- @tiptap/extension-link
- @tiptap/extension-highlight
- @tiptap/extension-placeholder
- @tiptap/extension-typography
- @tiptap/extension-underline

## Docs
https://tiptap.dev/docs
