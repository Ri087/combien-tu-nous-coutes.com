# AI SDK (Vercel AI)

## When to use
- Chat interfaces
- Text generation
- Streaming responses
- AI-powered features

## Setup

### 1. The package is already installed

`ai` is already in package.json.

### 2. Add your provider's API key

```bash
# For OpenAI
vercel env add OPENAI_API_KEY production preview development

# For Anthropic  
vercel env add ANTHROPIC_API_KEY production preview development
```

### 3. Install provider package

```bash
pnpm add @ai-sdk/openai   # OpenAI
pnpm add @ai-sdk/anthropic # Anthropic
```

## Usage

### Basic Generation

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Explain quantum computing.',
});
```

### Streaming Chat (API Route)

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

### Chat UI Component

```tsx
'use client';
import { useChat } from '@ai-sdk/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}><strong>{m.role}:</strong> {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Docs

https://sdk.vercel.ai/docs
