#!/usr/bin/env node
import { program } from 'commander';
import { translateCommand } from './commands/translate';
import { batchCommand } from './commands/batch';
import { configCommand } from './commands/config';

const version = '0.1.0';

program
  .name('translamate')
  .description('AI-powered translation CLI')
  .version(version);

program
  .command('translate')
  .alias('t')
  .description('Translate text or file')
  .argument('<input>', 'Text to translate or file path')
  .option('-t, --to <lang>', 'Target language', 'zh-CN')
  .option('-f, --from <lang>', 'Source language', 'auto')
  .option('-o, --output <path>', 'Output file path (for file translation)')
  .option('-c, --config <path>', 'Config file path')
  .action(translateCommand);

program
  .command('batch')
  .alias('b')
  .description('Batch translate files in directory')
  .argument('<input>', 'Input directory or file pattern')
  .option('-t, --to <lang>', 'Target language', 'zh-CN')
  .option('-o, --output <dir>', 'Output directory', './translated')
  .option('-e, --exclude <dirs>', 'Exclude directories (comma-separated)', 'node_modules,.git')
  .option('-c, --config <path>', 'Config file path')
  .action(batchCommand);

program
  .command('config')
  .description('Manage configuration')
  .option('-s, --set <key=value>', 'Set config value')
  .option('-g, --get <key>', 'Get config value')
  .option('-l, --list', 'List all config')
  .option('-i, --init', 'Initialize config file')
  .action(configCommand);

program.parse();
