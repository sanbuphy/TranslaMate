# TranslaMate API 文档

本文档描述 TranslaMate 如何使用 OpenAI 兼容的 API 进行翻译。

## 概述

TranslaMate 使用任何 OpenAI 兼容的 API 进行翻译。默认配置为 DeepSeek API，但您可以使用任何遵循 OpenAI API 格式的提供商。

## 配置

应用程序需要以下配置：

```typescript
interface TranslationConfig {
  apiKey: string;        // 您的 API 密钥
  baseURL: string;       // API 基础 URL
  model: string;         // 模型标识符
  maxTokens: number;     // 响应最大 tokens 数
  temperature: number;   // 采样温度
}
```

## 默认配置

- **基础 URL**: `https://api.deepseek.com`
- **模型**: `deepseek-chat`
- **最大 Tokens**: `512`
- **温度**: `0.7`

## 支持的 API 提供商

### DeepSeek（默认）

```typescript
{
  baseURL: "https://api.deepseek.com",
  model: "deepseek-chat"  // 或 "deepseek-reasoner"
}
```

### OpenAI

```typescript
{
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4"  // 或 "gpt-3.5-turbo" 等
}
```

### 其他提供商

任何具有 OpenAI 兼容 API 的提供商都可以通过配置适当的 `baseURL` 和 `model` 来使用。

## 翻译请求格式

应用程序以以下格式发送请求：

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

## 获取 API 密钥

### DeepSeek

1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 创建账户或登录
3. 导航到 API Keys 部分
4. 创建新的 API 密钥

### OpenAI

1. 访问 [https://platform.openai.com](https://platform.openai.com)
2. 创建账户或登录
3. 导航到 API Keys 部分
4. 创建新的 API 密钥

## 安全性

- API 密钥使用 `electron-store` 本地存储
- 密钥永远不会发送到配置的 API 端点以外的任何服务器
- 无遥测或数据收集

## 速率限制

请注意您的 API 提供商的速率限制：
- DeepSeek: 参考其官方文档
- OpenAI: 查看您套餐的限制

应用程序不实现速率限制 - 由用户负责管理使用。