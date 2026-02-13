# 贡献指南

感谢你对 TranslaMate 项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

1. 在 [Issues](https://github.com/username/translamate/issues) 中搜索是否已有类似问题
2. 如果没有，创建新的 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 系统环境信息（OS、版本号）
   - 截图或错误日志

### 提交功能建议

1. 先在 [Discussions](https://github.com/username/translamate/discussions) 讨论你的想法
2. 获得反馈后，可以创建 Feature Request Issue
3. 等待维护者确认后再开始开发

### 提交代码

1. **Fork 项目**
   ```bash
   # 克隆你的 fork
   git clone https://github.com/YOUR_USERNAME/translamate.git
   cd translamate
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **编写代码**
   - 遵循项目的代码风格
   - 添加必要的注释
   - 编写测试用例

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add some feature"
   ```

   提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
   - `feat:` - 新功能
   - `fix:` - Bug 修复
   - `docs:` - 文档更新
   - `style:` - 代码格式调整
   - `refactor:` - 重构
   - `test:` - 测试相关
   - `chore:` - 构建/工具链更新

5. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 在 GitHub 上打开 Pull Request
   - 填写 PR 模板
   - 等待代码审查

## 开发规范

### 代码风格

- 使用 TypeScript
- 遵循 ESLint 配置
- 使用 Prettier 格式化
- 编写有意义的变量和函数名

### 测试要求

- 为新功能添加单元测试
- 确保所有测试通过
- 测试覆盖率不低于 80%

### 文档

- 更新相关文档（README、API 文档等）
- 添加必要的 JSDoc 注释
- 更新 CHANGELOG.md

## 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 社区准则

- 尊重所有贡献者
- 友好和包容的交流
- 接受建设性批评
- 关注对社区最有利的事情

有任何问题，欢迎随时联系我们！
