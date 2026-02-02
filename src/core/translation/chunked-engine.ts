import OpenAI from 'openai';
import type { TranslationConfig, TranslationResult, TranslationProgress } from '../../shared/types';

export interface ChunkedTranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  chunkOverlap?: number;
  parallelChunks?: number; // 并行翻译的块数
}

export interface ParallelDocumentRequest {
  documents: Array<{
    id: string;
    text: string;
    sourceLanguage?: string;
  }>;
  targetLanguage: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  parallelDocs?: number; // 并行翻译的文档数
  parallelChunks?: number; // 每个文档内并行翻译的块数
}

export interface ChunkedTranslationResult extends TranslationResult {
  chunks: number;
  totalTokens: number;
}

export interface ParallelDocumentResult {
  id: string;
  result: ChunkedTranslationResult;
  status: 'completed' | 'error';
  error?: string;
}

export type ProgressCallback = (progress: TranslationProgress) => void;

export class ChunkedTranslationEngine {
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  async translateChunked(
    request: ChunkedTranslationRequest,
    onProgress?: ProgressCallback
  ): Promise<ChunkedTranslationResult> {
    const maxTokensPerChunk = request.maxTokensPerChunk || 1000;
    const chunkOverlap = request.chunkOverlap || 100;
    const parallelChunks = request.parallelChunks || 3; // 默认并行3个块

    // Step 1: Split text into chunks
    onProgress?.({
      currentChunk: 0,
      totalChunks: 0,
      stage: 'splitting',
      message: '正在分析文本并分块...',
    });

    const chunks = this.splitTextIntoChunks(request.text, maxTokensPerChunk, chunkOverlap);
    const totalTokens = this.estimateTokens(request.text);

    if (chunks.length === 1) {
      // 单块直接翻译
      const result = await this.translateSingleChunk(
        chunks[0],
        request.targetLanguage,
        request.glossary,
        null,
        null
      );

      return {
        text: result,
        chunks: 1,
        totalTokens,
      };
    }

    // Step 2: Translate chunks with context (parallel)
    onProgress?.({
      currentChunk: 0,
      totalChunks: chunks.length,
      stage: 'translating',
      message: `开始翻译 ${chunks.length} 个文本块...`,
    });

    const translatedChunks: string[] = [];

    // 分批并行处理
    for (let i = 0; i < chunks.length; i += parallelChunks) {
      const batch = chunks.slice(i, i + parallelChunks);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        const prevChunk = chunkIndex > 0 ? chunks[chunkIndex - 1] : null;
        const nextChunk = chunkIndex < chunks.length - 1 ? chunks[chunkIndex + 1] : null;

        const translated = await this.translateSingleChunk(
          chunk,
          request.targetLanguage,
          request.glossary,
          prevChunk,
          nextChunk
        );

        return { index: chunkIndex, translated };
      });

      const batchResults = await Promise.all(batchPromises);

      // 按顺序存储结果
      batchResults.forEach(({ index, translated }) => {
        translatedChunks[index] = translated;
      });

