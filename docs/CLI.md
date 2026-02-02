# CLI Documentation

Complete guide for using TranslaMate from the command line.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Configuration](#configuration)
- [Examples](#examples)
- [Exit Codes](#exit-codes)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Global Installation

```bash
# Clone the repository
git clone https://github.com/username/translamate.git
cd translamate

# Install dependencies
npm install

# Build CLI
npm run build:cli

# Link globally
npm link

# Verify installation
translamate --version
```

### Local Usage (without global install)

```bash
# After building
node dist/cli/index.js --help
```

### Docker Usage

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/cli ./dist/cli
ENTRYPOINT ["node", "dist/cli/index.js"]
```

```bash
# Build and run
docker build -t translamate .
docker run translamate translate "Hello" --to zh-CN
```

---

## Quick Start

```bash
# Translate text
translamate translate "Hello World" --to zh-CN

# Translate with specific source language
translamate translate "Hello" --from en --to ja

# Translate file
translamate translate document.txt --to zh-CN --output document-zh.txt

# Batch translate directory
translamate batch ./docs --to zh-CN --output ./docs-zh
```

---

## Commands

### `translate` (alias: `t`)

Translate text or a single file.

```bash
translamate translate <input> [options]
```

**Arguments:**
- `input` - Text to translate or path to file

**Options:**
- `-t, --to <lang>` - Target language code (default: "zh-CN")
- `-f, --from <lang>` - Source language code (default: "auto")
- `-o, --output <path>` - Output file path (for file translation)
- `-c, --config <path>` - Config file path

**Examples:**

```bash
# Simple text translation
translamate translate "Hello World" --to zh-CN
# Output: 你好世界

# File translation
translamate translate readme.md --to ja --output readme-ja.md

# With explicit source language
translamate translate "Bonjour" --from fr --to en
```

---

### `batch` (alias: `b`)

Batch translate multiple files in a directory.

```bash
translamate batch <directory> [options]
```

**Arguments:**
- `directory` - Directory containing files to translate

**Options:**
- `-t, --to <lang>` - Target language code (default: "zh-CN")
- `-f, --from <lang>` - Source language code (default: "auto")
- `-o, --output <dir>` - Output directory (default: "<input>-<lang>")
- `-e, --ext <extensions>` - File extensions to process (default: "txt,md")
- `-c, --config <path>` - Config file path

**Examples:**

```bash
# Translate all txt and md files
translamate batch ./docs --to zh-CN

# Specific extensions
translamate batch ./docs --to de --ext "md,html,json"

# Custom output directory
translamate batch ./content --to ja --output ./content-japanese
```

---

### `config`

Manage configuration settings.

```bash
translamate config [command] [options]
```

**Subcommands:**

#### `config set <key> <value>`

Set a configuration value.

```bash
translamate config set apiKey sk-xxxxxxxx
translamate config set baseURL https://api.deepseek.com
translamate config set model deepseek-chat
```

#### `config get <key>`

Get a configuration value.

```bash
translamate config get apiKey
translamate config get model
```

#### `config list`

List all configuration values.

```bash
translamate config list
```

#### `config reset`

Reset configuration to defaults.

```bash
translamate config reset
```

**Configuration Keys:**
- `apiKey` - API key for translation service
- `baseURL` - API base URL
- `model` - Model name
- `maxTokens` - Maximum tokens (number)
- `temperature` - Temperature value (0-1)

---

## Configuration

### Configuration File

CLI looks for configuration in the following order:

1. `--config` option
2. `.translamate.json` in current directory
3. `.translamate.json` in home directory
4. Environment variables

### Configuration File Format

```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

### Environment Variables

```bash
export TRANSLAMATE_API_KEY=sk-xxxxxxxx
export TRANSLAMATE_BASE_URL=https://api.deepseek.com
export TRANSLAMATE_MODEL=deepseek-chat
export TRANSLAMATE_MAX_TOKENS=512
export TRANSLAMATE_TEMPERATURE=0.7
```

### Priority Order

1. Command line options (highest)
2. Environment variables
3. Config file specified by `--config`
4. `.translamate.json` in current directory
5. `.translamate.json` in home directory
6. Default values (lowest)

---

## Examples

### Basic Usage

```bash
# Translate to Chinese
translamate t "Hello, how are you?" --to zh-CN

# Translate to Japanese with source detection
translamate t "Good morning" --to ja

# Translate to multiple languages
for lang in zh-CN ja de fr; do
  translamate t "Welcome" --to $lang
done
```

### File Translation

```bash
# Single file
translamate t report.md --to zh-CN -o report-zh.md

# Multiple files
for file in *.md; do
  translamate t "$file" --to de -o "${file%.md}-de.md"
done
```

### Batch Processing

```bash
# Documentation translation
translamate batch ./docs --to zh-CN --output ./docs-zh

# Code comments translation
translamate batch ./src --to en --ext "ts,js" --output ./src-en

# Website content
translamate batch ./content --to ja --ext "html,md,json"
```

### CI/CD Integration

```yaml
# .github/workflows/translate.yml
name: Translate Documentation
on:
  push:
    paths:
      - 'docs/**'

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup TranslaMate
        run: |
          npm ci
          npm run build:cli
      
      - name: Translate to Chinese
        run: node dist/cli/index.js batch docs --to zh-CN --output docs-zh
        env:
          TRANSLAMATE_API_KEY: ${{ secrets.API_KEY }}
      
      - name: Commit translations
        run: |
          git add docs-zh
          git commit -m "docs: update Chinese translations"
          git push
```

### Shell Scripts

```bash
#!/bin/bash
# translate-project.sh

SOURCE_DIR="${1:-./content}"
TARGET_LANG="${2:-zh-CN}"
OUTPUT_DIR="${3:-./content-${TARGET_LANG}}"

# Check if translamate is installed
if ! command -v translamate &> /dev/null; then
    echo "Error: translamate not found"
    exit 1
fi

# Check API key
if [ -z "$TRANSLAMATE_API_KEY" ]; then
    echo "Error: TRANSLAMATE_API_KEY not set"
    exit 1
fi

# Run translation
echo "Translating ${SOURCE_DIR} to ${TARGET_LANG}..."
translamate batch "$SOURCE_DIR" --to "$TARGET_LANG" --output "$OUTPUT_DIR"

echo "Done! Output: ${OUTPUT_DIR}"
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Configuration error |
| 4 | API error |
| 5 | File system error |
| 6 | Network error |

---

## Troubleshooting

### API Key Not Set

```
Error: API Key is required
```

**Solution:**
```bash
# Option 1: Set environment variable
export TRANSLAMATE_API_KEY=sk-xxxxxxxx

# Option 2: Use config command
translamate config set apiKey sk-xxxxxxxx

# Option 3: Create config file
echo '{"apiKey": "sk-xxxxxxxx"}' > ~/.translamate.json
```

### File Not Found

```
Error: File not found: document.txt
```

**Solution:**
- Check file path is correct
- Use absolute path if needed
- Ensure file has read permissions

### API Rate Limit

```
Error: Rate limit exceeded
```

**Solution:**
- Wait before retrying
- Check your API quota
- Consider upgrading your plan

### Network Issues

```
Error: Network error
```

**Solution:**
- Check internet connection
- Verify baseURL is correct
- Check firewall settings

### Batch Processing Errors

```
Error: Failed to process some files
```

**Solution:**
- Check file permissions
- Verify output directory is writable
- Review error logs for specific files

---

## Language Codes

Common language codes:

| Code | Language |
|------|----------|
| zh-CN | Chinese (Simplified) |
| zh-TW | Chinese (Traditional) |
| en | English |
| ja | Japanese |
| ko | Korean |
| de | German |
| fr | French |
| es | Spanish |
| ru | Russian |
| pt | Portuguese |
| it | Italian |
| ar | Arabic |
| hi | Hindi |
| th | Thai |
| vi | Vietnamese |

---

## Tips

1. **Use environment variables** for sensitive data like API keys
2. **Create config files** per project for different settings
3. **Use batch mode** for large translation jobs
4. **Check exit codes** in scripts for error handling
5. **Use `--output`** to preserve original files
