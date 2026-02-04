/**
 * 分块算法单元测试
 * 
 * 测试目标：验证文本分块算法的正确性
 * - splitTextIntoChunks: 将长文本分割成多个小块
 * - splitIntoSentences: 将文本分割成句子
 * - estimateTokens: 估算文本的 token 数量
 * - getOverlapText: 获取重叠文本用于块间上下文
 */

const tests = [
  { 
    name: '空文本应该返回原文本', 
    description: '测试边界情况：当输入为空字符串时，splitTextIntoChunks 应该返回包含一个空字符串的数组，而不是空数组或抛出错误',
    fn: () => {
      const chunks = splitTextIntoChunks('', 100);
      if (chunks.length !== 1) throw new Error(`期望1个块，得到${chunks.length}`);
      if (chunks[0] !== '') throw new Error('块内容应为空');
    }
  },
  { 
    name: '短文本不应分块', 
    description: '测试正常情况：当输入文本长度小于 maxTokens 时，splitTextIntoChunks 应该返回包含整个文本的单个块，不进行分割',
    fn: () => {
      const chunks = splitTextIntoChunks('这是一段短文本', 100);
      if (chunks.length !== 1) throw new Error(`期望1个块，得到${chunks.length}`);
    }
  },
  { 
    name: '足够长的文本应该分块', 
    description: '测试分块功能：当输入文本长度超过 maxTokens 时，splitTextIntoChunks 应该将文本分割成多个块',
    fn: () => {
      const text = ('这是测试内容。').repeat(100);
      const chunks = splitTextIntoChunks(text, 50);
      if (chunks.length <= 1) throw new Error('应该分多个块');
    }
  },
  { 
    name: '所有内容应该被保留', 
    description: '测试数据完整性：分块后，将所有块重新拼接应该包含原始文本的所有内容，确保没有数据丢失',
    fn: () => {
      const text = '段落一。\n\n段落二。\n\n段落三。';
      const chunks = splitTextIntoChunks(text, 50);
      const combined = chunks.join('');
      if (!combined.includes('段落一')) throw new Error('缺少段落一');
      if (!combined.includes('段落二')) throw new Error('缺少段落二');
      if (!combined.includes('段落三')) throw new Error('缺少段落三');
    }
  },
  { 
    name: 'CJK 字符应该计算为 1 token', 
    description: '测试 token 估算：中日韩统一表意文字(CJK)应该被计算为 1 个 token，每个字符独立计数',
    fn: () => {
      if (estimateTokens('你好世界') !== 4) throw new Error('CJK计算错误');
      if (estimateTokens('人工智能') !== 4) throw new Error('CJK计算错误');
    }
  },
  { 
    name: '应该正确分割中文句子', 
    description: '测试句子分割：splitIntoSentences 应该能够识别中文标点符号（。！？）并正确分割中文句子',
    fn: () => {
      const sentences = splitIntoSentences('第一句。第二句。第三句。');
      if (sentences.length !== 3) throw new Error(`期望3个句子，得到${sentences.length}`);
    }
  },
  { 
    name: '应该正确分割英文句子', 
    description: '测试句子分割：splitIntoSentences 应该能够识别英文标点符号（.!?）并正确分割英文句子',
    fn: () => {
      const sentences = splitIntoSentences('First sentence. Second sentence. Third sentence.');
      if (sentences.length !== 3) throw new Error(`期望3个句子，得到${sentences.length}`);
    }
  },
];

function splitTextIntoChunks(text, maxTokens, overlap = 50) {
  const chunks = [];
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

function splitIntoSentences(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const sentences = [];
  for (const paragraph of paragraphs) {
    const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g;
    const matches = paragraph.match(sentenceRegex);
    if (matches && matches.length > 0) sentences.push(...matches.map(s => s.trim()));
    else sentences.push(paragraph.trim());
  }
  return sentences.length > 0 ? sentences : [text];
}

function getOverlapText(text, overlapTokens) {
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

function estimateTokens(text) {
  const cjkChars = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - cjkChars - englishWords;
  return Math.ceil(cjkChars + englishWords * 0.75 + otherChars * 0.25);
}

console.log('═'.repeat(60));
console.log('  分块算法测试');
console.log('═'.repeat(60));
console.log('');

let passed = 0, failed = 0;
for (const tc of tests) {
  process.stdout.write(`  ${tc.name} ... `);
  try {
    tc.fn();
    console.log('✓');
    passed++;
  } catch (e) {
    console.log('✗');
    console.log(`    错误: ${e.message}`);
    failed++;
  }
}

console.log('');
console.log('─'.repeat(60));
console.log(`  结果: ${passed} 通过, ${failed} 失败`);
console.log('─'.repeat(60));

if (failed > 0) process.exit(1);
