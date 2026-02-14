/**
 * Skill Generator
 *
 * Creates new Claude skills with proper structure according to best practices
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a new skill
 */
export async function createSkill(name, options = {}) {
  const {
    path: basePath = '.',
    interactive = true,
    template = 'basic',
    translations = {}
  } = options;

  const t = (key) => translations[key]?.[''] || key;

  const skillPath = join(basePath, name);

  // Check if directory already exists
  if (fs.existsSync(skillPath)) {
    return {
      success: false,
      error: `Directory already exists: ${skillPath}`
    };
  }

  // Create directory structure
  const dirs = [
    'src/cli',
    'locales',
    'dist/cli',
    'dist/analyzer'
  ];

  for (const dir of dirs) {
    fs.mkdirSync(join(skillPath, dir), { recursive: true });
  }

  // Generate skill name variations
  const skillClassName = name.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Create package.json
  const packageJson = generatePackageJson(name, skillClassName);
  fs.writeFileSync(
    join(skillPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create polyglot.json
  const polyglotJson = generatePolyglotJson(name, skillClassName);
  fs.writeFileSync(
    join(skillPath, 'polyglot.json'),
    JSON.stringify(polyglotJson, null, 2)
  );

  // Create CLI entry point
  const cliContent = generateCli(name);
  fs.writeFileSync(
    join(skillPath, 'src/cli/index.js'),
    cliContent,
    { mode: 0o755 }
  );

  // Create README.md
  const readmeContent = generateReadme(name, skillClassName);
  fs.writeFileSync(
    join(skillPath, 'README.md'),
    readmeContent
  );

  // Create .gitignore
  const gitignoreContent = generateGitignore();
  fs.writeFileSync(
    join(skillPath, '.gitignore'),
    gitignoreContent
  );

  // Create .skill.yml
  const skillYmlContent = generateSkillYml(name);
  fs.writeFileSync(
    join(skillPath, '.skill.yml'),
    skillYmlContent
  );

  // Create analyzer if template requires it
  if (template === 'analyzer' || template === 'advanced') {
    const analyzerContent = generateAnalyzer(name);
    fs.writeFileSync(
      join(skillPath, 'src/analyzer/index.js'),
      analyzerContent
    );
  }

  // Create bunfig.toml for proper npm installs
  const bunfigContent = generateBunfig();
  fs.writeFileSync(
    join(skillPath, 'bunfig.toml'),
    bunfigContent
  );

  return {
    success: true,
    skillPath,
    skillName: name,
    message: t('success_skill_created')
      .replace('{name}', name)
      .replace('{path}', skillPath),
    nextSteps: [
      `cd ${skillPath}`,
      'npm install',
      'bun run build',
      'Test your skill: ./dist/cli/index.js --help'
    ]
  };
}

/**
 * Generate package.json content
 */
function generatePackageJson(name, className) {
  return {
    name,
    version: '1.0.0',
    description: `A Claude skill for ${name.replace(/-/g, ' ')}`,
    type: 'module',
    main: 'dist/cli/index.js',
    bin: {
      [name]: 'dist/cli/index.js'
    },
    scripts: {
      build: 'bun build src/cli/index.js --outdir dist/cli --target node --platform neutral',
      'build:analyzer': 'bun build src/analyzer/index.js --outdir dist/analyzer --target node --platform neutral',
      'build:all': 'bun run build && bun run build:analyzer',
      dev: `bun run src/cli/index.js`
    },
    keywords: [
      'claude',
      'skill',
      name
    ],
    author: '',
    license: 'MIT',
    dependencies: {
      'picocolors': '^1.1.1',
      'yargs': '^17.7.2'
    },
    devDependencies: {
      '@types/bun': 'latest',
      '@types/node': '^20.11.0',
      '@types/yargs': '^17.0.32',
      'bun-types': 'latest'
    }
  };
}

/**
 * Generate polyglot.json content
 */
function generatePolyglotJson(name, className) {
  return {
    skill_name: {
      '': className,
      zh: ''
    },
    skill_description: {
      '': `A Claude skill for ${name.replace(/-/g, ' ')}`,
      zh: ''
    },
    help_description: {
      '': `Use this skill to ${name.replace(/-/g, ' ')}`,
      zh: ''
    },
    command_help: {
      '': 'Show help information',
      zh: '显示帮助信息'
    },
    command_version: {
      '': 'Show version information',
      zh: '显示版本信息'
    },
    success_message: {
      '': 'Operation completed successfully',
      zh: '操作成功完成'
    },
    error_message: {
      '': 'An error occurred',
      zh: '发生错误'
    }
  };
}

/**
 * Generate CLI entry point
 */
function generateCli(name) {
  return `#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load translations
function loadTranslations() {
  try {
    const polyglotPath = join(__dirname, '../../polyglot.json');
    const fs = await import('fs');
    if (fs.existsSync(polyglotPath)) {
      const content = fs.readFileSync(polyglotPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('Failed to load translations:', e.message);
  }
  return {};
}

// Get translation helper
let translations = {};
function t(key, defaultValue = key) {
  return translations[key]?.[''] || defaultValue;
}

// CLI configuration
const argv = yargs(hideBin(process.argv))
  .scriptName('${name}')
  .usage('Usage: $0 <command> [options]')
  .command('hello [name]', 'Say hello to someone', (yargs) => {
    return yargs
      .positional('name', {
        describe: 'Name to greet',
        type: 'string',
        default: 'World'
      });
  }, async (argv) => {
    translations = loadTranslations();
    console.log(\`Hello, \${argv.name}!\`);
    console.log(t('success_message', 'Success!'));
  })
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .example('$0 hello Claude', 'Say hello to Claude')
  .argv;

export { argv };
`;
}

/**
 * Generate analyzer content
 */
function generateAnalyzer(name) {
  return `/**
 * ${name} Analyzer
 *
 * Analyzes input and generates structured data for visualization
 */

import fs from 'fs';
import path from 'path';

/**
 * Analyze the given input
 * @param {string} input - The input to analyze
 * @param {object} options - Analysis options
 * @returns {object} Analysis results
 */
export async function analyze(input, options = {}) {
  const results = {
    input,
    timestamp: new Date().toISOString(),
    analysis: {}
  };

  // Add your analysis logic here
  // Example: Parse input, extract patterns, generate metrics

  return results;
}

/**
 * Analyze a file
 * @param {string} filePath - Path to the file to analyze
 * @returns {object} Analysis results
 */
export async function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(\`File not found: \${filePath}\`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return analyze(content, { source: filePath });
}

/**
 * Analyze a directory
 * @param {string} dirPath - Path to the directory to analyze
 * @returns {object} Analysis results
 */
export async function analyzeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(\`Directory not found: \${dirPath}\`);
  }

  const results = {
    type: 'directory',
    path: dirPath,
    files: [],
    timestamp: new Date().toISOString()
  };

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      const filePath = path.join(dirPath, entry.name);
      try {
        const analysis = await analyzeFile(filePath);
        results.files.push({
          name: entry.name,
          analysis
        });
      } catch (e) {
        results.files.push({
          name: entry.name,
          error: e.message
        });
      }
    }
  }

  return results;
}

export { analyze, analyzeFile, analyzeDirectory };
`;
}

/**
 * Generate README.md content
 */
function generateReadme(name, className) {
  return `# ${className}

A Claude skill for ${name.replace(/-/g, ' ')}.

## Installation

This skill is installed as part of Claude Code environment.

## Usage

\`\`\`bash
${name} --help
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
| \`hello [name]\` | Say hello to someone |

## Development

\`\`\`bash
# Install dependencies
bun install

# Build the skill
bun run build

# Run in development mode
bun run dev
\`\`\`

## Structure

\`\`\`
${name}/
├── src/
│   ├── cli/
│   │   └── index.js      # CLI entry point
│   └── analyzer/
│       └── index.js      # Analyzer (optional)
├── dist/                 # Built files
├── locales/              # Additional translations
├── polyglot.json         # Internationalization
├── package.json
├── .skill.yml           # Skill configuration
└── README.md
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
`;
}

/**
 * Generate .gitignore content
 */
function generateGitignore() {
  return `# Dependencies
node_modules/

# Build output
dist/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
}

/**
 * Generate .skill.yml content
 */
function generateSkillYml(name) {
  return `# Claude Skill Configuration
name: ${name}
version: 1.0.0
description: A Claude skill for ${name.replace(/-/g, ' ')}

# Skill settings
settings:
  # Output format for results
  output_format: text

  # Enable verbose logging
  verbose: false

  # Default language
  language: en

# Supported commands
commands:
  - name: hello
    description: Say hello to someone
    arguments:
      - name: name
        description: Name to greet
        required: false
        default: World

# Triggers that invoke this skill
triggers:
  - pattern: "${name}"
    description: User mentions ${name}
`;
}

/**
 * Generate bunfig.toml content
 */
function generateBunfig() {
  return `[install]
# Always use exact versions in package.json
exact = true

# Don't install devDependencies in production
dev = true

[install.cache]
# Enable install cache
enable = true
`;
}
