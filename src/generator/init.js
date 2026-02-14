/**
 * Initialize current directory as a skill
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initSkill(cwd, options = {}) {
  const {
    force = false,
    translations = {}
  } = options;

  const t = (key) => translations[key]?.[''] || key;

  const results = {
    success: true,
    path: cwd,
    created: [],
    skipped: [],
    errors: []
  };

  // Helper to create file if it doesn't exist
  const createFile = (filename, content, overwrite = false) => {
    const filePath = join(cwd, filename);
    if (fs.existsSync(filePath) && !overwrite && !force) {
      results.skipped.push(filename);
      return false;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    results.created.push(filename);
    return true;
  };

  // Get skill name from directory name
  const skillName = path.basename(cwd);
  const skillClassName = skillName.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Check if already initialized
  if (fs.existsSync(join(cwd, 'package.json')) && !force) {
    const existingPackage = JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf-8'));
    if (existingPackage.name === skillName) {
      results.success = false;
      results.message = 'Directory is already initialized as a skill. Use --force to overwrite.';
      return results;
    }
  }

  // Create package.json
  const packageJson = {
    name: skillName,
    version: '1.0.0',
    description: `A Claude skill for ${skillName.replace(/-/g, ' ')}`,
    type: 'module',
    main: 'dist/cli/index.js',
    bin: {
      [skillName]: 'dist/cli/index.js'
    },
    scripts: {
      build: 'bun build src/cli/index.js --outdir dist/cli --target node --platform neutral',
      dev: `bun run src/cli/index.js`
    },
    keywords: ['claude', 'skill', skillName],
    author: '',
    license: 'MIT',
    dependencies: {
      'picocolors': '^1.1.1',
      'yargs': '^17.7.2'
    }
  };
  createFile('package.json', JSON.stringify(packageJson, null, 2));

  // Create polyglot.json
  const polyglotJson = {
    skill_name: { '': skillClassName },
    skill_description: { '': `A Claude skill for ${skillName}` },
    help_description: { '': `Use this skill to ${skillName}` },
    success_message: { '': 'Operation completed successfully' },
    error_message: { '': 'An error occurred' }
  };
  createFile('polyglot.json', JSON.stringify(polyglotJson, null, 2));

  // Create src/cli directory and index.js
  const cliContent = `#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .scriptName('${skillName}')
  .usage('Usage: $0 <command> [options]')
  .command('hello [name]', 'Say hello', (yargs) => {
    return yargs.positional('name', {
      describe: 'Name to greet',
      type: 'string',
      default: 'World'
    });
  }, async (argv) => {
    console.log(\`Hello, \${argv.name}!\`);
  })
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .argv;

export { argv };
`;
  createFile('src/cli/index.js', cliContent);

  // Create README.md
  const readmeContent = `# ${skillClassName}

A Claude skill for ${skillName.replace(/-/g, ' ')}.

## Usage

\`\`\`bash
${skillName} --help
\`\`\`

## Development

\`\`\`bash
bun install
bun run build
\`\`\`
`;
  createFile('README.md', readmeContent);

  // Create .gitignore
  const gitignoreContent = `node_modules/
dist/
.env
*.log
`;
  createFile('.gitignore', gitignoreContent);

  // Create .skill.yml
  const skillYmlContent = `name: ${skillName}
version: 1.0.0
description: A Claude skill for ${skillName}

commands:
  - name: hello
    description: Say hello to someone
`;
  createFile('.skill.yml', skillYmlContent);

  results.message = `✅ Skill initialized at ${cwd}`;
  return results;
}
