#!/usr/bin/env node

/**
 * Build Script
 * Handles building CLI, Electron, and all distribution packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}Error: ${message}${colors.reset}`);
  process.exit(1);
}

function exec(command, options = {}) {
  log(`> ${command}`, 'gray');
  try {
    return execSync(command, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      ...options
    });
  } catch (err) {
    throw new Error(`Command failed: ${command}`);
  }
}

function clean() {
  log('\n🧹 Cleaning build directories...', 'cyan');
  const dirsToClean = ['dist', 'release', 'build'];

  for (const dir of dirsToClean) {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      log(`  ✓ Removed ${dir}/`, 'green');
    }
  }
}

function buildCLI() {
  log('\n🔧 Building CLI...', 'cyan');
  try {
    exec('npm run build:cli');

    // Make CLI executable
    const cliPath = path.join(ROOT_DIR, 'dist', 'cli', 'index.js');
    if (fs.existsSync(cliPath)) {
      fs.chmodSync(cliPath, '755');
      log('  ✓ CLI built successfully', 'green');
    }
  } catch (err) {
    error('CLI build failed');
  }
}

function buildElectron() {
  log('\n🖥️  Building Electron app...', 'cyan');
  try {
    exec('npm run build');
    log('  ✓ Electron app built successfully', 'green');
  } catch (err) {
    error('Electron build failed');
  }
}

function buildAll() {
  log('\n📦 Building all packages...', 'cyan');
  try {
    exec('npm run build:all');
    log('  ✓ All packages built successfully', 'green');
  } catch (err) {
    error('Build failed');
  }
}

function buildForPlatform(platform) {
  log(`\n🎯 Building for ${platform}...`, 'cyan');
  try {
    switch (platform) {
      case 'win':
        exec('npm run build:win');
        break;
      case 'mac':
        exec('npm run build:mac');
        break;
      case 'linux':
        exec('npm run build:linux');
        break;
      default:
        error(`Unknown platform: ${platform}`);
    }
    log(`  ✓ ${platform} build completed`, 'green');
  } catch (err) {
    error(`${platform} build failed`);
  }
}

function verifyBuild() {
  log('\n🔍 Verifying build outputs...', 'cyan');

  const checks = [
    { path: 'dist/cli/index.js', name: 'CLI entry' },
    { path: 'dist/main/index.js', name: 'Electron main' },
    { path: 'dist/renderer/index.html', name: 'Renderer HTML' }
  ];

  let allGood = true;
  for (const check of checks) {
    const fullPath = path.join(ROOT_DIR, check.path);
    if (fs.existsSync(fullPath)) {
      log(`  ✓ ${check.name}: ${check.path}`, 'green');
    } else {
      log(`  ✗ ${check.name}: ${check.path} (missing)`, 'red');
      allGood = false;
    }
  }

  if (!allGood) {
    error('Build verification failed');
  }
}

function showHelp() {
  log('🏗️  TranslaMate Build Script\n', 'bright');
  log('Usage: node scripts/build.js [command] [options]\n', 'bright');
  log('Commands:', 'bright');
  log('  cli              Build CLI only');
  log('  electron         Build Electron app only');
  log('  all              Build all packages (CLI + Electron for all platforms)');
  log('  win|mac|linux    Build for specific platform');
  log('  clean            Clean build directories');
  log('  verify           Verify build outputs');
  log('  full             Full build (clean + cli + electron + verify)\n');
  log('Options:', 'bright');
  log('  --skip-verify    Skip verification step\n');
  log('Examples:', 'bright');
  log('  node scripts/build.js cli');
  log('  node scripts/build.js full');
  log('  node scripts/build.js mac --skip-verify');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const skipVerify = args.includes('--skip-verify');

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  log('🏗️  TranslaMate Build System\n', 'bright');

  const startTime = Date.now();

  try {
    switch (command) {
      case 'clean':
        clean();
        break;

      case 'cli':
        buildCLI();
        if (!skipVerify) verifyBuild();
        break;

      case 'electron':
        buildElectron();
        if (!skipVerify) verifyBuild();
        break;

      case 'win':
      case 'mac':
      case 'linux':
        buildForPlatform(command);
        break;

      case 'all':
        buildCLI();
        buildAll();
        break;

      case 'full':
        clean();
        buildCLI();
        buildElectron();
        if (!skipVerify) verifyBuild();
        break;

      case 'verify':
        verifyBuild();
        break;

      default:
        error(`Unknown command: ${command}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n✅ Build completed in ${duration}s`, 'green');

  } catch (err) {
    log(`\n❌ Build failed: ${err.message}`, 'red');
    process.exit(1);
  }
}

main();
