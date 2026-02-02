import * as path from 'path';
import { BatchProcessor, loadConfig, type TranslationConfig } from '../../core';

interface BatchOptions {
  to: string;
  output: string;
  exclude: string;
  config?: string;
}

export async function batchCommand(input: string, options: BatchOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    validateConfig(config);

    const processor = new BatchProcessor(config);

    // Scan for files
    console.log(`Scanning: ${input}`);
    const excludeDirs = options.exclude.split(',').map(s => s.trim());
    const files = await processor.scanDirectory(input, excludeDirs);

    if (files.length === 0) {
      console.log('No Markdown files found.');
      return;
    }

    console.log(`Found ${files.length} file(s) to translate\n`);

    // Process files
    let lastProgress = '';
    
    await processor.processFiles({
      files,
      outputDir: options.output,
      targetLanguage: options.to,
      config,
      onProgress: (progress) => {
        const line = `Progress: ${progress.completed}/${progress.total} completed` +
          (progress.failed > 0 ? `, ${progress.failed} failed` : '') +
          (progress.currentFile ? ` | Current: ${progress.currentFile}` : '');
        
        // Clear previous line and print new progress
        if (lastProgress) {
          process.stdout.write('\r' + ' '.repeat(lastProgress.length) + '\r');
        }
        process.stdout.write(line);
        lastProgress = line;
      },
      onMessage: (message) => {
        // Print messages on new lines
        if (lastProgress) {
          process.stdout.write('\n');
          lastProgress = '';
        }
        console.log(message);
      },
    });

    // Final newline
    if (lastProgress) {
      process.stdout.write('\n');
    }
    
    console.log(`\nBatch translation completed!`);
    console.log(`Output directory: ${path.resolve(options.output)}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
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
