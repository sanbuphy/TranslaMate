import * as fs from 'fs';
import * as path from 'path';
import type { TranslationConfig } from '../types';

export interface ConfigFile {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  // 分块翻译配置
  chunkedTranslation?: {
    enabled?: boolean;
    maxTokensPerChunk?: number;
    chunkOverlap?: number;
    parallelChunks?: number;
    parallelDocs?: number;
    useChunkedThreshold?: number;
  };
  // 术语表配置
  glossary?: {
    path?: string;
    autoLoad?: boolean;
    terms?: Record<string, string>;
  };
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
      chunkedTranslation: config.chunkedTranslation,
      glossary: config.glossary,
    };
    fs.writeFileSync(targetPath, JSON.stringify(configToSave, null, 2), 'utf-8');
  }

  static createDefault(): TranslationConfig {
    return {
      apiKey: '',
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      maxTokens: 512,
      temperature: 0.3,
      chunkedTranslation: {
        enabled: false,
        maxTokensPerChunk: 1000,
        chunkOverlap: 100,
        parallelChunks: 3,
        parallelDocs: 2,
        useChunkedThreshold: 1000,
      },
      glossary: {
        autoLoad: false,
      },
    };
  }

  private static mergeWithDefaults(config: ConfigFile): TranslationConfig {
    return {
      apiKey: config.apiKey || process.env.TRANSLAMATE_API_KEY || '',
      baseURL: config.baseURL || process.env.TRANSLAMATE_BASE_URL || 'https://api.deepseek.com',
      model: config.model || process.env.TRANSLAMATE_MODEL || 'deepseek-chat',
      maxTokens: config.maxTokens || parseInt(process.env.TRANSLAMATE_MAX_TOKENS || '512', 10),
      temperature: config.temperature || parseFloat(process.env.TRANSLAMATE_TEMPERATURE || '0.3'),
      chunkedTranslation: {
        enabled: config.chunkedTranslation?.enabled ?? false,
        maxTokensPerChunk: config.chunkedTranslation?.maxTokensPerChunk ?? 1000,
        chunkOverlap: config.chunkedTranslation?.chunkOverlap ?? 100,
        parallelChunks: config.chunkedTranslation?.parallelChunks ?? 3,
        parallelDocs: config.chunkedTranslation?.parallelDocs ?? 2,
        useChunkedThreshold: config.chunkedTranslation?.useChunkedThreshold ?? 1000,
      },
      glossary: {
        path: config.glossary?.path || process.env.TRANSLAMATE_GLOSSARY_PATH,
        autoLoad: config.glossary?.autoLoad ?? false,
        terms: config.glossary?.terms,
      },
    };
  }

  private static loadFromEnv(): TranslationConfig {
    return {
      apiKey: process.env.TRANSLAMATE_API_KEY || '',
      baseURL: process.env.TRANSLAMATE_BASE_URL || 'https://api.deepseek.com',
      model: process.env.TRANSLAMATE_MODEL || 'deepseek-chat',
      maxTokens: parseInt(process.env.TRANSLAMATE_MAX_TOKENS || '512', 10),
      temperature: parseFloat(process.env.TRANSLAMATE_TEMPERATURE || '0.3'),
      chunkedTranslation: {
        enabled: process.env.TRANSLAMATE_CHUNKED_ENABLED === 'true',
        maxTokensPerChunk: parseInt(process.env.TRANSLAMATE_MAX_TOKENS_PER_CHUNK || '1000', 10),
        chunkOverlap: parseInt(process.env.TRANSLAMATE_CHUNK_OVERLAP || '100', 10),
        parallelChunks: parseInt(process.env.TRANSLAMATE_PARALLEL_CHUNKS || '3', 10),
        parallelDocs: parseInt(process.env.TRANSLAMATE_PARALLEL_DOCS || '2', 10),
        useChunkedThreshold: parseInt(process.env.TRANSLAMATE_USE_CHUNKED_THRESHOLD || '1000', 10),
      },
      glossary: {
        path: process.env.TRANSLAMATE_GLOSSARY_PATH,
        autoLoad: process.env.TRANSLAMATE_GLOSSARY_AUTO_LOAD === 'true',
      },
    };
  }

  private static getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || process.cwd();
  }

  // 加载术语表
  static loadGlossary(glossaryPath: string): Record<string, string> {
    try {
      const content = fs.readFileSync(glossaryPath, 'utf-8');
      const parsed = JSON.parse(content);
      // 支持两种格式：{ "terms": {...} } 或 { "key": "value" }
      return parsed.terms || parsed;
    } catch (error) {
      throw new Error(
        `Failed to load glossary from ${glossaryPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // 自动加载术语表（如果配置启用）
  static autoLoadGlossary(config: TranslationConfig): Record<string, string> | undefined {
    if (config.glossary?.autoLoad && config.glossary?.path) {
      try {
        return this.loadGlossary(config.glossary.path);
      } catch (error) {
        console.warn(`Warning: Failed to auto-load glossary: ${error}`);
        return undefined;
      }
    }
    return config.glossary?.terms;
  }
}

export function loadConfig(configPath?: string): TranslationConfig {
  return ConfigLoader.load(configPath);
}

export function saveConfig(config: TranslationConfig, savePath?: string): void {
  ConfigLoader.save(config, savePath);
}

export function loadGlossary(glossaryPath: string): Record<string, string> {
  return ConfigLoader.loadGlossary(glossaryPath);
}

export function autoLoadGlossary(config: TranslationConfig): Record<string, string> | undefined {
  return ConfigLoader.autoLoadGlossary(config);
}