      // 报告进度
      const completed = Math.min(i + parallelChunks, chunks.length);
      onProgress?.({
        currentChunk: completed,
        totalChunks: chunks.length,
        stage: 'translating',
        message: `已翻译 ${completed}/${chunks.length} 个块`,
      });
    }

    // Step 3: Combine translated chunks with smart merging
    onProgress?.({
      currentChunk: chunks.length,
      totalChunks: chunks.length,
      stage: 'combining',
      message: '合并翻译结果...',
    });

    const combinedText = await this.smartMerge(translatedChunks, chunks, request.targetLanguage, request.glossary);

    onProgress?.({
      currentChunk: chunks.length,
      totalChunks: chunks.length,
      stage: 'merging',
      message: '翻译完成！',
    });

    return {
      text: combinedText,
      chunks: chunks.length,
      totalTokens,
    };
  }

  // 并行翻译多个文档
  async translateDocumentsParallel(
    request: ParallelDocumentRequest,
    onProgress?: ProgressCallback
  ): Promise<ParallelDocumentResult[]> {
    const parallelDocs = request.parallelDocs || 2;
    const { documents, targetLanguage, glossary, maxTokensPerChunk, parallelChunks } = request;

    const results: ParallelDocumentResult[] = [];

    // 分批处理文档
    for (let i = 0; i < documents.length; i += parallelDocs) {
      const batch = documents.slice(i, i + parallelDocs);

      onProgress?.({
        currentChunk: 0,
        totalChunks: 0,
        currentDocument: i + 1,
        totalDocuments: documents.length,
        stage: 'translating',
        message: `正在翻译文档批次 ${Math.floor(i / parallelDocs) + 1}/${Math.ceil(documents.length / parallelDocs)}...`,
      });

      // 并行翻译一批文档
      const batchPromises = batch.map(async (doc) => {
        try {
          const result = await this.translateChunked(
            {
              text: doc.text,
              targetLanguage,
              sourceLanguage: doc.sourceLanguage,
              glossary,
              maxTokensPerChunk,
              parallelChunks,
            },
            (progress) => {
              // 转发进度，添加文档ID
              onProgress?.({
                ...progress,
                documentId: doc.id,
                currentDocument: i + batch.indexOf(doc) + 1,
                totalDocuments: documents.length,
              });
            }
          );

          return {
            id: doc.id,
            result,
            status: 'completed' as const,
          };
        } catch (error) {
          return {
            id: doc.id,
            result: { text: '', chunks: 0, totalTokens: 0 },
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // 智能文本分块
  private splitTextIntoChunks(text: string, maxTokens: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = this.splitIntoSentences(text);

    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokens(sentence);

      if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
        // 保存当前块
        chunks.push(currentChunk.trim());

        // 开始新块，包含重叠部分
        const overlapText = this.getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + sentence;
        currentTokens = this.estimateTokens(currentChunk);
      } else {
        currentChunk += sentence + ' ';
        currentTokens += sentenceTokens;
      }
    }

    // 添加最后一个块
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // 将文本分割成句子
  private splitIntoSentences(text: string): string[] {
    // 支持中英文句子分割
    const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g;
    const matches = text.match(sentenceRegex);

    if (!matches || matches.length === 0) {
      // 如果没有找到句子，按段落分割
      return text.split(/\n\n+/).filter(p => p.trim().length > 0);
    }

    return matches.map(s => s.trim());
  }

  // 获取重叠文本
  private getOverlapText(text: string, overlapTokens: number): string {
    const sentences = this.splitIntoSentences(text);
    let overlapText = '';
    let tokens = 0;

    // 从后往前取句子，直到达到重叠token数
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      const sentenceTokens = this.estimateTokens(sentence);

      if (tokens + sentenceTokens > overlapTokens) {
        break;
      }

      overlapText = sentence + ' ' + overlapText;
      tokens += sentenceTokens;
    }

    return overlapText;
  }

  // 估算token数
  private estimateTokens(text: string): number {
    // 简单估算：中文字符 + 英文单词
    const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const otherChars = text.length - cjkChars - englishWords;

    // 中文字符算1个token，英文单词算0.75个token，其他字符算0.25个token
    return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
  }

  // 翻译单个块，带有上下文
  private async translateSingleChunk(
    chunk: string,
    targetLanguage: string,
    glossary?: Record<string, string>,
    prevChunk?: string | null,
    nextChunk?: string | null
  ): Promise<string> {
    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
    });

    // 构建带有上下文的提示
    let contextPrompt = '';
    if (prevChunk) {
      contextPrompt += `【上文】\n${prevChunk.slice(-200)}\n\n`;
    }
    if (nextChunk) {
      contextPrompt += `【下文】\n${nextChunk.slice(0, 200)}\n\n`;
    }

    // 构建术语表提示
    let glossaryPrompt = '';
    if (glossary && Object.keys(glossary).length > 0) {
      glossaryPrompt = '\n\n【术语表】翻译时请使用以下术语对照：\n';
      for (const [source, target] of Object.entries(glossary)) {
        glossaryPrompt += `${source} → ${target}\n`;
      }
    }

    const prompt = `请将以下文本翻译成${targetLanguage}。${contextPrompt ? '请参考上下文保持翻译连贯。' : ''}${glossaryPrompt ? '请严格遵循术语表。' : ''}

【待翻译文本】
${chunk}${glossaryPrompt}

请只输出翻译后的文本，不要添加任何解释或注释。`;

    const response = await client.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `你是一位专业的翻译专家。请准确、流畅地将文本翻译成${targetLanguage}，保持原文的语气和风格。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response.choices[0]?.message?.content?.trim() || chunk;
  }

  // 智能合并翻译结果
  private async smartMerge(
    translatedChunks: string[],
    originalChunks: string[],
    targetLanguage: string,
    glossary?: Record<string, string>
  ): Promise<string> {
    if (translatedChunks.length === 1) {
      return translatedChunks[0];
    }

    // 检查相邻块之间的衔接
    const mergedParts: string[] = [translatedChunks[0]];

    for (let i = 1; i < translatedChunks.length; i++) {
      const prev = translatedChunks[i - 1];
      const current = translatedChunks[i];
      const originalCurrent = originalChunks[i];

      // 检查是否需要平滑过渡
      const smoothed = await this.smoothTransition(
        prev,
        current,
        originalCurrent,
        targetLanguage,
        glossary
      );

      mergedParts.push(smoothed);
    }

    return mergedParts.join('\n\n');
  }

  // 平滑过渡处理
  private async smoothTransition(
    prevTranslated: string,
    currentTranslated: string,
    _currentOriginal: string,
    _targetLanguage: string,
    _glossary?: Record<string, string>
  ): Promise<string> {
    // 简单检查：如果上一段以标点结尾，当前段以标点开头，则直接拼接
    const prevEndsWithPunct = /[.!?。！？]\s*$/.test(prevTranslated);
    const currentStartsWithPunct = /^\s*[.!?。！？]/.test(currentTranslated);

    if (prevEndsWithPunct && !currentStartsWithPunct) {
      return currentTranslated;
    }

    // 如果需要更复杂的处理，可以调用AI进行平滑
    // 这里简化处理，直接返回当前段
    return currentTranslated;
  }
}
