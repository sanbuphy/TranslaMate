# 快速开始指南

5 分钟快速上手 TranslaMate！

## 前置要求

- Node.js 18 或更高版本
- npm 9 或更高版本（随 Node.js 安装）
- DeepSeek、OpenAI 或任何 OpenAI 兼容提供商的 API 密钥

## 安装步骤

### 1. 克隆并安装依赖

```bash
cd TranslaMate
npm install
```

### 2. 启动开发模式

```bash
npm run dev
```

这将：
- 启动 Vite 开发服务器
- 启动 Electron
- 打开应用窗口

## 首次配置

### 1. 打开设置

点击侧边栏中的设置图标。

### 2. 配置 API

填写必填字段：

**必填：**
- **API Key**: 来自提供商的 API 密钥

**可选（有默认值）：**
- **API Base URL**: `https://api.deepseek.com`（DeepSeek 默认）
- **Model Name**: `deepseek-chat`
- **Max Tokens**: `512`
- **Temperature**: `0.7`

完成后点击"保存设置"。

### 3. 开始翻译！

1. 在左侧面板输入文本
2. 选择目标语言
3. 点击"翻译"或按 `Ctrl/Cmd + Enter`

## 获取 API 密钥

### DeepSeek（推荐 - 实惠且快速）

1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 免费注册
3. 导航到"API Keys"
4. 创建新密钥
5. 复制并粘贴到 TranslaMate 设置中

**定价**: 约每 100 万 tokens ¥1（非常实惠！）

### OpenAI

1. 访问 [https://platform.openai.com](https://platform.openai.com)
2. 注册或登录
3. 导航到"API Keys"
4. 创建新密钥
5. 复制并粘贴到 TranslaMate 设置中

**定价**: 按模型不同（GPT-4、GPT-3.5 等）

## 生产构建

### Windows

```bash
npm run build:win
```

输出: `out/TranslaMate Setup X.Y.Z.exe`

### macOS

```bash
npm run build:mac
```

输出: `out/TranslaMate-X.Y.Z.dmg` 或 `TranslaMate-X.Y.Z-arm64.dmg`

### 双平台

```bash
npm run build:all
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Shift + T` | 显示/隐藏窗口 |
| `Ctrl/Cmd + Enter` | 翻译 |
| `Esc` | 关闭窗口 |

## 故障排除

### "API configuration not found"

前往设置并输入您的 API 密钥。

### 翻译不工作

1. 检查 API 密钥是否正确
2. 确认基础 URL 与提供商匹配
3. 检查是否有可用额度/配额

### 应用无法启动

1. 删除 `node_modules` 并重新运行 `npm install`
2. 检查 Node.js 版本: `node --version`（应为 18+）
3. 清除缓存: 删除 `dist/` 文件夹

### 构建失败

```bash
# 清理并重新构建
rm -rf dist/ out/ node_modules/
npm install
npm run build:all
```

## 后续步骤

- 阅读完整 [文档](../README.md)
- 如需贡献，查看 [开发指南](development.md)
- 查看 [API 文档](api.md) 了解技术细节

## 支持

- GitHub Issues: [报告问题](https://github.com/username/translamate/issues)
- GitHub Discussions: [提问](https://github.com/username/translamate/discussions)

---

祝您翻译愉快！🌐