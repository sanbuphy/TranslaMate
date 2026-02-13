# TranslaMate 架构设计

## 概述

TranslaMate 采用现代化的分层架构设计，确保代码的可维护性、可扩展性和高性能。本文档详细介绍了系统的核心模块、数据流和设计决策。

## 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   CLI UI    │  │  Electron   │  │     REST API    │   │
│  │ (Commander) │  │  (React)    │  │   (Express)     │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TranslationOrchestrator                │  │
│  │  • 协调翻译流程                                       │  │
│  │  • 管理配置和状态                                    │  │
│  │  • 错误处理和重试                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Core Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Chunked      │  │   Batch     │  │   Context      │   │
│  │ Translation  │  │ Processor   │  │   Builder      │   │
│  │ Engine       │  │             │  │                │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Config    │  │   Logger    │  │     Cache       │   │
│  │  Manager    │  │   System    │  │   Manager       │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. ChunkedTranslationEngine

负责处理大文本的分块翻译，支持并行处理和上下文保持。

**主要功能：**
- 智能文本分块（基于 token 限制和语义边界）
- 并行翻译多个文本块
- 上下文重叠处理，确保翻译连贯性
- 进度回调支持

**关键实现：**

```typescript
import { ChunkedTranslationEngine } from '../core';

const engine = new ChunkedTranslationEngine(config);

const result = await engine.translateChunked({
  text: longText,
  targetLanguage: 'zh-CN',
  glossary: { 'open source': '开源' },
  maxTokensPerChunk: 1000,
  parallelChunks: 3,
  chunkOverlap: 100
}, (progress) => {
  console.log(`${progress.stage}: ${progress.message}`);
});
```

### 2. BatchProcessor

批量文件处理引擎，支持多种输入格式和并发控制。

**特性：**
- 支持目录递归扫描
- 多种文件格式（Markdown、JSON、YAML、纯文本）
- 并发任务管理
- 断点续传和错误恢复

**使用示例：**

```typescript
import { BatchProcessor } from '../core/batch';

const processor = new BatchProcessor({
  concurrency: 4,
  outputDir: './translations',
  preserveStructure: true
});

await processor.processDirectory('./docs', {
  targetLanguage: 'zh-CN',
  filePatterns: ['**/*.md', '**/*.json']
});
```

### 3. ContextBuilder

构建翻译上下文，处理术语表和风格一致性。

**功能：**
- 术语表管理和应用
- 文档级上下文提取
- 风格指南集成
- 翻译记忆库支持

### 4. TextSplitter

智能文本分割器，基于语义边界进行分块。

**分割策略：**
- 段落边界优先
- 句子边界次之
-  token 数量限制
- 语义连贯性保持

```typescript
const splitter = new TextSplitter({
  maxTokens: 1000,
  overlap: 100,
  respectBoundaries: true
});

const chunks = splitter.split(longText);
```

## 数据流

### 单文件翻译流程

```
┌─────────────┐
│   Input     │
│  File/Text  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         TextSplitter                        │
│  • 读取文件内容                            │
│  • 根据配置分块                            │
│  • 生成 chunk 列表                         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    ChunkedTranslationEngine                │
│  • 并行提交翻译请求                        │
│  • 处理 API 限流和错误                     │
│  • 收集翻译结果                            │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      ContextBuilder                        │
│  • 应用术语表替换                          │
│  • 统一术语一致性                          │
│  • 后处理和优化                            │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────┐
│   Output    │
│  File/Text  │
└─────────────┘
```

### 批量翻译流程

```
┌─────────────┐
│  Directory  │
│   Scan      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│      File Filter                            │
│  • 匹配文件模式                            │
│  • 检查文件状态                            │
│  • 生成任务列表                            │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      Task Queue                             │
│  • 优先级排序                              │
│  • 并发控制                                │
│  • 状态追踪                                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      Worker Pool                            │
│  • 多进程/线程处理                         │
│  • 错误处理和重试                          │
│  • 进度报告                                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      Result Aggregator                      │
│  • 收集所有结果                            │
│  • 生成汇总报告                            │
│  • 清理临时文件                            │
└─────────────────────────────────────────────┘
```

## 模块依赖

### 核心依赖关系

```
TranslationOrchestrator
    ├── ChunkedTranslationEngine
    │   ├── TextSplitter
    │   ├── TranslationClient (API 客户端)
    │   └── ContextBuilder
    ├── BatchProcessor
    │   ├── FileScanner
    │   ├── TaskQueue
    │   └── WorkerPool
    └── ConfigManager
        ├── ConfigValidator
        └── ConfigLoader
```

### 接口定义

**TranslationClient 接口：**

