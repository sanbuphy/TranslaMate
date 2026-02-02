/**
 * 真实翻译测试 - 使用大模型API进行翻译
 * 
 * 使用 DeepSeek API
 * 测试结果输出到: outputs/
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

// 确保 outputs 目录存在
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'YOUR_API_KEY_HERE';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// 创建 OpenAI 客户端
const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
});

// 文本分块函数
function splitTextIntoChunks(text: string, maxTokens: number, overlap: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    if (paragraphTokens > maxTokens) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      const sentences = splitIntoSentences(paragraph);
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);

        if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          const overlapText = getOverlapText(currentChunk, overlap);
          currentChunk = overlapText + sentence + '\n\n';
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk += sentence + '\n\n';
          currentTokens += sentenceTokens;
        }
      }
    } else {
      if (currentTokens + paragraphTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const overlapText = getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + paragraph + '\n\n';
        currentTokens = estimateTokens(currentChunk);
      } else {
        currentChunk += paragraph + '\n\n';
        currentTokens += paragraphTokens;
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function splitIntoSentences(text: string): string[] {
  const sentences = text
    .replace(/([.!?。！？])(\s+|$)/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences.length > 0 ? sentences : [text];
}

function getOverlapText(text: string, overlapTokens: number): string {
  const sentences = splitIntoSentences(text);
  let overlapText = '';
  let tokens = 0;

  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokens(sentence);

    if (tokens + sentenceTokens > overlapTokens) {
      break;
    }

    overlapText = sentence + ' ' + overlapText;
    tokens += sentenceTokens;
  }

  return overlapText;
}

function estimateTokens(text: string): number {
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - cjkChars - englishWords;
  return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
}

// 翻译单个分块
async function translateChunk(chunk: string, index: number, total: number): Promise<string> {
  console.log(`  翻译分块 ${index + 1}/${total}...`);
  
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator. Translate the following Chinese text to English. Preserve the markdown formatting. Only output the translation, no explanations.'
      },
      {
        role: 'user',
        content: chunk
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || '';
}

// 串行翻译所有分块
async function translateSequential(chunks: string[]): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const translated = await translateChunk(chunks[i], i, chunks.length);
    results.push(translated);
  }
  return results;
}

// 并行翻译所有分块
async function translateParallel(chunks: string[], parallelCount: number): Promise<string[]> {
  const results: string[] = new Array(chunks.length);
  
  for (let i = 0; i < chunks.length; i += parallelCount) {
    const batch = chunks.slice(i, i + parallelCount);
    console.log(`  批次 ${Math.floor(i / parallelCount) + 1}/${Math.ceil(chunks.length / parallelCount)}: 翻译 ${batch.length} 个块...`);
    
    const batchPromises = batch.map(async (chunk, index) => {
      const translated = await translateChunk(chunk, i + index, chunks.length);
      return { index: i + index, translated };
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ index, translated }) => {
      results[index] = translated;
    });
  }
  
  return results;
}

// 生成双语对照内容
function generateBilingualContent(originalChunks: string[], translatedChunks: string[]): string {
  const sections: string[] = [];
  sections.push('# Bilingual Translation (Chinese-English)');
  sections.push('');
  sections.push('---');
  sections.push('');
  
  for (let i = 0; i < originalChunks.length; i++) {
    sections.push(`## 第 ${i + 1} 段 / Chunk ${i + 1}`);
    sections.push('');
    sections.push('**原文 (Chinese):**');
    sections.push('');
    sections.push('```');
    sections.push(originalChunks[i]);
    sections.push('```');
    sections.push('');
    sections.push('**译文 (English):**');
    sections.push('');
    sections.push('```');
    sections.push(translatedChunks[i] || '[Translation failed]');
    sections.push('```');
    sections.push('');
    sections.push('---');
    sections.push('');
  }
  
  return sections.join('\n');
}

// 运行测试
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              真实翻译性能测试（调用大模型）                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  console.log(`使用模型: deepseek-chat`);
  console.log(`API Base: ${DEEPSEEK_BASE_URL}`);
  console.log('');

  // 读取测试文章
  const testContent = fs.readFileSync(
    path.join(__dirname, 'test-article.md'),
    'utf-8'
  );

  console.log(`测试文件: test/test-article.md`);
  console.log(`输出目录: outputs/`);
  console.log(`文件大小: ${testContent.length} 字符`);
  console.log('');

  // 预分块
  const chunks = splitTextIntoChunks(testContent, 800, 100);
  console.log(`预分块数量: ${chunks.length}`);
  console.log('');

  // 存储所有结果
  const results: Array<{ parallelChunks: number; time: number; chunks: number }> = [];

  // 测试1: 串行翻译 (parallelChunks=1)
  console.log('========================================');
  console.log('测试1: 串行翻译 (parallelChunks=1)');
  console.log('========================================');
  
  const startTime1 = Date.now();
  const translatedChunks1 = await translateSequential(chunks);
  const sequentialTime = Date.now() - startTime1;
  
  console.log(`✓ 完成! 总耗时: ${sequentialTime}ms, 分块数: ${chunks.length}`);
  
  // 保存单语版
  fs.writeFileSync(
    path.join(OUTPUTS_DIR, 'translated-parallel-1.md'),
    translatedChunks1.join('\n\n'),
    'utf-8'
  );
  console.log(`  译文已保存: outputs/translated-parallel-1.md`);
  
  // 保存双语对照版
  fs.writeFileSync(
    path.join(OUTPUTS_DIR, 'translated-parallel-1-bilingual.md'),
    generateBilingualContent(chunks, translatedChunks1),
    'utf-8'
  );
  console.log(`  双语对照已保存: outputs/translated-parallel-1-bilingual.md`);
  console.log('');
  
  results.push({ parallelChunks: 1, time: sequentialTime, chunks: chunks.length });

  // 测试其他并行度
  const testValues = [3, 6, 9];
  
  for (let i = 0; i < testValues.length; i++) {
    const p = testValues[i];
    
    console.log('========================================');
    console.log(`测试: 并发翻译 (parallelChunks=${p})`);
    console.log('========================================');
    
    const startTime = Date.now();
    const translatedChunks = await translateParallel(chunks, p);
    const totalTime = Date.now() - startTime;
    
    console.log(`✓ 完成! 总耗时: ${totalTime}ms, 分块数: ${chunks.length}`);
    console.log(`  加速比: ${(sequentialTime / totalTime).toFixed(2)}x`);
    
    // 保存单语版
    fs.writeFileSync(
      path.join(OUTPUTS_DIR, `translated-parallel-${p}.md`),
      translatedChunks.join('\n\n'),
      'utf-8'
    );
    console.log(`  译文已保存: outputs/translated-parallel-${p}.md`);
    
    // 保存双语对照版
    fs.writeFileSync(
      path.join(OUTPUTS_DIR, `translated-parallel-${p}-bilingual.md`),
      generateBilingualContent(chunks, translatedChunks),
      'utf-8'
    );
    console.log(`  双语对照已保存: outputs/translated-parallel-${p}-bilingual.md`);
    console.log('');
    
    results.push({ parallelChunks: p, time: totalTime, chunks: chunks.length });
    
    if (i < testValues.length - 1) {
      console.log('等待 3 秒...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 生成报告
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    性能对比报告                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('并行数 | 总耗时(ms) | 加速比 | 分块数');
  console.log('───────┼───────────┼───────┼────────');
  
  for (const r of results) {
    const speedup = r.parallelChunks === 1 ? '1.00x' : (sequentialTime / r.time).toFixed(2) + 'x';
    console.log(`  ${r.parallelChunks.toString().padStart(2)}   | ${r.time.toString().padStart(10)} | ${speedup.padStart(5)} | ${r.chunks}`);
  }
  console.log('');

  // 保存报告
  const report = {
    testDate: new Date().toISOString(),
    model: 'deepseek-chat',
    results: results.map(r => ({
      parallelChunks: r.parallelChunks,
      time: r.time,
      speedup: r.parallelChunks === 1 ? 1.0 : parseFloat((sequentialTime / r.time).toFixed(2)),
      chunks: r.chunks,
    })),
  };

  fs.writeFileSync(
    path.join(OUTPUTS_DIR, 'real-test-results.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log('✓ 测试结果已保存:', path.join(OUTPUTS_DIR, 'real-test-results.json'));
  console.log('');
  console.log('所有测试完成！');
  console.log('');
  console.log('生成的文件:');
  const outputValues = [1, 3, 6, 9];
  for (const p of outputValues) {
    console.log(`  - translated-parallel-${p}.md`);
    console.log(`  - translated-parallel-${p}-bilingual.md`);
  }
}

runTest().catch(console.error);
