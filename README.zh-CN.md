# Skills Builder

一个用于检查、创建和管理 Claude Code Skills 的综合 CLI 工具，遵循最佳实践。

[English](README.md) | 简体中文

## 功能特性

- **检查**: 验证 skill 结构和最佳实践合规性
- **创建**: 生成具有正确结构的新 skills
- **初始化**: 将当前目录初始化为 skill
- **更新**: 修改现有 skill 配置

## 安装

当安装在 `~/.claude/skills/skills-builder/` 时，此 skill 在 Claude Code 中自动可用。

## 使用方法

### 检查 Skill

验证任何 skill 目录：

```bash
skills-builder check [路径]
skills-builder check ~/.claude/skills/code-actor
skills-builder check .  # 检查当前目录
```

选项：
- `--format, -f`: 输出格式（text, json, markdown）
- `--verbose, -v`: 启用详细输出

### 创建新 Skill

生成具有标准结构的新 skill：

```bash
skills-builder create [名称]
skills-builder create my-awesome-skill
```

选项：
- `--path, -p`: 创建 skill 的目录（默认：当前目录）
- `--interactive, -i`: 交互模式（默认：true）
- `--template, -t`: 模板类型（basic, advanced, analyzer）

### 初始化当前目录

将当前目录转换为 skill：

```bash
cd my-project
skills-builder init
```

### 更新 Skill

添加语言或依赖：

```bash
skills-builder update --add-language zh
skills-builder update --add-dependency lodash@4.17.21
```

## 最佳实践检查

运行 `skills-builder check` 时，将验证以下内容：

### 结构

- `package.json` 存在且有效
- `polyglot.json` 用于国际化
- `dist/cli/index.js` CLI 入口点
- `README.md` 文档
- `.skill.yml` 配置

### package.json

- 必需字段：name, version, description, type, main, bin
- 名称格式：kebab-case
- 类型设置为 "module"
- bin 指向 `dist/cli/index.js`

### 国际化

- `polyglot.json` 存在
- 具有默认（空字符串）翻译
- 支持多语言

### CLI 入口点

- 具有 shebang（`#!/usr/bin/env node`）
- 解析命令行参数

### 最佳实践

- `.skill.yml` 配置存在
- `locales/` 目录用于额外翻译
- `src/` 目录用于源代码
- `/dist` 在 `.gitignore` 中

## 输出格式

### 文本（默认）

```
🔍 Skill 验证结果
📁 路径: ~/.claude/skills/code-actor
📦 名称: code-actor

✅ 所有验证通过！

📊 检查摘要：
──────────────────────────────────────────────────
✅ [structure] file_package_json
✅ [structure] file_polyglot_json
✅ [package.json] field_name
...
```

### JSON

```json
{
  "success": true,
  "skillPath": "/path/to/skill",
  "skillName": "my-skill",
  "checks": [...],
  "errors": [],
  "warnings": []
}
```

### Markdown

```markdown
# 🔍 Skill 验证报告

## 摘要
- **Skill**: my-skill
- **路径**: `/path/to/skill`
- **状态**: ✅ 通过
...
```

## Skill 模板结构

创建新 skill 时，将生成以下结构：

```
my-skill/
├── src/
│   ├── cli/
│   │   └── index.js      # CLI 入口点
│   └── analyzer/
│       └── index.js      # 分析器（如果 template=analyzer）
├── dist/
│   ├── cli/
│   └── analyzer/
├── locales/              # 额外翻译
├── polyglot.json         # 国际化
├── package.json
├── .skill.yml           # 配置
├── .gitignore
├── bunfig.toml
└── README.md
```

## 开发

```bash
# 构建
bun run build:all

# 运行
node dist/cli/index.js --help
```

## 开源最佳实践

本项目遵循完整的开源最佳实践：

- ✅ **LICENSE** - MIT 许可证文件
- ✅ **CONTRIBUTING.md** - 贡献指南
- ✅ **CHANGELOG.md** - 版本变更记录
- ✅ **README.md** - 多语言文档（英文/中文）
- ✅ **SKILL.md** - Claude Code Skill 定义
- ✅ **完善的 .gitignore** - 包含常见模式

## 许可证

MIT
