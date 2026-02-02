# TranslaMate 术语表使用指南

本文档介绍如何在 TranslaMate 中使用术语表功能，确保专业术语翻译的一致性和准确性。

## 目录

- [概述](#概述)
- [术语表格式](#术语表格式)
- [使用方式](#使用方式)
- [使用案例](#使用案例)
- [最佳实践](#最佳实践)
- [CLI 集成](#cli-集成)
- [API 集成](#api-集成)

---

## 概述

术语表（Glossary）是翻译过程中的重要工具，用于：

- **确保术语一致性**：同一术语在全文中保持统一翻译
- **处理专业术语**：技术、法律、医学等领域的专业词汇
- **保持品牌名称**：公司名、产品名、技术栈名称等
- **处理多义词**：根据上下文指定特定翻译

## 术语表格式

术语表使用简单的键值对格式：

```typescript
interface Glossary {
  [sourceTerm: string]: string; // 原文术语 -> 译文术语
}
```

### 示例术语表

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

## 使用方式

### 1. 配置文件方式

在 `translamate.json` 中添加 `glossary` 字段：

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

### 2. 独立术语表文件

创建 `glossary.json` 文件：

```json
{
  "version": "1.0",
  "description": "技术文档术语表",
  "terms": {
    "open source": "开源",
    "machine learning": "机器学习",
    "artificial intelligence": "人工智能"
  }
}
```

使用时指定：

```bash
translamate translate document.md --to zh-CN --glossary glossary.json
```

### 3. 编程方式

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

## 使用案例

### 案例 1：技术文档翻译

**场景**：翻译一篇关于 Kubernetes 的技术博客

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

**使用**：
```bash
translamate translate k8s-guide.md --to zh-CN --glossary glossary-tech.json
```

### 案例 2：法律合同翻译

**场景**：翻译英文合同为中文

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

### 案例 3：医学文献翻译

**场景**：翻译医学研究论文

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

### 案例 4：游戏本地化

**场景**：游戏内容翻译

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

## 最佳实践

### 1. 术语表设计原则

```
优先级：品牌名 > 技术术语 > 行业术语 > 通用术语
```

- **保持品牌名不翻译**：`Docker`, `Kubernetes`, `React`
- **技术术语统一**：`API` 不翻译，`GPU` 可译为 `图形处理器` 或保持原样
- **避免过度翻译**：常见的技术缩写保持原样

### 2. 术语粒度

```json
// ✅ 推荐：精确匹配
{
  "machine learning": "机器学习",
  "deep learning": "深度学习"
}

// ❌ 避免：过于宽泛
{
  "learning": "学习"
}
```

### 3. 大小写敏感

```json
// 区分大小写
{
  "api": "应用程序接口",
  "API": "API"
}
```

### 4. 多词术语优先

```json
// ✅ 优先完整匹配
{
  "artificial intelligence": "人工智能"
}

// 而不是单独翻译
{
  "artificial": "人工的",
  "intelligence": "智能"
}
```

### 5. 版本管理

```json
{
  "version": "1.2.0",
  "lastUpdated": "2024-01-15",
  "description": "Kubernetes 文档术语表 v1.2",
  "terms": {
    // ...
  }
}
```

## CLI 集成

### 命令行使用术语表

```bash
# 使用 JSON 文件
translamate translate article.md --to zh-CN --glossary ./glossary.json

# 使用内联术语表（简单场景）
translamate translate article.md --to zh-CN \
  --glossary-term "API:API" \
  --glossary-term "open source:开源"

# 批量翻译时使用
translamate batch ./docs --to zh-CN --glossary ./glossary-tech.json
```

### 配置文件中指定

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

## API 集成

### 程序化使用

```typescript
import { ChunkedTranslationEngine } from 'translamate';

// 加载术语表
const glossary = await loadGlossary('./glossary.json');

const engine = new ChunkedTranslationEngine({
  apiKey: process.env.TRANSLAMATE_API_KEY,
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
});

// 单文档翻译
const result = await engine.translateChunked({
  text: documentContent,
  targetLanguage: 'zh-CN',
  glossary,
  parallelChunks: 3,
});

// 多文档并行翻译
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

### 动态术语表

```typescript
// 根据内容动态生成术语表
function extractGlossary(content: string): Record<string, string> {
  const glossary: Record<string, string> = {};
  
  // 提取代码中的函数名、类名
  const codeTerms = content.match(/\b[A-Z][a-zA-Z0-9]*\b/g) || [];
  
  // 提取技术术语
  const techTerms = [
    'API', 'SDK', 'HTTP', 'REST', 'JSON', 'XML',
    'frontend', 'backend', 'database', 'cache'
  ];
  
  // 构建术语表
  for (const term of techTerms) {
    if (content.includes(term)) {
      glossary[term] = translateTerm(term);
    }
  }
  
  return glossary;
}
```

## 术语表模板

### 通用技术术语表

```json
{
  "version": "1.0",
  "description": "通用技术术语表",
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

## 总结

术语表是确保翻译质量的重要工具。通过合理使用术语表，可以：

1. **提高一致性**：确保同一术语在全文中统一翻译
2. **提升准确性**：专业术语得到准确翻译
3. **保持品牌识别**：技术品牌名保持原样
4. **加速翻译流程**：减少后期校对工作量

建议为不同类型的文档维护专门的术语表，并定期更新维护。
