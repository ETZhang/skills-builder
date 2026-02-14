# Contributing to Skills Builder

感谢你有兴趣为 Skills Builder 做贡献！

## 如何贡献

### 报告问题

如果你发现了 bug，请：
1. 搜索现有的 issues 确认问题未被报告
2. 创建一个新的 issue，包含：
   - 清晰的标题
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息 (Node.js 版本, OS)

### 提交代码

1. **Fork 仓库**
   ```bash
   git clone https://github.com/your-username/skills-builder.git
   cd skills-builder
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新文档

4. **构建和测试**
   ```bash
   bun install
   bun run build:all
   node dist/cli/index.js --help
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add XYZ feature"
   # 或
   git commit -m "fix: resolve ABC issue"
   ```

6. **推送到你的 fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 描述你的更改
   - 引用相关的 issue
   - 等待代码审查

## 开发指南

### 项目结构

```
skills-builder/
├── src/
│   ├── cli/          # CLI 入口点
│   ├── validator/    # Skill 验证逻辑
│   └── generator/    # Skill 生成逻辑
├── dist/            # 构建输出 (gitignored)
├── polyglot.json    # 国际化翻译
└── package.json
```

### 代码风格

- 使用 ES modules (`import`/`export`)
- 使用 async/await 处理异步操作
- 函数命名使用 camelCase
- 文件命名使用 kebab-case

### 提交消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: add support for custom skill templates
fix: resolve validation error for missing polyglot.json
docs: update README with new usage examples
```

### 添加新语言

要为新语言添加翻译：

1. 编辑 `polyglot.json`
2. 添加语言代码和翻译：
   ```json
   {
     "": { "": "" },
     "zh": {
       "Skill Validation Results": "技能验证结果",
       "All validations passed!": "所有验证通过！"
     }
   }
   ```

## 行为准则

- 尊重所有贡献者
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 获取帮助

- 提问于 GitHub Discussions
- 报告安全问题至 [security@example.com](mailto:security@example.com)

再次感谢你的贡献！
