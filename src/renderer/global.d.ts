// Global type definitions for renderer process
import type { ElectronAPI } from '@main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
