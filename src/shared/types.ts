// Shared types for main and renderer processes

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

// 分块翻译配置
export interface ChunkedTranslationConfig {
  enabled?: boolean;
  maxTokensPerChunk?: number;
  chunkOverlap?: number;
  parallelChunks?: number;
  parallelDocs?: number;
  useChunkedThreshold?: number;
}

// 术语表配置
export interface GlossaryConfig {
  path?: string;
  autoLoad?: boolean;
  terms?: Record<string, string>;
}

export interface TranslationConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
  // 新增：分块翻译配置
  chunkedTranslation?: ChunkedTranslationConfig;
  // 新增：术语表配置
  glossary?: GlossaryConfig;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

// 分块翻译请求
export interface ChunkedTranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  parallelChunks?: number;
}

export interface TranslationResult {
  text: string;
  sourceLang?: string;
}

// 翻译进度
export interface TranslationProgress {
  stage: string;
  message: string;
  currentChunk: number;
  totalChunks: number;
  currentDocument?: number;
  totalDocuments?: number;
  documentId?: string;
  percentage?: number;
}

export interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
  timestamp: number;
}

// 批量翻译相关类型
export interface FileTranslationTask {
  filePath: string;
  sourceText: string;
  targetLanguage: string;
  translatedText?: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
  error?: string;
}

export interface BatchTranslationProgress {
  total: number;
  completed: number;
  failed: number;
  currentFile?: string;
}

export interface BatchTranslationOptions {
  files: string[];
  outputDir: string;
  targetLanguage: string;
  config: TranslationConfig;
  onProgress?: (progress: BatchTranslationProgress) => void;
  onMessage?: (message: string) => void;
}

// 批量翻译文件
export interface BatchFile {
  path: string;
  content: string;
}

// 批量翻译请求
export interface BatchTranslationRequest {
  files: BatchFile[];
  targetLanguage: string;
  sourceLanguage?: string;
  glossary?: Record<string, string>;
  maxTokensPerChunk?: number;
  parallelChunks?: number;
  parallelFiles?: number;
}

// 批量翻译结果
export interface BatchTranslationResult {
  path: string;
  translatedContent: string;
  sourceLang?: string;
}
