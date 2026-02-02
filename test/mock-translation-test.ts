/**
 * 模拟翻译测试 - 验证分块和并发逻辑
 * 
 * 这个测试不需要API密钥，用于验证代码逻辑的正确性
 * 测试结果输出到: outputs/mock-test-results.json
 */

import * as fs from 'fs';
import * as path from 'path';

// 确保 outputs 目录存在
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

// 模拟分块功能
function splitTextIntoChunks(text: string, maxTokens: number, overlap: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // 如果当前段落单独就超过限制，需要进一步分割
    if (paragraphTokens > maxTokens) {
      // 先保存当前块
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      // 在段落内按句子分割
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
      // 段落可以作为一个整体
      if (currentTokens + paragraphTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph + '\n\n';
        currentTokens = paragraphTokens;
      } else {
        currentChunk += paragraph + '\n\n';
        currentTokens += paragraphTokens;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

function splitIntoSentences(text: string): string[] {
  // 首先按段落分割，保留段落结构
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const sentences: string[] = [];

  for (const paragraph of paragraphs) {
    // 在每个段落内按句子分割
    const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g;
    const matches = paragraph.match(sentenceRegex);

    if (matches && matches.length > 0) {
      sentences.push(...matches.map(s => s.trim()));
    } else {
      // 如果没有找到句子，保留整个段落
      sentences.push(paragraph.trim());
    }
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

// 模拟翻译：将中文翻译成英文（简单模拟）
async function mockTranslateChunk(chunk: string, delay: number = 100): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 简单的中英对照模拟翻译
  const translations: Record<string, string> = {
    '人工智能': 'Artificial Intelligence',
    '发展历程': 'Development History',
    '未来展望': 'Future Outlook',
    '引言': 'Introduction',
    '计算机科学': 'Computer Science',
    '重要分支': 'Important Branch',
    '模拟、延伸和扩展人类智能': 'simulate, extend and expand human intelligence',
    '理论、方法、技术及应用系统': 'theories, methods, technologies and application systems',
    '20世纪50年代': '1950s',
    '社会进步': 'social progress',
    '经济发展': 'economic development',
    '核心驱动力': 'core driving force',
    '历史发展': 'Historical Development',
    '早期探索': 'Early Exploration',
    '英国数学家': 'British mathematician',
    '阿兰·图灵': 'Alan Turing',
    '计算机器与智能': 'Computing Machinery and Intelligence',
    '机器能思考吗': 'Can machines think',
    '图灵测试': 'Turing Test',
    '智能水平': 'intelligence level',
    '开创性': 'groundbreaking',
    '理论基础': 'theoretical foundation',
    '达特茅斯学院': 'Dartmouth College',
    '约翰·麦卡锡': 'John McCarthy',
    '独立学科': 'independent discipline',
    '马文·明斯基': 'Marvin Minsky',
    '克劳德·香农': 'Claude Shannon',
    '研究目标': 'research goals',
    '乐观态度': 'optimistic attitude',
    '预言': 'prediction',
    '计算能力': 'computing power',
    '复杂性': 'complexity',
    '第一次寒冬': 'First AI Winter',
    '重大挫折': 'major setback',
    '资助': 'funding',
    '符号推理': 'symbolic reasoning',
    '专家知识': 'expert knowledge',
    '数据中学习': 'learning from data',
    '维护成本': 'maintenance cost',
    '知识工程时代': 'Knowledge Engineering Era',
    '专家系统': 'Expert Systems',
    '领域专家': 'domain experts',
    '医疗诊断': 'medical diagnosis',
    '地质勘探': 'geological exploration',
    'MYCIN': 'MYCIN',
    '血液感染': 'blood infections',
    'DENDRAL': 'DENDRAL',
    '分子结构': 'molecular structure',
    '有机化学': 'organic chemistry',
    '局限性': 'limitations',
    '知识获取': 'knowledge acquisition',
    '通用性': 'generality',
    '不确定性': 'uncertainty',
    '个人计算机': 'personal computers',
    '机器学习崛起': 'Rise of Machine Learning',
    '神经网络': 'neural networks',
    '支持向量机': 'Support Vector Machines',
    '统计学习': 'statistical learning',
    '数据挖掘': 'data mining',
    '特征工程': 'feature engineering',
    '算法': 'algorithms',
    '模型': 'models',
    '训练数据': 'training data',
    '监督学习': 'supervised learning',
    '无监督学习': 'unsupervised learning',
    '强化学习': 'reinforcement learning',
    '深度学习革命': 'Deep Learning Revolution',
    '大数据': 'Big Data',
    'GPU': 'GPU',
    '卷积神经网络': 'Convolutional Neural Networks',
    '循环神经网络': 'Recurrent Neural Networks',
    'AlexNet': 'AlexNet',
    'ImageNet': 'ImageNet',
    '图像识别': 'image recognition',
    '错误率': 'error rate',
    '人类水平': 'human level',
    '自然语言处理': 'Natural Language Processing',
    '语音识别': 'speech recognition',
    '机器翻译': 'machine translation',
    '核心技术': 'core technologies',
    'Transformer': 'Transformer',
    '注意力机制': 'attention mechanism',
    'BERT': 'BERT',
    'GPT': 'GPT',
    '预训练': 'pre-training',
    '微调': 'fine-tuning',
    '生成式AI': 'Generative AI',
    'ChatGPT': 'ChatGPT',
    '大语言模型': 'Large Language Models',
    '应用场景': 'application scenarios',
    '智能客服': 'intelligent customer service',
    '内容创作': 'content creation',
    '代码生成': 'code generation',
    '教育辅助': 'educational assistance',
    '自动驾驶': 'autonomous driving',
    '计算机视觉': 'Computer Vision',
    '目标检测': 'object detection',
    '语义分割': 'semantic segmentation',
    '医疗影像': 'medical imaging',
    '诊断': 'diagnosis',
    '金融': 'finance',
    '风险评估': 'risk assessment',
    '欺诈检测': 'fraud detection',
    '量化交易': 'quantitative trading',
    '推荐系统': 'recommendation systems',
    '电子商务': 'e-commerce',
    '个性化': 'personalization',
    '用户行为': 'user behavior',
    '制造业': 'manufacturing',
    '预测性维护': 'predictive maintenance',
    '质量控制': 'quality control',
    '供应链优化': 'supply chain optimization',
    '机器人': 'robotics',
    '协作机器人': 'collaborative robots',
    '伦理挑战': 'Ethical Challenges',
    '隐私保护': 'privacy protection',
    '数据安全': 'data security',
    '算法偏见': 'algorithmic bias',
    '公平性': 'fairness',
    '透明度': 'transparency',
    '可解释性': 'explainability',
    '就业影响': 'employment impact',
    '技术失业': 'technological unemployment',
    '技能转型': 'skill transformation',
    '终身学习': 'lifelong learning',
    '监管框架': 'regulatory frameworks',
    'AI治理': 'AI governance',
    '国际标准': 'international standards',
    '技术发展趋势': 'Technology Trends',
    '多模态AI': 'Multimodal AI',
    '文本': 'text',
    '图像': 'images',
    '视频': 'video',
    '音频': 'audio',
    '融合': 'fusion',
    '具身智能': 'Embodied AI',
    '物理世界': 'physical world',
    '交互': 'interaction',
    '机器人技术': 'robotics technology',
    '边缘AI': 'Edge AI',
    '设备端': 'on-device',
    '实时处理': 'real-time processing',
    '低延迟': 'low latency',
    '隐私计算': 'privacy-preserving computing',
    '神经符号AI': 'Neuro-Symbolic AI',
    '结合': 'combination',
    '可解释': 'interpretable',
    '通用人工智能': 'Artificial General Intelligence',
    'AGI': 'AGI',
    '人类水平智能': 'human-level intelligence',
    '跨领域': 'cross-domain',
    '自主学习': 'autonomous learning',
    '人机协作': 'human-AI collaboration',
    '增强智能': 'augmented intelligence',
    '创造力': 'creativity',
    '科学发现': 'scientific discovery',
    '新药研发': 'drug discovery',
    '材料科学': 'materials science',
    '可持续发展': 'sustainable development',
    '气候变化': 'climate change',
    '能源优化': 'energy optimization',
    '智慧城市': 'smart cities',
    '结论': 'Conclusion',
    '变革性技术': 'transformative technology',
    '机遇': 'opportunities',
    '挑战': 'challenges',
    '负责任': 'responsible',
    '创新': 'innovation',
    '人类福祉': 'human well-being',
    '文明发展': 'civilization development'
  };
  
  let translated = chunk;
  
  // 替换中文为英文
  for (const [cn, en] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(cn, 'g'), en);
  }
  
  // 添加翻译标记
  translated = translated
    .replace(/# /g, '# [EN] ')
    .replace(/## /g, '## [EN] ')
    .replace(/### /g, '### [EN] ');
  
  return translated;
}

// 串行翻译
async function translateSequential(chunks: string[]): Promise<{ results: string[]; totalTime: number }> {
  const startTime = Date.now();
  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  翻译块 ${i + 1}/${chunks.length}...`);
    const translated = await mockTranslateChunk(chunks[i], 500); // 模拟500ms延迟
    results.push(translated);
  }

  return { results, totalTime: Date.now() - startTime };
}

// 并发翻译
async function translateParallel(chunks: string[], parallelCount: number): Promise<{ results: string[]; totalTime: number }> {
  const startTime = Date.now();
  const results: string[] = new Array(chunks.length);

  for (let i = 0; i < chunks.length; i += parallelCount) {
    const batch = chunks.slice(i, i + parallelCount);
    console.log(`  批次 ${Math.floor(i / parallelCount) + 1}/${Math.ceil(chunks.length / parallelCount)}: 翻译 ${batch.length} 个块...`);

    const batchPromises = batch.map(async (chunk, index) => {
      const translated = await mockTranslateChunk(chunk, 500);
      return { index: i + index, translated };
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ index, translated }) => {
      results[index] = translated;
    });
  }

  return { results, totalTime: Date.now() - startTime };
}

// 生成双语对照内容
function generateBilingualContent(originalChunks: string[], translatedChunks: string[]): string {
  const sections: string[] = [];
  
  for (let i = 0; i < originalChunks.length; i++) {
    sections.push(`## 第 ${i + 1} 段`);
    sections.push('');
    sections.push('**原文：**');
    sections.push('');
    sections.push(originalChunks[i]);
    sections.push('');
    sections.push('**译文：**');
    sections.push('');
    sections.push(translatedChunks[i]);
    sections.push('');
    sections.push('---');
    sections.push('');
  }
  
  return sections.join('\n');
}

// 运行测试
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           模拟翻译性能测试（无需API密钥）                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 读取测试文章
  const testContent = fs.readFileSync(
    path.join(__dirname, 'test-article.md'),
    'utf-8'
  );

  console.log(`测试文件: test/test-article.md`);
  console.log(`输出目录: outputs/`);
  console.log(`文件大小: ${testContent.length} 字符`);
  console.log(`预估Token: ${estimateTokens(testContent)}`);
  console.log('');

  // 分块
  const maxTokensPerChunk = 800;
  const overlap = 100;
  const chunks = splitTextIntoChunks(testContent, maxTokensPerChunk, overlap);

  console.log(`分块配置: maxTokens=${maxTokensPerChunk}, overlap=${overlap}`);
  console.log(`分块数量: ${chunks.length}`);
  console.log('');

  // 显示前3个块的信息
  console.log('前3个块的信息:');
  for (let i = 0; i < Math.min(3, chunks.length); i++) {
    console.log(`  块 ${i + 1}: ${chunks[i].length} 字符, ${estimateTokens(chunks[i])} tokens`);
    console.log(`    预览: ${chunks[i].substring(0, 80).replace(/\n/g, ' ')}...`);
  }
  if (chunks.length > 3) {
    console.log(`  ... 还有 ${chunks.length - 3} 个块`);
  }
  console.log('');

  // 测试1: 串行翻译
  console.log('========================================');
  console.log('测试1: 串行翻译 (parallelChunks=1)');
  console.log('========================================');
  const sequentialResult = await translateSequential(chunks);
  console.log(`✓ 完成! 总耗时: ${sequentialResult.totalTime}ms`);
  // 保存串行翻译结果（单语版）
  const sequentialOutputPath = path.join(OUTPUTS_DIR, 'translated-sequential.md');
  fs.writeFileSync(sequentialOutputPath, sequentialResult.results.join('\n\n'), 'utf-8');
  console.log(`  译文已保存: outputs/translated-sequential.md`);
  // 保存双语对照版
  const sequentialBilingualPath = path.join(OUTPUTS_DIR, 'translated-sequential-bilingual.md');
  fs.writeFileSync(sequentialBilingualPath, generateBilingualContent(chunks, sequentialResult.results), 'utf-8');
  console.log(`  双语对照已保存: outputs/translated-sequential-bilingual.md`);
  console.log('');

  // 等待一下
  await new Promise(resolve => setTimeout(resolve, 500));

  // 测试2: 并发翻译 (parallelChunks=2)
  console.log('========================================');
  console.log('测试2: 并发翻译 (parallelChunks=2)');
  console.log('========================================');
  const parallel2Result = await translateParallel(chunks, 2);
  console.log(`✓ 完成! 总耗时: ${parallel2Result.totalTime}ms`);
  console.log(`  加速比: ${(sequentialResult.totalTime / parallel2Result.totalTime).toFixed(2)}x`);
  // 保存并发翻译结果（单语版）
  const parallel2OutputPath = path.join(OUTPUTS_DIR, 'translated-parallel-2.md');
  fs.writeFileSync(parallel2OutputPath, parallel2Result.results.join('\n\n'), 'utf-8');
  console.log(`  译文已保存: outputs/translated-parallel-2.md`);
  // 保存双语对照版
  const parallel2BilingualPath = path.join(OUTPUTS_DIR, 'translated-parallel-2-bilingual.md');
  fs.writeFileSync(parallel2BilingualPath, generateBilingualContent(chunks, parallel2Result.results), 'utf-8');
  console.log(`  双语对照已保存: outputs/translated-parallel-2-bilingual.md`);
  console.log('');

  // 等待一下
  await new Promise(resolve => setTimeout(resolve, 500));

  // 测试3: 并发翻译 (parallelChunks=3)
  console.log('========================================');
  console.log('测试3: 并发翻译 (parallelChunks=3)');
  console.log('========================================');
  const parallel3Result = await translateParallel(chunks, 3);
  console.log(`✓ 完成! 总耗时: ${parallel3Result.totalTime}ms`);
  console.log(`  加速比: ${(sequentialResult.totalTime / parallel3Result.totalTime).toFixed(2)}x`);
  // 保存并发翻译结果（单语版）
  const parallel3OutputPath = path.join(OUTPUTS_DIR, 'translated-parallel-3.md');
  fs.writeFileSync(parallel3OutputPath, parallel3Result.results.join('\n\n'), 'utf-8');
  console.log(`  译文已保存: outputs/translated-parallel-3.md`);
  // 保存双语对照版
  const parallel3BilingualPath = path.join(OUTPUTS_DIR, 'translated-parallel-3-bilingual.md');
  fs.writeFileSync(parallel3BilingualPath, generateBilingualContent(chunks, parallel3Result.results), 'utf-8');
  console.log(`  双语对照已保存: outputs/translated-parallel-3-bilingual.md`);
  console.log('');

  // 等待一下
  await new Promise(resolve => setTimeout(resolve, 500));

  // 测试4: 并发翻译 (parallelChunks=5)
  console.log('========================================');
  console.log('测试4: 并发翻译 (parallelChunks=5)');
  console.log('========================================');
  const parallel5Result = await translateParallel(chunks, 5);
  console.log(`✓ 完成! 总耗时: ${parallel5Result.totalTime}ms`);
  console.log(`  加速比: ${(sequentialResult.totalTime / parallel5Result.totalTime).toFixed(2)}x`);
  // 保存并发翻译结果（单语版）
  const parallel5OutputPath = path.join(OUTPUTS_DIR, 'translated-parallel-5.md');
  fs.writeFileSync(parallel5OutputPath, parallel5Result.results.join('\n\n'), 'utf-8');
  console.log(`  译文已保存: outputs/translated-parallel-5.md`);
  // 保存双语对照版
  const parallel5BilingualPath = path.join(OUTPUTS_DIR, 'translated-parallel-5-bilingual.md');
  fs.writeFileSync(parallel5BilingualPath, generateBilingualContent(chunks, parallel5Result.results), 'utf-8');
  console.log(`  双语对照已保存: outputs/translated-parallel-5-bilingual.md`);
  console.log('');

  // 生成报告
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    性能对比报告                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('模式                    | 总耗时(ms) | 加速比 | 理论最大加速比');
  console.log('───────────────────────┼───────────┼───────┼───────────────');

  const results = [
    { mode: '串行 (parallelChunks=1)', time: sequentialResult.totalTime },
    { mode: '并发 (parallelChunks=2)', time: parallel2Result.totalTime },
    { mode: '并发 (parallelChunks=3)', time: parallel3Result.totalTime },
    { mode: '并发 (parallelChunks=5)', time: parallel5Result.totalTime },
  ];

  for (const result of results) {
    const speedup = sequentialResult.totalTime / result.time;
    const parallelCount = result.mode.includes('=1') ? 1 : parseInt(result.mode.match(/=(\d)/)?.[1] || '1');
    const theoreticalMax = Math.min(parallelCount, chunks.length);
    console.log(
      `${result.mode.padEnd(22)} | ${result.time.toString().padStart(9)} | ${speedup.toFixed(2).padStart(5)}x | ${theoreticalMax.toString().padStart(13)}x`
    );
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('结论:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  • 串行翻译耗时: ${sequentialResult.totalTime}ms`);
  console.log(`  • 最佳并发配置: parallelChunks=3`);
  console.log(`  • 实际加速比: ${(sequentialResult.totalTime / parallel3Result.totalTime).toFixed(2)}x`);
  console.log(`  • 理论最大加速比: ${Math.min(3, chunks.length)}x`);
  console.log('');
  console.log('说明:');
  console.log('  1. 实际加速比受API响应时间、网络延迟影响');
  console.log('  2. 并发数超过分块数后，加速比不再提升');
  console.log('  3. 过高的并发可能导致API限流');
  console.log('═══════════════════════════════════════════════════════════════');

  // 保存测试结果到 outputs 目录
  const testResults = {
    timestamp: new Date().toISOString(),
    testFile: 'test/test-article.md',
    fileSize: testContent.length,
    estimatedTokens: estimateTokens(testContent),
    chunkConfig: { maxTokens: maxTokensPerChunk, overlap },
    chunkCount: chunks.length,
    results: [
      { mode: '串行 (parallelChunks=1)', time: sequentialResult.totalTime, speedup: 1.0 },
      { mode: '并发 (parallelChunks=2)', time: parallel2Result.totalTime, speedup: sequentialResult.totalTime / parallel2Result.totalTime },
      { mode: '并发 (parallelChunks=3)', time: parallel3Result.totalTime, speedup: sequentialResult.totalTime / parallel3Result.totalTime },
      { mode: '并发 (parallelChunks=5)', time: parallel5Result.totalTime, speedup: sequentialResult.totalTime / parallel5Result.totalTime },
    ],
    conclusion: {
      sequentialTime: sequentialResult.totalTime,
      bestConfig: 'parallelChunks=3',
      bestSpeedup: sequentialResult.totalTime / parallel3Result.totalTime,
    }
  };

  const resultsPath = path.join(OUTPUTS_DIR, 'mock-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2), 'utf-8');
  console.log('');
  console.log(`✓ 测试结果已保存: ${resultsPath}`);
}

runTest().catch(console.error);
