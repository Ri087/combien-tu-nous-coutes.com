# AI SDK v6 (Vercel AI) + Vercel AI Gateway

## When to use
- Chat interfaces
- Text generation
- Streaming responses
- AI-powered features

## Setup

### 1. The package is already installed

`ai` v6 is already in package.json. No separate provider package is needed — the Vercel AI Gateway is built into the `ai` package.

### 2. Configure the Vercel AI Gateway

**IMPORTANT: Always use the Vercel AI Gateway** to access AI models. Do NOT install individual provider packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.) — the gateway handles all providers through a single unified interface.

#### Environment variable

```bash
# Add your AI Gateway API key
vercel env add AI_GATEWAY_API_KEY production preview development
```

On Vercel deployments, OIDC authentication is handled automatically. For local dev, use `vercel env pull` to get tokens.

#### BYOK (Bring Your Own Key)

Add your provider API keys in your Vercel team's AI Gateway settings (dashboard). Once configured, the gateway automatically uses your credentials with no code changes.

### 3. Usage

#### Simple model string (recommended)

```typescript
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Explain quantum computing.',
});
```

#### Explicit gateway provider

```typescript
import { generateText, gateway } from 'ai';

const { text } = await generateText({
  model: gateway('anthropic/claude-sonnet-4-5'),
  prompt: 'Explain quantum computing.',
});
```

#### Custom gateway configuration

```typescript
import { createGateway } from 'ai';

const gw = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
});

const { text } = await generateText({
  model: gw('openai/gpt-5'),
  prompt: 'Hello world',
});
```

### Streaming Chat (API Route)

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
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

### Available models (via gateway)

Use the `provider/model` format:

- `anthropic/claude-sonnet-4-5` — Claude Sonnet 4.5
- `anthropic/claude-haiku-3-5` — Claude Haiku 3.5
- `openai/gpt-5` — GPT-5
- `openai/gpt-5-mini` — GPT-5 Mini
- `google/gemini-2.5-pro` — Gemini 2.5 Pro
- `xai/grok-3` — Grok 3
- `deepseek/deepseek-r1` — DeepSeek R1

Full list: https://vercel.com/docs/ai-gateway/models-and-providers

## v6 Migration notes (from v5)

- Replace `convertToCoreMessages` with `convertToModelMessages` (now async)
- `generateObject`/`streamObject` are deprecated — use `generateText`/`streamText` with `output` setting
- Run `npx @ai-sdk/codemod v6` to auto-migrate

## Docs

- AI SDK: https://ai-sdk.dev/docs
- AI Gateway: https://vercel.com/docs/ai-gateway
- AI Gateway Provider: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
