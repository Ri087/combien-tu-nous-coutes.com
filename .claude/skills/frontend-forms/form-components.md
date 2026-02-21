# Skill: Form Wrapper Components Reference

## When to Use

Use this skill as a reference for all available form wrapper components. These components live in `/components/form/` and wrap AlignUI primitives with React Hook Form's `Controller`, automatically handling labels, error display, required indicators, tooltips, and descriptions.

## Prerequisites

- All components are imported from `@/components/form`
- Each component requires `control` (from `useForm()`) and `name` (field path)
- The underlying field type in your Zod schema must match the component's expected value type

## Available Components

### FormInput

Text, email, number, and other standard inputs.

```tsx
import { FormInput } from "@/components/form";

<FormInput
  control={form.control}
  name="email"
  label="Email Address"
  required
  placeholder="hello@example.com"
  type="email"                         // "text" | "email" | "number" | "tel" | etc.
  icon={RiMailLine}                    // Optional: Remix Icon component
  disabled={false}
  size="medium"                        // "medium" | "small" | "xsmall"
  description="We'll never share it"   // Subtle text next to label
  tooltip="Used for account recovery"  // Info icon with tooltip
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control from `useForm()` |
| `name` | `FieldPath<TFieldValues>` | required | Field name matching schema key |
| `label` | `string` | - | Label text above input |
| `required` | `boolean` | `false` | Shows asterisk next to label |
| `placeholder` | `string` | - | Placeholder text |
| `type` | `string` | `"text"` | HTML input type |
| `icon` | `React.ElementType` | - | Icon component (e.g., `RiMailLine`) |
| `disabled` | `boolean` | `false` | Disables the input |
| `size` | `"medium" \| "small" \| "xsmall"` | - | Input size variant |
| `description` | `string` | - | Description text next to label |
| `tooltip` | `string` | - | Tooltip text on info icon |

**Number input behavior:** When `type="number"`, the component automatically converts `e.target.valueAsNumber` and sends `undefined` for `NaN`.

---

### FormPassword

Password input with show/hide toggle. Automatically includes a lock icon.

```tsx
import { FormPassword } from "@/components/form";

<FormPassword
  control={form.control}
  name="password"
  label="Password"
  required
  placeholder="Enter your password"
  disabled={false}
  size="medium"
  description="At least 8 characters"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control from `useForm()` |
| `name` | `FieldPath<TFieldValues>` | required | Field name matching schema key |
| `label` | `string` | - | Label text |
| `required` | `boolean` | `false` | Shows asterisk |
| `placeholder` | `string` | - | Placeholder text |
| `disabled` | `boolean` | `false` | Disables the input |
| `size` | `"medium" \| "small" \| "xsmall"` | - | Input size variant |
| `description` | `string` | - | Description text next to label |

---

### FormTextarea

Multiline text input with optional character counter.

```tsx
import { FormTextarea } from "@/components/form";

<FormTextarea
  control={form.control}
  name="description"
  label="Description"
  placeholder="Write a description..."
  maxLength={500}              // Shows character counter when set
  rows={4}                     // Number of visible rows (default: 3)
  simple                       // Simplified variant without character counter wrapper
  disabled={false}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control |
| `name` | `FieldPath<TFieldValues>` | required | Field name |
| `label` | `string` | - | Label text |
| `required` | `boolean` | `false` | Shows asterisk |
| `placeholder` | `string` | - | Placeholder text |
| `maxLength` | `number` | - | Max chars; shows counter when set |
| `rows` | `number` | `3` | Visible text rows |
| `simple` | `boolean` | `false` | Simplified variant (no counter wrapper) |
| `disabled` | `boolean` | `false` | Disables the textarea |

---

### FormSelect

Dropdown select powered by Radix Select.

```tsx
import { FormSelect } from "@/components/form";
import { RiDraftLine, RiCheckLine } from "@remixicon/react";

<FormSelect
  control={form.control}
  name="status"
  label="Status"
  required
  placeholder="Select a status"
  options={[
    { value: "draft", label: "Draft", icon: RiDraftLine },
    { value: "active", label: "Active", icon: RiCheckLine },
    { value: "archived", label: "Archived" },
  ]}
  size="medium"
  variant="default"           // "default" | "compact" | "compactForInput" | "inline"
  disabled={false}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control |
