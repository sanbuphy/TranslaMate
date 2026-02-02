import { contextBridge, ipcRenderer } from 'electron';
import type { TranslationConfig, TranslationRequest, TranslationHistory } from '@shared/types';

const electronAPI = {
  translate: (request: TranslationRequest) => ipcRenderer.invoke('translate', request),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: TranslationConfig) => ipcRenderer.invoke('set-config', config),
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (item: TranslationHistory) => ipcRenderer.invoke('add-history', item),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  deleteHistoryItem: (id: string) => ipcRenderer.invoke('delete-history-item', id),

  // Batch translation
  selectMarkdownFiles: () => ipcRenderer.invoke('select-markdown-files'),
  selectMarkdownFolder: () => ipcRenderer.invoke('select-markdown-folder'),
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  batchTranslate: (files: string[], outputDir: string, targetLanguage: string) =>
    ipcRenderer.invoke('batch-translate', files, outputDir, targetLanguage),
  onBatchProgress: (callback: (progress: { total: number; completed: number; failed: number; currentFile?: string }) => void) => {
    const listener = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on('batch-progress', listener);
    return () => ipcRenderer.removeListener('batch-progress', listener);
  },

  platform: process.platform,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
