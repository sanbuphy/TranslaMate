# 开发指南

本文档为想要贡献或修改 TranslaMate 的开发者提供信息。

## 项目结构

```
TranslaMate/
├── src/
│   ├── core/              # 核心翻译逻辑（平台无关）
│   │   ├── translation/   # 翻译引擎
│   │   ├── batch/         # 批处理
│   │   ├── config/        # 配置管理
│   │   └── types.ts       # 核心类型定义
│   ├── cli/               # 命令行界面
│   │   ├── commands/      # CLI 命令
│   │   └── index.ts       # CLI 入口点
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主入口点
│   │   ├── preload.ts     # 预加载脚本
│   │   └── store.ts       # Electron store 配置
│   └── renderer/          # React 前端
│       ├── components/    # React 组件
│       ├── store/         # Zustand 状态管理
│       ├── App.tsx        # 主应用组件
│       ├── main.tsx       # 入口点
│       └── index.css      # 全局样式
├── scripts/               # 构建和发布脚本
├── docs/                  # 文档
└── build/                 # 构建资源
```

详细的架构信息请参阅 [architecture.md](architecture.md)。

## 技术栈

- **框架**: Electron
- **前端**: React 18 with TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **API 客户端**: OpenAI SDK

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 开发工作流

```bash
# 以开发模式运行
npm run electron:dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 架构

### 主进程 (Electron)

主进程处理：
- 窗口管理
- IPC（进程间通信）
- 调用翻译服务 API
- 通过 electron-store 进行本地存储
- 全局快捷键

### 渲染进程 (React)

渲染进程处理：
- UI 渲染
- 用户交互
- 状态管理 (Zustand)
- 通过预加载脚本与主进程通信

### 通信

主进程和渲染进程通过 IPC（进程间通信）进行通信：

```typescript
// 渲染器 (React)
const result = await window.electronAPI.translate({ text: 'Hello', targetLanguage: 'zh' });

// 主进程 (Electron)
ipcMain.handle('translate', async (event, request) => {
  // 处理翻译
  return result;
});
```

## 添加新功能

### 添加新语言

编辑 `src/shared/types.ts`：

```typescript
export const SUPPORTED_LANGUAGES: Language[] = [
  // 添加新语言
  { code: 'fr', name: 'French', nativeName: 'Français' },
];
```

### 添加新 API 提供商

`src/main/services/translation.ts` 中的翻译服务使用 OpenAI SDK。要添加对新提供商的支持：

1. 确保提供商与 OpenAI 兼容
2. 更新文档，包含提供商的 baseURL 和模型名称
3. 无需代码更改 - 只需在 UI 中配置即可

### 修改 UI

UI 组件位于 `src/renderer/components/`：

- `TranslateView.tsx` - 主翻译界面
- `HistoryView.tsx` - 翻译历史
- `SettingsView.tsx` - 设置页面
- `Sidebar.tsx` - 导航侧边栏
- `ErrorAlert.tsx` - 错误通知

样式使用 Tailwind CSS 工具类。全局样式在 `src/renderer/index.css`。

## 测试

### 测试脚本

```bash
# 运行所有测试
npm test

# 仅运行单元测试
npm run test:unit

# 运行性能测试（需要 API 密钥）
npm run test:performance
```

### 单元测试

单元测试套件（`test/unit.chunking-algorithm.test.ts`）验证：
- 文本分段的分块算法
- CJK 和英文文本的 token 估算准确性
- 中文和英文的句子分割
- 通过分块保留内容

**运行单元测试：**
```bash
npm run test:unit
```

**预期结果：**
```
════════════════════════════════════════════════════════════
  分块算法测试
═════════════════════════════════════════════════════════════

  空文本应该返回原文本 ... ✓ (0ms)
  短文本不应分块 ... ✓ (0ms)
  足够长的文本应该分块 ... ✓ (1ms)
  每个块应该在 token 限制内 ... ✓ (1ms)
  所有内容应该被保留 ... ✓ (0ms)
  CJK 字符应该计算为 1 token ... ✓ (0ms)
  英文应该按字符计算 ... ✓ (0ms)
  应该正确分割中文句子 ... ✓ (0ms)
  应该正确分割英文句子 ... ✓ (0ms)

────────────────────────────────────────────────────────────
  结果: 9 通过, 0 失败
