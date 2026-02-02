import { useStore } from '../store/useStore';
import { Trash2, Copy, Clock } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@shared/types';
import { useState } from 'react';

export default function HistoryView() {
  const { history, clearHistory, deleteHistoryItem } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">History</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your translation history
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Clock size={64} className="mb-4 opacity-50" />
            <p className="text-lg">No translation history yet</p>
            <p className="text-sm mt-2">Start translating to build your history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    {formatDate(item.timestamp)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                      {getLanguageName(item.sourceLanguage || 'auto')} → {getLanguageName(item.targetLanguage)}
                    </span>
                    <button
                      onClick={() => handleCopy(item.translatedText)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                      title="Copy translation"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Original:</p>
                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      {item.sourceText}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Translation:</p>
                    <p className="text-gray-900 dark:text-gray-100 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
