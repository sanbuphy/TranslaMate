# TranslaMate Architecture

This document describes the architecture of TranslaMate, including its layered design, module responsibilities, and data flow.

## Table of Contents

- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Core Module](#core-module)
- [CLI Module](#cli-module)
- [Electron Module](#electron-module)
- [Data Flow](#data-flow)
- [Module Dependencies](#module-dependencies)
- [Adding New Features](#adding-new-features)

---

## Overview

TranslaMate follows a **layered architecture** that separates business logic from platform-specific code. This design allows the same translation engine to be used across multiple interfaces:

- **Desktop Application** (Electron)
- **Command Line Interface** (CLI)
- **Programmatic API** (Node.js library)

### Key Principles

1. **Single Responsibility**: Each layer has a clear, focused responsibility
2. **Dependency Inversion**: Higher layers depend on the core, not vice versa
3. **Platform Agnostic**: Core business logic has no platform dependencies
4. **Testability**: Each layer can be tested independently

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   CLI        │  │  Electron    │  │  Programmatic    │  │
│  │  (commander) │  │   (React)    │  │     API          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
          └─────────────────┼───────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│                      Core Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Translation  │  │    Batch     │  │   Configuration  │  │
│  │   Engine     │  │  Processor   │  │     Loader       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Technologies |
|-------|---------------|--------------|
| **Core** | Business logic, translation algorithms | TypeScript, OpenAI SDK |
| **CLI** | Command-line interface, scripting | Commander.js |
| **Electron** | Desktop GUI, system integration | Electron, React |

---

## Core Module

The core module (`src/core/`) contains all business logic and is completely platform-agnostic.

### Structure

```
core/
├── types.ts              # Shared TypeScript definitions
├── translation/
│   ├── engine.ts         # TranslationEngine class
│   └── index.ts          # Public exports
├── batch/
│   ├── processor.ts      # BatchProcessor class
│   └── index.ts
└── config/
    ├── loader.ts         # ConfigLoader class
    └── index.ts
```

### TranslationEngine

The primary translation service.

```typescript
import { TranslationEngine } from '../core';

const engine = new TranslationEngine({
  apiKey: 'your-api-key',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  maxTokens: 512,
  temperature: 0.7
});

const result = await engine.translate({
  text: 'Hello world',
  targetLanguage: 'zh-CN'
});
```

**Responsibilities:**
- API client management
- Prompt construction
- Error handling
- Response parsing

### BatchProcessor

Handles batch file translation with progress tracking.

```typescript
import { BatchProcessor } from '../core';

const processor = new BatchProcessor(config);

await processor.processFiles({
  files: ['./doc1.md', './doc2.md'],
  outputDir: './translated',
  targetLanguage: 'zh-CN',
  onProgress: (progress) => {
    console.log(`${progress.completed}/${progress.total}`);
  }
});
```

**Responsibilities:**
- File system scanning
- Directory structure preservation
- Progress tracking
- Error recovery

### ConfigLoader

Manages configuration from multiple sources.

**Priority Order:**
1. Explicit config file path
2. `./translamate.json` (current directory)
3. `~/.translamate.json` (home directory)
4. Environment variables (`TRANSLAMATE_*`)

```typescript
import { loadConfig } from '../core';

// Load with priority resolution
const config = loadConfig('./custom-config.json');
```

---

## CLI Module

The CLI module (`src/cli/`) provides a command-line interface using Commander.js.

### Structure

```
cli/
├── index.ts              # CLI entry point
└── commands/
    ├── translate.ts      # translate command
    ├── batch.ts          # batch command
    └── config.ts         # config command
```

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `translate` | Translate text or file | `translamate translate "Hello" --to zh-CN` |
| `batch` | Batch translate directory | `translamate batch ./docs --to ja` |
| `config` | Manage configuration | `translamate config --init` |

### Design Decisions

- **Pure Functions**: Commands are testable functions
- **Error Handling**: Consistent error messages with exit codes
- **Progress Output**: Real-time progress for batch operations

---

## Electron Module

The Electron module (`src/main/`, `src/renderer/`) provides the desktop GUI.

### Structure

```
main/                     # Main process (Node.js)
├── index.ts             # Entry point, IPC handlers
├── preload.ts           # Secure bridge to renderer
└── store.ts             # electron-store configuration

renderer/                 # Renderer process (Browser)
├── components/          # React components
├── store/               # Zustand state management
├── App.tsx              # Root component
└── main.tsx             # Renderer entry
```

### IPC Communication

```
Renderer Process          Main Process
     │                         │
     │  ipcRenderer.invoke()   │
     │ ──────────────────────> │
     │                         │
     │    TranslationEngine    │
     │                         │
     │ <────────────────────── │
     │      return result      │
```

**IPC Channels:**
- `translate`: Single text translation
- `batch-translate`: Batch file translation
- `get-config` / `set-config`: Configuration management
- `get-history` / `add-history`: Translation history

### Design Decisions

- **Thin Main Process**: Main process only handles UI-related concerns (dialogs, shortcuts)
- **Core Delegation**: All business logic delegated to core module
- **State Management**: Zustand for renderer state, electron-store for persistent config

---

## Data Flow

### Single Translation Flow

```
User Input
    │
    ▼
┌─────────────┐
│   CLI /     │
│  Electron   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Config    │
│   Loader    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│Translation  │────>│   OpenAI    │
│   Engine    │<────│    API      │
└──────┬──────┘     └─────────────┘
       │
       ▼
   Result
```

### Batch Translation Flow

```
Input Directory
       │
       ▼
┌─────────────┐
│    Batch    │
│  Processor  │
└──────┬──────┘
       │
       ├──> Scan files
       │
       ├──> For each file:
       │      ├──> Read file
       │      ├──> Translate (Engine)
       │      ├──> Write output
       │      └──> Report progress
       │
       └──> Complete
```

---

## Module Dependencies

### Dependency Rules

```
Allowed:    core <- cli
            core <- electron
            
Forbidden:  cli  -> electron
            electron -> cli
            core -> cli
            core -> electron
```

### Import Examples

**Core module** (no external dependencies):
```typescript
// core/translation/engine.ts
import OpenAI from 'openai';  // Only external library
import type { TranslationConfig } from '../types';
```

**CLI module** (depends on core):
```typescript
// cli/commands/translate.ts
import { TranslationEngine, loadConfig } from '../../core';
import * as fs from 'fs';  // Node.js built-in
```

**Electron module** (depends on core):
```typescript
// main/index.ts
import { TranslationEngine, BatchProcessor } from '../core';
import { ipcMain, dialog } from 'electron';
```

---

## Adding New Features

### Adding a New Translation Provider

1. **Modify Core** (`core/translation/engine.ts`):
   ```typescript
   // Add provider-specific configuration
   interface ProviderConfig {
     type: 'openai' | 'anthropic' | 'custom';
     // ...
   }
   ```

2. **Update Types** (`core/types.ts`):
   ```typescript
   export interface TranslationConfig {
     provider: ProviderConfig;
     // ...
   }
   ```

3. **Test in CLI**:
   ```bash
   npm run cli -- translate "test" --to zh-CN
   ```

4. **Update Electron UI** (if needed):
   - Add provider selector in SettingsView

### Adding a New CLI Command

1. **Create Command** (`cli/commands/newcommand.ts`):
   ```typescript
   export async function newCommand(args: string[], options: any): Promise<void> {
     // Implementation using core modules
   }
   ```

2. **Register in CLI** (`cli/index.ts`):
   ```typescript
   program
     .command('newcmd')
     .action(newCommand);
   ```

3. **Add Tests**:
   ```typescript
   // tests/cli/newcommand.test.ts
   ```

### Adding a New UI Feature

1. **Update Core** (if business logic):
   ```typescript
   // core/newfeature/service.ts
   ```

2. **Add IPC Handler** (`main/index.ts`):
   ```typescript
   ipcMain.handle('new-feature', async (event, args) => {
     // Use core module
   });
   ```

3. **Create Component** (`renderer/components/NewFeature.tsx`):
   ```typescript
   // React component using IPC
   ```

---

## Testing Strategy

### Unit Tests

```typescript
// Core module tests (no mocks needed)
describe('TranslationEngine', () => {
  it('should translate text', async () => {
    const engine = new TranslationEngine(mockConfig);
    const result = await engine.translate(request);
    expect(result.text).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// CLI tests
describe('translate command', () => {
  it('should translate via CLI', async () => {
    const result = await execa('translamate', ['translate', 'hello', '--to', 'zh-CN']);
    expect(result.stdout).toContain('你好');
  });
});
```

### E2E Tests

```typescript
// Electron tests with Playwright
test('translates text in UI', async () => {
  await page.fill('[data-testid="input"]', 'hello');
  await page.click('[data-testid="translate-btn"]');
  await expect(page.locator('[data-testid="output"]')).toContainText('你好');
});
```

---

## Configuration Reference

### File Locations

| Priority | Location | Use Case |
|----------|----------|----------|
| 1 | `--config <path>` | CI/CD, specific project |
| 2 | `./translamate.json` | Project-specific settings |
| 3 | `~/.translamate.json` | User global settings |
| 4 | Environment variables | Secrets, temporary |

### Environment Variables

```bash
TRANSLAMATE_API_KEY=sk-xxx
TRANSLAMATE_BASE_URL=https://api.deepseek.com
TRANSLAMATE_MODEL=deepseek-chat
TRANSLAMATE_MAX_TOKENS=512
TRANSLAMATE_TEMPERATURE=0.7
```

---

## Migration Guide

### From Old Architecture

If you're migrating from the old single-layer architecture:

1. **Move business logic** from `main/services/` to `core/`
2. **Update imports** from `@shared/types` to `core/types`
3. **Refactor to classes** instead of standalone functions
4. **Test in CLI** before updating Electron UI

### Breaking Changes

- `translateText()` function → `TranslationEngine.translate()` method
- `batchTranslateFiles()` function → `BatchProcessor.processFiles()` method
- Types moved from `@shared/types` to `core/types`

---

## Resources

- [Core Module Documentation](./CORE_MODULE.md)
- [CLI Guide](./CLI_GUIDE.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API.md)
