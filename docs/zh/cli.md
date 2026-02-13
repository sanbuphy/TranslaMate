# CLI 文档

TranslaMate 命令行界面的完整使用指南。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [命令](#命令)
- [配置](#配置)
- [示例](#示例)
- [退出代码](#退出代码)
- [故障排除](#故障排除)

---

## 安装

### 全局安装

```bash
# 克隆仓库
git clone https://github.com/username/translamate.git
cd translamate

# 安装依赖
npm install

# 构建 CLI
npm run build:cli

# 全局链接
npm link

# 验证安装
translamate --version
```

### 本地使用（无需全局安装）

```bash
# 构建后
node dist/cli/index.js --help
```

### Docker 使用

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/cli ./dist/cli
ENTRYPOINT ["node", "dist/cli/index.js"]
```

```bash
# 构建并运行
docker build -t translamate .
docker run translamate translate "Hello" --to zh-CN
```

---

## 快速开始

```bash
# 翻译文本
translamate translate "Hello World" --to zh-CN

# 指定源语言翻译
translamate translate "Hello" --from en --to ja

# 翻译文件
translamate translate document.txt --to zh-CN --output document-zh.txt

# 批量翻译目录
translamate batch ./docs --to zh-CN --output ./docs-zh
```

---

## 命令

### `translate` (别名: `t`)

翻译文本或单个文件。

```bash
translamate translate <input> [options]
```

**参数：**
- `input` - 要翻译的文本或文件路径

**选项：**
- `-t, --to <lang>` - 目标语言代码（默认："zh-CN"）
- `-f, --from <lang>` - 源语言代码（默认："auto"）
- `-o, --output <path>` - 输出文件路径（用于文件翻译）
- `-c, --config <path>` - 配置文件路径

**示例：**

```bash
# 简单文本翻译
translamate translate "Hello World" --to zh-CN
# 输出: 你好世界

# 文件翻译
translamate translate readme.md --to ja --output readme-ja.md

# 指定源语言
translamate translate "Bonjour" --from fr --to en
```

---

### `batch` (别名: `b`)

批量翻译目录中的多个文件。

```bash
translamate batch <directory> [options]
```

**参数：**
- `directory` - 包含要翻译文件的目录

**选项：**
- `-t, --to <lang>` - 目标语言代码（默认："zh-CN"）
- `-f, --from <lang>` - 源语言代码（默认："auto"）
- `-o, --output <dir>` - 输出目录（默认："<input>-<lang>"）
- `-e, --ext <extensions>` - 要处理的文件扩展名（默认："txt,md"）
- `-c, --config <path>` - 配置文件路径

**示例：**

```bash
# 翻译所有 txt 和 md 文件
translamate batch ./docs --to zh-CN

# 指定扩展名
translamate batch ./docs --to de --ext "md,html,json"

# 自定义输出目录
translamate batch ./content --to ja --output ./content-japanese
```

---

### `config`

管理配置设置。

```bash
translamate config [command] [options]
```

**子命令：**

#### `config set <key> <value>`

设置配置值。

```bash
translamate config set apiKey sk-xxxxxxxx
translamate config set baseURL https://api.deepseek.com
translamate config set model deepseek-chat
```

#### `config get <key>`

获取配置值。

```bash
translamate config get apiKey
translamate config get model
```

#### `config list`

列出所有配置值。

```bash
translamate config list
```

#### `config reset`

重置配置为默认值。

```bash
translamate config reset
```

**配置键：**
- `apiKey` - 翻译服务的 API 密钥
- `baseURL` - API 基础 URL
- `model` - 模型名称
- `maxTokens` - 最大 tokens 数（数字）
- `temperature` - 温度值（0-1）

---

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 仅运行单元测试
npm run test:unit

# 运行性能测试（需要 API 密钥）
npm run test:performance
```

### 翻译验证测试
```bash
# 将测试文档翻译为英文
npm run test:translate:en

# 将测试文档翻译为繁体中文
npm run test:translate:zh-tw

# 将测试文档翻译为日文
npm run test:translate:ja

# 运行所有翻译测试
npm run test:translate:all
```

**注意：** 翻译测试需要在 `.translamate.json` 或环境变量中配置有效的 API 密钥。

### 单元测试详情

单元测试套件验证：
- 文本分段的分块算法
- Token 估算准确性
- CJK 和拉丁语言的分句
- 通过分块保持内容完整性

**预期结果：**
- 所有 9 个测试通过
- 无失败
- 退出代码：0

---

## 配置

CLI 按以下顺序查找配置：

1. `--config` 选项
2. 当前目录中的 `.translamate.json`
3. 主目录中的 `.translamate.json`
4. 环境变量

### 配置文件格式

```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "maxTokens": 512,
  "temperature": 0.7
}
```

### 环境变量

```bash
export TRANSLAMATE_API_KEY=sk-xxxxxxxx
export TRANSLAMATE_BASE_URL=https://api.deepseek.com
export TRANSLAMATE_MODEL=deepseek-chat
export TRANSLAMATE_MAX_TOKENS=512
export TRANSLAMATE_TEMPERATURE=0.7
```

### 优先级顺序

1. 命令行选项（最高）
2. 环境变量
3. `--config` 指定的配置文件
4. 当前目录中的 `.translamate.json`
5. 主目录中的 `.translamate.json`
6. 默认值（最低）

---

## 示例

### 基本用法

```bash
# 翻译为中文
translamate t "Hello, how are you?" --to zh-CN

# 翻译为日文（自动检测源语言）
translamate t "Good morning" --to ja

# 翻译为多种语言
for lang in zh-CN ja de fr; do
  translamate t "Welcome" --to $lang
done
```

### 文件翻译

```bash
# 单个文件
translamate t report.md --to zh-CN -o report-zh.md

# 多个文件
for file in *.md; do
  translamate t "$file" --to de -o "${file%.md}-de.md"
done
```

### 批量处理

```bash
# 文档翻译
translamate batch ./docs --to zh-CN --output ./docs-zh

# 代码注释翻译
translamate batch ./src --to en --ext "ts,js" --output ./src-en

# 网站内容
translamate batch ./content --to ja --ext "html,md,json"
```

### CI/CD 集成

```yaml
# .github/workflows/translate.yml
name: Translate Documentation
on:
  push:
    paths:
      - 'docs/**'

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup TranslaMate
        run: |
          npm ci
          npm run build:cli
      
      - name: Translate to Chinese
        run: node dist/cli/index.js batch docs --to zh-CN --output docs-zh
        env:
          TRANSLAMATE_API_KEY: ${{ secrets.API_KEY }}
      
      - name: Commit translations
        run: |
          git add docs-zh
          git commit -m "docs: update Chinese translations"
          git push
```

### Shell 脚本

```bash
#!/bin/bash
# translate-project.sh

SOURCE_DIR="${1:-./content}"
TARGET_LANG="${2:-zh-CN}"
OUTPUT_DIR="${3:-./content-${TARGET_LANG}}"

# 检查 translamate 是否安装
if ! command -v translamate &> /dev/null; then
    echo "错误: translamate 未找到"
    exit 1
fi

# 检查 API 密钥
if [ -z "$TRANSLAMATE_API_KEY" ]; then
    echo "错误: TRANSLAMATE_API_KEY 未设置"
    exit 1
fi

# 运行翻译
echo "正在将 ${SOURCE_DIR} 翻译为 ${TARGET_LANG}..."
translamate batch "$SOURCE_DIR" --to "$TARGET_LANG" --output "$OUTPUT_DIR"

echo "完成！输出: ${OUTPUT_DIR}"
```

---

## 退出代码

| 代码 | 含义 |
|------|------|
| 0 | 成功 |
| 1 | 一般错误 |
| 2 | 无效参数 |
| 3 | 配置错误 |
| 4 | API 错误 |
| 5 | 文件系统错误 |
| 6 | 网络错误 |

---

## 故障排除

### API 密钥未设置

```
错误: API Key is required
```

**解决方案：**
```bash
# 方法 1: 设置环境变量
export TRANSLAMATE_API_KEY=sk-xxxxxxxx

# 方法 2: 使用 config 命令
translamate config set apiKey sk-xxxxxxxx

# 方法 3: 创建配置文件
echo '{"apiKey": "sk-xxxxxxxx"}' > ~/.translamate.json
```

### 文件未找到

```
错误: File not found: document.txt
```

**解决方案：**
- 检查文件路径是否正确
- 如有需要，使用绝对路径
- 确保文件有读取权限

### API 速率限制

```
错误: Rate limit exceeded
```

**解决方案：**
- 等待后重试
- 检查 API 配额
- 考虑升级套餐

### 网络问题

```
错误: Network error
```

**解决方案：**
- 检查网络连接
- 验证 baseURL 是否正确
- 检查防火墙设置

### 批量处理错误

```
错误: Failed to process some files
```

**解决方案：**
- 检查文件权限
- 验证输出目录是否可写
- 查看特定文件的错误日志

---

## 语言代码

常用语言代码：

| 代码 | 语言 |
|------|------|
| zh-CN | 简体中文 |
| zh-TW | 繁体中文 |
| en | 英文 |
| ja | 日文 |
| ko | 韩文 |
| de | 德文 |
| fr | 法文 |
| es | 西班牙文 |
| ru | 俄文 |
| pt | 葡萄牙文 |
| it | 意大利文 |
| ar | 阿拉伯文 |
| hi | 印地文 |
| th | 泰文 |
| vi | 越南文 |

---

## 提示

1. **使用环境变量** 存储敏感数据如 API 密钥
2. **创建配置文件** 为不同项目设置不同配置
3. **使用批量模式** 处理大型翻译任务
4. **检查退出代码** 在脚本中进行错误处理
5. **使用 `--output`** 保留原始文件