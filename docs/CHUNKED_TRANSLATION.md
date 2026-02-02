# TranslaMate 分块翻译引擎技术文档

## 概述

本文档详细描述 TranslaMate 分块翻译引擎的架构设计、实现细节和集成方式。该引擎支持长文本智能分块、并行翻译、上下文感知和术语表功能。

## 目录

- [架构设计](#架构设计)
- [核心模块](#核心模块)
- [实现细节](#实现细节)
- [集成指南](#集成指南)
- [配置说明](#配置说明)
- [性能优化](#性能优化)
- [错误处理](#错误处理)

---

## 架构设计

### 1. 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      表现层 (Presentation)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   CLI        │  │  Electron    │  │  Programmatic API    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼─────────────────────┼──────────────┘
          │                 │                     │
          └─────────────────┼─────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    分块翻译引擎 (Chunked Engine)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ChunkedTranslationEngine                                 │  │
│  │  ├─ translateChunked()        // 单文档分块翻译           │  │
│  │  └─ translateDocumentsParallel() // 多文档并行翻译        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  核心组件                                                  │  │
│  │  ├─ TextSplitter          // 文本分块器                   │  │
│  │  ├─ ParallelTranslator    // 并行翻译器                   │  │
│  │  ├─ ContextBuilder        // 上下文构建器                 │  │
│  │  └─ SmartMerger           // 智能合并器                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    基础翻译引擎 (Base Engine)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TranslationEngine                                        │  │
│  │  └─ translate()              // 基础翻译能力             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 设计原则

#### 高内聚
- **单一职责**：每个类只负责一个明确的功能
  - `ChunkedTranslationEngine`：协调分块翻译流程
  - `TextSplitter`：专注于文本分块算法
  - `ParallelTranslator`：管理并行翻译执行
  - `SmartMerger`：处理翻译结果合并

#### 低耦合
- **依赖抽象**：引擎依赖于 `TranslationConfig` 接口，而非具体实现
- **事件驱动**：通过回调函数传递进度，而非直接操作 UI
- **配置外部化**：所有参数通过配置对象传入

#### 模块化
- **独立模块**：每个功能模块可独立测试和替换
- **插件化扩展**：术语表、上下文构建器可自定义
- **分层架构**：清晰的层级关系，上层不依赖下层细节

---

## 核心模块

### 1. ChunkedTranslationEngine

**职责**：协调整个分块翻译流程

**核心方法**：
```typescript
class ChunkedTranslationEngine {
  // 单文档分块翻译
  async translateChunked(
    request: ChunkedTranslationRequest,
    onProgress?: ProgressCallback
  ): Promise<ChunkedTranslationResult>;

  // 多文档并行翻译
  async translateDocumentsParallel(
    request: ParallelDocumentRequest,
    onProgress?: ProgressCallback
  ): Promise<ParallelDocumentResult[]>;
}
```

**设计要点**：
- 不直接处理 HTTP 请求，委托给基础 `TranslationEngine`
- 进度回调使用函数类型，不依赖任何 UI 框架
- 错误处理在模块边界统一捕获和转换

### 2. 文本分块 (Text Splitting)

**职责**：将长文本分割成适当大小的块

**算法**：
```typescript
private splitTextIntoChunks(text: string, maxTokens: number, overlap: number): string[] {
  // 1. 按段落分割（保持语义完整性）
  const paragraphs = text.split(/\n\n+/);
  
  // 2. 如果段落超过限制，按句子分割
  // 3. 块间保留重叠区域，确保上下文连贯
  // 4. 优先在标点处分割，避免截断句子
}
```

**分块策略**：
1. **段落优先**：尽量保持段落完整性
2. **句子回退**：长段落按句子分割
3. **重叠缓冲**：块间保留 50-100 tokens 重叠
4. **边界智能**：在标点符号处分割

### 3. 并行翻译 (Parallel Translation)

**职责**：管理多个翻译任务的并行执行

**实现**：
```typescript
private async translateChunksParallel(
  chunks: string[],
  targetLanguage: string,
  glossary?: Record<string, string>,
  parallelCount: number = 3
): Promise<string[]> {
  // 1. 预计算每个块的上下文
  // 2. 分批并行执行（控制并发数）
  // 3. 保持块顺序，确保结果正确拼接
}
```

**并发控制**：
- 使用 `Promise.all()` 批量执行
- 通过 `parallelCount` 限制并发数
- 避免对 API 造成过大压力

### 4. 上下文构建 (Context Building)

**职责**：为每个块构建前后文参考

**策略**：
```typescript
private buildContextualPrompt(
  chunks: string[],
  currentIndex: number,
  translatedChunks: string[]
): string {
  // 前200字符：已翻译的前一块结尾
  // 当前块：待翻译内容
  // 后200字符：下一块原文开头
}
```

**上下文类型**：
- **前文**：已翻译的前一块结尾（确保连贯性）
- **后文**：下一块原文开头（提供语境）
- **术语表**：全局术语映射（确保一致性）

### 5. 智能合并 (Smart Merging)

**职责**：合并翻译后的块，处理边界问题

**合并策略**：
```typescript
private async smartMergeChunks(
  originalChunks: string[],
  translatedChunks: string[]
): Promise<string> {
  // 1. 检测重复内容并去除
  // 2. 检测句子断裂并修复
  // 3. 使用 AI 平滑生硬的过渡
}
```

**问题处理**：
- **重复检测**：比较块边界，去除重复翻译
- **断裂修复**：检测未完成的句子，使用 AI 平滑
- **过渡优化**：对不自然的过渡进行润色

---

## 实现细节

### 1. 文件结构

```
src/core/translation/
├── index.ts                    # 模块导出
├── engine.ts                   # 基础翻译引擎（已有）
└── chunked-engine.ts           # 分块翻译引擎（新增）
```

### 2. 类型定义

```typescript
// 分块翻译请求
interface ChunkedTranslationRequest {
  text: string;                           // 待翻译文本
  sourceLanguage?: string;                // 源语言（可选）
  targetLanguage: string;                 // 目标语言
  glossary?: Record<string, string>;      // 术语表
  maxTokensPerChunk?: number;             // 每块最大token数
  chunkOverlap?: number;                  // 块间重叠token数
  parallelChunks?: number;                // 并行块数
}

// 多文档翻译请求
interface ParallelDocumentRequest {
  documents: Array<{
    id: string;
    text: string;
    sourceLanguage?: string;
  }>;
  targetLanguage: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  parallelDocs?: number;                  // 并行文档数
  parallelChunks?: number;                // 每文档并行块数
}

// 翻译进度
interface TranslationProgress {
  currentChunk: number;
  totalChunks: number;
  currentDocument?: number;
  totalDocuments?: number;
  documentId?: string;
  stage: 'splitting' | 'translating' | 'combining' | 'merging';
  message: string;
}
```

### 3. 核心算法

#### Token 估算
```typescript
private estimateTokens(text: string): number {
  // CJK字符：1 token/字符
  // 英文单词：0.75 token/单词
  // 其他字符：0.25 token/字符
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - cjkChars - englishWords;

  return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
}
```

#### 重叠检测
```typescript
private findOverlap(str1: string, str2: string): string | null {
  // 从长到短比较后缀和前缀
  const maxOverlap = Math.min(str1.length, str2.length, 150);
  for (let i = maxOverlap; i > 10; i--) {
    const suffix = str1.slice(-i).trim();
    const prefix = str2.slice(0, i).trim();
    if (suffix === prefix) return suffix;
  }
  return null;
}
```

---

## 集成指南

### 1. 基础集成

**步骤 1**：导入模块
```typescript
import { ChunkedTranslationEngine } from '../core/translation';
```

**步骤 2**：创建引擎实例
```typescript
const engine = new ChunkedTranslationEngine({
  apiKey: 'your-api-key',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  maxTokens: 1500,
  temperature: 0.3,
});
```

**步骤 3**：执行翻译
```typescript
const result = await engine.translateChunked({
  text: longText,
  targetLanguage: 'zh-CN',
  glossary: {
    'open source': '开源',
    'machine learning': '机器学习',
  },
  parallelChunks: 3,
}, (progress) => {
  console.log(`${progress.stage}: ${progress.message}`);
});
```

### 2. CLI 集成

**修改文件**：`src/cli/commands/translate.ts`

```typescript
import { ChunkedTranslationEngine } from '../../core';

export async function translateCommand(input: string, options: TranslateOptions): Promise<void> {
  const config = loadConfig(options.config);
  
  // 检测文本长度，决定使用哪种引擎
  const textLength = estimateTokens(input);
  const USE_CHUNKED_THRESHOLD = 1000;
  
  if (textLength > USE_CHUNKED_THRESHOLD || options.chunked) {
    // 使用分块引擎
    const engine = new ChunkedTranslationEngine(config);
    
    // 加载术语表
    const glossary = options.glossary ? await loadGlossary(options.glossary) : undefined;
    
    const result = await engine.translateChunked({
      text: input,
      targetLanguage: options.to,
      sourceLanguage: options.from === 'auto' ? undefined : options.from,
      glossary,
      maxTokensPerChunk: options.maxTokensPerChunk,
      parallelChunks: options.parallelChunks,
    }, (progress) => {
      // 显示进度条
      displayProgress(progress);
    });
    
    console.log(result.text);
  } else {
    // 使用基础引擎（已有代码）
    ...
  }
}
```

**添加 CLI 参数**：
```typescript
program
  .command('translate <input>')
  .option('--chunked', '启用分块翻译')
  .option('--glossary <path>', '术语表文件路径')
  .option('--max-tokens-per-chunk <number>', '每块最大token数', '1000')
  .option('--parallel-chunks <number>', '并行块数', '3')
  .action(translateCommand);
```

### 3. GUI 集成

**修改文件**：`src/renderer/components/TranslationView.tsx`（假设存在）

```typescript
import { ChunkedTranslationEngine, type TranslationProgress } from '../../core';

function TranslationComponent() {
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (text: string, targetLang: string) => {
    setIsTranslating(true);
    
    const engine = new ChunkedTranslationEngine(config);
    
    try {
      const result = await engine.translateChunked({
        text,
        targetLanguage: targetLang,
        glossary: await loadGlossary(),
      }, (p) => {
        // 更新进度状态，触发 UI 更新
        setProgress(p);
      });
      
      setTranslatedText(result.text);
    } finally {
      setIsTranslating(false);
      setProgress(null);
    }
  };

  return (
    <div>
      {isTranslating && progress && (
        <ProgressBar 
          current={progress.currentChunk} 
          total={progress.totalChunks}
          message={progress.message}
        />
      )}
      {/* 其他 UI */}
    </div>
  );
}
```

### 4. 批量文件翻译集成

**修改文件**：`src/core/batch/processor.ts`

```typescript
import { ChunkedTranslationEngine } from '../translation';

export class BatchProcessor {
  private engine: ChunkedTranslationEngine;

  constructor(config: TranslationConfig) {
    this.engine = new ChunkedTranslationEngine(config);
  }

  async processFiles(options: BatchTranslationOptions): Promise<void> {
    // 读取所有文件内容
    const documents = await Promise.all(
      options.files.map(async (filePath) => ({
        id: filePath,
        text: await fs.promises.readFile(filePath, 'utf-8'),
      }))
    );

    // 使用多文档并行翻译
    const results = await this.engine.translateDocumentsParallel({
      documents,
      targetLanguage: options.targetLanguage,
      glossary: options.glossary,
      parallelDocs: options.parallelFiles || 2,
      parallelChunks: options.parallelChunks || 3,
    }, (progress) => {
      options.onProgress?.({
        total: documents.length,
        completed: progress.currentDocument || 0,
        failed: 0,
        currentFile: progress.documentId,
      });
      options.onMessage?.(progress.message);
    });

    // 写入结果文件
    for (const result of results) {
      if (result.status === 'completed') {
        const outputPath = this.calculateOutputPath(result.id, ...);
        await fs.promises.writeFile(outputPath, result.result.text, 'utf-8');
      }
    }
  }
}
```

---

## 配置说明

### 1. 配置文件扩展

**文件**：`translamate.json`

```json
{
  "apiKey": "sk-your-api-key",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  
  // 分块翻译配置
  "chunkedTranslation": {
    "enabled": true,
    "maxTokensPerChunk": 1000,
    "chunkOverlap": 100,
    "parallelChunks": 3,
    "parallelDocs": 2
  },
  
  // 术语表配置
  "glossary": {
    "path": "./glossary.json",
    "autoLoad": true
  },
  
  // 阈值配置
  "thresholds": {
    "useChunked": 1000
  }
}
```

### 2. 环境变量

```bash
# 分块翻译
export TRANSLAMATE_CHUNKED_ENABLED=true
export TRANSLAMATE_MAX_TOKENS_PER_CHUNK=1000
export TRANSLAMATE_PARALLEL_CHUNKS=3
export TRANSLAMATE_PARALLEL_DOCS=2

# 术语表
export TRANSLAMATE_GLOSSARY_PATH=./glossary.json
```

### 3. 配置加载器扩展

**修改文件**：`src/core/config/loader.ts`

```typescript
export interface TranslationConfig {
  // 已有配置
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
  
  // 新增配置
  chunkedTranslation?: {
    enabled?: boolean;
    maxTokensPerChunk?: number;
    chunkOverlap?: number;
    parallelChunks?: number;
    parallelDocs?: number;
  };
  glossary?: {
    path?: string;
    autoLoad?: boolean;
    terms?: Record<string, string>;
  };
}

export async function loadGlossary(path: string): Promise<Record<string, string>> {
  const content = await fs.promises.readFile(path, 'utf-8');
  const parsed = JSON.parse(content);
  return parsed.terms || parsed;
}
```

---

## 性能优化

### 1. 并行度调优

| 场景 | parallelChunks | parallelDocs | 说明 |
|------|----------------|--------------|------|
| 短文本 (< 3000 tokens) | 1 | 1 | 无需分块 |
| 中等文本 (3000-10000) | 3 | 1 | 适度并行 |
| 长文本 (> 10000) | 5 | 1 | 高并行 |
| 多文件批量 | 3 | 2-3 | 文件+块双并行 |
| API 限流严格 | 2 | 1 | 降低并发 |

### 2. 块大小选择

| 模型 | maxTokensPerChunk | 说明 |
|------|-------------------|------|
| deepseek-chat | 1000-1500 | 平衡速度和质量 |
| gpt-4 | 1500-2000 | 上下文能力强 |
| gpt-3.5-turbo | 800-1200 | 成本考虑 |

### 3. 重叠区域优化

- **默认**：100 tokens（约 2-3 个句子）
- **技术文档**：150 tokens（保持上下文）
- **创意写作**：50 tokens（减少重复）

---

## 错误处理

### 1. 错误类型

```typescript
enum TranslationErrorType {
  API_ERROR = 'API_ERROR',           // API 调用失败
  RATE_LIMIT = 'RATE_LIMIT',         // 速率限制
  TIMEOUT = 'TIMEOUT',               // 超时
  INVALID_GLOSSARY = 'INVALID_GLOSSARY', // 术语表格式错误
  MERGE_FAILED = 'MERGE_FAILED',     // 合并失败
}
```

### 2. 错误恢复策略

```typescript
private async translateChunksParallel(...): Promise<string[]> {
  const results: (string | null)[] = new Array(chunks.length).fill(null);
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // 找出失败的块
    const failedIndices = results
      .map((r, i) => r === null ? i : -1)
      .filter(i => i !== -1);

    if (failedIndices.length === 0) break;

    // 重试失败的块
    const retryPromises = failedIndices.map(async (index) => {
      try {
        const result = await this.translateSingleChunk(...);
        results[index] = result;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw new Error(`Chunk ${index} failed after ${maxRetries} attempts`);
        }
      }
    });

    await Promise.all(retryPromises);
    
    // 指数退避
    if (attempt < maxRetries - 1) {
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  return results as string[];
}
```

### 3. 降级策略

```typescript
async function translateWithFallback(
  text: string,
  config: TranslationConfig
): Promise<string> {
  try {
    // 尝试分块翻译
    const engine = new ChunkedTranslationEngine(config);
    const result = await engine.translateChunked({ text, targetLanguage: 'zh-CN' });
    return result.text;
  } catch (error) {
    console.warn('Chunked translation failed, falling back to basic:', error);
    
    // 降级到基础翻译
    const engine = new TranslationEngine(config);
    const result = await engine.translate({ text, targetLanguage: 'zh-CN' });
    return result.text;
  }
}
```

---

## 测试策略

### 1. 单元测试

```typescript
describe('ChunkedTranslationEngine', () => {
  test('should split text into chunks correctly', () => {
    const engine = new ChunkedTranslationEngine(config);
    const chunks = engine['splitTextIntoChunks'](longText, 100, 20);
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThan(400); // 100 tokens * 4 chars
  });

  test('should detect overlap correctly', () => {
    const engine = new ChunkedTranslationEngine(config);
    const overlap = engine['findOverlap']('hello world', 'world peace');
    
    expect(overlap).toBe('world');
  });
});
```

### 2. 集成测试

```typescript
test('should translate long text with glossary', async () => {
  const engine = new ChunkedTranslationEngine(config);
  
  const result = await engine.translateChunked({
    text: longTechnicalText,
    targetLanguage: 'zh-CN',
    glossary: { 'API': 'API', 'GPU': '图形处理器' },
  });

  expect(result.text).toContain('API');
  expect(result.text).toContain('图形处理器');
  expect(result.chunks).toBeGreaterThan(1);
});
```

---

## 总结

分块翻译引擎通过以下设计实现高内聚、低耦合、模块化：

1. **高内聚**：每个类职责单一，功能集中
2. **低耦合**：依赖接口和配置，不依赖具体实现
3. **模块化**：各组件可独立测试、替换和扩展
4. **可配置**：所有参数外部化，灵活调整
5. **可观察**：完善的进度回调和错误处理

该引擎可无缝集成到 CLI、GUI 和批量处理流程中，显著提升长文本翻译的效率和质量。
