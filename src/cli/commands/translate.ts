import * as fs from 'fs';
import * as path from 'path';
import { TranslationEngine, loadConfig, type TranslationConfig } from '../../core';

interface TranslateOptions {
  to: string;
  from: string;
  output?: string;
  config?: string;
}

export async function translateCommand(input: string, options: TranslateOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    validateConfig(config);

    // Check if input is a file
    const isFile = fs.existsSync(input) && fs.statSync(input).isFile();

    if (isFile) {
      await translateFile(input, options, config);
    } else {
      await translateText(input, options, config);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function translateText(text: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  const engine = new TranslationEngine(config);

  console.log(`Translating to ${options.to}...`);

  const result = await engine.translate({
    text,
    sourceLanguage: options.from === 'auto' ? undefined : options.from,
    targetLanguage: options.to,
  });

  console.log('\n' + result.text);
}

async function translateFile(filePath: string, options: TranslateOptions, config: TranslationConfig): Promise<void> {
  const engine = new TranslationEngine(config);

  console.log(`Reading file: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`Translating to ${options.to}...`);
  const result = await engine.translate({
    text: content,
    sourceLanguage: options.from === 'auto' ? undefined : options.from,
    targetLanguage: options.to,
  });

  // Determine output path
  let outputPath: string;
  if (options.output) {
    outputPath = options.output;
  } else {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    outputPath = path.join(dir, `${baseName}_${options.to}${ext}`);
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Write translated file
  fs.writeFileSync(outputPath, result.text, 'utf-8');
  console.log(`Saved to: ${outputPath}`);
}

function validateConfig(config: TranslationConfig): void {
  if (!config.apiKey) {
    throw new Error(
      'API Key is required. Set it via:\n' +
      '  - Config file: translamate.json\n' +
      '  - Environment: TRANSLAMATE_API_KEY\n' +
      '  - Command: translamate config --set apiKey=xxx'
    );
  }
}
