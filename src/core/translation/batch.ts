import * as fs from 'fs';
import * as path from 'path';
import { ChunkedTranslationEngine } from './chunked-engine';
import type { TranslationConfig, ChunkedTranslationRequest } from '../../shared/types';

export interface BatchFile {
  path: string;
  content: string;
}

export interface BatchTranslationOptions {
  targetLanguage: string;
  sourceLanguage?: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  parallelChunks?: number;
  parallelFiles?: number;
  outputDir?: string;
}

export interface BatchTranslationResult {
  path: string;
  translatedContent: string;
  sourceLang?: string;
  success: boolean;
  error?: string;
}

export class BatchTranslator {
  private engine: ChunkedTranslationEngine;

  constructor(config: TranslationConfig) {
    this.engine = new ChunkedTranslationEngine(config);
  }

  async translateBatch(
    files: BatchFile[],
    options: BatchTranslationOptions,
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<BatchTranslationResult[]> {
    const results: BatchTranslationResult[] = [];
    const parallelFiles = options.parallelFiles || 2;

    // 批量处理文件
    for (let i = 0; i < files.length; i += parallelFiles) {
      const batch = files.slice(i, i + parallelFiles);
      
      // 并行翻译一批文件
      const batchPromises = batch.map(async (file) => {
        try {
          const request: ChunkedTranslationRequest = {
            text: file.content,
            targetLanguage: options.targetLanguage,
            sourceLanguage: options.sourceLanguage,
            glossary: options.glossary,
            maxTokensPerChunk: options.maxTokensPerChunk,
            parallelChunks: options.parallelChunks,
          };

          const result = await this.engine.translateChunked(request);

          return {
            path: file.path,
            translatedContent: result.text,
            sourceLang: result.sourceLang,
            success: true,
          } as BatchTranslationResult;
        } catch (error) {
          return {
            path: file.path,
            translatedContent: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          } as BatchTranslationResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 报告进度
      if (onProgress) {
        const completed = Math.min(i + parallelFiles, files.length);
        const currentFile = batch[batch.length - 1]?.path || '';
        onProgress(completed, files.length, currentFile);
      }
    }

    return results;
  }

  async translateDirectory(
    inputDir: string,
    options: BatchTranslationOptions,
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<BatchTranslationResult[]> {
    const files = this.collectFiles(inputDir);
    const batchFiles: BatchFile[] = files.map(filePath => ({
      path: filePath,
      content: fs.readFileSync(filePath, 'utf-8'),
    }));

    const results = await this.translateBatch(batchFiles, options, onProgress);

    // 如果指定了输出目录，保存翻译结果
    if (options.outputDir) {
      for (const result of results) {
        if (result.success) {
          const relativePath = path.relative(inputDir, result.path);
          const outputPath = path.join(options.outputDir, relativePath);
          
          // 确保输出目录存在
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          fs.writeFileSync(outputPath, result.translatedContent, 'utf-8');
        }
      }
    }

    return results;
  }

  private collectFiles(dir: string, extensions: string[] = ['.txt', '.md', '.json']): string[] {
    const files: string[] = [];

    const traverse = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // 跳过常见的非文本目录
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            traverse(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    traverse(dir);
    return files;
  }
}

// 便捷函数
export async function translateBatch(
  files: BatchFile[],
  config: TranslationConfig,
  options: BatchTranslationOptions,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<BatchTranslationResult[]> {
  const translator = new BatchTranslator(config);
  return translator.translateBatch(files, options, onProgress);
}

export async function translateDirectory(
  inputDir: string,
  config: TranslationConfig,
  options: BatchTranslationOptions,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<BatchTranslationResult[]> {
  const translator = new BatchTranslator(config);
  return translator.translateDirectory(inputDir, options, onProgress);
}
