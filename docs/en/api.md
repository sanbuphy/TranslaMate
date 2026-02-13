# API Configuration

TranslaMate provides an OpenAI-compatible API interface that allows you to use various translation providers including DeepSeek, OpenAI, SiliconFlow, and local Ollama instances.

## Base Configuration

The API endpoint is configured using the following environment variables or configuration file:

```bash
# Required
TRANSLATION_API_KEY=your_api_key
TRANSLATION_BASE_URL=https://api.deepseek.com/v1  # or your provider's endpoint
TRANSLATION_MODEL=deepseek-chat

# Optional
TRANSLATION_MAX_TOKENS=4000
TRANSLATION_TEMPERATURE=0.3
TRANSLATION_TIMEOUT=60000
```

## Supported Providers

### DeepSeek
- Base URL: `https://api.deepseek.com/v1`
- Recommended model: `deepseek-chat`
- Features: High-quality translation, good for technical content

### OpenAI
- Base URL: `https://api.openai.com/v1`
- Recommended model: `gpt-4` or `gpt-3.5-turbo`
- Features: Reliable, widely supported

### SiliconFlow (硅基流动)
- Base URL: Custom endpoint
- Features: Cost-effective, good performance

### Local Ollama
- Base URL: `http://localhost:11434/v1`
- Model: Any locally installed model (e.g., `llama2`, `mistral`)
- Features: No API costs, privacy-focused

## Translation Request Format

### REST API

```bash
curl -X POST "http://localhost:3000/api/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "targetLanguage": "zh-CN",
    "sourceLanguage": "en",
    "options": {
      "glossary": null,
      "preserveFormatting": true,
      "maxTokensPerChunk": 1000,
      "parallelChunks": 3
    }
  }'
```

### Programmatic API

```typescript
import { TranslationClient } from 'translamate';

const client = new TranslationClient({
  apiKey: process.env.TRANSLATION_API_KEY!,
  baseURL: process.env.TRANSLATION_BASE_URL!,
  model: process.env.TRANSLATION_MODEL!,
  maxTokens: parseInt(process.env.TRANSLATION_MAX_TOKENS || '4000'),
  temperature: parseFloat(process.env.TRANSLATION_TEMPERATURE || '0.3'),
  timeout: parseInt(process.env.TRANSLATION_TIMEOUT || '60000')
});

const result = await client.translate({
  text: 'Hello, world!',
  targetLanguage: 'zh-CN',
  sourceLanguage: 'en',
  options: {
    glossary: null,
    preserveFormatting: true,
    maxTokensPerChunk: 1000,
    parallelChunks: 3
  }
});

console.log(result.translatedText);
```

## Response Format

```json
{
  "translatedText": "你好，世界！",
  "sourceLanguage": "en",
  "targetLanguage": "zh-CN",
  "tokensUsed": 150,
  "processingTime": 1200,
  "model": "deepseek-chat"
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Invalid request (missing parameters, unsupported language)
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: Internal server error
- `502`: Provider error (upstream API failure)

Error response format:

```json
{
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "Failed to connect to translation provider",
    "details": null
  }
}
```

## Advanced Features

### Glossary Support

You can provide a glossary to enforce specific terminology:

```typescript
const glossary = {
  "API": "应用程序接口",
  "CLI": "命令行界面",
  "SDK": "软件开发工具包"
};

const result = await client.translate({
  text: 'Use the API via CLI or SDK',
  targetLanguage: 'zh-CN',
  glossary: glossary
});
// Result: "使用应用程序接口通过命令行界面或软件开发工具包"
```

### Chunked Translation

For long texts, the API automatically chunks and translates in parallel:

```typescript
const result = await client.translate({
  text: longDocument,  // Any length
  targetLanguage: 'zh-CN',
  options: {
    maxTokensPerChunk: 1000,  // Max tokens per chunk
    parallelChunks: 3,        // Number of parallel requests
    preserveContext: true     // Maintain context between chunks
  }
});
```

### Streaming Translation

For real-time translation, use streaming:

```typescript
const stream = await client.translateStream({
  text: longDocument,
  targetLanguage: 'zh-CN'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

## Configuration Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiKey` | string | Required | Your API key from the provider |
| `baseURL` | string | Required | Provider's API endpoint URL |
| `model` | string | Required | Model identifier to use |
| `maxTokens` | number | 4000 | Maximum tokens in response |
| `temperature` | number | 0.3 | Sampling temperature (0.0-1.0) |
| `timeout` | number | 60000 | Request timeout in milliseconds |
| `maxTokensPerChunk` | number | 1000 | Tokens per chunk for long texts |
| `parallelChunks` | number | 3 | Number of parallel chunk requests |
| `preserveFormatting` | boolean | true | Preserve original formatting |
| `preserveContext` | boolean | true | Maintain context between chunks |

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `TRANSLATION_API_KEY` | Yes | API key |
| `TRANSLATION_BASE_URL` | Yes | API endpoint URL |
| `TRANSLATION_MODEL` | Yes | Model name |
| `TRANSLATION_MAX_TOKENS` | No | Max tokens (default: 4000) |
| `TRANSLATION_TEMPERATURE` | No | Temperature (default: 0.3) |
| `TRANSLATION_TIMEOUT` | No | Timeout ms (default: 60000) |

## Provider-Specific Notes

### DeepSeek
- Best for: Technical documentation, code comments
- Rate limits: 10 requests/minute (free tier)
- Context window: 64K tokens

### OpenAI
- Best for: General translation, creative content
- Rate limits: Varies by plan
- Context window: 128K tokens (GPT-4)

### Ollama
- Best for: Offline translation, privacy-sensitive content
- Rate limits: None (self-hosted)
- Context window: Depends on model

## Troubleshooting

**Issue**: "Invalid API key"
- Check your `TRANSLATION_API_KEY` is set correctly
- Verify the key is active in your provider dashboard

**Issue**: "Rate limit exceeded"
- Reduce `parallelChunks` to 1 or 2
- Add retry logic with exponential backoff
- Consider upgrading your provider plan

**Issue**: "Context window exceeded"
- Reduce `maxTokensPerChunk`
- Split very long documents manually
- Use a model with larger context window

**Issue**: Poor translation quality
- Adjust `temperature` (lower for consistency, higher for creativity)
- Try a different model
- Provide a glossary for domain-specific terms