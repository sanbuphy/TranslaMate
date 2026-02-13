<div align="center">

<img src="assets/logo.png" alt="TranslaMate Logo" width="120" height="120">

# TranslaMate

**AI 驱动的桌面 / 命令行翻译应用**

[![GitHub release](https://img.shields.io/github/v/release/sanbuphy/translamate?style=flat-square)](https://github.com/sanbuphy/translamate/releases)
[![License](https://img.shields.io/github/license/sanbuphy/translamate?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/sanbuphy/translamate/build.yml?style=flat-square)](https://github.com/sanbuphy/translamate/actions)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue?style=flat-square)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)]()
[![Downloads](https://img.shields.io/github/downloads/sanbuphy/translamate/total?style=flat-square)]()

[English](README.md) · [简体中文](README_zh.md)

</div>

---

## TranslaMate 是什么？

TranslaMate 是一个**统一的翻译解决方案**，将现代化的桌面应用与强大的命令行界面相结合。通过 **GUI 和 CLI** 两种方式，为您提供一致、简单的 AI 翻译体验。

告别在不同翻译工具之间切换的烦恼。无论是翻译一句话还是处理数千份文档，一个应用搞定一切。

```bash
# CLI：一行命令翻译
translamate translate "Hello World" --to zh-CN

# 桌面端：随处按 Ctrl+Shift+T
```

---

## 核心特性

| 特性 | 说明 |
|------|------|
| **双界面** | 同时支持桌面 GUI 和命令行 CLI |
| **通用 API** | 兼容任何 OpenAI 格式的提供商 |
| **一键安装** | `npm install -g translamate` 即可使用 |
| **批量处理** | 一条命令翻译整个文件夹 |
| **10+ 语言** | 自动检测 + 手动选择源语言 |
| **灵活配置** | 支持 `.env`、JSON 配置或直接传参 |
| **零依赖** | 单二进制文件，无需运行时依赖 |
| **隐私优先** | 所有数据本地存储 |

---

## 快速开始

### 桌面应用

**macOS (Homebrew)：**
```bash
brew install --cask translamate
```

**Windows (Scoop)：**
```powershell
scoop install translamate
```

**或直接下载：**
- [最新版本](https://github.com/sanbuphy/translamate/releases/latest)

### CLI 安装

```bash
# 全局安装
npm install -g translamate

# 或使用 npx（无需安装）
npx translamate translate "Hello" --to zh-CN
```

### 1. 设置 API Key

```bash
# 创建 .env 文件
echo 'TRANSLAMATE_API_KEY=your_key_here' > .env

# 或使用配置命令
translamate config set apiKey your_key_here
```

### 2. 开始翻译

**桌面端：**
```
Ctrl/Cmd + Shift + T  →  显示 TranslaMate
Ctrl/Cmd + Enter      →  执行翻译
```

**CLI：**
```bash
# 简单翻译
translamate translate "Hello World" --to zh-CN

# 文件翻译
translamate translate document.md --to ja --output document-ja.md

# 批量翻译
translamate batch ./docs --to zh-CN --output ./docs-zh
```

---

## 使用示例

### 桌面应用

```
1. 打开 TranslaMate（或按 Ctrl/Cmd+Shift+T）
2. 在输入框中输入文本
3. 选择目标语言
4. 按 Ctrl/Cmd+Enter 翻译
5. 在侧边栏查看历史记录
```

### 命令行界面

```bash
# 查看所有命令
translamate --help

# 翻译文本
translamate translate "Hello, how are you?" --to zh-CN
# 输出：你好，你好吗？

# 指定源语言翻译
translamate translate "Bonjour" --from fr --to en

# 翻译文件
translamate translate readme.md --to ja --output readme-ja.md

# 批量翻译目录
translamate batch ./content --to de --ext "md,txt,html"

# 查看配置
translamate config list
```

---

## 支持的提供商

### AI 翻译提供商

| 提供商 | Base URL | 模型 | 价格 |
|--------|----------|------|------|
| **DeepSeek**（推荐） | `https://api.deepseek.com` | `deepseek-chat`, `deepseek-reasoner` | ~¥1/百万 tokens |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4`, `gpt-3.5-turbo` | $0.50-30/百万 tokens |
| **SiliconFlow** | `https://api.siliconflow.cn` | 多种开源模型 | 有竞争力 |
| **本地 (Ollama)** | `http://localhost:11434/v1` | 任意本地模型 | 免费 |

---

## 支持的语言

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 自动检测 | `auto` | 韩语 | `ko` |
| 简体中文 | `zh-CN` | 阿拉伯语 | `ar` |
| 繁体中文 | `zh-TW` | 越南语 | `vi` |
| 英语 | `en` | 德语 | `de` |
| 日语 | `ja` | 西班牙语 | `es` |
| 法语 | `fr` | 葡萄牙语 | `pt` |
| 俄语 | `ru` | 意大利语 | `it` |

---

## 配置

### 方式 1：环境变量（推荐）

在项目根目录创建 `.env` 文件：

```bash
TRANSLAMATE_API_KEY=your_key_here
TRANSLAMATE_BASE_URL=https://api.deepseek.com
TRANSLAMATE_MODEL=deepseek-chat
TRANSLAMATE_MAX_TOKENS=512
TRANSLAMATE_TEMPERATURE=0.7
```

### 方式 2：配置文件

在 home 目录或项目目录创建 `.translamate.json`：

```json
{
  "apiKey": "your_key_here",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

### 方式 3：CLI 配置命令

```bash
# 设置配置
translamate config set apiKey your_key_here
translamate config set baseURL https://api.deepseek.com
translamate config set model deepseek-chat

# 查看配置
translamate config list
```

### 配置优先级

1. CLI 参数（最高）
2. 环境变量
3. 当前目录的 `.translamate.json`
4. home 目录的 `.translamate.json`
5. 默认值（最低）

---

## 开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 设置

```bash
# 克隆
git clone https://github.com/sanbuphy/translamate.git
cd translamate

# 安装
npm install

# 桌面端开发模式
npm run electron:dev

# 构建 CLI
npm run build:cli

# 构建桌面端
npm run build:all
```

### 技术栈

```
┌─────────────────────────────────────────┐
│  表现层                                  │
│  ├── Electron + React (桌面端)           │
│  └── Commander.js (CLI)                 │
├─────────────────────────────────────────┤
│  核心层                                  │
│  ├── 翻译引擎                             │
│  ├── 批量处理器                           │
│  └── 配置加载器                           │
├─────────────────────────────────────────┤
│  基础设施                                │
│  ├── OpenAI SDK                         │
│  ├── Tailwind CSS                       │
│  └── Zustand (状态管理)                  │
└─────────────────────────────────────────┘
```

---

## 文档

- [快速开始指南](docs/zh/quickstart.md) - 5 分钟上手
- [CLI 文档](docs/zh/cli.md) - 完整 CLI 参考
- [API 参考](docs/zh/api.md) - API 配置指南
- [开发指南](docs/zh/development.md) - 贡献和开发
- [部署指南](docs/zh/deployment.md) - 服务器部署
- [架构文档](docs/zh/architecture.md) - 系统架构（含分块翻译技术）
- [翻译代理](docs/zh/translation-agent.md) - 多提供商配置
- [贡献指南](docs/zh/contributing.md) - 贡献规范
- [术语表](docs/zh/glossary.md) - 术语解释
- [构建验证](docs/zh/build-verification.md) - 构建检查清单

---

## 路线图

- [ ] PDF 和 DOCX 批量翻译支持
- [ ] 翻译记忆库和术语表
- [ ] 自定义提供商插件系统
- [ ] Linux 支持 (AppImage)
- [ ] 历史记录云同步
- [ ] REST API 服务器模式
- [ ] Web 界面

---

## 贡献

欢迎贡献！参与步骤：

1. **Fork** 仓库
2. 创建**功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交**更改 (`git commit -m 'feat: add amazing feature'`)
4. **推送**到分支 (`git push origin feature/amazing-feature`)
5. 发起 **Pull Request**

详见 [CONTRIBUTING.md](docs/CONTRIBUTING.md)。

### 贡献者

<a href="https://github.com/sanbuphy/translamate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sanbuphy/translamate" />
</a>

---

## 项目统计

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=sanbuphy/translamate&type=Date)](https://star-history.com/#sanbuphy/translamate&Date)

</div>

---

## 许可证

本项目采用 **Apache License 2.0** - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

感谢所有 AI 提供商提供的优秀 API：

[DeepSeek](https://www.deepseek.com/) · [OpenAI](https://openai.com/) · [SiliconFlow](https://cloud.siliconflow.cn/) · [Ollama](https://ollama.com/)

特别感谢开源社区提供的工具：
[Electron](https://www.electronjs.org/) · [React](https://react.dev/) · [Vite](https://vitejs.dev/) · [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**在 GitHub 上给我们点星 — 这对我们是很大的鼓励！**

[报告 Bug](https://github.com/sanbuphy/translamate/issues) · [功能建议](https://github.com/sanbuphy/translamate/issues) · [文档](https://github.com/sanbuphy/translamate/tree/main/docs)

</div>
