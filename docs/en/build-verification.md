# Build Verification Guide

This document provides a checklist for verifying successful builds of TranslaMate.

## Prerequisites

- Node.js >= 18
- npm >= 9
- All dependencies installed (`npm install`)

---

## Build Verification Checklist

### 1. CLI Build Verification

#### Build CLI
```bash
npm run build:cli
```

**Expected Results:**
- `dist/cli/` directory is created
- JavaScript files are compiled
- No TypeScript errors
- Exit code: 0

#### CLI Smoke Test
```bash
# Test help command
node dist/cli/index.js --help

# Test version command
node dist/cli/index.js --version
```

**Expected Results:**
- Help text is displayed
- Version number is shown
- No errors

#### Output Directory Structure
```
dist/cli/
├── cli/
│   ├── commands/
│   │   ├── batch.js
│   │   ├── config.js
│   │   ├── index.js
│   │   └── translate.js
│   └── index.js
└── core/
    ├── batch/
    ├── config/
    ├── translation/
    └── types.js
```

---

### 2. Desktop (Electron) Build Verification

#### Build Desktop App
```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux

# Or build all
npm run build:all
```

**Expected Results:**
- `dist/` directory contains compiled files
- `out/` directory contains packaged applications
- No build errors
- Exit code: 0

#### Desktop Output Verification

**macOS:**
```
out/
├── TranslaMate-<version>-<arch>.dmg
├── TranslaMate-<version>-<arch>.zip
└── TranslaMate-<version>-darwin dmg (macOS DMG)
```

**Windows:**
```
out/
├── TranslaMate Setup <version>.exe
└── TranslaMate-<version>-win portable.exe (portable)
```

**Linux:**
```
out/
├── TranslaMate-<version>.AppImage
├── TranslaMate-<version>.deb
└── TranslaMate-<version>.rpm
```

---

## Test Scripts

### Unit Tests
```bash
npm run test:unit
```

**Expected Results:**
- All tests pass
- Exit code: 0
- Summary shows "X passed, 0 failed"

### Performance Tests
```bash
npm run test:performance
```

**Note:** Requires API key configuration. Will fail without valid API credentials.

**Expected Results (with API key):**
- Performance report generated
- `outputs/performance-report.json` created
- Exit code: 0

---

## Translation Verification

### Test Translation Commands
```bash
# English translation
npm run test:translate:en

# Traditional Chinese translation
npm run test:translate:zh-tw

# Japanese translation
npm run test:translate:ja

# All translations
npm run test:translate:all
```

**Expected Results:**
- `outputs/translated-en.md` created
- `outputs/translated-zh-tw.md` created
- `outputs/translated-ja.md` created
- Files contain translated content
- Original markdown formatting preserved

### Manual Translation Verification
```bash
# Test traditional Chinese
node dist/cli/index.js translate "Hello World" --to zh-TW

# Test Japanese
node dist/cli/index.js translate "Good morning" --to ja

# Test English (from Chinese)
node dist/cli/index.js translate "大家好" --to en
```

**Expected Results:**
- Correct translations returned
- No errors
- Exit code: 0

---

## Configuration Verification

### Config Command Tests
```bash
# List configuration
node dist/cli/index.js config list

# Get specific value
node dist/cli/index.js config get model
```

**Expected Results:**
- Current configuration displayed
- No errors

---

## Common Build Issues

### TypeScript Errors
```bash
# Run type check to identify issues
npm run typecheck
```

**Common Solutions:**
- Check for missing type definitions
- Verify `tsconfig.json` configuration
- Ensure all imports are valid

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Platform Issues
- macOS builds require Xcode Command Line Tools
- Windows builds require .NET Framework 4.5+
- Linux builds requires rpm, fakeroot, and dpkg-deb

---

## Verification Summary

After completing all verification steps, you should have:

- [x] CLI builds successfully
- [x] Desktop app builds for target platform(s)
- [x] Unit tests pass
- [x] CLI smoke tests pass
- [x] Translation tests produce valid output
- [x] Documentation is up to date
- [x] CHANGELOG.md is updated

If all items are checked, the build is verified and ready for release.
