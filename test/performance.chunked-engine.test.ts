/**
 * 翻译性能测试 - 并发 vs 单独翻译对比
 * 
 * 测试场景：
 * 1. 串行翻译（单块依次翻译，不并发）
 * 2. 并发翻译（多块并行翻译）
 * 
 * 测试指标：
 * - 总耗时
 * - 每块平均耗时
 * - 翻译质量（通过简单检查）
 * 
 * 测试结果输出到: outputs/
 */

import * as fs from 'fs';
import * as path from 'path';
import { ChunkedTranslationEngine, ChunkedTranslationRequest } from '../src/core/translation/chunked-engine';
import { loadConfig } from '../src/core/config/loader';

// 确保 outputs 目录存在
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

interface TestResult {
  mode: string;
  totalTime: number;
  chunkCount: number;
  avgTimePerChunk: number;
  translatedLength: number;
}

class TranslationPerformanceTest {
  private engine: ChunkedTranslationEngine;
  private testContent: string;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.engine = new ChunkedTranslationEngine(this.config);
    this.testContent = fs.readFileSync(
      path.join(__dirname, 'data.ai-article.md'),
      'utf-8'
    );
  }

  /**
   * 测试串行翻译（不并发）
   */
  async testSequentialTranslation(): Promise<TestResult> {
    console.log('\n========================================');
    console.log('测试1: 串行翻译（单块依次，不并发）');
    console.log('========================================');

    const request: ChunkedTranslationRequest = {
      text: this.testContent,
      targetLanguage: 'en',
      maxTokensPerChunk: 800,
      parallelChunks: 1, // 串行：每次只翻译1块
    };

    const startTime = Date.now();
    let chunkCount = 0;

    const result = await this.engine.translateChunked(request, (progress) => {
      if (progress.stage === 'translating') {
        chunkCount = progress.totalChunks;
        process.stdout.write(`\r进度: ${progress.currentChunk}/${progress.totalChunks} - ${progress.message}`);
      }
    });

    const totalTime = Date.now() - startTime;

    console.log('\n');
    console.log(`✓ 翻译完成`);
    console.log(`  总耗时: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`  分块数: ${chunkCount}`);
    console.log(`  每块平均: ${(totalTime / chunkCount / 1000).toFixed(2)}秒`);
    console.log(`  译文长度: ${result.text.length} 字符`);

    return {
      mode: '串行翻译 (parallelChunks=1)',
      totalTime,
      chunkCount,
      avgTimePerChunk: totalTime / chunkCount,
      translatedLength: result.text.length,
    };
  }

  /**
   * 测试并发翻译
   */
  async testParallelTranslation(parallelChunks: number): Promise<TestResult> {
    console.log('\n========================================');
    console.log(`测试2: 并发翻译 (parallelChunks=${parallelChunks})`);
    console.log('========================================');

    const request: ChunkedTranslationRequest = {
      text: this.testContent,
      targetLanguage: 'en',
      maxTokensPerChunk: 800,
      parallelChunks, // 并发：同时翻译多块
    };

    const startTime = Date.now();
    let chunkCount = 0;

    const result = await this.engine.translateChunked(request, (progress) => {
      if (progress.stage === 'translating') {
        chunkCount = progress.totalChunks;
        process.stdout.write(`\r进度: ${progress.currentChunk}/${progress.totalChunks} - ${progress.message}`);
      }
    });

    const totalTime = Date.now() - startTime;

    console.log('\n');
    console.log(`✓ 翻译完成`);
    console.log(`  总耗时: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`  分块数: ${chunkCount}`);
    console.log(`  每块平均: ${(totalTime / chunkCount / 1000).toFixed(2)}秒`);
    console.log(`  译文长度: ${result.text.length} 字符`);

    // 保存译文用于对比
    const outputPath = path.join(OUTPUTS_DIR, `translated-parallel-${parallelChunks}.md`);
    fs.writeFileSync(outputPath, result.text, 'utf-8');
    console.log(`  译文已保存: outputs/translated-parallel-${parallelChunks}.md`);

    return {
      mode: `并发翻译 (parallelChunks=${parallelChunks})`,
      totalTime,
      chunkCount,
      avgTimePerChunk: totalTime / chunkCount,
      translatedLength: result.text.length,
    };
  }

  /**
   * 测试不同并发度的性能
   */
  async testDifferentParallelLevels(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const parallelLevels = [1, 2, 3, 5];

    for (const level of parallelLevels) {
      const result = await this.testParallelTranslation(level);
      results.push(result);

      // 测试之间等待2秒，避免API限流
      if (level !== parallelLevels[parallelLevels.length - 1]) {
        console.log('\n等待2秒后继续...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  /**
   * 生成对比报告
   */
  generateReport(results: TestResult[]): void {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    翻译性能对比报告                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // 表格头部
    console.log('模式                          | 总耗时(秒) | 分块数 | 每块平均(秒) | 加速比');
    console.log('─────────────────────────────┼───────────┼───────┼─────────────┼───────');

    // 基准时间（串行翻译）
    const baseline = results.find(r => r.mode.includes('parallelChunks=1'));
    const baselineTime = baseline ? baseline.totalTime : results[0].totalTime;

    // 表格内容
    for (const result of results) {
      const speedup = baselineTime / result.totalTime;
      const mode = result.mode.padEnd(28);
      const totalTime = (result.totalTime / 1000).toFixed(2).padStart(9);
      const chunkCount = result.chunkCount.toString().padStart(5);
      const avgTime = (result.avgTimePerChunk / 1000).toFixed(2).padStart(11);
      const speedupStr = speedup.toFixed(2).padStart(5);

      console.log(`${mode}| ${totalTime} | ${chunkCount} | ${avgTime} | ${speedupStr}x`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('结论:');
    console.log('───────────────────────────────────────────────────────────────');

    const bestResult = results.reduce((best, current) =>
      current.totalTime < best.totalTime ? current : best
    );

    const worstResult = results.reduce((worst, current) =>
      current.totalTime > worst.totalTime ? current : worst
    );

    const maxSpeedup = baselineTime / bestResult.totalTime;

    console.log(`  • 最快模式: ${bestResult.mode}`);
    console.log(`  • 最慢模式: ${worstResult.mode}`);
    console.log(`  • 最大加速比: ${maxSpeedup.toFixed(2)}x`);
    console.log(`  • 时间节省: ${((1 - 1/maxSpeedup) * 100).toFixed(1)}%`);
    console.log('');
    console.log('注意事项:');
    console.log('  1. 实际加速比受API响应时间、网络延迟影响');
    console.log('  2. 过高的并发可能导致API限流');
    console.log('  3. 建议根据API限制和文本长度调整并发数');
    console.log('═══════════════════════════════════════════════════════════════');
  }

  /**
   * 运行完整测试
   */
  async run(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              TranslaMate 翻译性能测试                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`测试文件: data.ai-article.md`);
    console.log(`文件大小: ${this.testContent.length} 字符`);
    console.log(`目标语言: English`);
    console.log(`分块大小: 800 tokens`);
    console.log('');

    if (!this.config.apiKey) {
      console.error('错误: 未配置API密钥，请在 translamate.json 中设置 apiKey');
      process.exit(1);
    }

    try {
      const results = await this.testDifferentParallelLevels();
      this.generateReport(results);

      // 保存详细报告
      const reportPath = path.join(OUTPUTS_DIR, 'performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`\n详细报告已保存: outputs/performance-report.json`);

    } catch (error) {
      console.error('测试失败:', error);
      process.exit(1);
    }
  }
}

// 运行测试
const test = new TranslationPerformanceTest();
test.run();
