# AI SDK (Vercel AI)

## When to use
- Chat interfaces
- Text generation
- AI-powered features

## Setup

The package is already installed. Just need an API key for your provider:
```bash
# OpenAI
OPENAI_API_KEY="sk-xxxxx"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

Add the key to env.ts as optional:
```typescript
OPENAI_API_KEY: z.string().optional(),
```

## Usage
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello!',
});
```

## Docs
https://sdk.vercel.ai/docs
