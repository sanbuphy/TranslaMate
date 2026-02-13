# TranslaMate Translation Agent Management

## Overview

TranslaMate uses OpenAI-compatible APIs for translation, supporting multiple AI providers. This document details the translation mechanism, configuration methods, and provider management.

---

## 1. Translation Architecture

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────┐
│                    CLI Layer                         │
│  translamate translate <text> --to <language>       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                 Config Layer (Config)                │
│  • API Key                                          │
│  • Base URL                                         │
│  • Model Name                                       │
│  • Temperature, Max Tokens                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Translation Engine (Engine)             │
│  • Prompt Engineering                               │
│  • Request Building                                 │
│  • Response Parsing                                 │
│  • Error Handling                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           OpenAI Compatible SDK                      │
│  Standardized interface for all providers            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              AI Provider API                         │
│  • DeepSeek (Recommended)                            │
│  • OpenAI                                            │
│  • SiliconFlow                                       │
│  • Local Ollama                                      │
└─────────────────────────────────────────────────────┘
```

### 1.2 Translation Flow

```typescript
// 1. User input
CLI: translamate translate "Hello" --to zh-CN

// 2. Config loading
Config: {
  apiKey: "sk-xxx",
  baseURL: "https://api.deepseek.com",
  model: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 512
}

// 3. Build request
Request: {
  text: "Hello",
  sourceLanguage: "auto",
  targetLanguage: "zh-CN"
}

// 4. Prompt engineering
System: "You are a professional translator..."
User: "Translate the following text to zh-CN: Hello"

// 5. API call
Response: "你好"

// 6. Return result
Output: "你好"
```

---

## 2. Configuration Management

### 2.1 Configuration Priority (High to Low)

```
1. CLI command line arguments (Highest priority)
   ↓
2. Environment variables
   ↓
3. Project directory config file (./translamate.json)
   ↓
4. User directory config file (~/.translamate.json)
   ↓
5. Default values (Lowest priority)
```

### 2.2 Configuration Methods

#### Method 1: Environment Variables (Recommended for CI/CD)

```bash
export TRANSLAMATE_API_KEY="sk-your-api-key"
export TRANSLAMATE_BASE_URL="https://api.deepseek.com"
export TRANSLAMATE_MODEL="deepseek-chat"
export TRANSLAMATE_MAX_TOKENS="512"
export TRANSLAMATE_TEMPERATURE="0.7"
```

#### Method 2: Config File (Recommended for Development)

Create `translamate.json`:

```json
{
  "apiKey": "sk-your-api-key",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

#### Method 3: CLI Arguments (Temporary Override)

```bash
translamate translate "Hello" \
  --to zh-CN \
  --model deepseek-reasoner \
  --temperature 0.3
```

#### Method 4: Config Command

```bash
# Set API Key
translamate config --set apiKey=sk-xxx

# Set model
translamate config --set model=deepseek-chat

# Set Base URL
translamate config --set baseURL=https://api.deepseek.com

# List config
translamate config --list
```

---

## 3. Supported AI Providers

### 3.1 DeepSeek (Recommended)

**Features:**
- Lowest cost (~¥1/1M tokens)
- Excellent Chinese support
- Fast response
- Ideal for large-scale translation

**Configuration:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
```

**Available Models:**
- `deepseek-chat` - General conversational model (recommended)
- `deepseek-reasoner` - Reasoning specialized model (more accurate but slower)

### 3.2 OpenAI

**Features:**
- Quality benchmark
- Best multilingual support
- Higher cost

**Configuration:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.openai.com/v1",
  "model": "gpt-4"
}
```

**Available Models:**
- `gpt-4` - Highest quality
- `gpt-3.5-turbo` - Fast and economical

### 3.3 SiliconFlow

**Features:**
- Competitive pricing
- Various open-source models

**Configuration:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.siliconflow.cn",
  "model": "Qwen/Qwen2.5-7B-Instruct"
}
```

### 3.4 Local Ollama (Free)

**Features:**
- Completely free
- Data privacy
- Requires GPU

**Configuration:**
```json
{
  "apiKey": "not-needed",
  "baseURL": "http://localhost:11434/v1",
  "model": "llama3.2"
}
```

**Prerequisites:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.2
```

---

## 4. Prompt Engineering

### Current System Prompt

```typescript
const systemPrompt = `You are a professional translator. Your task is to translate text accurately while maintaining the original meaning, tone, and style.

Rules:
- Only provide the translated text without any explanations or additional content
- Preserve formatting, line breaks, and special characters
- Handle technical terms appropriately
- If the source language is the same as the target language, return the original text
- Do NOT add any quotes, prefixes, or explanations`;
```

### Custom Prompt (Advanced Usage)

To customize the prompt, modify `src/core/translation/engine.ts`:

```typescript
const systemPrompt = `You are a professional translator.
Task: Translate text to ${targetLanguage}
Requirements:
- Maintain original tone and style
- Accurate technical terminology
- Preserve formatting and line breaks
- Return only translation, no explanations`;
```

---

## 5. Parameter Tuning

### Temperature

Controls translation creativity and consistency.