────────────────────────────────────────────────────────────
```

### 性能测试

性能测试（`test/performance.chunked-engine.test.ts`）测量：
- 串行翻译性能（parallelChunks=1）
- 并行翻译性能（parallelChunks=2,3,5）
- 加速比和时间节省
- 翻译质量验证

**运行性能测试：**
```bash
npm run test:performance
```

**注意：** 需要有效的 API 密钥配置。

### 翻译验证测试

翻译测试验证 CLI 能否将文档翻译成多种语言：
- 英语（`en`）
- 繁体中文（`zh-TW`）
- 日语（`ja`）

**运行翻译测试：**
```bash
# 测试单个语言
npm run test:translate:en
npm run test:translate:zh-tw
npm run test:translate:ja

# 测试所有语言
npm run test:translate:all
```

**注意：** 这些测试需要配置的 API 密钥。

### 测试文件

- `test/unit.chunking-algorithm.test.ts` - 分块算法单元测试
- `test/performance.chunked-engine.test.ts` - 性能基准测试
- `test/integration.deepseek-api.test.ts` - 与真实 API 的集成测试
- `test/data.ai-article.md` - 用于翻译的测试文档


## 构建

### 构建脚本

我们在 `scripts/` 目录中提供了便捷的构建脚本：

```bash
# 完整构建（清理 + CLI + Electron + 验证）
node scripts/build.js full

# 仅构建 CLI
node scripts/build.js cli

# 仅构建 Electron
node scripts/build.js electron

# 为特定平台构建
node scripts/build.js win
node scripts/build.js mac
node scripts/build.js linux

# 构建所有平台
node scripts/build.js all

# 清理构建目录
node scripts/build.js clean

# 验证构建输出
node scripts/build.js verify
```

### NPM 脚本

```bash
# 构建 CLI
npm run build:cli

# 构建 Electron 应用
npm run build

# 为当前平台构建
npm run electron:build

# 为特定平台构建
npm run build:win
npm run build:mac
npm run build:linux
npm run build:all
```

### 构建输出

- **CLI**: `dist/cli/`
- **Electron**: `dist/main/`, `dist/renderer/`
- **包**: `release/`（electron-builder 输出）

### 构建后 CLI 使用

```bash
# 全局链接 CLI
npm link

# 使用 CLI
translamate translate "Hello" --to zh-CN
translamate batch ./docs --to zh-CN

# 或不链接直接使用
node dist/cli/index.js translate "Hello" --to zh-CN
```

## 调试

### 主进程

在开发环境中，DevTools 会自动打开。要手动打开：

```typescript
mainWindow.webContents.openDevTools();
```

### 渲染进程

使用 React DevTools 浏览器扩展或内置 DevTools。

### 日志记录

使用 `console.log()` 进行调试。在生产环境中，考虑使用像 `electron-log` 这样的日志库。

## 发布流程

### 版本管理

```bash
# 增加补丁版本 (0.0.1 -> 0.0.2)
npm run version:patch

# 增加次要版本 (0.1.0 -> 0.2.0)
npm run version:minor

# 增加主要版本 (1.0.0 -> 2.0.0)
npm run version:major
```

### 发布脚本

```bash
# 验证发布准备情况
node scripts/release.js validate

# 更新 CHANGELOG.md
node scripts/release.js changelog

# 创建 git 标签
node scripts/release.js tag

# 完整发布流程
node scripts/release.js full
```

### 手动发布步骤

1. **更新版本**：
   ```bash
   npm version patch  # 或 minor/major
   ```

2. **用新版本和更改更新 CHANGELOG.md**

3. **构建和测试**：
   ```bash
   node scripts/build.js full
   ```

4. **提交和标记**：
   ```bash
   git add -A
   git commit -m "chore(release): v$(node -p "require('./package.json').version")"
   git tag -a "v$(node -p "require('./package.json').version")" -m "Release v$(node -p "require('./package.json').version")"
   ```

5. **推送**：
   ```bash
   git push origin main
   git push origin --tags
   ```

## 常见问题

### 找不到模块

确保已运行 `npm install` 并重启开发服务器。

### IPC 错误

验证：
1. 处理器已在 `src/main/index.ts` 中注册
2. API 已在 `src/main/preload.ts` 中暴露
3. 类型已在 `src/shared/types.ts` 中定义

### 构建错误

清理构建目录：

```bash
node scripts/build.js clean
npm run build:all
```

### TypeScript 错误

运行类型检查以识别问题：

```bash
npm run typecheck
```

## 贡献

请参阅 [contributing.md](contributing.md) 了解贡献指南。

## 许可证

Apache License 2.0 - 详情见 [LICENSE](../LICENSE)。