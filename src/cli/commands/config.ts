import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, saveConfig, ConfigLoader } from '../../core';

interface ConfigOptions {
  set?: string;
  get?: string;
  list?: boolean;
  init?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  try {
    if (options.init) {
      await initConfig();
      return;
    }

    if (options.set) {
      await setConfigValue(options.set);
      return;
    }

    if (options.get) {
      await getConfigValue(options.get);
      return;
    }

    if (options.list) {
      await listConfig();
      return;
    }

    // Default: show help
    console.log('Usage:');
    console.log('  translamate config --init              Initialize config file');
    console.log('  translamate config --set apiKey=xxx    Set config value');
    console.log('  translamate config --get apiKey        Get config value');
    console.log('  translamate config --list              List all config');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function initConfig(): Promise<void> {
  const configPath = path.join(process.cwd(), 'translamate.json');
  
  if (fs.existsSync(configPath)) {
    console.log('Config file already exists:', configPath);
    return;
  }

  const defaultConfig = ConfigLoader.createDefault();
  saveConfig(defaultConfig, configPath);
  
  console.log('Created config file:', configPath);
  console.log('\nPlease edit the file and add your API key.');
}

async function setConfigValue(setOption: string): Promise<void> {
  const [key, value] = setOption.split('=');
  
  if (!key || value === undefined) {
    throw new Error('Invalid format. Use: --set key=value');
  }

  const config = loadConfig();
  const configPath = path.join(process.cwd(), 'translamate.json');
  
  // Update config
  (config as unknown as Record<string, unknown>)[key] = parseValue(value);
  
  saveConfig(config, configPath);
  console.log(`Set ${key} = ${value}`);
}

async function getConfigValue(key: string): Promise<void> {
  const config = loadConfig();
  const value = (config as unknown as Record<string, unknown>)[key];
  
  if (value === undefined) {
    console.log(`${key}: not set`);
  } else {
    console.log(`${key}: ${key === 'apiKey' ? maskApiKey(String(value)) : value}`);
  }
}

async function listConfig(): Promise<void> {
  const config = loadConfig();
  
  console.log('Current configuration:\n');
  console.log(`  apiKey:     ${maskApiKey(config.apiKey) || '(not set)'}`);
  console.log(`  baseURL:    ${config.baseURL}`);
  console.log(`  model:      ${config.model}`);
  console.log(`  maxTokens:  ${config.maxTokens}`);
  console.log(`  temperature: ${config.temperature}`);
  
  console.log('\nConfig file locations (in order of priority):');
  console.log('  1. ./translamate.json (current directory)');
  console.log('  2. ~/.translamate.json (home directory)');
  console.log('  3. Environment variables (TRANSLAMATE_*)');
}

function parseValue(value: string): string | number {
  // Try to parse as number
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  if (/^\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  return value;
}

function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return apiKey;
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
}
