---
name: skills-builder
description: Comprehensive CLI tool and best practices guide for checking, creating, and managing Claude Code skills. Use this skill when validating skill structure, generating new skills, initializing directories as skills, or ensuring a skill project follows open-source best practices.
license: MIT
---

# Skills Builder

A comprehensive CLI tool and best practices guide for checking, creating, and managing Claude Code skills according to open-source standards.

## Quick Start

### As Claude Code Skill

```bash
/skills-builder check [path]
/skills-builder create [name]
/skills-builder init
```

### As Standalone CLI Tool

```bash
# Check a skill
skills-builder check [path]
skills-builder check ~/.claude/skills/code-actor
skills-builder check .  # Check current directory

# Create a new skill
skills-builder create [name]
skills-builder create my-awesome-skill

# Initialize current directory as a skill
cd my-project
skills-builder init

# Update a skill
skills-builder update --add-language zh
skills-builder update --add-dependency lodash@4.17.21
```

## Commands Reference

### Check Command

Validate any skill directory structure and best practices compliance.

**Usage:** `skills-builder check [path] [options]`

**Options:**
- `--format, -f`: Output format (text, json, markdown)
- `--verbose, -v`: Enable verbose output

**Example:**
```bash
skills-builder check ~/.claude/skills/code-actor --format=json
```

### Create Command

Generate a new skill with standard structure following best practices.

**Usage:** `skills-builder create [name] [options]`

**Options:**
- `--path, -p`: Directory to create skill in (default: current)
- `--interactive, -i`: Interactive mode with guided prompts (default: true)
- `--template, -t`: Template type (basic, advanced, analyzer)

**Example:**
```bash
skills-builder create my-awesome-skill --template=analyzer
```

### Init Command

Turn current directory into a properly structured skill.

**Usage:** `skills-builder init [options]`

**Options:**
- `--force, -f`: Overwrite existing files

**Example:**
```bash
cd my-project
skills-builder init
```

### Update Command

Add languages or dependencies to an existing skill.

**Usage:** `skills-builder update [path] [options]`

**Options:**
- `--add-language`: Add a new language (e.g., zh, es, fr)
- `--add-dependency`: Add a package dependency

**Example:**
```bash
skills-builder update --add-language zh
skills-builder update --add-dependency lodash@4.17.21
```

## Best Practices Validation

When running `skills-builder check`, following aspects are validated:

### Required Structure

- `package.json` - Must exist and be valid JSON
- `polyglot.json` - For internationalization support
- `dist/cli/index.js` - CLI entry point with shebang
- `README.md` - Project documentation
- `SKILL.md` - Skill definition file (required for Claude Code recognition)
- `.skill.yml` - Skill configuration metadata

### package.json Requirements

- **name**: kebab-case format
- **version**: Semantic version (e.g., 1.0.0)
- **description**: Clear project description
- **type**: Must be "module" for ES modules
- **main**: Entry point (typically `dist/cli/index.js`)
- **bin**: CLI command mapping
- **license**: Open source license identifier

### Internationalization (i18n)

- `polyglot.json` must exist with default translations
- Supports multiple languages via locale keys
- Empty string `""` key serves as default/fallback

### CLI Entry Point

- Must have shebang: `#!/usr/bin/env node`
- Must parse command line arguments (yargs, commander, etc.)

### Open Source Best Practices

- `LICENSE` file - Actual license text (not just package.json field)
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history tracking
- `.gitignore` - Comprehensive ignore patterns
- `src/` - Source code directory
- `dist/` - Build output (should be gitignored)

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
✅ [structure] file_skill_md
✅ [package.json] field_name
✅ [package.json] field_version
✅ [package.json] field_type
✅ [package.json] field_main
✅ [package.json] field_bin
✅ [package.json] field_license
✅ [i18n] file_polyglot_json
✅ [cli] shebang_present
✅ [cli] argument_parsing
✅ [best-practices] file_license
✅ [best-practices] file_contributing_md
✅ [best-practices] file_changelog_md
✅ [best-practices] gitignore_dist
```

### JSON

```json
{
  "success": true,
  "skillPath": "/path/to/skill",
  "skillName": "my-skill",
  "checks": [
    { "category": "structure", "name": "file_package_json", "status": "pass" },
    { "category": "best-practices", "name": "file_license", "status": "pass" }
  ],
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

## Checks
| Category | Check | Status |
|----------|-------|--------|
| structure | package.json exists | ✅ |
| structure | SKILL.md exists | ✅ |
| best-practices | LICENSE file | ✅ |
```

## Skill Template Structure

When creating a new skill, the following structure is generated:

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
├── SKILL.md              # Skill definition (required!)
├── .skill.yml           # Configuration
├── LICENSE               # License text
├── CONTRIBUTING.md       # Contribution guide
├── CHANGELOG.md          # Version history
├── .gitignore
└── README.md
```

## Development

```bash
# Install dependencies
bun install

# Build all components
bun run build:all

# Run CLI
node dist/cli/index.js --help

# Test
bun run test
```

## Important Notes

1. **SKILL.md vs README.md**: `SKILL.md` is the skill definition loaded by Claude Code. `README.md` is for human users on GitHub.

2. **File name case**: `SKILL.md` must be uppercase. Claude Code won't recognize `skill.md` or `Skill.md`.

3. **LICENSE is critical**: Even if `package.json` has `"license": "MIT"`, you must have an actual `LICENSE` file for proper open source distribution.

4. **dist in .gitignore**: Always ignore build outputs. Only commit source code.

## License

MIT
