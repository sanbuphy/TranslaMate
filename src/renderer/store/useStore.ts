import { create } from 'zustand';
import type { TranslationConfig, TranslationHistory } from '@shared/types';

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
  swapLanguages: () => void;
  clearText: () => void;

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
    const { sourceText, targetLanguage, sourceLanguage, config } = get();

    if (!sourceText.trim()) {
      set({ error: 'Please enter text to translate' });
      return;
    }

    if (!config?.apiKey) {
      set({ error: 'Please configure your API key in settings' });
      return;
    }

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
    set({ sourceText: '', translatedText: '', error: null });
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
