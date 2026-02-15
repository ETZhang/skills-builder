---
name: skills-builder
description: Comprehensive CLI tool and master guide for checking, creating, and managing Claude Code skills. Use this skill when validating skill structure, generating new skills, initializing directories as skills, ensuring open-source best practices compliance, or learning skill creation methodology with Progressive Disclosure and design patterns.
license: MIT
---

# Skills Builder

Comprehensive CLI tool and master guide for checking, creating, and managing Claude Code skills according to open-source standards and "The Complete Guide to Building Skills for Claude" best practices.

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

---

## Core Principles (Per PDF Guide)

### 1. Concise is Key

The context window is a public good. Skills share the context window with everything else Claude needs: system prompt, conversation history, other Skills' metadata, and the actual user request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this explanation?" and "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### 2. Progressive Disclosure Design Principle

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (unlimited because scripts can be executed without reading into context window)

#### Progressive Disclosure Patterns

Keep SKILL.md body to essentials and under 500 lines to minimize context bloat. Split content into separate files when approaching this limit. When splitting out content into other files, it is very important to reference them from SKILL.md and describe clearly when to read them, to ensure the reader of the skill knows they exist and when to use them.

**Key principle:** When a skill supports multiple variations, frameworks, or options, keep only core workflow and selection guidance in SKILL.md. Move variant-specific details (patterns, examples, configuration) into separate reference files.

#### Pattern 1: High-level guide with references

```markdown
# PDF Processing

## Quick start
Extract text with pdfplumber:
[code example]

## Advanced features
- **Form filling**: See [FORMS.md](FORMS.md) for complete guide
- **API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

#### Pattern 2: Domain-specific organization

For skills with multiple domains, organize content by domain to avoid loading irrelevant context:

```markdown
bigquery-skill/
├── SKILL.md (overview and navigation)
└── references/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

When a user asks about sales metrics, Claude only reads sales.md.

#### Pattern 3: Conditional details

Show basic content, link to advanced content:

```markdown
# DOCX Processing

## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.

1. **For tracked changes**: See [TRACKING.md](TRACKING.md)
2. **For OOXML details**: See [OOXML.md](OOXML.md)
```

Claude reads TRACKING.md or OOXML.md only when user needs those features.

### 3. Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability:

**High freedom (text-based instructions)**: Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach.

**Medium freedom (pseudocode or scripts with parameters)**: Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior.

**Low freedom (specific scripts, few parameters)**: Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed.

Think of Claude as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

---

## Skill Creation Process (6 Steps)

Skill creation involves these steps (from skill-creator best practices):

### Step 1: Understand the Skill with Concrete Examples

Skip this step only when the skill's usage patterns are already clearly understood. It remains valuable even when working with an existing skill.

To create an effective skill, clearly understand concrete examples of how the skill will be used. This understanding can come from either direct user examples or generated examples that are validated with user feedback.

For example, when building an `image-editor` skill, relevant questions include:
- "What functionality should image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "I can imagine users asking for things like 'Remove the red-eye from this image' or 'Rotate this image'. Are there other ways you imagine this skill being used?"
- "What would a user say that should trigger this skill?"

### Step 2: Plan Reusable Skill Contents

To turn concrete examples into an effective skill, analyze each example by:

1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, and assets would be helpful when executing these workflows repeatedly

**Example**: When building a `pdf-editor` skill to handle queries like "Help me rotate this PDF," analysis shows:
1. Rotating a PDF requires re-writing the same code each time
2. A `scripts/rotate_pdf.py` script would be helpful to store in the skill

### Step 3: Initialize the Skill

At this point, it is time to actually create the skill.

```bash
cd my-project
skills-builder init
```

The command creates a new skill directory with:
- SKILL.md template with proper frontmatter and TODO placeholders
- Example resource directories: `scripts/`, `references/`, and `assets/`
- Example files in each directory that can be customized or deleted

### Step 4: Edit the Skill

When editing the (newly-generated or existing) skill, remember that the skill is being created for another instance of Claude to use. Include information that would be beneficial and non-obvious to Claude. Consider what procedural knowledge, domain-specific details, or reusable assets would help another Claude instance execute these tasks more effectively.

### Step 5: Package the Skill

Once development of the skill is complete, it must be packaged into a distributable `.skill` file that gets shared with the user. The packaging process automatically validates the skill first to ensure it meets all requirements.

```bash
# Package is handled by skills-builder
skills-builder package
```

The packaging script will:
1. **Validate** the skill automatically, checking:
   - YAML frontmatter format and required fields
   - Skill naming conventions and directory structure
   - Description completeness and quality
   - File organization and resource references
2. **Package** the skill if validation passes, creating a `.skill` file named after the skill (e.g., `my-skill.skill`) that includes all files and maintains proper directory structure for distribution.

If validation fails, the command will report the errors and exit without creating a package. Fix any validation errors and run the packaging command again.

### Step 6: Iterate Based on Real Usage

After testing the skill, users may request improvements. Often this happens right after using the skill, with fresh context of how the skill performed.

**Iteration workflow:**
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again

---

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

**Important guidelines:**
- **Avoid deeply nested references** - Keep references one level deep from SKILL.md
- **Structure longer reference files** - For files longer than 100 lines, include a table of contents at the top so Claude can see the full scope when previewing

---

## Output Formats

### Text (Default)

```
🔍 Skill Validation Results
📁 Path: ~/.claude/skills/code-actor
📦 Name: code-actor

✅ All validations passed!

📊 Checks Summary:
──────────────────────────────────────────────────
✅ [structure] file_SKILL.md
✅ [SKILL.md] has_frontmatter
✅ [SKILL.md] frontmatter_has_name
✅ [SKILL.md] frontmatter_has_description
✅ [SKILL.md] frontmatter_has_license
✅ [SKILL.md] describes_when_to_use
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
✅ [best_practices] file_license
✅ [best_practices] file_contributing_md
✅ [best_practices] file_changelog_md
✅ [best_practices] gitignore_dist
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
    { "category": "best_practices", "name": "file_license", "status": "pass" }
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
- **Errors**: 0
- **Warnings**: 2

## Checks
| Category | Check | Status |
|----------|-------|--------|
| structure | package.json exists | ✅ |
| structure | SKILL.md exists | ✅ |
| best_practices | LICENSE file | ✅ |
```

---

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

---

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

---

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

---

## License

MIT
