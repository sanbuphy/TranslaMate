# TranslaMate 翻译 Agent 管理文档

## 概述

TranslaMate 使用 OpenAI 兼容的 API 进行翻译，支持多种 AI 提供商。本文档详细说明翻译机制、配置方法和提供商管理。

---

## 一、翻译架构

### 1. 核心组件

```
┌─────────────────────────────────────────────────────┐
│                    CLI 层                            │
│  translamate translate <text> --to <language>       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                 配置层 (Config)                       │
│  • API Key                                          │
│  • Base URL                                         │
│  • Model 名称                                       │
│  • 温度、最大令牌数                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              翻译引擎 (Engine)                        │
│  • 提示词工程 (Prompt Engineering)                   │
│  • 请求构建                                          │
│  • 响应解析                                          │
│  • 错误处理                                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           OpenAI 兼容 SDK                            │
│  标准化接口，统一所有提供商                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              AI 提供商 API                           │
│  • DeepSeek (推荐)                                   │
│  • OpenAI                                            │
│  • SiliconFlow                                       │
│  • 本地 Ollama                                       │
└─────────────────────────────────────────────────────┘
```

### 2. 翻译流程

```typescript
// 1. 用户输入
CLI: translamate translate "Hello" --to zh-CN

// 2. 配置加载
Config: {
  apiKey: "sk-xxx",
  baseURL: "https://api.deepseek.com",
  model: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 512
}

// 3. 构建请求
Request: {
  text: "Hello",
  sourceLanguage: "auto",
  targetLanguage: "zh-CN"
}

// 4. 提示词工程
System: "You are a professional translator..."
User: "Translate the following text to zh-CN: Hello"

// 5. API 调用
Response: "你好"

// 6. 返回结果
Output: "你好"
```

---

## 二、配置管理

### 1. 配置优先级（从高到低）

```
1. CLI 命令行参数（最高优先级）
   ↓
2. 环境变量
   ↓
3. 项目目录配置文件 (./translamate.json)
   ↓
4. 用户目录配置文件 (~/.translamate.json)
   ↓
5. 默认值（最低优先级）
```

### 2. 配置方法

#### 方法 1: 环境变量（推荐用于 CI/CD）

```bash
export TRANSLAMATE_API_KEY="sk-your-api-key"
export TRANSLAMATE_BASE_URL="https://api.deepseek.com"
export TRANSLAMATE_MODEL="deepseek-chat"
export TRANSLAMATE_MAX_TOKENS="512"
export TRANSLAMATE_TEMPERATURE="0.7"
```

#### 方法 2: 配置文件（推荐用于开发）

创建 `translamate.json`:

```json
{
  "apiKey": "sk-your-api-key",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

#### 方法 3: CLI 命令（临时覆盖）

```bash
translamate translate "Hello" \
  --to zh-CN \
  --model deepseek-reasoner \
  --temperature 0.3
```

#### 方法 4: 命令设置配置

```bash
# 设置 API Key
translamate config --set apiKey=sk-xxx

# 设置模型
translamate config --set model=deepseek-chat

# 设置 Base URL
translamate config --set baseURL=https://api.deepseek.com

# 查看配置
translamate config --list
```

---

## 三、支持的 AI 提供商

### 1. DeepSeek（推荐）

**特点:**
- 价格最低 (~¥1/1M tokens)
- 中文支持优秀
- 响应速度快
- 适合大批量翻译

**配置:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
```

**可用模型:**
- `deepseek-chat` - 通用对话模型（推荐）
- `deepseek-reasoner` - 推理专用模型（更准确但更慢）

### 2. OpenAI

**特点:**
- 质量标杆
- 多语言支持最好
- 价格较高

**配置:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.openai.com/v1",
  "model": "gpt-4"
}
```

**可用模型:**
- `gpt-4` - 最高质量
- `gpt-3.5-turbo` - 快速经济

### 3. SiliconFlow

**特点:**
- 竞争力价格
- 多种开源模型

**配置:**
```json
{
  "apiKey": "sk-xxx",
  "baseURL": "https://api.siliconflow.cn",
  "model": "Qwen/Qwen2.5-7B-Instruct"
}
```

### 4. 本地 Ollama（免费）

**特点:**
- 完全免费
- 数据隐私
- 需要 GPU

**配置:**
```json
{
  "apiKey": "not-needed",
  "baseURL": "http://localhost:11434/v1",
  "model": "llama3.2"
}
```

**前置要求:**
```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取模型
ollama pull llama3.2
```

---

## 四、提示词工程

### 当前系统提示词

```typescript
const systemPrompt = `You are a professional translator. Your task is to translate text accurately while maintaining the original meaning, tone, and style.

Rules:
- Only provide the translated text without any explanations or additional content
- Preserve formatting, line breaks, and special characters
- Handle technical terms appropriately
- If the source language is the same as the target language, return the original text
- Do NOT add any quotes, prefixes, or explanations`;
```

### 自定义提示词（高级用法）

如需自定义提示词，可以修改 `src/core/translation/engine.ts`:

```typescript
const systemPrompt = `你是一个专业翻译员。
任务：将文本翻译成${targetLanguage}
要求：
- 保持原文的语气和风格
- 技术术语准确翻译
- 保留格式和换行
- 只返回翻译结果，不要解释`;
```

---

## 五、参数调优

### Temperature（温度）

控制翻译的创造性和一致性。

```bash
# 0.0 - 完全确定性（适合技术文档）
translamate translate "API endpoint" --to zh-CN --temperature 0.0

