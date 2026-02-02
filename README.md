<div align="center">

<img src="assets/logo.png" alt="TranslaMate Logo" width="120" height="120">

# TranslaMate

**AI-Powered Desktop / CLI Translation Application**

[![GitHub release](https://img.shields.io/github/v/release/sanbuphy/translamate?style=flat-square)](https://github.com/sanbuphy/translamate/releases)
[![License](https://img.shields.io/github/license/sanbuphy/translamate?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/sanbuphy/translamate/build.yml?style=flat-square)](https://github.com/sanbuphy/translamate/actions)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue?style=flat-square)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)]()
[![Downloads](https://img.shields.io/github/downloads/sanbuphy/translamate/total?style=flat-square)]()

[English](README.md) · [简体中文](README_zh.md)

</div>

---

## What is TranslaMate?

TranslaMate is a **unified translation solution** that combines a modern desktop application with a powerful command-line interface. Access AI-powered translation through **both GUI and CLI** with a consistent, simple experience.

Stop switching between different translation tools. Use one application for everything — whether you're translating a quick sentence or processing thousands of documents.

```bash
# CLI: One-line translation
translamate translate "Hello World" --to zh-CN

# Desktop: Press Ctrl+Shift+T anywhere
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Dual Interface** | Both Desktop GUI and Command Line Interface |
| **Universal API** | Works with any OpenAI-compatible provider |
| **One-Line Setup** | `npm install -g translamate` and you're ready |
| **Batch Processing** | Translate entire folders with one command |
| **10+ Languages** | Auto-detection + manual source selection |
| **Flexible Config** | `.env`, JSON config, or direct parameters |
| **Zero Dependencies** | Single binary, no runtime dependencies |
| **Privacy First** | All data stored locally |

---

## Quick Start

### Desktop App

**macOS (Homebrew):**
```bash
brew install --cask translamate
```

**Windows (Scoop):**
```powershell
scoop install translamate
```

**Or download directly:**
- [Latest Release](https://github.com/sanbuphy/translamate/releases/latest)

### CLI Installation

```bash
# Install globally
npm install -g translamate

# Or use npx (no install)
npx translamate translate "Hello" --to zh-CN
```

### 1. Set Your API Key

```bash
# Create .env file
echo 'TRANSLAMATE_API_KEY=your_key_here' > .env

# Or use config command
translamate config set apiKey your_key_here
```

### 2. Start Translating

**Desktop:**
```
Ctrl/Cmd + Shift + T  →  Show TranslaMate
Ctrl/Cmd + Enter      →  Translate
```

**CLI:**
```bash
# Simple translation
translamate translate "Hello World" --to zh-CN

# File translation
translamate translate document.md --to ja --output document-ja.md

# Batch translation
translamate batch ./docs --to zh-CN --output ./docs-zh
```

---

## Usage Examples

### Desktop Application

```
1. Open TranslaMate (or press Ctrl/Cmd+Shift+T)
2. Enter text in the input box
3. Select target language
4. Press Ctrl/Cmd+Enter to translate
5. View history in the sidebar
```

### Command Line Interface

```bash
# List all commands
translamate --help

# Translate text
translamate translate "Hello, how are you?" --to zh-CN
# Output: 你好，你好吗？

# Translate with specific source
translamate translate "Bonjour" --from fr --to en

# Translate file
translamate translate readme.md --to ja --output readme-ja.md

# Batch translate directory
translamate batch ./content --to de --ext "md,txt,html"

# Check configuration
translamate config list
```

---

## Supported Providers

### AI Translation Providers

| Provider | Base URL | Models | Pricing |
|----------|----------|--------|---------|
| **DeepSeek** (Recommended) | `https://api.deepseek.com` | `deepseek-chat`, `deepseek-reasoner` | ~¥1/1M tokens |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4`, `gpt-3.5-turbo` | $0.50-30/1M tokens |
| **SiliconFlow** | `https://api.siliconflow.cn` | Various open models | Competitive |
| **Local (Ollama)** | `http://localhost:11434/v1` | Any local model | Free |

---

## Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| Auto Detect | `auto` | 한국어 (Korean) | `ko` |
| 简体中文 (Simplified Chinese) | `zh-CN` | العربية (Arabic) | `ar` |
| 繁體中文 (Traditional Chinese) | `zh-TW` | Tiếng Việt (Vietnamese) | `vi` |
| English | `en` | Deutsch (German) | `de` |
| 日本語 (Japanese) | `ja` | Español (Spanish) | `es` |
| Français (French) | `fr` | Português (Portuguese) | `pt` |
| Русский (Russian) | `ru` | Italiano (Italian) | `it` |

---

## Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in your project root:

```bash
TRANSLAMATE_API_KEY=your_key_here
TRANSLAMATE_BASE_URL=https://api.deepseek.com
TRANSLAMATE_MODEL=deepseek-chat
TRANSLAMATE_MAX_TOKENS=512
TRANSLAMATE_TEMPERATURE=0.7
```

### Option 2: Config File

Create `.translamate.json` in your home or project directory:

```json
{
  "apiKey": "your_key_here",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

### Option 3: CLI Config Command

```bash
# Set configuration
translamate config set apiKey your_key_here
translamate config set baseURL https://api.deepseek.com
translamate config set model deepseek-chat

# View configuration
translamate config list
```

### Configuration Priority

1. CLI options (highest)
2. Environment variables
3. `.translamate.json` in current directory
4. `.translamate.json` in home directory
5. Default values (lowest)

---

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# Clone
git clone https://github.com/sanbuphy/translamate.git
cd translamate

# Install
npm install

# Run desktop in development
npm run electron:dev

# Build CLI
npm run build:cli

# Build desktop
npm run build:all
```

### Tech Stack

```
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  ├── Electron + React (Desktop)         │
│  └── Commander.js (CLI)                 │
├─────────────────────────────────────────┤
│  Core Layer                             │
│  ├── Translation Engine                 │
│  ├── Batch Processor                    │
│  └── Config Loader                      │
├─────────────────────────────────────────┤
│  Infrastructure                         │
│  ├── OpenAI SDK                         │
│  ├── Tailwind CSS                       │
│  └── Zustand (State)                    │
└─────────────────────────────────────────┘
```

---

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get started in 5 minutes
- [CLI Documentation](docs/CLI.md) - Complete CLI reference
- [API Reference](docs/API.md) - API configuration guide
- [Development Guide](docs/DEVELOPMENT.md) - Contributing and development
- [Deployment Guide](docs/DEPLOYMENT.md) - Server deployment
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines

---

## Roadmap

- [ ] PDF and DOCX support for batch translation
- [ ] Translation memory and glossary
- [ ] Plugin system for custom providers
- [ ] Linux support (AppImage)
- [ ] Cloud sync for history
- [ ] REST API server mode
- [ ] Web interface

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

### Contributors

<a href="https://github.com/sanbuphy/translamate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sanbuphy/translamate" />
</a>

---

## Project Stats

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=sanbuphy/translamate&type=Date)](https://star-history.com/#sanbuphy/translamate&Date)

</div>

---

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Thanks to all the AI providers for their amazing APIs:

[DeepSeek](https://www.deepseek.com/) · [OpenAI](https://openai.com/) · [SiliconFlow](https://cloud.siliconflow.cn/) · [Ollama](https://ollama.com/)

Special thanks to the open-source community for the tools that make this project possible:
[Electron](https://www.electronjs.org/) · [React](https://react.dev/) · [Vite](https://vitejs.dev/) · [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**Star us on GitHub — it motivates us a lot!**

[Report Bug](https://github.com/sanbuphy/translamate/issues) · [Request Feature](https://github.com/sanbuphy/translamate/issues) · [Documentation](https://github.com/sanbuphy/translamate/tree/main/docs)

</div>
