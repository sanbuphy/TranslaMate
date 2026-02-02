// Core types - no Electron dependencies

export interface TranslationConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface TranslationResult {
  text: string;
  sourceLang?: string;
}

export interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
  timestamp: number;
}

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

export interface FileTranslationTask {
  filePath: string;
  sourceText: string;
  targetLanguage: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
  translatedText?: string;
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
