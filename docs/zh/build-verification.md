# 构建验证指南

本文档提供了验证 TranslaMate 构建成功与否的检查清单。

## 先决条件

- Node.js >= 18
- npm >= 9
- 所有依赖已安装（`npm install`）

---

## 构建验证检查清单

### 1. CLI 构建验证

#### 构建 CLI
```bash
npm run build:cli
```

**预期结果：**
- 创建 `dist/cli/` 目录
- JavaScript 文件已编译
- 无 TypeScript 错误
- 退出代码：0

#### CLI 冒烟测试
```bash
# 测试 help 命令
node dist/cli/index.js --help

# 测试 version 命令
node dist/cli/index.js --version
```

**预期结果：**
- 显示帮助文本
- 显示版本号
- 无错误

#### 输出目录结构
```
dist/cli/
├── cli/
│   ├── commands/
│   │   ├── batch.js
│   │   ├── config.js
│   │   ├── index.js
│   │   └── translate.js
│   └── index.js
└── core/
    ├── batch/
    ├── config/
    ├── translation/
    └── types.js
```

---

### 2. 桌面应用（Electron）构建验证

#### 构建桌面应用
```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux

# 或构建所有平台
npm run build:all
```

**预期结果：**
- `dist/` 目录包含已编译的文件
- `out/` 目录包含打包的应用程序
- 无构建错误
- 退出代码：0

#### 桌面输出验证

**macOS：**
```
out/
├── TranslaMate-<version>-<arch>.dmg
├── TranslaMate-<version>-<arch>.zip
└── TranslaMate-<version>-darwin dmg (macOS DMG)
```

**Windows：**
```
out/
├── TranslaMate Setup <version>.exe
└── TranslaMate-<version>-win portable.exe (便携版)
```

**Linux：**
```
out/
├── TranslaMate-<version>.AppImage
├── TranslaMate-<version>.deb
└── TranslaMate-<version>.rpm
```

---

## 测试脚本

### 单元测试
```bash
npm run test:unit
```

**预期结果：**
- 所有测试通过
- 退出代码：0
- 摘要显示 "X passed, 0 failed"

### 性能测试
```bash
npm run test:performance
```

**注意：** 需要配置 API 密钥。没有有效的 API 凭据将会失败。

**预期结果（有 API 密钥）：**
- 生成性能报告
- 创建 `outputs/performance-report.json`
- 退出代码：0

---

## 翻译验证

### 测试翻译命令
```bash
# 英文翻译
npm run test:translate:en

# 繁体中文翻译
npm run test:translate:zh-tw

# 日文翻译
npm run test:translate:ja

# 所有翻译
npm run test:translate:all
```

**预期结果：**
- 创建 `outputs/translated-en.md`
- 创建 `outputs/translated-zh-tw.md`
- 创建 `outputs/translated-ja.md`
- 文件包含翻译内容
- 保留原始 markdown 格式

### 手动翻译验证
```bash
# 测试繁体中文
node dist/cli/index.js translate "Hello World" --to zh-TW

# 测试日文
node dist/cli/index.js translate "Good morning" --to ja

# 测试英文（从中文）
node dist/cli/index.js translate "大家好" --to en
```

**预期结果：**
- 返回正确的翻译
- 无错误
- 退出代码：0

---

## 配置验证

### 配置命令测试
```bash
# 列出配置
node dist/cli/index.js config list

# 获取特定值
node dist/cli/index.js config get model
```

**预期结果：**
- 显示当前配置
- 无错误

---

## 常见构建问题

### TypeScript 错误
```bash
# 运行类型检查以识别问题
npm run typecheck
```

**常见解决方案：**
- 检查缺失的类型定义
- 验证 `tsconfig.json` 配置
- 确保所有导入有效

### 模块未找到
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 构建平台问题
- macOS 构建需要 Xcode 命令行工具
- Windows 构建需要 .NET Framework 4.5+
- Linux 构建需要 rpm、fakeroot 和 dpkg-deb

---

## 验证总结

完成所有验证步骤后，您应该拥有：

- [x] CLI 构建成功
- [x] 桌面应用为目标平台构建成功
- [x] 单元测试通过
- [x] CLI 冒烟测试通过
- [x] 翻译测试产生有效输出
- [x] 文档是最新的
- [x] CHANGELOG.md 已更新

如果所有项目都已勾选，则构建已验证并准备好发布。