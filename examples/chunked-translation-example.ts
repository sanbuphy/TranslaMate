/**
 * TranslaMate 分块翻译 + 术语表使用示例
 *
 * 本示例展示如何使用 ChunkedTranslationEngine 进行：
 * 1. 长文本分块翻译
 * 2. 多文档并行翻译
 * 3. 术语表集成
 * 4. 进度跟踪
 */

import {
  ChunkedTranslationEngine,
  type TranslationProgress,
} from '../src/core/translation';

// 示例配置
const config = {
  apiKey: process.env.TRANSLAMATE_API_KEY || 'your-api-key',
  baseURL: process.env.TRANSLAMATE_BASE_URL || 'https://api.deepseek.com',
  model: 'deepseek-chat',
  maxTokens: 1500,
  temperature: 0.3,
};

// 示例术语表 - 技术文档
const techGlossary = {
  'open source': '开源',
  'machine learning': '机器学习',
  'artificial intelligence': '人工智能',
  'neural network': '神经网络',
  'deep learning': '深度学习',
  'API': 'API',
  'GPU': '图形处理器',
  'Docker': 'Docker',
  'Kubernetes': 'Kubernetes',
  'cloud computing': '云计算',
  'big data': '大数据',
  'data mining': '数据挖掘',
};

/**
 * 示例 1: 长文本分块翻译
 */
async function example1_LongTextTranslation() {
  console.log('=== 示例 1: 长文本分块翻译 ===\n');

  const engine = new ChunkedTranslationEngine(config);

  // 模拟长文本（实际场景中可能是从文件读取）
  const longText = `
Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.

Machine learning algorithms are often categorized as supervised or unsupervised. Supervised learning algorithms can apply what has been learned in the past to new data using labeled examples to predict future events. Starting from the analysis of a known training dataset, the learning algorithm produces an inferred function to make predictions about the output values.

Unsupervised learning, on the other hand, is used when the information used to train is neither classified nor labeled. Unsupervised learning studies how systems can infer a function to describe a hidden structure from unlabeled data. The system doesn't figure out the right output, but it explores the data and can draw inferences from datasets to describe hidden structures.

Deep learning is part of a broader family of machine learning methods based on artificial neural networks. Learning can be supervised, semi-supervised or unsupervised. Deep learning architectures such as deep neural networks, deep belief networks, recurrent neural networks and convolutional neural networks have been applied to fields including computer vision, speech recognition, natural language processing, audio recognition, social network filtering, machine translation, bioinformatics, drug design, medical image analysis, material inspection and board game programs.

The GPU has become an essential tool for deep learning. Its ability to process multiple computations simultaneously makes it ideal for the matrix and vector operations that are fundamental to neural network training. Cloud computing platforms now offer GPU instances specifically designed for machine learning workloads, making high-performance computing accessible to researchers and developers worldwide.

Docker and Kubernetes have revolutionized how machine learning models are deployed. Docker containers ensure consistency across development and production environments, while Kubernetes orchestrates containerized applications at scale. This combination has become the standard for deploying machine learning services in production.

Open source frameworks like TensorFlow, PyTorch, and scikit-learn have democratized access to machine learning tools. These libraries provide pre-built components for building and training models, allowing developers to focus on solving problems rather than implementing algorithms from scratch.
  `.trim();

  console.log(`原文长度: ${longText.length} 字符`);
  console.log('开始翻译...\n');

  const startTime = Date.now();

  const result = await engine.translateChunked(
    {
      text: longText,
      targetLanguage: 'zh-CN',
      glossary: techGlossary,
      maxTokensPerChunk: 800, // 每块最大 token 数
      chunkOverlap: 50, // 块之间重叠的 token 数
      parallelChunks: 3, // 并行翻译 3 个块
    },
    (progress: TranslationProgress) => {
      // 进度回调
      const percentage =
        progress.totalChunks > 0
          ? Math.round((progress.currentChunk / progress.totalChunks) * 100)
          : 0;
      console.log(`[${progress.stage}] ${progress.message} (${percentage}%)`);
    }
  );

  const duration = Date.now() - startTime;

  console.log('\n=== 翻译完成 ===');
  console.log(`分块数: ${result.chunks}`);
  console.log(`预估 Token 数: ${result.totalTokens}`);
  console.log(`耗时: ${duration}ms`);
  console.log(`\n翻译结果:\n${result.text.substring(0, 500)}...`);
}

/**
 * 示例 2: 多文档并行翻译
 */
