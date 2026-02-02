import { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog } from 'electron';
import * as path from 'path';
import { store } from './store';
import { TranslationEngine, BatchProcessor, type TranslationConfig, type TranslationRequest, type TranslationHistory } from '../core';
import type { BatchTranslationProgress, ChunkedTranslationRequest, TranslationProgress } from '../shared/types';
import { ChunkedTranslationEngine } from '../core/translation/chunked-engine';
import { loadGlossary } from '../core/config/loader';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'TranslaMate',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createMenu();

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('translate', async (_event, request: TranslationRequest): Promise<{ text: string; sourceLang?: string }> => {
  const config = store.get('config') as TranslationConfig;

  if (!config || !config.apiKey) {
    throw new Error('API configuration not found. Please configure your API key in settings.');
  }

  const engine = new TranslationEngine(config);
  return engine.translate(request);
});

ipcMain.handle('get-config', (): TranslationConfig => {
  return store.get('config') as TranslationConfig || {
    apiKey: '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    maxTokens: 512,
    temperature: 0.3,
  };
});

ipcMain.handle('set-config', (_event, config: TranslationConfig): void => {
  store.set('config', config);
});

ipcMain.handle('get-history', (): TranslationHistory[] => {
  return store.get('history') as TranslationHistory[] || [];
});

ipcMain.handle('add-history', (_event, item: TranslationHistory): void => {
  const history = store.get('history') as TranslationHistory[] || [];
  history.unshift(item);
  // Keep only last 100 items
  if (history.length > 100) {
    history.pop();
  }
  store.set('history', history);
});

ipcMain.handle('clear-history', (): void => {
  store.set('history', []);
});

ipcMain.handle('delete-history-item', (_event, id: string): void => {
  const history = store.get('history') as TranslationHistory[] || [];
  const filtered = history.filter(item => item.id !== id);
  store.set('history', filtered);
});

// Batch translation IPC handlers
ipcMain.handle('select-markdown-files', async (): Promise<string[]> => {
  if (!mainWindow) throw new Error('Main window not available');
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('select-markdown-folder', async (): Promise<string[]> => {
  if (!mainWindow) throw new Error('Main window not available');
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return [];
  }

  const processor = new BatchProcessor({} as TranslationConfig);
  return processor.scanDirectory(result.filePaths[0]);
});

ipcMain.handle('select-output-directory', async (): Promise<string | null> => {
  if (!mainWindow) throw new Error('Main window not available');
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('batch-translate', async (
  event,
  files: string[],
  outputDir: string,
  targetLanguage: string
): Promise<void> => {
  const config = store.get('config') as TranslationConfig;

  if (!config || !config.apiKey) {
    throw new Error('API configuration not found. Please configure your API key in settings.');
  }

  const processor = new BatchProcessor(config);
  
  await processor.processFiles({
    files,
    outputDir,
    targetLanguage,
    config,
    onProgress: (progress: BatchTranslationProgress) => {
      event.sender.send('batch-progress', progress);
    },
  });
});

// 分块翻译 IPC handler
ipcMain.handle('translate-chunked', async (
  event,
  request: ChunkedTranslationRequest
): Promise<{ text: string; sourceLang?: string }> => {
  const config = store.get('config') as TranslationConfig;

  if (!config || !config.apiKey) {
    throw new Error('API configuration not found. Please configure your API key in settings.');
  }

  const engine = new ChunkedTranslationEngine(config);
  
  const result = await engine.translateChunked(
    request,
    (progress: TranslationProgress) => {
      event.sender.send('translation-progress', progress);
    }
  );

  return {
    text: result.text,
    sourceLang: result.sourceLang,
  };
});

// 加载术语表 IPC handler
ipcMain.handle('load-glossary', async (_event, glossaryPath: string): Promise<Record<string, string>> => {
  return loadGlossary(glossaryPath);
});
