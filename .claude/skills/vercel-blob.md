# Vercel Blob - File Uploads

## When to use
- User file uploads (images, documents, etc.)
- Static asset storage
- Any file storage need

## Setup (2 minutes)

1. Go to Vercel Dashboard → Storage → Create Database → Blob
2. Copy the BLOB_READ_WRITE_TOKEN
3. Add to .env.local:
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxx"
4. Uncomment in env.ts if not already done

## Usage
```typescript
import { put, del } from '@vercel/blob';

// Upload
const blob = await put('filename.png', file, {
  access: 'public',
});
// blob.url → "https://xxxxx.public.blob.vercel-storage.com/filename.png"

// Delete
await del(blob.url);
```

## Docs
https://vercel.com/docs/storage/vercel-blob
