#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Get translations
function getTranslations() {
  try {
    const polyglotPath = join(__dirname, '../../polyglot.json');
    if (fs.existsSync(polyglotPath)) {
      const content = fs.readFileSync(polyglotPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Silently fail
  }
  return {};
}

function t(key, translations = {}) {
  return translations[key]?.[''] || key;
}

// CLI Configuration
const argv = yargs(hideBin(process.argv))
  .scriptName('skill-builder')
  .usage('Usage: $0 <command> [options]')
  .command('check [path]', 'Validate a skill', (yargs) => {
    return yargs
      .positional('path', {
        describe: 'Path to skill directory',
        type: 'string',
        default: '.'
      })
      .option('format', {
        alias: 'f',
        describe: 'Output format (text, json, markdown)',
        choices: ['text', 'json', 'markdown'],
        default: 'text'
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Enable verbose output',
        type: 'boolean',
        default: false
      });
  }, async (argv) => {
    const translations = getTranslations();
    const { checkSkill } = await import('../validator/index.js');
    const result = await checkSkill(argv.path, {
      format: argv.format,
      verbose: argv.verbose,
      translations
    });
    console.log(result);
  })
  .command('create [name]', 'Create a new skill', (yargs) => {
    return yargs
      .positional('name', {
        describe: 'Name of skill (kebab-case)',
        type: 'string',
        default: 'my-new-skill'
      })
      .option('path', {
        alias: 'p',
        describe: 'Directory to create skill in',
        type: 'string',
        default: '.'
      })
      .option('interactive', {
        alias: 'i',
        describe: 'Interactive mode with guided prompts',
        type: 'boolean',
        default: true
      })
      .option('template', {
        alias: 't',
        describe: 'Template to use (basic, advanced, analyzer)',
        choices: ['basic', 'advanced', 'analyzer'],
        default: 'basic'
      });
  }, async (argv) => {
    const translations = getTranslations();
    const { createSkill } = await import('../generator/index.js');
    const result = await createSkill(argv.name, {
      path: argv.path,
      interactive: argv.interactive,
      template: argv.template,
      translations
    });
    console.log(result);
  })
  .command('init', 'Initialize current directory as a skill', (yargs) => {
    return yargs
      .option('force', {
        alias: 'f',
        describe: 'Overwrite existing files',
        type: 'boolean',
        default: false
      });
  }, async (argv) => {
    const translations = getTranslations();
    const { initSkill } = await import('../generator/init.js');
    const result = await initSkill(process.cwd(), {
      force: argv.force,
      translations
    });
    console.log(result);
  })
  .command('update [path]', 'Update an existing skill', (yargs) => {
    return yargs
      .positional('path', {
        describe: 'Path to skill directory',
        type: 'string',
        default: '.'
      })
      .option('add-language', {
        describe: 'Add a new language',
        type: 'string'
      })
      .option('add-dependency', {
        describe: 'Add a dependency',
        type: 'string'
      });
  }, async (argv) => {
    const translations = getTranslations();
    const { updateSkill } = await import('../generator/update.js');
    const result = await updateSkill(argv.path, {
      addLanguage: argv.addLanguage,
      addDependency: argv.addDependency,
      translations
    });
    console.log(result);
  })
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .example('$0 check', 'Validate current directory as a skill')
  .example('$0 create my-awesome-skill', 'Create a new skill')
  .example('$0 init', 'Initialize current directory as a skill')
  .example('$0 update --add-language zh', 'Add Chinese language support')
  .argv;

export { argv, colors };
