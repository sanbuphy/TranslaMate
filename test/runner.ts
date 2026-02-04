/**
 * 简单测试运行器
 * 
 * 使用方法:
 * 1. 在测试文件末尾添加: import './runner';  // 运行测试
 * 2. 运行: npx tsx test/unit.chunking-algorithm.test.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const TESTS_DIR = __dirname;
const OUTPUTS_DIR = path.join(TESTS_DIR, '..', 'outputs');

if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

type TestFn = () => void | Promise<void>;
type TestCase = {
  name: string;
  fn: TestFn;
};

const testCases: TestCase[] = [];
let passed = 0;
let failed = 0;
let currentSuite = '';

export function describe(suiteName: string, fn: () => void) {
  currentSuite = suiteName;
  fn();
  currentSuite = '';
}

export function test(name: string, fn: TestFn) {
  testCases.push({ name: `${currentSuite ? currentSuite + ' › ' : ''}${name}`, fn });
}

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || '断言失败');
  }
}

export function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `期望 ${expected}，得到 ${actual}`);
  }
}

export function assertGreaterThan(actual: number, expected: number, message?: string) {
  if (actual <= expected) {
    throw new Error(message || `期望 ${actual} > ${expected}`);
  }
}

function runTests() {
  console.clear();
  console.log('═'.repeat(60));
  console.log('  TranslaMate 测试套件');
  console.log('═'.repeat(60));
  console.log('');

  for (const tc of testCases) {
    process.stdout.write(`  ${tc.name} ... `);
    const startTime = Date.now();
    
    try {
      const result = tc.fn();
      if (result instanceof Promise) {
        // Handle async test
      }
      const duration = Date.now() - startTime;
      console.log(`✓ (${duration}ms)`);
      passed++;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`✗ (${duration}ms)`);
      console.log(`    错误: ${(error as Error).message}`);
      failed++;
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`  结果: ${passed} 通过, ${failed} 失败`);
  console.log('─'.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}