async function example2_ParallelDocuments() {
  console.log('\n\n=== 示例 2: 多文档并行翻译 ===\n');

  const engine = new ChunkedTranslationEngine(config);

  // 模拟多个文档
  const documents = [
    {
      id: 'doc1-intro',
      text: 'Docker is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly.',
    },
    {
      id: 'doc2-kubernetes',
      text: 'Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It was originally designed by Google and is now maintained by the Cloud Native Computing Foundation.',
    },
    {
      id: 'doc3-ml',
      text: 'Machine learning operations (MLOps) is a paradigm that aims to deploy and maintain machine learning models in production reliably and efficiently. It is a compound of machine learning and DevOps practices.',
    },
  ];

  console.log(`待翻译文档数: ${documents.length}`);
  console.log('开始并行翻译...\n');

  const startTime = Date.now();

  const results = await engine.translateDocumentsParallel(
    {
      documents,
      targetLanguage: 'zh-CN',
      glossary: techGlossary,
      maxTokensPerChunk: 500,
      parallelDocs: 2, // 同时翻译 2 个文档
      parallelChunks: 2, // 每个文档内并行 2 个块
    },
    (progress) => {
      if (progress.documentId) {
        console.log(
          `[${progress.documentId}] ${progress.stage}: ${progress.message}`
        );
      } else {
        console.log(`[全局] ${progress.stage}: ${progress.message}`);
      }
    }
  );

  const duration = Date.now() - startTime;

  console.log('\n=== 翻译结果 ===');
  for (const result of results) {
    console.log(`\n--- ${result.id} ---`);
    if (result.status === 'completed') {
      console.log(`状态: ✅ 完成`);
      console.log(`分块数: ${result.result.chunks}`);
      console.log(
        `译文预览: ${result.result.text.substring(0, 100)}...`
      );
    } else {
      console.log(`状态: ❌ 失败`);
      console.log(`错误: ${result.error}`);
    }
  }
  console.log(`\n总耗时: ${duration}ms`);
}

/**
 * 示例 3: 带领域术语表的翻译
 */
async function example3_DomainSpecificGlossary() {
  console.log('\n\n=== 示例 3: 医学文档翻译 ===\n');

  const engine = new ChunkedTranslationEngine(config);

  // 医学术语表
  const medicalGlossary = {
    'randomized controlled trial': '随机对照试验',
    'placebo': '安慰剂',
    'double-blind': '双盲',
    'adverse event': '不良事件',
    'efficacy': '疗效',
    'pharmacokinetics': '药代动力学',
    'bioavailability': '生物利用度',
    'contraindication': '禁忌症',
    'adverse reaction': '不良反应',
    'clinical trial': '临床试验',
    'informed consent': '知情同意',
    'protocol': '研究方案',
  };

  const medicalText = `
A randomized controlled trial (RCT) was conducted to evaluate the efficacy and safety of the new drug. The study was designed as a double-blind, placebo-controlled trial involving 500 patients.

All participants provided informed consent before enrollment. The study protocol was approved by the institutional review board. The primary endpoint was the improvement in symptoms after 12 weeks of treatment.

Pharmacokinetic analysis showed good bioavailability of the drug. No serious adverse events were reported during the trial. Mild adverse reactions were observed in 5% of patients, including headache and nausea.

Contraindications include known hypersensitivity to any component of the formulation. The drug should not be used in patients with severe hepatic impairment.
  `.trim();

  console.log('使用医学术语表进行翻译...\n');

  const result = await engine.translateChunked({
    text: medicalText,
    targetLanguage: 'zh-CN',
    glossary: medicalGlossary,
    parallelChunks: 2,
  });

  console.log('=== 翻译结果 ===');
  console.log(result.text);
}

/**
 * 示例 4: 游戏本地化
 */
async function example4_GameLocalization() {
  console.log('\n\n=== 示例 4: 游戏本地化 ===\n');

  const engine = new ChunkedTranslationEngine(config);

  // 游戏术语表
  const gameGlossary = {
    'HP': '生命值',
    'MP': '魔法值',
    'EXP': '经验值',
    'Quest': '任务',
    'Achievement': '成就',
    'Inventory': '背包',
    'Skill Tree': '技能树',
    'Boss': '首领',
    'NPC': '非玩家角色',
    'PvP': '玩家对战',
    'PvE': '玩家对环境',
    'Dungeon': '地下城',
    'Guild': '公会',
    'Crafting': '制作',
    'Loot': '战利品',
  };

  const gameText = `
Welcome to the world of Adventure! Your journey begins now.

First, complete the tutorial quest to learn basic controls. You will receive EXP and equipment as rewards. Check your inventory to see your items.

Join a guild to team up with other players. Together, you can challenge powerful Bosses in dungeons. Don't forget to upgrade your Skill Tree to unlock new abilities.

Participate in PvP battles to test your skills against other players, or focus on PvE content to explore the world and complete achievements.

Happy adventuring!
  `.trim();

  console.log('使用游戏术语表进行翻译...\n');

  const result = await engine.translateChunked({
    text: gameText,
    targetLanguage: 'zh-CN',
    glossary: gameGlossary,
  });

  console.log('=== 翻译结果 ===');
  console.log(result.text);
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await example1_LongTextTranslation();
    await example2_ParallelDocuments();
    await example3_DomainSpecificGlossary();
    await example4_GameLocalization();

    console.log('\n\n✅ 所有示例运行完成！');
  } catch (error) {
    console.error('\n\n❌ 示例运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples();
}

export {
  example1_LongTextTranslation,
  example2_ParallelDocuments,
  example3_DomainSpecificGlossary,
  example4_GameLocalization,
};
