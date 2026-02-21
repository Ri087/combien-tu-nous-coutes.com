# Skill: File Uploads in Forms

## When to Use

Use this skill whenever a form needs image or file upload functionality. This covers profile pictures, cover images, document attachments, and any file that needs to be stored via Vercel Blob.

## Prerequisites

- Vercel Blob is configured (`@vercel/blob` package installed)
- An upload API route exists (e.g., `/api/upload`) -- see `.claude/skills/vercel-blob.md` if needed
- `FormImageUpload` and `FormFileUpload` components are available in `/components/form/`
- The Zod schema field for uploads should be `z.string()` (stores the uploaded URL)

## Components Overview

### FormImageUpload

For image files with visual preview. Features:
- Drag-and-drop upload zone
- Image preview with aspect ratio control
- Remove button with loading state
- File type and size validation
- Vercel Blob integration

### FormFileUpload

For any file type with file info display. Features:
- Drag-and-drop upload zone
- File name and status display
- Remove button with loading state
- File type and size validation
- Vercel Blob integration

## Step-by-Step Instructions

### Step 1: Define the Zod Schema

The upload field stores a URL string:

```typescript
// validators/projects.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  coverImage: z.string().min(1, "Cover image is required"), // Required image
  logo: z.string().optional(),                               // Optional image
  attachment: z.string().optional(),                          // Optional file
});
```

### Step 2: Use FormImageUpload

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FormImageUpload, FormInput } from "@/components/form";
import * as FancyButton from "@/components/ui/fancy-button";
import { createProjectSchema } from "@/validators/projects";

type FormValues = z.infer<typeof createProjectSchema>;

export function CreateProjectForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      coverImage: "",
      logo: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput
        control={form.control}
        label="Project Name"
        name="name"
        required
      />

      <FormImageUpload
        control={form.control}
        name="coverImage"
        label="Cover Image"
        required
        uploadPath="/api/upload"
        uploadPrefix="projects/covers"
        acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
        maxSize={5 * 1024 * 1024}
        previewAspectRatio="wide"
      />

      <FormImageUpload
        control={form.control}
        name="logo"
        label="Logo"
        uploadPath="/api/upload"
        uploadPrefix="projects/logos"
        previewAspectRatio="square"
        maxSize={2 * 1024 * 1024}
        description="Square image recommended"
      />

      <FancyButton.Root size="medium" variant="primary">
        Create
      </FancyButton.Root>
    </form>
  );
}
```

### Step 3: FormImageUpload Props Reference

```tsx
<FormImageUpload
  // Required React Hook Form props
  control={form.control}
  name="coverImage"

  // Label and validation display
  label="Cover Image"
  required={true}
  description="Tooltip text for additional info"

  // Upload configuration (REQUIRED)
  uploadPath="/api/upload"          // Your Vercel Blob upload API route

  // Upload customization (optional)
  uploadPrefix="projects/covers"    // Folder prefix in blob storage (default: "uploads")
  acceptedTypes={[                  // MIME types (default: ["image/jpeg", "image/png", "image/webp"])
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]}
  maxSize={5 * 1024 * 1024}         // Max file size in bytes (default: 5MB)

  // Preview customization
  previewAspectRatio="wide"         // "square" | "wide" | "tall" | "auto" (default: "wide")
  placeholder="Choose an image or drag & drop it here"

  // Callbacks
  onUploadSuccess={async (url) => {
    // Called after successful upload with the blob URL
    // If provided, the default success toast is suppressed
    console.log("Uploaded:", url);
  }}
  onRemoveSuccess={async (url) => {
    // Called when user removes the image
    // Use this to delete from blob storage
    // If provided, the default success toast is suppressed
    await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
    });
  }}
  onUploadStart={() => {
    // Called when upload begins (optional)
  }}
  onRemoveStart={() => {
    // Called when removal begins (optional)
  }}
/>
```

**Aspect ratio options:**
- `"square"` -- `aspect-square` (1:1)
- `"wide"` -- `aspect-[16/9]` (16:9, default)
- `"tall"` -- `aspect-[4/5]` (4:5)
- `"auto"` -- `max-h-96 min-h-64` (natural aspect ratio)

### Step 4: Use FormFileUpload

For generic file uploads (PDFs, documents, spreadsheets, etc.):

```tsx
import { FormFileUpload } from "@/components/form";

