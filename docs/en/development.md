# Development Guide

This document provides information for developers who want to contribute to or modify TranslaMate.

## Project Structure

```
TranslaMate/
├── src/
│   ├── core/              # Core translation logic (platform-agnostic)
│   │   ├── translation/   # Translation engine
│   │   ├── batch/         # Batch processing
│   │   ├── config/        # Configuration management
│   │   └── types.ts       # Core type definitions
│   ├── cli/               # Command-line interface
│   │   ├── commands/      # CLI commands
│   │   └── index.ts       # CLI entry point
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── preload.ts     # Preload script
│   │   └── store.ts       # Electron store configuration
│   └── renderer/          # React frontend
│       ├── components/    # React components
│       ├── store/         # Zustand state management
│       ├── App.tsx        # Main app component
│       ├── main.tsx       # Entry point
│       └── index.css      # Global styles
├── scripts/               # Build and release scripts
├── docs/                  # Documentation
└── build/                 # Build resources
```

For detailed architecture information, see [architecture.md](architecture.md).

## Technology Stack

- **Framework**: Electron
- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **API Client**: OpenAI SDK

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Workflow

```bash
# Run in development mode
npm run electron:dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Architecture

### Main Process (Electron)

The main process handles:
- Window management
- IPC (Inter-Process Communication)
- API calls to translation services
- Local storage via electron-store
- Global shortcuts

### Renderer Process (React)

The renderer process handles:
- UI rendering
- User interactions
- State management (Zustand)
- Communication with main process via preload script

### Communication

The main and renderer processes communicate through IPC (Inter-Process Communication):

```typescript
// Renderer (React)
const result = await window.electronAPI.translate({ text: 'Hello', targetLanguage: 'zh' });

// Main (Electron)
ipcMain.handle('translate', async (event, request) => {
  // Handle translation
  return result;
});
```

## Adding New Features

### Adding a New Language

Edit `src/shared/types.ts`:

```typescript
export const SUPPORTED_LANGUAGES: Language[] = [
  // Add new language
  { code: 'fr', name: 'French', nativeName: 'Français' },
];
```

### Adding a New API Provider

The translation service in `src/main/services/translation.ts` uses the OpenAI SDK. To add support for a new provider:

1. Ensure the provider is OpenAI-compatible
2. Update the documentation with the provider's baseURL and model names
3. No code changes needed - just configure in the UI

### Modifying the UI

UI components are located in `src/renderer/components/`:

- `TranslateView.tsx` - Main translation interface
- `HistoryView.tsx` - Translation history
- `SettingsView.tsx` - Settings page
- `Sidebar.tsx` - Navigation sidebar
- `ErrorAlert.tsx` - Error notifications

Styles use Tailwind CSS utility classes. Global styles are in `src/renderer/index.css`.

## Testing

### Test Scripts
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run performance tests (requires API key)
npm run test:performance
```

### Unit Tests
The unit test suite (`test/unit.chunking-algorithm.test.ts`) validates:
- Chunking algorithm for text segmentation
- Token estimation accuracy for CJK and English text
- Sentence splitting for Chinese and English
- Content preservation through chunking

**Run unit tests:**
```bash
npm run test:unit
```

**Expected Results:**
```
════════════════════════════════════════════════════════════
  Chunking Algorithm Tests
═════════════════════════════════════════════════════════════

  Empty text should return original ... ✓ (0ms)
  Short text should not chunk ... ✓ (0ms)
  Long text should be chunked ... ✓ (1ms)
  Each chunk should be within token limit ... ✓ (1ms)
  All content should be preserved ... ✓ (0ms)
  CJK characters should count as 1 token ... ✓ (0ms)
  English should count by characters ... ✓ (0ms)
  Should split Chinese sentences correctly ... ✓ (0ms)
  Should split English sentences correctly ... ✓ (0ms)

────────────────────────────────────────────────────────────
  Results: 9 passed, 0 failed
────────────────────────────────────────────────────────────
```

### Performance Tests
Performance tests (`test/performance.chunked-engine.test.ts`) measure:
- Serial translation performance (parallelChunks=1)
- Parallel translation performance (parallelChunks=2,3,5)
- Speedup ratios and time savings
- Translation quality validation

