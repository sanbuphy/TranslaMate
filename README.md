<div align="center">

<img src="assets/logo.png" alt="TranslaMate Logo" width="120" height="120">

# TranslaMate

**AI-Powered Desktop Translation Application**

[![GitHub release](https://img.shields.io/github/v/release/username/translamate?style=flat-square)](https://github.com/username/translamate/releases)
[![License](https://img.shields.io/github/license/username/translamate?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/username/translamate/build.yml?style=flat-square)](https://github.com/username/translamate/actions)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue?style=flat-square)]()
[![Downloads](https://img.shields.io/github/downloads/username/translamate/total?style=flat-square)]()

[English](README.md) · [简体中文](README_zh.md)

</div>

---

## Overview

TranslaMate is a modern, privacy-first desktop translation application powered by AI. It supports any OpenAI-compatible API provider and offers both single text translation and batch file processing capabilities.

**Why TranslaMate?**

- **Universal API Support** - Works with DeepSeek, OpenAI, or any OpenAI-compatible provider
- **Privacy First** - All data stored locally; only translation requests leave your machine
- **Batch Processing** - Translate entire folders of Markdown files with one click
- **Cross-Platform** - Native applications for Windows and macOS

---

## Quick Start

### Installation

**macOS (Homebrew):**
```bash
brew install --cask translamate
```

**Windows (Scoop):**
```powershell
scoop install translamate
```

**Or download directly:**
- [Latest Release](https://github.com/username/translamate/releases/latest)

### Usage

1. **Configure API Key**
   - Open Settings (gear icon)
   - Enter your API key from [DeepSeek](https://platform.deepseek.com) or [OpenAI](https://platform.openai.com)
   - Save

2. **Translate Text**
   ```
   Ctrl/Cmd + Shift + T  →  Show TranslaMate
   Ctrl/Cmd + Enter      →  Translate
   ```

3. **Batch Translate**
   - Switch to Batch mode
   - Select folder containing Markdown files
   - Choose target language
   - Start translation

---

## Features

<table>
<tr>
<td width="50%">

### Core Features

- **AI Translation** - Powered by state-of-the-art LLMs
- **Multi-Provider** - DeepSeek, OpenAI, or custom endpoints
- **10+ Languages** - Including Chinese, English, Japanese, and more
- **Auto-Detection** - Automatic source language identification

</td>
<td width="50%">

### Advanced Features

- **Batch Processing** - Translate multiple files at once
- **History** - Persistent translation history (up to 100 entries)
- **Global Hotkeys** - Quick access from anywhere
- **Dark Mode** - Easy on the eyes

</td>
</tr>
</table>

---

## Supported Providers

| Provider | Base URL | Models | Pricing |
|----------|----------|--------|---------|
| **DeepSeek** (Recommended) | `https://api.deepseek.com` | `deepseek-chat`, `deepseek-reasoner` | ~¥1/1M tokens |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4`, `gpt-3.5-turbo` | $0.50-30/1M tokens |
| **Local (Ollama)** | `http://localhost:11434/v1` | Any local model | Free |

---

## Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| Auto Detect | `auto` | Korean | `ko` |
| Simplified Chinese | `zh-CN` | Arabic | `ar` |
| Traditional Chinese | `zh-TW` | Vietnamese | `vi` |
| English | `en` | German | `de` |
| Japanese | `ja` | Spanish | `es` |
| French | `fr` | | |

---

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# Clone
git clone https://github.com/username/translamate.git
cd translamate

# Install
npm install

# Run in development
npm run dev

# Build
npm run build:all
```

### Tech Stack

```
┌─────────────────────────────────────────┐
│  Electron + React + TypeScript          │
├─────────────────────────────────────────┤
│  Tailwind CSS + Lucide Icons            │
├─────────────────────────────────────────┤
│  Zustand (State) + OpenAI SDK           │
├─────────────────────────────────────────┤
│  Vite (Build) + electron-builder        │
└─────────────────────────────────────────┘
```

---

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [API Reference](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## Roadmap

- [ ] PDF and DOCX support for batch translation
- [ ] Translation memory and glossary
- [ ] Plugin system for custom providers
- [ ] Linux support
- [ ] Cloud sync for history

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) before submitting a PR.

### Contributors

<a href="https://github.com/username/translamate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=username/translamate" />
</a>

---

## License

[MIT](LICENSE) 2026 TranslaMate Contributors

---

<div align="center">

**[Website](https://translamate.app)** · **[Documentation](docs/)** · **[Report Bug](https://github.com/username/translamate/issues)** · **[Request Feature](https://github.com/username/translamate/issues)**

</div>
