# Quick Start Guide

Get TranslaMate up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher (comes with Node.js)
- An API key from DeepSeek, OpenAI, or any OpenAI-compatible provider

## Installation

### 1. Clone and Install

```bash
cd TranslaMate
npm install
```

### 2. Start Development Mode

```bash
npm run dev
```

This will:
- Start the Vite dev server
- Launch Electron
- Open the application window

## First Time Setup

### 1. Open Settings

Click the Settings icon in the sidebar.

### 2. Configure API

Fill in the required fields:

**Required:**
- **API Key**: Your API key from your provider

**Optional (have defaults):**
- **API Base URL**: `https://api.deepseek.com` (for DeepSeek)
- **Model Name**: `deepseek-chat`
- **Max Tokens**: `512`
- **Temperature**: `0.7`

Click "Save Settings" when done.

### 3. Start Translating!

1. Enter text in the left panel
2. Select target language
3. Click "Translate" or press `Ctrl/Cmd + Enter`

## Getting an API Key

### DeepSeek (Recommended - Affordable & Fast)

1. Go to [https://platform.deepseek.com](https://platform.deepseek.com)
2. Sign up for free
3. Navigate to "API Keys"
4. Create a new key
5. Copy and paste into TranslaMate settings

**Pricing**: ~¥1 per 1M tokens (very affordable!)

### OpenAI

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy and paste into TranslaMate settings

**Pricing**: Varies by model (GPT-4, GPT-3.5, etc.)

## Building for Production

### Windows

```bash
npm run build:win
```

Output: `out/TranslaMate Setup X.Y.Z.exe`

### macOS

```bash
npm run build:mac
```

Output: `out/TranslaMate-X.Y.Z.dmg` or `TranslaMate-X.Y.Z-arm64.dmg`

### Both Platforms

```bash
npm run build:all
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + T` | Show/Hide window |
| `Ctrl/Cmd + Enter` | Translate |
| `Esc` | Close window |

## Troubleshooting

### "API configuration not found"

Go to Settings and enter your API key.

### Translation doesn't work

1. Check your API key is correct
2. Verify the base URL matches your provider
3. Check you have available credits/quota

### App won't start

1. Delete `node_modules` and run `npm install` again
2. Check Node.js version: `node --version` (should be 18+)
3. Clear cache: Delete `dist/` folder

### Build fails

```bash
# Clean and rebuild
rm -rf dist/ out/ node_modules/
npm install
npm run build:all
```

## Next Steps

- Read the full [Documentation](../README.md)
- Check [Development Guide](DEVELOPMENT.md) if you want to contribute
- Review [API Documentation](API.md) for technical details

## Support

- GitHub Issues: [Report a bug](https://github.com/username/translamate/issues)
- GitHub Discussions: [Ask a question](https://github.com/username/translamate/discussions)

---

Happy translating! 🌐