| `name` | `FieldPath<TFieldValues>` | required | Field name |
| `label` | `string` | - | Label text |
| `required` | `boolean` | `false` | Shows asterisk |
| `placeholder` | `string` | - | Placeholder when no value selected |
| `options` | `{ value: string; label: string; icon?: ElementType }[]` | required | Select options |
| `size` | `"medium" \| "small" \| "xsmall"` | - | Select size |
| `variant` | `"default" \| "compact" \| "compactForInput" \| "inline"` | - | Style variant |
| `disabled` | `boolean` | `false` | Disables the select |

---

### FormCheckbox

Checkbox with optional label and description.

```tsx
import { FormCheckbox } from "@/components/form";

<FormCheckbox
  control={form.control}
  name="agreeToTerms"
  label="I agree to the Terms of Service"
  description="You must agree to continue"
  disabled={false}
  className="mt-2"
  labelClassName="text-paragraph-sm"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control |
| `name` | `FieldPath<TFieldValues>` | required | Field name (boolean in schema) |
| `label` | `string` | - | Label text next to checkbox |
| `description` | `string` | - | Description text under label |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `className` | `string` | - | Wrapper class |
| `labelClassName` | `string` | - | Label class |

---

### FormDateInput

Date picker with calendar popover.

```tsx
import { FormDateInput } from "@/components/form";

<FormDateInput
  control={form.control}
  name="startDate"
  label="Start Date"
  required
  placeholder="Select date..."
  dateFormat="PPP"             // date-fns format string (default: "PPP" = long date)
  size="medium"
  disabled={false}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<TFieldValues>` | required | Form control |
| `name` | `FieldPath<TFieldValues>` | required | Field name (Date in schema) |
| `label` | `string` | - | Label text |
| `required` | `boolean` | `false` | Shows asterisk |
| `placeholder` | `string` | `"Select date..."` | Placeholder text |
| `dateFormat` | `string` | `"PPP"` | date-fns format string |
| `size` | `"medium" \| "small" \| "xsmall"` | - | Input size |
| `disabled` | `boolean` | `false` | Disables the picker |

---

### FormImageUpload

Image upload with drag-and-drop, preview, and Vercel Blob integration.

```tsx
import { FormImageUpload } from "@/components/form";

<FormImageUpload
  control={form.control}
  name="coverImage"
  label="Cover Image"
  required
  uploadPath="/api/upload"
  uploadPrefix="projects/covers"
  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
  maxSize={5 * 1024 * 1024}            // 5MB
  previewAspectRatio="wide"            // "square" | "wide" | "tall" | "auto"
  onUploadSuccess={async (url) => { /* handle success */ }}
  onRemoveSuccess={async (url) => { /* handle removal */ }}
/>
```

See `form-file-upload.md` for full details.

---

### FormFileUpload

Generic file upload with drag-and-drop and Vercel Blob integration.

```tsx
import { FormFileUpload } from "@/components/form";

<FormFileUpload
  control={form.control}
  name="attachment"
  label="Attachment"
  uploadPath="/api/upload"
  uploadPrefix="documents"
  acceptedTypes={["application/pdf", "image/*"]}
  maxSize={10 * 1024 * 1024}           // 10MB
  onUploadSuccess={async (url) => { /* handle success */ }}
  onRemoveSuccess={async (url) => { /* handle removal */ }}
/>
```

See `form-file-upload.md` for full details.

---

### FormRichTextEditor

Rich text editor powered by Tiptap.

```tsx
import { FormRichTextEditor } from "@/components/form";

<FormRichTextEditor
  control={form.control}
  name="content"
  label="Content"
  required
  placeholder="Write your content..."
  description="Supports bold, italic, underline, links, and lists"
/>
```

See `form-rich-text.md` for full details.

## Usage Pattern

All form wrapper components follow the same pattern:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
} from "@/components/form";
import { mySchema } from "@/validators/my-feature";

type FormValues = z.infer<typeof mySchema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      // Provide defaults matching schema types
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput control={form.control} name="fieldName" label="Field" />
      {/* More fields... */}
    </form>
  );
}
```

## Critical Rules

1. **Always pass `control={form.control}`** -- this connects the component to React Hook Form
2. **The `name` prop must match a key in your Zod schema** -- TypeScript will enforce this
3. **Error display is automatic** -- FormField renders `FormMessage` when there is a field error
4. **Never create custom wrappers** for these components -- use them as-is
5. **Import from `@/components/form`** not from the individual files
6. **Never modify files in `/components/form/` or `/components/ui/`** -- they are shared infrastructure
