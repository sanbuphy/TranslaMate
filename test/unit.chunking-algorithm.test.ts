/**
 * 分块算法测试
 * 
 * 运行: npx tsx test/unit.chunking-algorithm.test.ts
 */

declare const process: { exit(code: number): void; stdout: { write(msg: string): void } };

const tests: { name: string; fn: () => void }[] = [];
let passed = 0;
let failed = 0;

function describe(name: string, fn: () => void) {
  fn();
}

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function assert(condition: boolean, message?: string) {
  if (!condition) throw new Error(message || '断言失败');
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) throw new Error(message || `期望 ${expected}，得到 ${actual}`);
}

function assertGreaterThan(actual: number, expected: number, message?: string) {
  if (actual <= expected) throw new Error(message || `期望 ${actual} > ${expected}`);
}

function runTests() {
  console.clear();
  console.log('═'.repeat(60));
  console.log('  分块算法测试');
  console.log('═'.repeat(60));
  console.log('');

  for (const tc of tests) {
    process.stdout.write(`  ${tc.name} ... `);
    const start = Date.now();
    try {
      tc.fn();
      console.log(`✓ (${Date.now() - start}ms)`);
      passed++;
    } catch (e) {
      console.log(`✗ (${Date.now() - start}ms)`);
      console.log(`    错误: ${(e as Error).message}`);
      failed++;
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`  结果: ${passed} 通过, ${failed} 失败`);
  console.log('─'.repeat(60));

  if (failed > 0) process.exit(1);
}

function splitTextIntoChunks(text: string, maxTokens: number, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    if (paragraphTokens > maxTokens) {
      if (currentChunk.length > 0) { chunks.push(currentChunk.trim()); currentChunk = ''; currentTokens = 0; }
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
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks.length > 0 ? chunks : [text];
}

function splitIntoSentences(text: string): string[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const sentences: string[] = [];
  for (const paragraph of paragraphs) {
    const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g;
    const matches = paragraph.match(sentenceRegex);
    if (matches && matches.length > 0) sentences.push(...matches.map(s => s.trim()));
    else sentences.push(paragraph.trim());
  }
  return sentences.length > 0 ? sentences : [text];
}

function getOverlapText(text: string, overlapTokens: number): string {
  const sentences = splitIntoSentences(text);
  let overlapText = '';
  let tokens = 0;
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokens(sentence);
    if (tokens + sentenceTokens > overlapTokens) break;
    overlapText = sentence + ' ' + overlapText;
    tokens += sentenceTokens;
  }
  return overlapText;
}

function estimateTokens(text: string): number {
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const otherChars = text.length - cjkChars - englishChars;
  return Math.ceil(cjkChars + englishWords + otherChars * 0.25);
}

describe('分块算法', () => {
  test('空文本应该返回原文本', () => {
    const chunks = splitTextIntoChunks('', 100);
    assertEqual(chunks.length, 1);
    assertEqual(chunks[0], '');
  });

  test('短文本不应分块', () => {
    const chunks = splitTextIntoChunks('这是一段短文本', 100);
    assertEqual(chunks.length, 1);
  });

  test('足够长的文本应该分块', () => {
    const text = ('这是测试内容。').repeat(100);
    const chunks = splitTextIntoChunks(text, 50);
    assertGreaterThan(chunks.length, 1);
  });

  test('每个块应该在 token 限制内', () => {
    const text = ('短文本。').repeat(100);
    const chunks = splitTextIntoChunks(text, 50);
    chunks.forEach((chunk, i) => {
      const tokens = estimateTokens(chunk);
      assert(tokens <= 60, `块 ${i + 1} 有 ${tokens} tokens，超出限制`);
    });
  });

  test('所有内容应该被保留', () => {
    const text = '段落一。\n\n段落二。\n\n段落三。';
    const chunks = splitTextIntoChunks(text, 50);
    const combined = chunks.join('');
    assert(combined.includes('段落一'));
    assert(combined.includes('段落二'));
    assert(combined.includes('段落三'));
  });
});

describe('Token 估算', () => {
  test('CJK 字符应该计算为 1 token', () => {
    assertEqual(estimateTokens('你好世界'), 4);
    assertEqual(estimateTokens('人工智能'), 4);
  });

  test('英文应该按字符计算', () => {
    assertEqual(estimateTokens('ab'), 1);
    assertEqual(estimateTokens('hello'), 1);
  });
});

describe('句子分割', () => {
  test('应该正确分割中文句子', () => {
    const sentences = splitIntoSentences('第一句。第二句。第三句。');
    assertEqual(sentences.length, 3);
  });

  test('应该正确分割英文句子', () => {
    const sentences = splitIntoSentences('First sentence. Second sentence. Third sentence.');
    assertEqual(sentences.length, 3);
  });
});

runTests();
