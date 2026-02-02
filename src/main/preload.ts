import { contextBridge, ipcRenderer } from 'electron';
import type { TranslationConfig, TranslationRequest, TranslationHistory, ChunkedTranslationRequest, TranslationProgress } from '@shared/types';

const electronAPI = {
  // 基础翻译
  translate: (request: TranslationRequest) => ipcRenderer.invoke('translate', request),
  
  // 分块翻译
  translateChunked: (
    request: ChunkedTranslationRequest, 
    onProgress?: (progress: TranslationProgress) => void
  ) => {
    // 设置进度监听
    if (onProgress) {
      const listener = (_event: any, progress: TranslationProgress) => onProgress(progress);
      ipcRenderer.on('translation-progress', listener);
      
      return ipcRenderer.invoke('translate-chunked', request).finally(() => {
        ipcRenderer.removeListener('translation-progress', listener);
      });
    }
    return ipcRenderer.invoke('translate-chunked', request);
  },
  
  // 加载术语表
  loadGlossary: (path: string) => ipcRenderer.invoke('load-glossary', path),
  
  // 配置管理
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: TranslationConfig) => ipcRenderer.invoke('set-config', config),
  
  // 历史记录
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (item: TranslationHistory) => ipcRenderer.invoke('add-history', item),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  deleteHistoryItem: (id: string) => ipcRenderer.invoke('delete-history-item', id),

  // 批量翻译
  selectMarkdownFiles: () => ipcRenderer.invoke('select-markdown-files'),
  selectMarkdownFolder: () => ipcRenderer.invoke('select-markdown-folder'),
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  batchTranslate: (files: string[], outputDir: string, targetLanguage: string) =>
    ipcRenderer.invoke('batch-translate', files, outputDir, targetLanguage),
  onBatchProgress: (callback: (progress: { total: number; completed: number; failed: number; currentFile?: string }) => void): (() => void) => {
    const listener = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on('batch-progress', listener);
    return () => {
      ipcRenderer.removeListener('batch-progress', listener);
    };
  },

  platform: process.platform,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
