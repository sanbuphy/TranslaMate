import { create } from 'zustand';
import type { TranslationConfig, TranslationHistory, TranslationProgress } from '@shared/types';

interface AppState {
  // Config
  config: TranslationConfig | null;
  setConfig: (config: TranslationConfig) => Promise<void>;
  loadConfig: () => Promise<void>;

  // Translation
  isTranslating: boolean;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  setSourceText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  translate: () => Promise<void>;
  translateChunked: () => Promise<void>;
  swapLanguages: () => void;
  clearText: () => void;

  // Chunked Translation Progress
  translationProgress: TranslationProgress | null;
  setTranslationProgress: (progress: TranslationProgress | null) => void;
  useChunkedTranslation: boolean;
  setUseChunkedTranslation: (use: boolean) => void;
  glossary: Record<string, string> | null;
  setGlossary: (glossary: Record<string, string> | null) => void;
  loadGlossary: (path: string) => Promise<void>;

  // History
  history: TranslationHistory[];
  loadHistory: () => Promise<void>;
  addHistoryItem: (item: TranslationHistory) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;

  // UI
  currentView: 'translate' | 'batch' | 'history' | 'settings';
  setCurrentView: (view: 'translate' | 'batch' | 'history' | 'settings') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Token 估算函数
function estimateTokens(text: string): number {
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - cjkChars - englishWords;
  return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
}

export const useStore = create<AppState>((set, get) => ({
  // Config
  config: null,
  setConfig: async (config) => {
    await window.electronAPI.setConfig(config);
    set({ config });
  },
  loadConfig: async () => {
    const config = await window.electronAPI.getConfig();
    set({ config });
  },

  // Translation
  isTranslating: false,
  sourceText: '',
  translatedText: '',
  sourceLanguage: 'auto',
  targetLanguage: 'zh-CN',
  setSourceText: (text) => set({ sourceText: text }),
  setTranslatedText: (text) => set({ translatedText: text }),
  setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),
  
  translate: async () => {
    const { sourceText, targetLanguage, sourceLanguage, config, useChunkedTranslation } = get();

    if (!sourceText.trim()) {
      set({ error: 'Please enter text to translate' });
      return;
    }

    if (!config?.apiKey) {
      set({ error: 'Please configure your API key in settings' });
      return;
    }

    // 根据文本长度或用户选择决定是否使用分块翻译
    const tokenCount = estimateTokens(sourceText);
    const USE_CHUNKED_THRESHOLD = 1000;
    
    if (useChunkedTranslation || tokenCount > USE_CHUNKED_THRESHOLD) {
      await get().translateChunked();
    } else {
      // 基础翻译
      set({ isTranslating: true, error: null });

      try {
        const result = await window.electronAPI.translate({
          text: sourceText,
          targetLanguage,
          sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        });

        set({ translatedText: result.text, isTranslating: false });

        // Add to history
        const historyItem: TranslationHistory = {
          id: Date.now().toString(),
          sourceText,
          translatedText: result.text,
          sourceLanguage: result.sourceLang || sourceLanguage,
          targetLanguage,
          timestamp: Date.now(),
        };
        await window.electronAPI.addHistory(historyItem);
        get().loadHistory();
      } catch (error) {
        set({
          isTranslating: false,
          error: error instanceof Error ? error.message : 'Translation failed',
        });
      }
    }
  },

  translateChunked: async () => {
    const { sourceText, targetLanguage, sourceLanguage, glossary } = get();

    set({ isTranslating: true, error: null, translationProgress: null });

    try {
      const result = await window.electronAPI.translateChunked({
        text: sourceText,
        targetLanguage,
        sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        glossary: glossary || undefined,
      }, (progress: { stage: string; message: string; currentChunk: number; totalChunks: number }) => {
        // 进度回调
        set({ translationProgress: progress });
      });

      set({ 
        translatedText: result.text, 
        isTranslating: false,
        translationProgress: null,
      });

      // Add to history
      const historyItem: TranslationHistory = {
        id: Date.now().toString(),
        sourceText,
        translatedText: result.text,
        sourceLanguage: result.sourceLang || sourceLanguage,
        targetLanguage,
        timestamp: Date.now(),
      };
      await window.electronAPI.addHistory(historyItem);
      get().loadHistory();
    } catch (error) {
      set({
        isTranslating: false,
        translationProgress: null,
        error: error instanceof Error ? error.message : 'Translation failed',
      });
    }
  },

  swapLanguages: () => {
    const { sourceLanguage, targetLanguage, sourceText, translatedText } = get();
    if (sourceLanguage !== 'auto') {
      set({
        sourceLanguage: targetLanguage,
        targetLanguage: sourceLanguage,
        sourceText: translatedText,
        translatedText: sourceText,
      });
    }
  },
  clearText: () => {
    set({ sourceText: '', translatedText: '', error: null, translationProgress: null });
  },

  // Chunked Translation Progress
  translationProgress: null,
  setTranslationProgress: (progress) => set({ translationProgress: progress }),
  useChunkedTranslation: false,
  setUseChunkedTranslation: (use) => set({ useChunkedTranslation: use }),
  glossary: null,
  setGlossary: (glossary) => set({ glossary }),
  loadGlossary: async (path: string) => {
    try {
      const glossary = await window.electronAPI.loadGlossary(path);
      set({ glossary });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load glossary' });
    }
  },

  // History
  history: [],
  loadHistory: async () => {
    const history = await window.electronAPI.getHistory();
    set({ history });
  },
  addHistoryItem: async (item) => {
    await window.electronAPI.addHistory(item);
    get().loadHistory();
  },
  clearHistory: async () => {
    await window.electronAPI.clearHistory();
    set({ history: [] });
  },
  deleteHistoryItem: async (id) => {
    await window.electronAPI.deleteHistoryItem(id);
    get().loadHistory();
  },

  // UI
  currentView: 'translate',
  setCurrentView: (view) => set({ currentView: view }),
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  error: null,
  setError: (error) => set({ error }),
}));