**Run performance tests:**
```bash
npm run test:performance
```

**Note:** Requires a valid API key configuration.

### Translation Verification Tests
Translation tests verify the CLI can translate documents to multiple languages:
- English (`en`)
- Traditional Chinese (`zh-TW`)
- Japanese (`ja`)

**Run translation tests:**
```bash
# Test individual languages
npm run test:translate:en
npm run test:translate:zh-tw
npm run test:translate:ja

# Test all languages
npm run test:translate:all
```

**Note:** These tests require a configured API key.

### Test Files
- `test/unit.chunking-algorithm.test.ts` - Unit tests for chunking algorithm
- `test/performance.chunked-engine.test.ts` - Performance benchmarks
- `test/integration.deepseek-api.test.ts` - Integration tests with real API
- `test/data.ai-article.md` - Test document for translation


## Building

### Build Scripts

We provide convenient build scripts in the `scripts/` directory:

```bash
# Full build (clean + CLI + Electron + verify)
node scripts/build.js full

# Build CLI only
node scripts/build.js cli

# Build Electron only
node scripts/build.js electron

# Build for specific platform
node scripts/build.js win
node scripts/build.js mac
node scripts/build.js linux

# Build all platforms
node scripts/build.js all

# Clean build directories
node scripts/build.js clean

# Verify build outputs
node scripts/build.js verify
```

### NPM Scripts

```bash
# Build CLI
npm run build:cli

# Build Electron app
npm run build

# Build for current platform
npm run electron:build

# Build for specific platforms
npm run build:win
npm run build:mac
npm run build:linux
npm run build:all
```

### Build Outputs

- **CLI**: `dist/cli/`
- **Electron**: `dist/main/`, `dist/renderer/`
- **Packages**: `release/` (electron-builder output)

### CLI Usage After Build

```bash
# Link CLI globally
npm link

# Use CLI
translamate translate "Hello" --to zh-CN
translamate batch ./docs --to zh-CN

# Or use without linking
node dist/cli/index.js translate "Hello" --to zh-CN
```

## Debugging

### Main Process

In development, DevTools is automatically opened. To manually open:

```typescript
mainWindow.webContents.openDevTools();
```

### Renderer Process

Use the React DevTools browser extension or built-in DevTools.

### Logging

Use `console.log()` for debugging. In production, consider using a logging library like `electron-log`.

## Release Process

### Version Management

```bash
# Bump patch version (0.0.1 -> 0.0.2)
npm run version:patch

# Bump minor version (0.1.0 -> 0.2.0)
npm run version:minor

# Bump major version (1.0.0 -> 2.0.0)
npm run version:major
```

### Release Script

```bash
# Validate release readiness
node scripts/release.js validate

# Update CHANGELOG.md
node scripts/release.js changelog

# Create git tag
node scripts/release.js tag

# Full release process
node scripts/release.js full
```

### Manual Release Steps

1. **Update version**:
   ```bash
   npm version patch  # or minor/major
   ```

2. **Update CHANGELOG.md** with new version and changes

3. **Build and test**:
   ```bash
   node scripts/build.js full
   ```

4. **Commit and tag**:
   ```bash
   git add -A
   git commit -m "chore(release): v$(node -p "require('./package.json').version")"
   git tag -a "v$(node -p "require('./package.json').version")" -m "Release v$(node -p "require('./package.json').version")"
   ```

5. **Push**:
   ```bash
   git push origin main
   git push origin --tags
   ```

## Common Issues

### Module Not Found

Ensure you've run `npm install` and restarted the dev server.

### IPC Errors

Verify that:
1. The handler is registered in `src/main/index.ts`
2. The API is exposed in `src/main/preload.ts`
3. Types are defined in `src/shared/types.ts`

### Build Errors

Clear the build directories:

```bash
node scripts/build.js clean
npm run build:all
```

### TypeScript Errors

Run type checking to identify issues:

```bash
npm run typecheck
```

## Contributing

Please see [contributing.md](contributing.md) for contribution guidelines.

## License

Apache License 2.0 - see [LICENSE](../../LICENSE) for details.
