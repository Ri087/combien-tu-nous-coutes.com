# Skill: Rich Text Editor in Forms

## When to Use

Use this skill whenever a form field needs rich text editing capabilities (bold, italic, underline, links, lists, highlights). Examples: blog post content, project descriptions, comments, notes, email templates.

## Prerequisites

- Tiptap editor packages are installed (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
- The `RichTextEditor` component exists at `/components/custom/rich-text-editor.tsx`
- The `FormRichTextEditor` wrapper exists at `/components/form/form-rich-text-editor.tsx`
- The Zod schema field should be `z.string()` -- the editor stores HTML content

## Step-by-Step Instructions

### Step 1: Define the Schema

The rich text field stores HTML as a string:

```typescript
// validators/posts.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

### Step 2: Use FormRichTextEditor

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FormInput, FormRichTextEditor } from "@/components/form";
import * as FancyButton from "@/components/ui/fancy-button";
import { createPostSchema } from "@/validators/posts";

type FormValues = z.infer<typeof createPostSchema>;

export function CreatePostForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // data.content contains HTML string like:
    // "<p>Hello <strong>world</strong></p>"
    console.log(data.content);
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        label="Title"
        name="title"
        placeholder="Post title"
        required
      />

      <FormRichTextEditor
        control={form.control}
        name="content"
        label="Content"
        required
        placeholder="Write your post content..."
        description="Supports bold, italic, underline, links, and lists"
      />

      <FancyButton.Root size="medium" variant="primary">
        Publish
      </FancyButton.Root>
    </form>
  );
}
```

### Step 3: FormRichTextEditor Props Reference

```tsx
<FormRichTextEditor
  // Required React Hook Form props
  control={form.control}
  name="content"

  // Label and validation display
  label="Content"
  required={true}
  description="Supports rich text formatting"

  // Editor customization
  placeholder="Write something..."
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control from `useForm()` |
| `name` | `FieldPath<TFieldValues>` | required | Field name (string in schema) |
| `label` | `string` | - | Label text above editor |
| `required` | `boolean` | `false` | Shows asterisk next to label |
| `description` | `string` | - | Description text next to label |
| `placeholder` | `string` | - | Placeholder text when editor is empty |

### Step 4: Understanding the Editor Features

The underlying `RichTextEditor` component uses Tiptap with the following extensions:

| Extension | Feature | Toolbar |
|-----------|---------|---------|
| `StarterKit` | Bold, italic, strike, code, blockquote, bullet list, ordered list, hard break, horizontal rule | Floating toolbar |
| `Highlight` | Text highlighting | Floating toolbar |
| `Underline` | Underline text | Floating toolbar |
| `Link` | Clickable links (auto-detected, HTTPS default) | Floating toolbar |
| `Typography` | Smart quotes, dashes, ellipsis | Automatic |
| `Placeholder` | Placeholder text when empty | Automatic |

**Floating toolbar:** A toolbar appears when the user selects text, providing formatting buttons. It auto-hides when the selection is cleared.

**No heading support:** The editor is configured with `heading: false` in StarterKit -- it does not support H1-H6 headings.

### Step 5: Working with HTML Content

The editor stores and returns HTML:

```typescript
// Empty state
""

// Simple text
"<p>Hello world</p>"

// Formatted text
"<p>Hello <strong>world</strong></p>"

// Complex content
"<p>Here is a <em>formatted</em> paragraph with a <a href=\"https://example.com\">link</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul>"
```

**Rendering HTML content:** When displaying the stored content, use `dangerouslySetInnerHTML` with proper sanitization, or parse it with a library:

```tsx
// Display rich text content (ensure sanitization in production)
<div
  className="prose prose-sm"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
```

### Step 6: Edit Forms with Existing Content

When editing existing content, pass the HTML string as the default value:

```tsx
const defaultValues = useMemo<FormValues>(
  () => ({
    title: post.title,
    content: post.content ?? "", // HTML string from database
  }),
  [post.title, post.content]
);

const form = useForm<FormValues>({
  resolver: zodResolver(updatePostSchema),
  defaultValues,
});

// The RichTextEditor syncs via useEffect when content prop changes
```

The `RichTextEditor` component includes a `useEffect` that calls `editor.commands.setContent(content)` when the `content` prop changes, so it stays in sync with form resets.

### Step 7: Validation Considerations

Since the editor produces HTML, a "required" field needs careful validation:

```typescript
// Basic: just check non-empty
content: z.string().min(1, "Content is required"),

// Better: check that it's not just empty HTML tags
content: z.string().refine(
  (val) => {
    // Strip HTML tags and check if there's actual text content
    const textContent = val.replace(/<[^>]*>/g, "").trim();
    return textContent.length > 0;
  },
  { message: "Content is required" }
),

// With maximum length (based on text content, not HTML)
content: z.string().refine(
  (val) => {
    const textContent = val.replace(/<[^>]*>/g, "").trim();
    return textContent.length <= 5000;
  },
  { message: "Content must be 5000 characters or less" }
),
```

## Editor Styling

The editor inherits these CSS classes:
- **Editor area:** `text-paragraph-sm prose-sm prose text-text-strong-950 min-h-[100px]`
- **Wrapper:** Rounded border with focus ring, hover state, AlignUI design tokens
- **Placeholder:** Shown via the `is-editor-empty` class when the editor has no content

The editor visually matches other AlignUI form inputs with the same border, focus, and hover styles.

## Complete Example

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";

import {
  FormInput,
  FormRichTextEditor,
  FormTextarea,
} from "@/components/form";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import { orpc } from "@/lib/orpc/client";
import { createPostSchema } from "@/validators/posts";

type FormValues = z.infer<typeof createPostSchema>;

export function CreatePostForm() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => orpc.posts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created");
      form.reset();
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = form.handleSubmit((data) => {
    setError(null);
    mutation.mutate(data);
  });

  const isSubmitting = mutation.isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        label="Title"
        name="title"
        placeholder="Post title"
        required
      />

      <FormTextarea
        control={form.control}
        label="Summary"
        name="summary"
        placeholder="Brief summary..."
        maxLength={200}
        rows={2}
      />

      <FormRichTextEditor
        control={form.control}
        label="Content"
        name="content"
        placeholder="Write your post..."
        required
      />

      <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
        {error}
      </FormGlobalMessage>

      <FancyButton.Root
        disabled={isSubmitting}
        size="medium"
        variant="primary"
      >
        {isSubmitting && <StaggeredFadeLoader variant="muted" />}
        {isSubmitting ? "Publishing..." : "Publish Post"}
      </FancyButton.Root>
    </form>
  );
}
```

## Critical Rules

1. **The schema field must be `z.string()`** -- the editor stores HTML as a string
2. **Default value should be `""`** -- empty string, not `undefined` or `null`
3. **HTML content needs sanitization when rendered** -- use `dangerouslySetInnerHTML` with care
4. **The editor does not support headings** -- `heading: false` is configured in StarterKit
5. **The floating toolbar appears on text selection** -- no static toolbar is rendered
6. **Content syncs via `useEffect`** -- external changes to the `content` prop are reflected
7. **Import from `@/components/form`** -- use `FormRichTextEditor`, not the raw `RichTextEditor`
8. **Never modify** `/components/custom/rich-text-editor.tsx` or `/components/form/form-rich-text-editor.tsx`
9. **For Tiptap setup details** -- read `.claude/skills/tiptap.md` if you need to extend the editor
