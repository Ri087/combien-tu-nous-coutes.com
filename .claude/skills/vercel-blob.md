# Vercel Blob - File Uploads

## When to use
- User file uploads (images, documents, avatars)
- Static asset storage
- Any file storage need in the project

## Setup (2 minutes)

### 1. Create Blob Store on Vercel

1. Go to your Vercel project dashboard
2. Storage → Create Database → Blob
3. Name it (e.g., `{project-name}-blob`)
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 2. Add Environment Variable

```bash
# Add to Vercel
vercel env add BLOB_READ_WRITE_TOKEN production preview development

# Add to .env.local for dev
echo 'BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxx"' >> .env.local
```

### 3. env.ts is already configured

The `BLOB_READ_WRITE_TOKEN` is already defined as optional in `env.ts`.

## Usage

### Basic Upload

```typescript
import { put, del, list } from '@vercel/blob';

// Upload a file
export async function uploadFile(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  });

  return blob.url;
  // → "https://xxxxx.public.blob.vercel-storage.com/filename.png"
}
```

## Docs

https://vercel.com/docs/storage/vercel-blob
