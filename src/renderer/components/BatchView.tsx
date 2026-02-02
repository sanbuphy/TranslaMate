import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SUPPORTED_LANGUAGES, Language } from '@shared/types';
import {
  File,
  Folder,
  FolderOpen,
  Play,
  X,
  Check,
  FileText,
  Trash2,
} from 'lucide-react';

interface SelectedFile {
  path: string;
  name: string;
}

export default function BatchView() {
  const { targetLanguage, setTargetLanguage, config } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [outputDir, setOutputDir] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    currentFile?: string;
  } | null>(null);

  useEffect(() => {
    const cleanup = window.electronAPI.onBatchProgress((progressUpdate) => {
      setProgress(progressUpdate);
    });

    return cleanup;
  }, []);

  const handleSelectFiles = async () => {
    const files = await window.electronAPI.selectMarkdownFiles();
    if (files.length > 0) {
      const fileObjects = files.map((path: string) => ({
        path,
        name: path.split(/[/\\]/).pop() || path,
      }));
      setSelectedFiles(fileObjects);
    }
  };

  const handleSelectFolder = async () => {
    const files = await window.electronAPI.selectMarkdownFolder();
    if (files.length > 0) {
      const fileObjects = files.map((path: string) => ({
        path,
        name: path.split(/[/\\]/).pop() || path,
      }));
      setSelectedFiles(fileObjects);
    }
  };

  const handleSelectOutputDir = async () => {
    const dir = await window.electronAPI.selectOutputDirectory();
    if (dir) {
      setOutputDir(dir);
    }
  };

  const handleRemoveFile = (path: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.path !== path));
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setProgress(null);
  };

  const handleTranslate = async () => {
    if (!config?.apiKey) {
      alert('Please configure your API key in settings first.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select files to translate.');
      return;
    }

    if (!outputDir) {
      alert('Please select an output directory.');
      return;
    }

    setIsTranslating(true);
    setProgress({
      total: selectedFiles.length,
      completed: 0,
      failed: 0,
    });

    try {
      await window.electronAPI.batchTranslate(
        selectedFiles.map((f) => f.path),
        outputDir,
        targetLanguage
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Batch Translation</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Translate multiple Markdown files at once
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Target Language */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={isTranslating}
            className="input-field"
          >
            {SUPPORTED_LANGUAGES.filter((lang: Language) => lang.code !== 'auto').map((lang: Language) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* File Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Select Files
          </h3>
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleSelectFiles}
              disabled={isTranslating}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              <File size={18} />
              Select Files
            </button>
            <button
              onClick={handleSelectFolder}
              disabled={isTranslating}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              <Folder size={18} />
              Select Folder
            </button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleClearFiles}
                  disabled={isTranslating}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear all
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.path)}
                      disabled={isTranslating}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Directory */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Output Directory
          </h3>
          <button
            onClick={handleSelectOutputDir}
            disabled={isTranslating}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {outputDir ? <FolderOpen size={18} /> : <Folder size={18} />}
            {outputDir ? outputDir : 'Select Output Directory'}
          </button>
          {outputDir && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Translated files will be saved to: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{outputDir}</code>
            </p>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Translation Progress
            </h3>
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {progress.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {progress.completed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {progress.failed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                </div>
              </div>

              {/* Current File */}
              {progress.currentFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="spinner" style={{ width: 20, height: 20 }}></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    Translating: {progress.currentFile}
                  </p>
                </div>
              )}

              {/* Completion Status */}
              {!isTranslating && progress.completed + progress.failed === progress.total && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Check size={20} className="text-green-600 dark:text-green-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Translation completed! {progress.completed} succeeded, {progress.failed} failed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Translate Button */}
      <div className="mt-6">
        <button
          onClick={handleTranslate}
          disabled={isTranslating || selectedFiles.length === 0 || !outputDir}
          className="btn-primary w-full py-3 text-lg font-medium flex items-center justify-center gap-2 shadow-lg"
        >
          {isTranslating ? (
            <>
              <div className="spinner" style={{ width: 20, height: 20 }}></div>
              Translating...
            </>
          ) : (
            <>
              <Play size={20} />
              Start Translation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