<FormFileUpload
  control={form.control}
  name="attachment"
  label="Attachment"
  required
  uploadPath="/api/upload"
  uploadPrefix="documents"
  acceptedTypes={["application/pdf", "image/*", "text/csv"]}
  maxSize={10 * 1024 * 1024}
  placeholder="Choose a file or drag & drop it here"
  onUploadSuccess={async (url) => {
    console.log("File uploaded:", url);
  }}
  onRemoveSuccess={async (url) => {
    await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
    });
  }}
/>
```

### Step 5: FormFileUpload Props Reference

```tsx
<FormFileUpload
  // Required React Hook Form props
  control={form.control}
  name="attachment"

  // Label and validation display
  label="Attachment"
  required={true}
  description="Additional description"

  // Upload configuration (REQUIRED)
  uploadPath="/api/upload"

  // Upload customization (optional)
  uploadPrefix="documents"          // Folder prefix (default: "uploads")
  acceptedTypes={["*/*"]}           // MIME types (default: ["*/*"] = all types)
  maxSize={10 * 1024 * 1024}        // Max size in bytes (default: 10MB)

  // Placeholder
  placeholder="Choose a file or drag & drop it here"

  // Callbacks (same as FormImageUpload)
  onUploadSuccess={async (url) => { ... }}
  onRemoveSuccess={async (url) => { ... }}
  onUploadStart={() => { ... }}
  onRemoveStart={() => { ... }}
/>
```

### Step 6: Upload with Side Effects

When you need to update a database record when an image is uploaded or removed:

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/client";

export function ProfileImageForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const updateAvatar = useMutation({
    mutationFn: (url: string) =>
      orpc.users.updateAvatar({ userId, avatarUrl: url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  const removeAvatar = useMutation({
    mutationFn: (url: string) =>
      orpc.users.removeAvatar({ userId, previousUrl: url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  return (
    <FormImageUpload
      control={form.control}
      name="avatar"
      label="Profile Picture"
      uploadPath="/api/upload"
      uploadPrefix={`users/${userId}/avatar`}
      previewAspectRatio="square"
      maxSize={2 * 1024 * 1024}
      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
      onUploadSuccess={async (url) => {
        await updateAvatar.mutateAsync(url);
        toast.success("Profile picture updated");
      }}
      onRemoveSuccess={async (url) => {
        await removeAvatar.mutateAsync(url);
        toast.success("Profile picture removed");
      }}
    />
  );
}
```

## How the Upload Works Internally

1. User selects or drops a file
2. Client-side validation runs (file size + MIME type)
3. If invalid, a `toast.error()` is shown and upload is aborted
4. `setIsUploading(true)` -- the upload zone shows a loading spinner
5. A unique filename is generated: `{uploadPrefix}/{ulid()}.{extension}`
6. The file is uploaded to Vercel Blob via `upload(filename, file, { access: "public", handleUploadUrl: uploadPath })`
7. The returned URL is set as the field value via `field.onChange(url)`
8. `onUploadSuccess` callback is called if provided
9. `setIsUploading(false)` -- the preview replaces the upload zone

## Common Accepted Types

```typescript
// Images only
["image/jpeg", "image/png", "image/webp"]

// Images including GIF
["image/jpeg", "image/png", "image/webp", "image/gif"]

// Documents
["application/pdf"]

// Spreadsheets
["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

// All image types (wildcard)
["image/*"]

// All file types
["*/*"]
```

## Critical Rules

1. **Always provide `uploadPath`** -- this is the API route that handles the Vercel Blob upload
2. **The schema field must be `z.string()`** -- the component stores the uploaded URL as a string
3. **Default value for upload fields should be `""`** -- empty string, not `undefined`
4. **Handle `onRemoveSuccess` for cleanup** -- delete the blob from storage when the user removes it
5. **If you provide `onUploadSuccess` or `onRemoveSuccess`** -- the default toast is suppressed; show your own
6. **File validation happens client-side** -- server-side validation on the upload route is also recommended
7. **Never modify the upload components** -- they are in `/components/form/`, not feature-specific code
8. **The upload route must exist** -- if it does not, read `.claude/skills/vercel-blob.md` to create one
