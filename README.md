# Skills Builder

A comprehensive CLI tool for checking, creating, and managing Claude Code skills according to best practices.

English | [简体中文](README.zh-CN.md)

## Features

- **Check**: Validate skill structure and best practices compliance
- **Create**: Generate new skills with proper structure
- **Init**: Initialize current directory as a skill
- **Update**: Modify existing skill configurations

## Installation

This skill is automatically available in Claude Code when installed in `~/.claude/skills/skills-builder/`.

## Usage

### Check a Skill

Validate any skill directory:

```bash
skills-builder check [path]
skills-builder check ~/.claude/skills/code-actor
skills-builder check .  # Check current directory
```

Options:
- `--format, -f`: Output format (text, json, markdown)
- `--verbose, -v`: Enable verbose output

### Create a New Skill

Generate a new skill with standard structure:

```bash
skills-builder create [name]
skills-builder create my-awesome-skill
```

Options:
- `--path, -p`: Directory to create skill in (default: current)
- `--interactive, -i`: Interactive mode (default: true)
- `--template, -t`: Template type (basic, advanced, analyzer)

### Initialize Current Directory

Turn current directory into a skill:

```bash
cd my-project
skills-builder init
```

### Update a Skill

Add languages or dependencies:

```bash
skills-builder update --add-language zh
skills-builder update --add_dependency lodash@4.17.21
```

## Best Practices Checked

When running `skills-builder check`, following are validated:

### Structure

- `package.json` exists and is valid
- `polyglot.json` for internationalization
- `dist/cli/index.js` CLI entry point
- `README.md` documentation
- `.skill.yml` configuration

### package.json

- Required fields: name, version, description, type, main, bin
- Name format: kebab-case
- Type set to "module"
- Bin points to `dist/cli/index.js`

### Internationalization

- `polyglot.json` exists
- Has default (empty string) translations
- Multiple languages supported

### CLI Entry Point

- Has shebang (`#!/usr/bin/env node`)
- Parses command line arguments

### Best Practices

- `.skill.yml` configuration present
- `locales/` directory for additional translations
- `src/` directory for source code
- `/dist` in `.gitignore`

## Output Formats

### Text (Default)

```
🔍 Skill Validation Results
📁 Path: ~/.claude/skills/code-actor
📦 Name: code-actor

✅ All validations passed!

📊 Checks Summary:
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
# 🔍 Skill Validation Report

## Summary
- **Skill**: my-skill
- **Path**: `/path/to/skill`
- **Status**: ✅ Passed
...
```

## Skill Template Structure

When creating a new skill, following structure is generated:

```
my-skill/
├── src/
│   ├── cli/
│   │   └── index.js      # CLI entry point
│   └── analyzer/
│       └── index.js      # Analyzer (if template=analyzer)
├── dist/
│   ├── cli/
│   └── analyzer/
├── locales/              # Additional translations
├── polyglot.json         # Internationalization
├── package.json
├── .skill.yml           # Configuration
├── .gitignore
├── bunfig.toml
└── README.md
```

## Development

```bash
# Build
bun run build:all

# Run
node dist/cli/index.js --help
```

## License

MIT