# 0.7 - 平衡（推荐默认值）
translamate translate "Hello" --to zh-CN --temperature 0.7

# 1.0 - 更创造性（适合文学作品）
translamate translate "Poem" --to zh-CN --temperature 1.0
```

**建议值:**
- 技术文档: `0.0 - 0.3`
- 日常对话: `0.5 - 0.7`
- 文学创作: `0.8 - 1.0`

### Max Tokens（最大令牌数）

控制翻译的最大长度。

```bash
# 短文本（默认 512）
translamate translate "Hi" --to zh-CN --maxTokens 128

# 长文档
translamate translate "Long article..." --to zh-CN --maxTokens 2048
```

**建议值:**
- 短句/段落: `128 - 512`
- 整页文档: `1024 - 2048`
- 长文档: `4096+`

### Model Selection（模型选择）

```bash
# 快速翻译（大批量）
translamate translate "Text" --to zh-CN --model deepseek-chat

# 精确翻译（重要内容）
translamate translate "Text" --to zh-CN --model deepseek-reasoner
```

---

## 六、语言检测

### 自动检测

TranslaMate 使用正则表达式自动检测语言：

```typescript
// 中文
/[\u4e00-\u9fa5]/

// 日语
/[\u3040-\u309f\u30a0-\u30ff]/

// 韩语
/[\uac00-\ud7af]/

// 俄语
/[\u0400-\u04FF]/

// 阿拉伯语
/[\u0600-\u06FF]/

// 默认：英语
```

### 手动指定源语言

```bash
# 明确指定源语言（更准确）
translamate translate "Bonjour" --from fr --to en
```

---

## 七、批量翻译优化

### 批量翻译命令

```bash
# 翻译整个目录
translamate batch ./docs \
  --to zh-CN \
  --output ./docs-zh \
  --exclude "node_modules,.git,dist"
```

### 性能优化建议

1. **使用快速模型**
   ```json
   {
     "model": "deepseek-chat"  // 比 deepseek-reasoner 快 3-5 倍
   }
   ```

2. **调整 maxTokens**
   ```json
   {
     "maxTokens": 1024  // 根据实际需求设置
   }
   ```

3. **降低 temperature**
   ```json
   {
     "temperature": 0.3  // 更稳定，减少重试
   }
   ```

4. **并行处理**
   - CLI 默认会并行处理多个文件
   - 确保网络带宽充足

---

## 八、错误处理

### 常见错误及解决方案

#### 1. API Key 错误
```
Error: API Key is required
```
**解决:** 设置正确的 API Key
```bash
export TRANSLAMATE_API_KEY="sk-xxx"
```

#### 2. API 请求失败
```
Error: API Error: 401 Unauthorized
```
**解决:** 检查 API Key 是否有效

#### 3. 网络超时
```
Error: API Error: Request timeout
```
**解决:**
- 检查网络连接
- 如果使用本地 Ollama，确保服务运行
- 考虑增加超时时间

#### 4. 令牌超限
```
Error: This model's maximum context length is XXX tokens
```
**解决:** 减少 maxTokens 或分段翻译

---

## 九、测试和验证

### 运行测试

```bash
# 单元测试
npm test

# 翻译测试
./test-translations.sh

# 文件翻译测试
translamate translate test-en.md --to zh-CN --output test-zh.md
```

### 验证翻译质量

1. **检查格式保留**
   - Markdown 格式
   - 标题层级
   - 列表结构

2. **检查术语一致性**
   - 技术术语
   - 专有名词
   - 品牌名称

3. **检查语言自然度**
   - 语法正确
   - 表达自然
   - 文化适当

---

## 十、最佳实践

### 1. 配置管理

```bash
# 开发环境（使用本地文件）
translamate config --set apiKey=dev-key

# 生产环境（使用环境变量）
export TRANSLAMATE_API_KEY=$PROD_KEY

# CI/CD（使用环境变量）
ci:
  env:
    TRANSLAMATE_API_KEY: ${{ secrets.API_KEY }}
```

### 2. 大型文档翻译

```bash
# 1. 先测试小文件
translamate translate chapter1.md --to zh-CN --output chapter1-zh.md

# 2. 确认质量后批量翻译
translamate batch ./book --to zh-CN --output ./book-zh

# 3. 验证输出
ls -la ./book-zh/
```

### 3. 成本优化

- **DeepSeek:** 最经济，适合大批量
- **Ollama:** 完全免费，适合隐私需求
- **OpenAI:** 最高质量，适合重要内容

### 4. 质量保证

```bash
# 使用推理模型进行最终审校
translamate translate "Draft text" \
  --to zh-CN \
  --model deepseek-reasoner \
  --temperature 0.3
```

---

## 十一、故障排除清单

- [ ] API Key 是否正确设置？
- [ ] Base URL 是否正确？
- [ ] 网络连接是否正常？
- [ ] 模型名称是否正确？
- [ ] 输入文本是否过长？
- [ ] 目标语言代码是否正确？
- [ ] 配置文件格式是否正确？

---

## 十二、相关文档

- [CLI 使用文档](./cli.md)
- [API 配置文档](./api.md)
- [架构文档](./architecture.md)
- [快速开始](./quickstart.md)

---

## 更新日志

- **2026-02-02:** 初始版本，包含完整的翻译 Agent 管理文档
- 支持 DeepSeek, OpenAI, SiliconFlow, Ollama
- 完成所有翻译测试（通过率 100%）
