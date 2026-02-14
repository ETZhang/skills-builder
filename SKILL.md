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

- `SKILL.md` - **Must exist!** This is THE required file for Claude Code skills
  - Must have YAML frontmatter (`---`)
  - Frontmatter must include `name:` field
  - Frontmatter must include `description:` field explaining when to use the skill
  - Frontmatter should include `license:` field
  - Should have markdown body content after frontmatter
- `package.json` - Package configuration
- `README.md` - Project documentation
- `polyglot.json` - For internationalization support
- `dist/cli/index.js` - CLI entry point with shebang (for CLI skills)
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

### Bundled Resources (Optional)

Per "The Complete Guide to Building Skills for Claude" PDF:

- `scripts/` - Executable code for tasks requiring deterministic reliability
  - Use when same code is repeatedly rewritten
  - Example: `scripts/rotate_pdf.py` for PDF rotation tasks
- `references/` - Documentation to be loaded into context as needed
  - Use for documentation Claude should reference while working
  - Example: `references/finance.md` for financial schemas
  - Keep SKILL.md lean; move detailed reference material here
- `assets/` - Files used in output Claude produces (not loaded into context)
  - Use for templates, images, fonts, boilerplate, sample documents
  - Example: `assets/logo.png`, `assets/template.html`

## Output Formats

### Text (Default)

```
🔍 Skill Validation Results
📁 Path: ~/.claude/skills/code-actor
📦 Name: code-actor

✅ All validations passed!

📊 Checks Summary:
──────────────────────────────────────────────────
✅ [structure] file_skill_md
✅ [SKILL.md] has_frontmatter
✅ [SKILL.md] frontmatter_has_name
✅ [SKILL.md] frontmatter_has_description
✅ [SKILL.md] frontmatter_has_license
✅ [SKILL.md] has_markdown_body
✅ [structure] file_package_json
✅ [structure] file_polyglot_json
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
✅ [bundled_resources] has_scripts
✅ [bundled_resources] has_references
✅ [bundled_resources] has_assets
✅ [SKILL.md] concise_content
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
├── SKILL.md              # Skill definition (REQUIRED!)
├── package.json
├── .skill.yml           # Configuration metadata
├── README.md             # Documentation
├── LICENSE               # License text (open source best practice)
├── CONTRIBUTING.md       # Contribution guide (open source best practice)
├── CHANGELOG.md          # Version history (open source best practice)
├── .gitignore
├── src/                  # Source code
│   ├── cli/
│   │   └── index.js      # CLI entry point (if CLI skill)
│   └── analyzer/
│       └── index.js      # Analyzer (if template=analyzer)
├── dist/                 # Build output (gitignored)
│   ├── cli/
│   └── analyzer/
├── locales/              # Additional translations (optional)
├── polyglot.json         # Internationalization
├── scripts/              # Executable code (optional, per PDF)
├── references/           # Documentation for context (optional, per PDF)
└── assets/               # Output files (optional, per PDF)
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

### Per "The Complete Guide to Building Skills for Claude" PDF

1. **SKILL.md vs README.md**:
   - `SKILL.md` is the skill definition loaded by Claude Code
   - `README.md` is for human users on GitHub
   - Keep SKILL.md concise; move detailed material to references/

2. **File name case**: `SKILL.md` must be uppercase. Claude Code won't recognize `skill.md` or `Skill.md`.

3. **Concise is Key** (Core Principle):
   - The context window is a public good
   - Default assumption: Claude is already very smart
   - Only add context Claude doesn't already have
   - Prefer concise examples over verbose explanations

4. **Appropriate Degrees of Freedom** (Core Principle):
   - **High freedom** (text-based): Multiple valid approaches, decisions depend on context
   - **Medium freedom** (pseudocode/scripts): Preferred pattern exists, some variation OK
   - **Low freedom** (specific scripts): Fragile/error-prone operations, consistency critical

5. **SKILL.md Frontmatter Requirements**:
   - Must start with `---` (YAML frontmatter)
   - Required field: `name:` - skill identifier
   - Required field: `description:` - **when to use** this skill
   - Optional field: `license:`

6. **Bundled Resources** (Optional):
   - `scripts/` - Executable code for deterministic reliability
   - `references/` - Documentation loaded into context as needed
   - `assets/` - Files used in output (not loaded into context)

7. **LICENSE is critical**: Even if `package.json` has `"license": "MIT"`, you must have an actual `LICENSE` file for proper open source distribution.

8. **dist in .gitignore**: Always ignore build outputs. Only commit source code.

## License

MIT
