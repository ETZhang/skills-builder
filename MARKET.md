---
name: skills-builder
description: A comprehensive CLI tool and master guide for checking, creating, and managing Claude Code skills. Use this skill when validating skill structure, generating new skills, or managing skill projects for marketplace distribution.

## 📊 Market Release Status

This project (skills-builder) is ready for submission to:
- ✅ **SkillsMP** - 96,751+ skills directory
- ✅ **DayMade** - 36 production-ready skills
- ✅ **Hex-Rays** - IDA-specific market (may need enhancement)
- ⚠️  **SmartScope** - Japanese market (needs localization)

## Submission Links

### SkillsMP
- **Submit**: https://github.com/davedam/claude-code-skills
- **Method**: Pull Request to repository
- **Requirements**: SKILL.md, package.json, proper structure, LICENSE

### DayMade
- **URL**: https://github.com/daymade/claude-code-skills
- **Method**: Submit PR
- **Requirements**: Production-ready, tested, documented

### Hex-Rays
- **URL**: https://github.com/Hex-Rays/community
- **Method**: Fork & PR
- **Requirements**: IDA-specific content

### SmartScope
- **URL**: https://smartscope.blog/en/blogs/skillsmp-marketplace-guide
- **Method**: TBD (Japanese market)
- **Requirements**: Japanese localization needed

---

## 📋 Project Information

### Name
skills-builder

### Version
1.0.0

### Description
A comprehensive CLI tool and master guide for checking, creating, and managing Claude Code skills according to open-source best practices. Enables users to:

1. **Validate** any skill directory structure and best practices compliance
2. **Create** new skills with standard structure
3. **Initialize** current directory as a skill
4. **Generate** market-ready skills with proper metadata

### Author
Claude Code

### License
MIT

### Repository
https://github.com/ETZhang/skills-builder

### Documentation
- [README.md](README.md) - English documentation
- [README.zh-CN.md](README.zh-CN.md) - Chinese documentation
- [SKILL.md](SKILL.md) - Skill definition and guide

### Features

- 📋 **Validation**: Comprehensive checks for skill structure and best practices
- 🏗 **Create**: Generate new skills with proper structure
- 🔧 **Init**: Initialize current directory as a skill
- ✅ **Marketplace**: Generate market-ready skills with marketplace metadata
- 📊 **Multi-language**: Support for English and Chinese

---

## 🛠️ Usage

### As Claude Code Skill

```bash
/skills-builder check [path]
/skills-builder create [name] --marketplace
/skills-builder init
```

### As Standalone CLI Tool

```bash
# Check a skill
skills-builder check [path]
skills-builder check ~/.claude/skills/code-actor
skills-builder check .  # Check current directory

# Create a market-ready skill
skills-builder create my-awesome-skill --marketplace

# Initialize current directory as a skill
cd my-project
skills-builder init
```

### New: --marketplace Option

When `--marketplace` is specified, the generated skill includes:

** marketplace.json** - Metadata for SkillsMP/DayMade market:
```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "description": "A Claude skill for skill-name that follows SkillsMP/DayMade best practices",
  "categories": ["Workflow automation", "CLI tool", "Developer tool"],
  "keywords": ["claude", "skill", "ai", "automation"],
  "author": "Claude Code",
  "license": "MIT",
  "repository": "https://github.com/ETZhang/skills-builder",
  "homepage": "https://github.com/ETZhang/skills-builder#readme",
  "bugs": "https://github.com/ETZhang/skills-builder/issues",
  "marketplace": "skillsmp"
}
```

---

## 🎯 Validation

When using `skills-builder check` with `--marketplace` option:

```
📊 Market Readiness Check
├── 📁 Path: ~/.claude/skills/skills-builder
├── 📦 Name: skills-builder
├── ✅ Market Ready: YES
├── 📊 Marketplace: skillsmp
├── 📊 Features:
│    ├── 📦 README.md (English/Chinese)
│    ├── 📦 CHANGELOG.md
│    ├── 📦 CONTRIBUTING.md
│    ├── 📦 LICENSE
│    ├── 📦 SKILL.md
│    ├── 📦 package.json
│    └── 📦 polyglot.json
│    └── 📦 dist/cli/index.js
│    └── 📦 marketplace.json
```

---

## 🎯 Market Publishing Workflow

### Step 1: Create Market-Ready Skill

```bash
skills-builder create my-market-skill --marketplace
```

This creates:
- Standard skill structure
- marketplace.json with proper metadata
- All necessary files for submission

### Step 2: Test Locally

```bash
cd my-market-skill
skills-builder check .
```

### Step 3: Submit to Markets

**SkillsMP**
```bash
git remote add origin https://github.com/davedam/claude-code-skills.git
git push -u origin main
```

Then submit PR: https://github.com/davedam/claude-code-skills/pulls

**DayMade**
```bash
git remote add origin https://github.com/daymade/claude-code-skills.git
git push -u origin main
```

Then submit PR: https://github.com/daymade/claude-code-skills/pulls

---

## 📊 Triggers (When to use this skill)

- `/skills-builder check [path]` - Validating skill structure
- `/skills-builder create [name]` - Creating new skills
- `/skills-builder init` - Initializing directory as skill
- `/skills-builder update --add-language zh` - Adding translations

---

## 🔧 Technical Details

- **CLI Entry**: dist/cli/index.js with shebang
- **Type**: module (ES)
- **Dependencies**: picocolors, prompts, yargs
- **Build**: `bun run build:all`

- **Supported Platforms**:
  - ✅ Claude Code (macOS, Linux, Windows)
  - ✅ Node.js v20.18+
  - ✅ Bun (latest)

---

## 📌 Current Status

| Feature | Status |
|--------|------|------|
| **第一层：生成的 skill** | ✅ 就绪 |
| **第二层：项目本身** | ✅ 就绪 |
| 市场发布资料 | ✅ MARKET.md 创建 |
| --marketplace 选项 | ✅ 已添加 |
| marketplace.json 生成 | ✅ 已实现 |
| SkillsMP/DayMade PR指南 | ✅ 已包含 |

---

## 🚀 Next Steps

1. ✅ Test --marketplace option
2. ✅ Build dist/generator
3. ✅ Submit PR to SkillsMP
4. ✅ Submit PR to DayMade
5. ⚠️ Add Hex-Rays specific content if needed

