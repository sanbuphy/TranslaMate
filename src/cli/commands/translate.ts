import * as fs from 'fs';
import * as path from 'path';
import {
  TranslationEngine,
  ChunkedTranslationEngine,
  loadConfig,
  type TranslationConfig,
  type TranslationProgress,
} from '../../core';

interface TranslateOptions {
  to: string;
  from: string;
  output?: string;
  config?: string;
  chunked?: boolean;
  glossary?: string;
  maxTokensPerChunk?: string;
  parallelChunks?: string;
}

// Token 估算函数
function estimateTokens(text: string): number {
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - cjkChars - englishWords;
  return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
}

// 加载术语表
async function loadGlossary(glossaryPath: string): Promise<Record<string, string>> {
  try {
    const content = fs.readFileSync(glossaryPath, 'utf-8');
    const parsed = JSON.parse(content);
    // 支持两种格式：{ "terms": {...} } 或 { "key": "value" }
    return parsed.terms || parsed;
  } catch (error) {
    throw new Error(`Failed to load glossary from ${glossaryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 显示进度条
function displayProgress(progress: TranslationProgress): void {
  const percentage = progress.totalChunks > 0
    ? Math.round((progress.currentChunk / progress.totalChunks) * 100)
    : 0;
  
  const barLength = 30;
  const filledLength = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`[${bar}] ${percentage}% | ${progress.stage}: ${progress.message}`);
}

// 清除进度条
function clearProgress(): void {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

export async function translateCommand(input: string, options: TranslateOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    validateConfig(config);

    // Check if input is a file
    const isFile = fs.existsSync(input) && fs.statSync(input).isFile();

    if (isFile) {
      await translateFile(input, options, config);
    } else {
      await translateText(input, options, config);
    }
  } catch (error) {
    clearProgress();
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function translateText(text: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  const tokenCount = estimateTokens(text);
  const USE_CHUNKED_THRESHOLD = 1000;

  // 决定是否使用分块翻译
  const useChunked = options.chunked || tokenCount > USE_CHUNKED_THRESHOLD;

  if (useChunked) {
    await translateTextChunked(text, options, config);
  } else {
    await translateTextBasic(text, options, config);
  }
}

async function translateTextBasic(text: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  const engine = new TranslationEngine(config);

  console.log(`Translating to ${options.to}...`);

  const result = await engine.translate({
    text,
    sourceLanguage: options.from === 'auto' ? undefined : options.from,
    targetLanguage: options.to,
  });

  console.log('\n' + result.text);
}

async function translateTextChunked(text: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  const engine = new ChunkedTranslationEngine(config);

  // 加载术语表
  const glossary = options.glossary ? await loadGlossary(options.glossary) : undefined;

  console.log(`Translating to ${options.to} using chunked mode...`);
  console.log(''); // 空行，为进度条预留空间

  const maxTokensPerChunk = options.maxTokensPerChunk ? parseInt(options.maxTokensPerChunk, 10) : 1000;
  const parallelChunks = options.parallelChunks ? parseInt(options.parallelChunks, 10) : 3;

  const result = await engine.translateChunked(
    {
      text,
      sourceLanguage: options.from === 'auto' ? undefined : options.from,
      targetLanguage: options.to,
      glossary,
      maxTokensPerChunk,
      parallelChunks,
    },
    (progress) => {
      displayProgress(progress);
    }
  );

  clearProgress();
  console.log(`\nTranslation completed: ${result.chunks} chunks, ~${result.totalTokens} tokens`);
  console.log('\n' + result.text);
}

async function translateFile(filePath: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  console.log(`Reading file: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf-8');

  const tokenCount = estimateTokens(content);
  const USE_CHUNKED_THRESHOLD = 1000;
  const useChunked = options.chunked || tokenCount > USE_CHUNKED_THRESHOLD;

  // Determine output path
  let outputPath: string;
  if (options.output) {
    outputPath = options.output;
  } else {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    outputPath = path.join(dir, `${baseName}_${options.to}${ext}`);
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  if (useChunked) {
    await translateFileChunked(filePath, content, outputPath, options, config);
  } else {
    await translateFileBasic(content, outputPath, options, config);
  }

  console.log(`Saved to: ${outputPath}`);
}

async function translateFileBasic(
  content: string,
  outputPath: string,
  options: TranslateOptions,
  config: TranslationConfig
): Promise<void> {
  const engine = new TranslationEngine(config);

  console.log(`Translating to ${options.to}...`);
  const result = await engine.translate({
    text: content,
    sourceLanguage: options.from === 'auto' ? undefined : options.from,
    targetLanguage: options.to,
  });

  fs.writeFileSync(outputPath, result.text, 'utf-8');
}

async function translateFileChunked(
  _filePath: string,
  content: string,
  outputPath: string,
  options: TranslateOptions,
  config: TranslationConfig
): Promise<void> {
  const engine = new ChunkedTranslationEngine(config);

  // 加载术语表
  const glossary = options.glossary ? await loadGlossary(options.glossary) : undefined;

  console.log(`Translating to ${options.to} using chunked mode...`);
  console.log(''); // 空行，为进度条预留空间

  const maxTokensPerChunk = options.maxTokensPerChunk ? parseInt(options.maxTokensPerChunk, 10) : 1000;
  const parallelChunks = options.parallelChunks ? parseInt(options.parallelChunks, 10) : 3;

  const result = await engine.translateChunked(
    {
      text: content,
      sourceLanguage: options.from === 'auto' ? undefined : options.from,
      targetLanguage: options.to,
      glossary,
      maxTokensPerChunk,
      parallelChunks,
    },
    (progress) => {
      displayProgress(progress);
    }
  );

  clearProgress();
  console.log(`Translation completed: ${result.chunks} chunks, ~${result.totalTokens} tokens`);

  fs.writeFileSync(outputPath, result.text, 'utf-8');
}

function validateConfig(config: TranslationConfig): void {
  if (!config.apiKey) {
    throw new Error(
      'API Key is required. Set it via:\n' +
      '  - Config file: translamate.json\n' +
      '  - Environment: TRANSLAMATE_API_KEY\n' +
      '  - Command: translamate config --set apiKey=xxx'
    );
  }
}
