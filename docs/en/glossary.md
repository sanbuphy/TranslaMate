# TranslaMate Glossary Usage Guide

This document explains how to use the glossary feature in TranslaMate to ensure consistency and accuracy in professional term translation.

## Table of Contents

- [Overview](#overview)
- [Glossary Format](#glossary-format)
- [Usage Methods](#usage-methods)
- [Use Cases](#use-cases)
- [Best Practices](#best-practices)
- [CLI Integration](#cli-integration)
- [API Integration](#api-integration)

---

## Overview

Glossary is an important tool in the translation process, used to:

- **Ensure term consistency**: Keep the same term uniformly translated throughout the document
- **Handle professional terminology**: Technical, legal, medical, and other specialized vocabulary
- **Preserve brand names**: Company names, product names, technology stack names
- **Handle polysemous words**: Specify specific translations based on context

## Glossary Format

Glossary uses a simple key-value pair format:

```typescript
interface Glossary {
  [sourceTerm: string]: string; // Source term -> Target term
}
```

### Example Glossary

```json
{
  "open source": "开源",
  "machine learning": "机器学习",
  "API": "API",
  "GPU": "图形处理器",
  "Docker": "Docker",
  "Kubernetes": "Kubernetes",
  "cloud computing": "云计算",
  "artificial intelligence": "人工智能",
  "neural network": "神经网络",
  "deep learning": "深度学习"
}
```

## Usage Methods

### 1. Configuration File Method

Add `glossary` field to `translamate.json`:

```json
{
  "apiKey": "sk-your-api-key",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "glossary": {
    "open source": "开源",
    "machine learning": "机器学习",
    "API": "API",
    "GPU": "图形处理器"
  }
}
```

### 2. Standalone Glossary File

Create `glossary.json` file:

```json
{
  "version": "1.0",
  "description": "Technical Documentation Glossary",
  "terms": {
    "open source": "开源",
    "machine learning": "机器学习",
    "artificial intelligence": "人工智能"
  }
}
```

Specify when using:

```bash
translamate translate document.md --to zh-CN --glossary glossary.json
```

### 3. Programmatic Method

```typescript
import { ChunkedTranslationEngine } from 'translamate';

const engine = new ChunkedTranslationEngine(config);

const result = await engine.translateChunked({
  text: longText,
  targetLanguage: 'zh-CN',
  glossary: {
    'open source': '开源',
    'machine learning': '机器学习',
    'API': 'API',
  },
  parallelChunks: 3,
}, (progress) => {
  console.log(`${progress.currentChunk}/${progress.totalChunks}: ${progress.message}`);
});
```

## Use Cases

### Case 1: Technical Documentation Translation

**Scenario**: Translate a Kubernetes technical blog

**glossary-tech.json**:
```json
{
  "Kubernetes": "Kubernetes",
  "Pod": "Pod",
  "Container": "容器",
  "Node": "节点",
  "Cluster": "集群",
  "Deployment": "Deployment",
  "Service": "Service",
  "Ingress": "Ingress",
  "Namespace": "命名空间",
  "ConfigMap": "ConfigMap",
  "Secret": "Secret",
  "Persistent Volume": "持久卷",
  "kubectl": "kubectl",
  "Helm": "Helm",
  "Docker": "Docker"
}
```

**Usage**:
```bash
translamate translate k8s-guide.md --to zh-CN --glossary glossary-tech.json
```

### Case 2: Legal Contract Translation

**Scenario**: Translate English contract to Chinese

**glossary-legal.json**:
```json
{
  "Party A": "甲方",
  "Party B": "乙方",
  "hereinafter referred to as": "以下简称",
  "intellectual property": "知识产权",
  "confidential information": "保密信息",
  "force majeure": "不可抗力",
  "breach of contract": "违约",
  "liability": "责任",
  "indemnification": "赔偿",
  "termination": "终止",
  "governing law": "管辖法律",
  "jurisdiction": "司法管辖权"
}
```

### Case 3: Medical Literature Translation

**Scenario**: Translate medical research paper

**glossary-medical.json**:
```json
{
  "randomized controlled trial": "随机对照试验",
  "placebo": "安慰剂",
  "double-blind": "双盲",
  "adverse event": "不良事件",
  "efficacy": "疗效",
  "pharmacokinetics": "药代动力学",
  "bioavailability": "生物利用度",
  "contraindication": "禁忌症",
  "adverse reaction": "不良反应"
}
```

### Case 4: Game Localization

**Scenario**: Game content translation

**glossary-game.json**:
```json
{
  "HP": "生命值",
  "MP": "魔法值",
  "EXP": "经验值",
  "Quest": "任务",
  "Achievement": "成就",
  "Inventory": "背包",
  "Skill Tree": "技能树",
  "Boss": "Boss",
  "NPC": "NPC",
  "PvP": "玩家对战",
  "PvE": "玩家对环境"
}
```

## Best Practices

### 1. Glossary Design Principles

```
Priority: Brand names > Technical terms > Industry terms > General terms
```

- **Keep brand names untranslated**: `Docker`, `Kubernetes`, `React`
- **Unify technical terms**: `API` stays as is, `GPU` can be translated as `图形处理器` or keep original
- **Avoid over-translation**: Common tech abbreviations remain unchanged

### 2. Term Granularity

```json
// ✅ Recommended: Exact matching
{
  "machine learning": "机器学习",
  "deep learning": "深度学习"
}

// ❌ Avoid: Too broad
{
  "learning": "学习"
}
```

### 3. Case Sensitivity

```json
// Case-sensitive
{
  "api": "应用程序接口",
  "API": "API"
}
```

### 4. Multi-word Terms Priority

```json
// ✅ Prefer complete matching
{
  "artificial intelligence": "人工智能"
}

// Instead of translating separately
{
  "artificial": "人工的",
  "intelligence": "智能"
}
```

### 5. Version Management

```json
{
  "version": "1.2.0",
  "lastUpdated": "2024-01-15",
  "description": "Kubernetes Documentation Glossary v1.2",
  "terms": {
    // ...
  }
}
```

## CLI Integration

### Command-line Glossary Usage

```bash
# Use JSON file
translamate translate article.md --to zh-CN --glossary ./glossary.json

# Use inline glossary (simple scenarios)
translamate translate article.md --to zh-CN \
  --glossary-term "API:API" \
  --glossary-term "open source:开源"

# Use in batch translation
translamate batch ./docs --to zh-CN --glossary ./glossary-tech.json
```

### Specify in Configuration File

```json
{
  "apiKey": "sk-xxx",
  "model": "deepseek-chat",
  "glossaryPath": "./glossary.json",
  "glossary": {
    "autoLoad": true,
    "mergeWithFile": true
  }
}
```

## API Integration

### Programmatic Usage

```typescript
import { ChunkedTranslationEngine } from 'translamate';

// Load glossary
const glossary = await loadGlossary('./glossary.json');

const engine = new ChunkedTranslationEngine({
  apiKey: process.env.TRANSLAMATE_API_KEY,
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
});

// Single document translation
const result = await engine.translateChunked({
  text: documentContent,
  targetLanguage: 'zh-CN',
  glossary,
  parallelChunks: 3,
});

// Parallel translation of multiple documents
const results = await engine.translateDocumentsParallel({
  documents: [
    { id: 'doc1', text: content1 },
    { id: 'doc2', text: content2 },
    { id: 'doc3', text: content3 },
  ],
  targetLanguage: 'zh-CN',
  glossary,
  parallelDocs: 2,
  parallelChunks: 3,
}, (progress) => {
  console.log(`[${progress.documentId}] ${progress.message}`);
});
```

### Dynamic Glossary

```typescript
// Dynamically generate glossary based on content
function extractGlossary(content: string): Record<string, string> {
  const glossary: Record<string, string> = {};
  
  // Extract function names, class names from code
  const codeTerms = content.match(/\b[A-Z][a-zA-Z0-9]*\b/g) || [];
  
  // Extract technical terms
  const techTerms = [
    'API', 'SDK', 'HTTP', 'REST', 'JSON', 'XML',
    'frontend', 'backend', 'database', 'cache'
  ];
  
  // Build glossary
  for (const term of techTerms) {
    if (content.includes(term)) {
      glossary[term] = translateTerm(term);
    }
  }
  
  return glossary;
}
```

## Glossary Templates

### General Technical Glossary

```json
{
  "version": "1.0",
  "description": "General Technical Glossary",
  "terms": {
    "algorithm": "算法",
    "application": "应用",
    "architecture": "架构",
    "authentication": "认证",
    "authorization": "授权",
    "backend": "后端",
    "bandwidth": "带宽",
    "cache": "缓存",
    "client": "客户端",
    "cloud": "云",
    "compiler": "编译器",
    "component": "组件",
    "compression": "压缩",
    "configuration": "配置",
    "database": "数据库",
    "debugging": "调试",
    "deployment": "部署",
    "domain": "域名",
    "encryption": "加密",
    "firewall": "防火墙",
    "framework": "框架",
    "frontend": "前端",
    "gateway": "网关",
    "hardware": "硬件",
    "hosting": "托管",
    "infrastructure": "基础设施",
    "integration": "集成",
    "interface": "接口",
    "latency": "延迟",
    "load balancing": "负载均衡",
    "middleware": "中间件",
    "module": "模块",
    "monitoring": "监控",
    "network": "网络",
    "optimization": "优化",
    "packet": "数据包",
    "protocol": "协议",
    "proxy": "代理",
    "query": "查询",
    "repository": "仓库",
    "scalability": "可扩展性",
    "server": "服务器",
    "service": "服务",
    "session": "会话",
    "software": "软件",
    "storage": "存储",
    "throughput": "吞吐量",
    "token": "令牌",
    "traffic": "流量",
    "virtualization": "虚拟化",
    "webhook": "Webhook",
    "workflow": "工作流"
  }
}
```

---

## Summary

Glossary is an essential tool for ensuring translation quality. By using glossary properly, you can:

1. **Improve consistency**: Ensure uniform translation of the same term throughout the document
2. **Enhance accuracy**: Achieve accurate translation of professional terms
3. **Maintain brand recognition**: Keep technology brand names unchanged
4. **Accelerate translation process**: Reduce post-editing workload

It is recommended to maintain specialized glossaries for different types of documents and update them regularly.
