import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsView() {
  const { config, setConfig } = useStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (localConfig) {
      await setConfig(localConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!localConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your API settings
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="input-field pr-12"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never sent anywhere except the API endpoint.
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={localConfig.baseURL}
              onChange={(e) => setLocalConfig({ ...localConfig, baseURL: e.target.value })}
              placeholder="https://api.deepseek.com"
              className="input-field"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The base URL for the OpenAI-compatible API. Examples:
              <br />
              • DeepSeek: https://api.deepseek.com
              <br />
              • OpenAI: https://api.openai.com/v1
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model Name
            </label>
            <input
              type="text"
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder="deepseek-chat"
              className="input-field"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The model identifier. Examples: deepseek-chat, deepseek-reasoner, gpt-4, gpt-3.5-turbo
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              value={localConfig.maxTokens}
              onChange={(e) => setLocalConfig({ ...localConfig, maxTokens: parseInt(e.target.value) || 512 })}
              className="input-field"
              min={1}
              max={4096}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Maximum number of tokens in the response (1-4096)
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                className="flex-1"
                min={0}
                max={2}
                step={0.1}
              />
              <span className="w-16 text-center font-mono text-sm">
                {localConfig.temperature.toFixed(1)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Controls randomness: Lower values (0.0-0.3) = more focused, Higher values (0.7-1.0) = more creative
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <span className="text-green-200">✓ Saved!</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Getting an API Key
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">DeepSeek:</strong>
              <p>Visit <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">platform.deepseek.com</a> to get your API key.</p>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">OpenAI:</strong>
              <p>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">platform.openai.com</a> to get your API key.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
