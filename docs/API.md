# TranslaMate API Documentation

This document describes how TranslaMate uses OpenAI-compatible APIs for translation.

## Overview

TranslaMate uses any OpenAI-compatible API to perform translations. The default configuration is set up for DeepSeek API, but you can use any provider that follows the OpenAI API format.

## Configuration

The application requires the following configuration:

```typescript
interface TranslationConfig {
  apiKey: string;        // Your API key
  baseURL: string;       // API base URL
  model: string;         // Model identifier
  maxTokens: number;     // Maximum tokens in response
  temperature: number;   // Sampling temperature
}
```

## Default Configuration

- **Base URL**: `https://api.deepseek.com`
- **Model**: `deepseek-chat`
- **Max Tokens**: `512`
- **Temperature**: `0.7`

## Supported API Providers

### DeepSeek (Default)

```typescript
{
  baseURL: "https://api.deepseek.com",
  model: "deepseek-chat"  // or "deepseek-reasoner"
}
```

### OpenAI

```typescript
{
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4"  // or "gpt-3.5-turbo", etc.
}
```

### Other Providers

Any provider with an OpenAI-compatible API can be used by configuring the appropriate `baseURL` and `model`.

## Translation Request Format

The application sends requests in the following format:

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional translator..."
    },
    {
      "role": "user",
      "content": "Translate the following text to Chinese:\n\nHello, world!"
    }
  ],
  "max_tokens": 512,
  "temperature": 0.7,
  "stream": false
}
```

## Getting API Keys

### DeepSeek

1. Visit [https://platform.deepseek.com](https://platform.deepseek.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key

### OpenAI

1. Visit [https://platform.openai.com](https://platform.openai.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key

## Security

- API keys are stored locally using `electron-store`
- Keys are never sent to any server except the configured API endpoint
- No telemetry or data collection

## Rate Limits

Be aware of your API provider's rate limits:
- DeepSeek: Refer to their official documentation
- OpenAI: Check your plan's limits

The application does not implement rate limiting - it's up to the user to manage their usage responsibly.
