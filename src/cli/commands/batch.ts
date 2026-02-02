import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, loadGlossary } from '../../core/config/loader';
import { BatchTranslator, BatchFile } from '../../core/translation/batch';

interface BatchOptions {
  to: string;
  output: string;
  exclude: string;
  config?: string;
  glossary?: string;
  parallelFiles?: string;
  parallelChunks?: string;
  maxTokensPerChunk?: string;
}

export async function batchCommand(input: string, options: BatchOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);

    if (!config.apiKey) {
      console.error('Error: API key not configured. Please set it via:');
      console.error('  - Config file: translamate.json');
      console.error('  - Environment variable: TRANSLAMATE_API_KEY');
      process.exit(1);
    }

    // Load glossary if provided
    let glossary: Record<string, string> | undefined;
    if (options.glossary) {
      glossary = loadGlossary(options.glossary);
      console.log(`✓ Loaded glossary: ${Object.keys(glossary).length} terms`);
    }

    // Collect files
    const files = collectFiles(input, options.exclude.split(','));

    if (files.length === 0) {
      console.error('Error: No files found to translate');
      process.exit(1);
    }

    console.log(`Found ${files.length} files to translate`);
    console.log(`Target language: ${options.to}`);
    console.log(`Parallel files: ${options.parallelFiles || 2}`);
    console.log(`Parallel chunks: ${options.parallelChunks || 3}`);
    console.log('');

    // Create output directory
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true });
    }

    // Prepare batch files
    const batchFiles: BatchFile[] = files.map(filePath => ({
      path: filePath,
      content: fs.readFileSync(filePath, 'utf-8'),
    }));

    // Create translator
    const translator = new BatchTranslator(config);

    // Translate with progress
    const startTime = Date.now();
    let lastCompleted = 0;

    const results = await translator.translateBatch(
      batchFiles,
      {
        targetLanguage: options.to,
        glossary,
        maxTokensPerChunk: parseInt(options.maxTokensPerChunk || '1000', 10),
        parallelChunks: parseInt(options.parallelChunks || '3', 10),
        parallelFiles: parseInt(options.parallelFiles || '2', 10),
        outputDir: options.output,
      },
      (completed, total, currentFile) => {
        // Only show progress when it changes
        if (completed !== lastCompleted) {
          const percentage = Math.round((completed / total) * 100);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          process.stdout.write(`\r[${completed}/${total}] ${percentage}% | ${elapsed}s | ${path.basename(currentFile)}`);
          lastCompleted = completed;
        }
      }
    );

    console.log('\n');

    // Save results
    let successCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.success) {
        const relativePath = path.relative(input, result.path);
        const outputPath = path.join(options.output, relativePath);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, result.translatedContent, 'utf-8');
        successCount++;
      } else {
        console.error(`\n✗ Failed: ${result.path}`);
        console.error(`  Error: ${result.error}`);
        errorCount++;
      }
    }

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n========================================');
    console.log('Translation Complete!');
    console.log('========================================');
    console.log(`Total files: ${files.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Time: ${totalTime}s`);
    console.log(`Output: ${path.resolve(options.output)}`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

function collectFiles(input: string, excludeDirs: string[]): string[] {
  const files: string[] = [];

  // Check if input is a file pattern
  if (input.includes('*')) {
    // Simple glob pattern support
    const dir = path.dirname(input);
    const pattern = path.basename(input);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (regex.test(entry)) {
          const fullPath = path.join(dir, entry);
          if (fs.statSync(fullPath).isFile()) {
            files.push(fullPath);
          }
        }
      }
    }
  } else if (fs.statSync(input).isDirectory()) {
    // Recursively collect files from directory
    const traverse = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            traverse(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.txt', '.md', '.json'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    traverse(input);
  } else {
    // Single file
    files.push(input);
  }

  return files;
}
