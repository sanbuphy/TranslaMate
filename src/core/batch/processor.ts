import * as fs from 'fs';
import * as path from 'path';
import { TranslationEngine } from '../translation';
import type {
  TranslationConfig,
  FileTranslationTask,
  BatchTranslationProgress,
  BatchTranslationOptions,
} from '../types';

export class BatchProcessor {
  private engine: TranslationEngine;

  constructor(config: TranslationConfig) {
    this.engine = new TranslationEngine(config);
  }

  async scanDirectory(dir: string, excludeDirs: string[] = ['node_modules', '.git']): Promise<string[]> {
    const markdownFiles: string[] = [];

    async function scan(currentDir: string): Promise<void> {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await scan(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === '.md' || ext === '.markdown') {
            markdownFiles.push(fullPath);
          }
        }
      }
    }

    await scan(dir);
    return markdownFiles;
  }

  async processFiles(options: BatchTranslationOptions): Promise<void> {
    const { files, outputDir, targetLanguage, onProgress, onMessage } = options;

    const tasks: FileTranslationTask[] = files.map((filePath) => ({
      filePath,
      sourceText: '',
      targetLanguage,
      status: 'pending',
    }));

    const progress: BatchTranslationProgress = {
      total: files.length,
      completed: 0,
      failed: 0,
    };

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      try {
        progress.currentFile = path.basename(task.filePath);
        onProgress?.(progress);
        onMessage?.(`Translating: ${progress.currentFile}`);

        // Read file
        task.status = 'translating';
        task.sourceText = await fs.promises.readFile(task.filePath, 'utf-8');

        // Translate
        const result = await this.engine.translate({
          text: task.sourceText,
          targetLanguage,
        });

        task.translatedText = result.text;
        task.status = 'completed';

        // Calculate output path preserving structure
        const outputPath = this.calculateOutputPath(task.filePath, files, outputDir, targetLanguage);
        
        // Ensure subdirectories exist
        await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
        
        // Write translated file
        await fs.promises.writeFile(outputPath, task.translatedText, 'utf-8');

        progress.completed++;
        onProgress?.(progress);
        onMessage?.(`Completed: ${path.basename(outputPath)}`);
      } catch (error) {
        task.status = 'error';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        progress.failed++;
        onProgress?.(progress);
        onMessage?.(`Error: ${task.error}`);
      }
    }

    progress.currentFile = undefined;
    onProgress?.(progress);
    onMessage?.(`Batch translation completed: ${progress.completed}/${progress.total} files`);
  }

  async translateSingleFile(
    filePath: string,
    outputDir: string,
    targetLanguage: string,
    onMessage?: (message: string) => void
  ): Promise<void> {
    onMessage?.(`Reading file: ${path.basename(filePath)}`);
    const sourceText = await fs.promises.readFile(filePath, 'utf-8');

    onMessage?.('Translating...');
    const result = await this.engine.translate({ text: sourceText, targetLanguage });

    const outputFileName = path.basename(filePath).replace(/\.[^.]+$/, `_${targetLanguage}.md`);
    const outputPath = path.join(outputDir, outputFileName);

    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(outputPath, result.text, 'utf-8');

    onMessage?.(`Saved to: ${outputPath}`);
  }

  private calculateOutputPath(
    filePath: string,
    allFiles: string[],
    outputDir: string,
    targetLanguage: string
  ): string {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    
    // If single file or files are in different directories, just use filename
    if (allFiles.length === 1) {
      return path.join(outputDir, `${baseName}_${targetLanguage}.md`);
    }

    // Find common base directory
    const commonBase = this.findCommonBase(allFiles);
    const relativePath = path.relative(commonBase, filePath);
    const relativeDir = path.dirname(relativePath);
    
    // Preserve directory structure
    const outputSubDir = path.join(outputDir, relativeDir);
    return path.join(outputSubDir, `${baseName}_${targetLanguage}.md`);
  }

  private findCommonBase(filePaths: string[]): string {
    if (filePaths.length === 0) return '';
    if (filePaths.length === 1) return path.dirname(filePaths[0]);

    const sorted = [...filePaths].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    let i = 0;
    while (i < first.length && first[i] === last[i]) {
      i++;
    }
    
    const commonPath = first.substring(0, i);
    const lastSlash = commonPath.lastIndexOf(path.sep);
    
    return lastSlash > 0 ? commonPath.substring(0, lastSlash) : commonPath;
  }
}

// Backward compatibility - standalone functions
export async function scanMarkdownFiles(dir: string, excludeDirs?: string[]): Promise<string[]> {
  const processor = new BatchProcessor({} as TranslationConfig);
  return processor.scanDirectory(dir, excludeDirs);
}
