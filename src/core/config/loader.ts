import * as fs from 'fs';
import * as path from 'path';
import type { TranslationConfig } from '../types';

export interface ConfigFile {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ConfigLoader {
  private static readonly CONFIG_FILE_NAME = 'translamate.json';

  static load(configPath?: string): TranslationConfig {
    // Priority: explicit path > cwd > home directory
    const paths = [
      configPath,
      path.join(process.cwd(), this.CONFIG_FILE_NAME),
      path.join(this.getHomeDir(), `.${this.CONFIG_FILE_NAME}`),
    ].filter(Boolean) as string[];

    for (const filePath of paths) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const config = JSON.parse(content) as ConfigFile;
          return this.mergeWithDefaults(config);
        } catch (error) {
          console.warn(`Warning: Failed to load config from ${filePath}`);
        }
      }
    }

    // Try environment variables
    return this.loadFromEnv();
  }

  static save(config: TranslationConfig, savePath?: string): void {
    const targetPath = savePath || path.join(process.cwd(), this.CONFIG_FILE_NAME);
    const configToSave: ConfigFile = {
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    };
    fs.writeFileSync(targetPath, JSON.stringify(configToSave, null, 2), 'utf-8');
  }

  static createDefault(): TranslationConfig {
    return {
      apiKey: '',
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      maxTokens: 512,
      temperature: 0.7,
    };
  }

  private static mergeWithDefaults(config: ConfigFile): TranslationConfig {
    return {
      apiKey: config.apiKey || process.env.TRANSLAMATE_API_KEY || '',
      baseURL: config.baseURL || 'https://api.deepseek.com',
      model: config.model || 'deepseek-chat',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature || 0.7,
    };
  }

  private static loadFromEnv(): TranslationConfig {
    return {
      apiKey: process.env.TRANSLAMATE_API_KEY || '',
      baseURL: process.env.TRANSLAMATE_BASE_URL || 'https://api.deepseek.com',
      model: process.env.TRANSLAMATE_MODEL || 'deepseek-chat',
      maxTokens: parseInt(process.env.TRANSLAMATE_MAX_TOKENS || '512', 10),
      temperature: parseFloat(process.env.TRANSLAMATE_TEMPERATURE || '0.7'),
    };
  }

  private static getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || process.cwd();
  }
}

export function loadConfig(configPath?: string): TranslationConfig {
  return ConfigLoader.load(configPath);
}

export function saveConfig(config: TranslationConfig, savePath?: string): void {
  ConfigLoader.save(config, savePath);
}