```bash
# 0.0 - Completely deterministic (for technical docs)
translamate translate "API endpoint" --to zh-CN --temperature 0.0

# 0.7 - Balanced (recommended default)
translamate translate "Hello" --to zh-CN --temperature 0.7

# 1.0 - More creative (for literary content)
translamate translate "Poem" --to zh-CN --temperature 1.0
```

**Recommended Values:**
- Technical documentation: `0.0 - 0.3`
- Daily conversation: `0.5 - 0.7`
- Literary content: `0.8 - 1.0`

### Max Tokens

Controls maximum translation length.

```bash
# Short text (default 512)
translamate translate "Hi" --to zh-CN --maxTokens 128

# Long document
translamate translate "Long article..." --to zh-CN --maxTokens 2048
```

**Recommended Values:**
- Short sentences/paragraphs: `128 - 512`
- Full page documents: `1024 - 2048`
- Long documents: `4096+`

### Model Selection

```bash
# Fast translation (large batches)
translamate translate "Text" --to zh-CN --model deepseek-chat

# Precise translation (important content)
translamate translate "Text" --to zh-CN --model deepseek-reasoner
```

---

## 6. Language Detection

### Auto Detection

TranslaMate uses regex patterns for automatic language detection:

```typescript
// Chinese
/[\u4e00-\u9fa5]/

// Japanese
/[\u3040-\u309f\u30a0-\u30ff]/

// Korean
/[\uac00-\ud7af]/

// Russian
/[\u0400-\u04FF]/

// Arabic
/[\u0600-\u06FF]/

// Default: English
```

### Manual Source Language

```bash
# Explicitly specify source language (more accurate)
translamate translate "Bonjour" --from fr --to en
```

---

## 7. Batch Translation Optimization

### Batch Translation Command

```bash
# Translate entire directory
translamate batch ./docs \
  --to zh-CN \
  --output ./docs-zh \
  --exclude "node_modules,.git,dist"
```

### Performance Optimization Tips

1. **Use fast model**
   ```json
   {
     "model": "deepseek-chat"  // 3-5x faster than deepseek-reasoner
   }
   ```

2. **Adjust maxTokens**
   ```json
   {
     "maxTokens": 1024  // Set based on actual needs
   }
   ```

3. **Lower temperature**
   ```json
   {
     "temperature": 0.3  // More stable, fewer retries
   }
   ```

4. **Parallel processing**
   - CLI parallelizes multiple files by default
   - Ensure sufficient network bandwidth

---

## 8. Error Handling

### Common Errors and Solutions

#### 1. API Key Error
```
Error: API Key is required
```
**Solution:** Set correct API Key
```bash
export TRANSLAMATE_API_KEY="sk-xxx"
```

#### 2. API Request Failed
```
Error: API Error: 401 Unauthorized
```
**Solution:** Check if API Key is valid

#### 3. Network Timeout
```
Error: API Error: Request timeout
```
**Solution:**
- Check network connection
- If using local Ollama, ensure service is running
- Consider increasing timeout

#### 4. Token Limit Exceeded
```
Error: This model's maximum context length is XXX tokens
```
**Solution:** Reduce maxTokens or translate in segments

---

## 9. Testing and Validation

### Run Tests

```bash
# Unit tests
npm test

# Translation tests
./test-translations.sh

# File translation test
translamate translate test-en.md --to zh-CN --output test-zh.md
```

### Validate Translation Quality

1. **Check format preservation**
   - Markdown formatting
   - Header hierarchy
   - List structures

2. **Check terminology consistency**
   - Technical terms
   - Proper nouns
   - Brand names

3. **Check language naturalness**
   - Grammar correctness
   - Natural expression
   - Cultural appropriateness

---

## 10. Best Practices

### 1. Configuration Management

```bash
# Development (use local file)
translamate config --set apiKey=dev-key

# Production (use environment variables)
export TRANSLAMATE_API_KEY=$PROD_KEY

# CI/CD (use environment variables)
ci:
  env:
    TRANSLAMATE_API_KEY: ${{ secrets.API_KEY }}
```

### 2. Large Document Translation

```bash
# 1. Test with small file first
translamate translate chapter1.md --to zh-CN --output chapter1-zh.md

# 2. Batch translate after confirming quality
translamate batch ./book --to zh-CN --output ./book-zh

# 3. Verify output
ls -la ./book-zh/
```

### 3. Cost Optimization

- **DeepSeek:** Most economical, ideal for large batches
- **Ollama:** Completely free, ideal for privacy needs
- **OpenAI:** Highest quality, ideal for critical content

### 4. Quality Assurance

```bash
# Use reasoning model for final review
translamate translate "Draft text" \
  --to zh-CN \
  --model deepseek-reasoner \
  --temperature 0.3
```

---

## 11. Troubleshooting Checklist

- [ ] Is API Key set correctly?
- [ ] Is Base URL correct?
- [ ] Is network connection normal?
- [ ] Is model name correct?
- [ ] Is input text too long?
- [ ] Is target language code correct?
- [ ] Is config file format correct?

---

## 12. Related Documentation

- [CLI Documentation](./cli.md)
- [API Configuration](./api.md)
- [Architecture](./architecture.md)
- [Quick Start](./quickstart.md)

---

## Changelog

- **2026-02-02:** Initial version with complete translation agent management
- Supports DeepSeek, OpenAI, SiliconFlow, Ollama
- All translation tests passed (100% pass rate)