```typescript
interface TranslationClient {
  translate(text: string, options: TranslateOptions): Promise<string>;
  healthCheck(): Promise<boolean>;
  estimateTokens(text: string): number;
}

class OpenAIClient implements TranslationClient {
  constructor(private config: TranslationConfig) {}

  async translate(text: string, options: TranslateOptions): Promise<string> {
    // 实现 OpenAI 兼容 API 调用
    const response = await fetch(this.config.baseURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `你是一个专业的翻译助手。将以下文本翻译成${options.targetLanguage}：`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.baseURL + '/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  estimateTokens(text: string): number {
    // 简化的 token 估算（实际应使用分词器）
    const cjkChars = text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g)?.length || 0;
    const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
    const otherChars = text.length - cjkChars - englishWords;
    const totalTokens = Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
    return totalTokens;
  }
}
```

## 配置管理

### 配置优先级

1. **命令行参数**（最高优先级）
2. **项目配置文件**（`.translatemate.json`、`translatemate.config.js`）
3. **用户主目录配置**（`~/.translatemate/config.json`）
4. **环境变量**（`TRANSLATEMATE_*`）
5. **默认配置**（最低优先级）

### 配置结构

```typescript
interface TranslationConfig {
  apiKey: string;        // 您的 API 密钥
  baseURL: string;       // API 基础 URL
  model: string;         // 模型标识符
  maxTokens: number;     // 响应最大 tokens 数
  temperature: number;   // 采样温度
}

interface AppConfig {
  translation: TranslationConfig;
  chunking: {
    maxTokensPerChunk: number;
    chunkOverlap: number;
    parallelChunks: number;
  };
  batch: {
    concurrency: number;
    retryAttempts: number;
    timeout: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}
```

## 性能优化

### 并行处理策略

- **I/O 密集型操作**：使用异步并发（Promise.all with limit）
- **CPU 密集型操作**：使用 Worker 线程或子进程
- **网络请求**：连接池和请求批处理

### 缓存机制

- **翻译结果缓存**：基于文本哈希的 LRU 缓存
- **API 响应缓存**：减少重复请求
- **文件系统缓存**：避免重复扫描

### 内存管理

- **流式处理**：大文件分块读取，避免内存溢出
- **对象池**：复用频繁创建的对象
- **垃圾回收优化**：及时释放不再使用的资源

## 错误处理

### 重试策略

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = backoffMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 错误分类

- **网络错误**：自动重试（指数退避）
- **API 限流**：等待并重试
- **配置错误**：立即失败，提示用户
- **文件错误**：记录并跳过，继续处理其他文件

## 安全性

### API 密钥管理

- 从环境变量读取，避免硬编码
- 配置文件权限限制（仅用户可读）
- 密钥不在日志中记录
- 支持密钥轮换

### 输入验证

- 文件路径规范化，防止目录遍历攻击
- API 响应验证，防止注入攻击
- 配置文件模式验证

## 扩展性

### 插件系统

```typescript
interface TranslationPlugin {
  name: string;
  version: string;

  beforeTranslate?(context: PluginContext): Promise<void>;
  afterTranslate?(result: TranslationResult): Promise<void>;
  transformChunk?(chunk: string): Promise<string>;
}

class PluginManager {
  private plugins: TranslationPlugin[] = [];

  use(plugin: TranslationPlugin) {
    this.plugins.push(plugin);
  }

  async runBeforeHooks(context: PluginContext) {
    for (const plugin of this.plugins) {
      if (plugin.beforeTranslate) {
        await plugin.beforeTranslate(context);
      }
    }
  }
}
```

### 自定义处理器

支持用户自定义文件处理器和翻译策略：

```typescript
interface FileHandler {
  canHandle(filePath: string): boolean;
  read(filePath: string): Promise<string>;
  write(filePath: string, content: string): Promise<void>;
}

class MarkdownHandler implements FileHandler {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.md');
  }

  async read(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  async write(filePath: string, content: string): Promise<void> {
    return fs.promises.writeFile(filePath, content, 'utf-8');
  }
}
```

## 测试策略

### 单元测试

- 每个核心模块独立测试
- Mock 外部依赖（API 客户端、文件系统）
- 边界条件和错误场景覆盖

### 集成测试

- 端到端翻译流程测试
- 真实 API 调用（使用测试密钥）
- 批量处理流程验证

### 性能测试

- 大文件处理性能基准
- 并发压力测试
- 内存泄漏检测

## 监控和日志

### 结构化日志

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
  metadata?: Record<string, any>;
}
```

### 关键指标

- 翻译速度（tokens/秒）
- API 调用成功率
- 平均响应时间
- 内存使用情况
- 错误率和重试率

## 未来规划

### 短期目标

- [ ] 支持更多文件格式（PDF、DOCX）
- [ ] 实时翻译预览功能
- [ ] 翻译质量评估工具
- [ ] 术语库可视化编辑器

### 长期愿景

- [ ] 分布式翻译集群
- [ ] 机器学习驱动的质量优化
- [ ] 实时协作翻译
- [ ] 多模态内容翻译（图片、音频）