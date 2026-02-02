#!/usr/bin/env node

/**
 * Release Script
 * Handles versioning, changelog updates, and release creation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const CHANGELOG_MD = path.join(ROOT_DIR, 'CHANGELOG.md');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}Error: ${message}${colors.reset}`);
  process.exit(1);
}

function getPackageInfo() {
  const content = fs.readFileSync(PACKAGE_JSON, 'utf-8');
  return JSON.parse(content);
}

function getCurrentVersion() {
  return getPackageInfo().version;
}

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const hasUncommitted = execSync('git status --porcelain', { encoding: 'utf-8' }).trim().length > 0;
    return { branch, commit, hasUncommitted };
  } catch {
    return { branch: 'unknown', commit: 'unknown', hasUncommitted: false };
  }
}

function validateRelease() {
  const gitInfo = getGitInfo();

  if (gitInfo.branch !== 'main' && gitInfo.branch !== 'master') {
    error(`Must be on main/master branch. Current: ${gitInfo.branch}`);
  }

  if (gitInfo.hasUncommitted) {
    error('You have uncommitted changes. Please commit or stash them first.');
  }

  // Check if tests pass
  log('Running tests...', 'cyan');
  try {
    execSync('npm run typecheck', { stdio: 'inherit', cwd: ROOT_DIR });
    execSync('npm run lint', { stdio: 'inherit', cwd: ROOT_DIR });
  } catch {
    error('Tests failed. Please fix issues before releasing.');
  }
}

function updateChangelog(version) {
  if (!fs.existsSync(CHANGELOG_MD)) {
    log('Creating CHANGELOG.md...', 'yellow');
    fs.writeFileSync(CHANGELOG_MD, '# Changelog\n\n');
  }

  const date = new Date().toISOString().split('T')[0];
  const content = fs.readFileSync(CHANGELOG_MD, 'utf-8');

  // Check if version already exists
  if (content.includes(`## [${version}]`)) {
    log(`Version ${version} already in CHANGELOG`, 'yellow');
    return;
  }

  // Get commits since last tag
  let commits = '';
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf-8' }).trim();
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    commits = execSync(`git log ${range} --pretty=format:"- %s"`, { encoding: 'utf-8' });
  } catch {
    commits = '- Initial release';
  }

  const newEntry = `## [${version}] - ${date}

${commits || '- Version bump'}

`;

  const updatedContent = content.replace('# Changelog\n\n', `# Changelog\n\n${newEntry}`);
  fs.writeFileSync(CHANGELOG_MD, updatedContent);

  log(`Updated CHANGELOG.md with version ${version}`, 'green');
}

function createGitTag(version) {
  const tagName = `v${version}`;

  try {
    execSync(`git add -A`, { cwd: ROOT_DIR });
    execSync(`git commit -m "chore(release): ${tagName}"`, { cwd: ROOT_DIR });
    execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { cwd: ROOT_DIR });

    log(`Created git tag: ${tagName}`, 'green');
    log(`\nTo push the release, run:`, 'cyan');
    log(`  git push origin main && git push origin ${tagName}`, 'bright');
  } catch (err) {
    error(`Failed to create git tag: ${err.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  log('🚀 TranslaMate Release Script\n', 'bright');

  const version = getCurrentVersion();
  const gitInfo = getGitInfo();

  log(`Current version: ${colors.cyan}${version}${colors.reset}`);
  log(`Git branch: ${colors.cyan}${gitInfo.branch}${colors.reset}`);
  log(`Git commit: ${colors.cyan}${gitInfo.commit}${colors.reset}\n`);

  switch (command) {
    case 'validate':
      validateRelease();
      log('✅ All validations passed!', 'green');
      break;

    case 'changelog':
      updateChangelog(version);
      break;

    case 'tag':
      createGitTag(version);
      break;

    case 'full':
      validateRelease();
      updateChangelog(version);
      createGitTag(version);
      log('\n✅ Release process completed!', 'green');
      break;

    default:
      log('Usage: node scripts/release.js [command]', 'bright');
      log('\nCommands:', 'bright');
      log('  validate  - Validate release readiness');
      log('  changelog - Update CHANGELOG.md');
      log('  tag       - Create git tag');
      log('  full      - Run full release process');
      log('\nVersion bump commands:', 'bright');
      log('  npm run version:patch  - Bump patch version (0.0.1)');
      log('  npm run version:minor  - Bump minor version (0.1.0)');
      log('  npm run version:major  - Bump major version (1.0.0)');
  }
}

main();
