import { useStore } from '../store/useStore';
import { SUPPORTED_LANGUAGES, Language } from '@shared/types';
import { ArrowRightLeft, X, Send, Copy, Check, FileText, Settings2 } from 'lucide-react';
import { useState } from 'react';

export default function TranslateView() {
  const {
    sourceText,
    translatedText,
    sourceLanguage,
    targetLanguage,
    isTranslating,
    translationProgress,
    useChunkedTranslation,
    glossary,
    setSourceText,
    setSourceLanguage,
    setTargetLanguage,
    translate,
    swapLanguages,
    clearText,
    setUseChunkedTranslation,
    loadGlossary,
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      translate();
    }
  };

  const handleLoadGlossary = async () => {
    // 使用 Electron 的文件选择对话框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const path = (file as any).path;
        await loadGlossary(path);
      }
    };
    input.click();
  };

  // 计算进度百分比
  const progressPercentage = translationProgress?.totalChunks
    ? Math.round((translationProgress.currentChunk / translationProgress.totalChunks) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Translate</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Translate text between languages with AI
        </p>
      </div>

      {/* Options Bar */}
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <Settings2 size={16} />
          Options
        </button>
        
        {glossary && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <FileText size={14} />
            Glossary loaded ({Object.keys(glossary).length} terms)
          </span>
        )}
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useChunkedTranslation}
                onChange={(e) => setUseChunkedTranslation(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Force chunked translation (for long texts)
              </span>
            </label>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadGlossary}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <FileText size={14} />
                Load Glossary
              </button>
              {glossary && (
                <button
                  onClick={() => useStore.getState().setGlossary(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Source */}
        <div className="flex-1 flex flex-col card">
          <div className="flex items-center justify-between mb-3">
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="input-field !py-1.5 !px-3 text-sm font-medium"
            >
              {SUPPORTED_LANGUAGES.map((lang: Language) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            {sourceText && (
              <button
                onClick={() => handleCopy(sourceText)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Copy"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            )}
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter text to translate..."
            className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent dark:text-gray-100 placeholder-gray-400"
          />
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{sourceText.length} characters</span>
            {sourceText && (
              <button
                onClick={clearText}
                className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={swapLanguages}
          disabled={sourceLanguage === 'auto' || isTranslating}
          className="self-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          title="Swap languages"
        >
          <ArrowRightLeft size={20} className="text-primary-600" />
        </button>

        {/* Target */}
        <div className="flex-1 flex flex-col card">
          <div className="flex items-center justify-between mb-3">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="input-field !py-1.5 !px-3 text-sm font-medium"
            >
              {SUPPORTED_LANGUAGES.filter((lang: Language) => lang.code !== 'auto').map((lang: Language) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            {translatedText && (
              <button
                onClick={() => handleCopy(translatedText)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Copy"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            )}
          </div>
          <div className="flex-1 w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-y-auto dark:text-gray-100">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="spinner"></div>
                
                {/* Progress Bar */}
                {translationProgress && (
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{translationProgress.stage}</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {translationProgress.message}
                    </p>
                    {translationProgress.totalChunks > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Chunk {translationProgress.currentChunk} of {translationProgress.totalChunks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : translatedText ? (
              <p className="whitespace-pre-wrap">{translatedText}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">Translation will appear here</p>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {translatedText && <span>{translatedText.length} characters</span>}
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={translate}
          disabled={!sourceText.trim() || isTranslating}
          className="btn-primary px-8 py-3 text-lg font-medium flex items-center gap-2 shadow-lg"
        >
          {isTranslating ? (
            <>
              <div className="spinner" style={{ width: 20, height: 20 }}></div>
              Translating...
            </>
          ) : (
            <>
              <Send size={20} />
              Translate
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Press {window.electronAPI.platform === 'darwin' ? '⌘' : 'Ctrl'} + Enter to translate
      </p>
    </div>
  );
}
