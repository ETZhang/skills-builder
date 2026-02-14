/**
 * Skill Validator
 *
 * Validates Claude skills according to best practices documented in:
 * The Complete Guide to Building Skills for Claude
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validation result types
const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

// Required files for a valid skill
const REQUIRED_FILES = [
  'package.json'
];

// Recommended files for a well-structured skill
const RECOMMENDED_FILES = [
  'README.md',
  'polyglot.json',
  'dist/cli/index.js'
];

// Best practice rules
const BEST_PRACTICES = {
  // package.json must have specific fields
  packageJsonFields: [
    'name',
    'version',
    'description',
    'type',
    'main',
    'bin'
  ],

  // package.json name should be kebab-case
  nameFormat: /^([a-z0-9]+(-[a-z0-9]+)*)$/,

  // type should be "module"
  moduleType: 'module',

  // Should use polyglot for internationalization
  usesPolyglot: true
};

/**
 * Main validation function
 */
export async function checkSkill(skillPath, options = {}) {
  const {
    format = 'text',
    verbose = false,
    translations = {}
  } = options;

  const results = {
    success: true,
    skillPath,
    skillName: path.basename(skillPath),
    checks: [],
    errors: [],
    warnings: [],
    recommendations: []
  };

  // Helper function to add a check result
  const addCheck = (category, name, passed, severity = SEVERITY.SUCCESS, message = '') => {
    const check = { category, name, passed, severity, message };
    results.checks.push(check);

    if (severity === SEVERITY.ERROR) {
      results.errors.push(check);
      results.success = false;
    } else if (severity === SEVERITY.WARNING) {
      results.warnings.push(check);
    }
  };

  // Get translation helper
  const t = (key) => translations[key]?.[''] || key;

  // 1. Check if skill directory exists
  console.log(`${t('info_checking_structure')}`);
  if (!fs.existsSync(skillPath)) {
    addCheck('structure', 'directory_exists', false, SEVERITY.ERROR,
      t('error_no_skill_dir').replace('{path}', skillPath));
    return formatOutput(results, format, translations);
  }

  // 2. Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(skillPath, file);
    const exists = fs.existsSync(filePath);
    addCheck('structure', `file_${file.replace(/\//g, '_')}`, exists,
      exists ? SEVERITY.SUCCESS : SEVERITY.ERROR,
      exists ? '' : t('error_missing_required').replace('{file}', file));
  }

  // 3. Check recommended files
  for (const file of RECOMMENDED_FILES) {
    const filePath = path.join(skillPath, file);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      addCheck('structure', `file_${file.replace(/\//g, '_')}`, false, SEVERITY.WARNING,
        t('warning_missing_file').replace('{file}', file));
    }
  }

  // 4. Validate package.json
  console.log(`${t('info_checking_package')}`);
  const packageJsonPath = path.join(skillPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Check required fields
      for (const field of BEST_PRACTICES.packageJsonFields) {
        const hasField = packageJson[field] !== undefined;
        addCheck('package.json', `field_${field}`, hasField,
          hasField ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          hasField ? '' : `Missing field: ${field}`);
      }

      // Check name format (kebab-case)
      if (packageJson.name) {
        const validName = BEST_PRACTICES.nameFormat.test(packageJson.name);
        addCheck('package.json', 'name_format', validName,
          validName ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          validName ? '' : 'Name should be kebab-case (lowercase with hyphens)');
      }

      // Check type is "module"
      if (packageJson.type) {
        const isModule = packageJson.type === BEST_PRACTICES.moduleType;
        addCheck('package.json', 'is_module', isModule,
          isModule ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          isModule ? '' : `Type should be "${BEST_PRACTICES.moduleType}"`);
      }

      // Check for bin pointing to dist/cli/index.js
      if (packageJson.bin) {
        const binPath = typeof packageJson.bin === 'string'
          ? packageJson.bin
          : packageJson.bin[packageJson.name];
        const hasCorrectBin = binPath && binPath === 'dist/cli/index.js';
        addCheck('package.json', 'bin_correct', hasCorrectBin,
          hasCorrectBin ? SEVERITY.SUCCESS : SEVERITY.INFO,
          hasCorrectBin ? '' : 'bin should point to "dist/cli/index.js"');
      }

    } catch (e) {
      addCheck('package.json', 'valid_json', false, SEVERITY.ERROR,
        t('error_invalid_package_json').replace('{path}', packageJsonPath));
    }
  }

  // 5. Validate polyglot.json
  console.log(`${t('info_checking_polyglot')}`);
  const polyglotPath = path.join(skillPath, 'polyglot.json');
  if (fs.existsSync(polyglotPath)) {
    try {
      const polyglot = JSON.parse(fs.readFileSync(polyglotPath, 'utf-8'));

      // Check if polyglot has at least one key with empty string (default language)
      const hasDefaultLang = Object.values(polyglot).some(
        translations => translations[''] !== undefined
      );
      addCheck('polyglot.json', 'has_default_language', hasDefaultLang,
        hasDefaultLang ? SEVERITY.SUCCESS : SEVERITY.WARNING,
        hasDefaultLang ? '' : 'Each key should have a default (empty string) translation');

      // Check for multiple languages
      const languages = new Set();
      for (const translations of Object.values(polyglot)) {
        Object.keys(translations).forEach(lang => languages.add(lang));
      }
      const hasMultipleLanguages = languages.size > 1;
      addCheck('polyglot.json', 'multiple_languages', hasMultipleLanguages,
        hasMultipleLanguages ? SEVERITY.SUCCESS : SEVERITY.INFO,
        hasMultipleLanguages ? `Found ${languages.size} languages: ${[...languages].join(', ')}` : 'Consider adding multiple language support');

    } catch (e) {
      addCheck('polyglot.json', 'valid_json', false, SEVERITY.ERROR,
        'polyglot.json contains invalid JSON');
    }
  } else {
    addCheck('polyglot.json', 'exists', false, SEVERITY.WARNING,
      'Consider using polyglot.json for internationalization');
  }

  // 6. Validate CLI entry point
  console.log(`${t('info_checking_cli')}`);
  const cliPath = path.join(skillPath, 'dist/cli/index.js');
  if (fs.existsSync(cliPath)) {
    // Check if CLI file is executable and has shebang
    const cliContent = fs.readFileSync(cliPath, 'utf-8');
    const hasShebang = cliContent.startsWith('#!/');
    addCheck('cli', 'has_shebang', hasShebang,
      hasShebang ? SEVERITY.SUCCESS : SEVERITY.INFO,
      hasShebang ? '' : 'CLI file should start with shebang (#!/usr/bin/env node)');

    // Check if CLI parses arguments
    const hasArgv = cliContent.includes('yargs') || cliContent.includes('argv') || cliContent.includes('process.argv');
    addCheck('cli', 'parses_args', hasArgv,
      hasArgv ? SEVERITY.SUCCESS : SEVERITY.WARNING,
      hasArgv ? '' : 'CLI should parse command line arguments');
  }

  // 7. Check best practices
  console.log(`${t('info_checking_best_practices')}`);

  // Check for .skill.yml configuration
  const skillYmlPath = path.join(skillPath, '.skill.yml');
  const hasSkillYml = fs.existsSync(skillYmlPath);
  addCheck('best_practices', 'has_skill_yml', hasSkillYml,
    hasSkillYml ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasSkillYml ? '' : 'Consider adding .skill.yml for configuration');

  // Check for locales directory
  const localesPath = path.join(skillPath, 'locales');
  const hasLocales = fs.existsSync(localesPath);
  addCheck('best_practices', 'has_locales', hasLocales,
    hasLocales ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasLocales ? '' : 'Consider adding locales directory for additional translations');

  // Check for src directory structure
  const srcPath = path.join(skillPath, 'src');
  const hasSrc = fs.existsSync(srcPath);
  addCheck('best_practices', 'has_src_directory', hasSrc,
    hasSrc ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasSrc ? '' : 'Source code should be in src/ directory');

  // Check for dist in .gitignore
  const gitignorePath = path.join(skillPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    const ignoresDist = gitignore.includes('/dist') || gitignore.includes('dist');
    addCheck('best_practices', 'ignores_dist', ignoresDist,
      ignoresDist ? SEVERITY.SUCCESS : SEVERITY.WARNING,
      ignoresDist ? '' : 'Add /dist to .gitignore');
  }

  // Generate recommendations
  if (results.warnings.length > 0) {
    results.recommendations.push('Address warnings to improve skill quality');
  }
  if (!fs.existsSync(polyglotPath)) {
    results.recommendations.push('Add polyglot.json for internationalization support');
  }
  if (!fs.existsSync(path.join(skillPath, 'README.md'))) {
    results.recommendations.push('Add README.md with documentation');
  }

  return formatOutput(results, format, translations);
}

/**
 * Format validation output
 */
function formatOutput(results, format, translations) {
  const t = (key) => translations[key]?.[''] || key;

  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  if (format === 'markdown') {
    return formatMarkdown(results, t);
  }

  // Default text format
  return formatText(results, t);
}

/**
 * Format as text
 */
function formatText(results, t) {
  const lines = [];

  lines.push('🔍 Skill Validation Results');
  lines.push(`📁 Path: ${results.skillPath}`);
  lines.push(`📦 Name: ${results.skillName}`);
  lines.push('');

  if (results.success) {
    lines.push('✅ ' + t('validation_passed'));
  } else {
    lines.push(`❌ ${t('validation_failed').replace('{count}', results.errors.length)}`);
  }

  if (results.warnings.length > 0) {
    lines.push(`⚠️  ${t('validation_warnings').replace('{count}', results.warnings.length)}`);
  }

  lines.push('');
  lines.push('📊 Checks Summary:');
  lines.push('─'.repeat(50));

  for (const check of results.checks) {
    const icon = check.passed ? '✅' : (check.severity === SEVERITY.WARNING ? '⚠️' : '❌');
    lines.push(`${icon} [${check.category}] ${check.name}`);
    if (check.message && !check.passed) {
      lines.push(`   ${check.message}`);
    }
  }

  if (results.recommendations.length > 0) {
    lines.push('');
    lines.push('💡 Recommendations:');
    for (const rec of results.recommendations) {
      lines.push(`  • ${rec}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format as markdown
 */
function formatMarkdown(results, t) {
  const lines = [];

  lines.push('# 🔍 Skill Validation Report');
  lines.push('');
  lines.push(`## ${t('header_summary')}`);
  lines.push('');
  lines.push(`- **Skill**: ${results.skillName}`);
  lines.push(`- **Path**: \`${results.skillPath}\``);
  lines.push(`- **Status**: ${results.success ? '✅ Passed' : '❌ Failed'}`);
  lines.push(`- **Errors**: ${results.errors.length}`);
  lines.push(`- **Warnings**: ${results.warnings.length}`);
  lines.push('');

  lines.push(`## ${t('header_structure')}`);
  lines.push('');

  const structureChecks = results.checks.filter(c => c.category === 'structure');
  for (const check of structureChecks) {
    const status = check.passed ? '✅' : '❌';
    lines.push(`- ${status} \`${check.name.replace('file_', '')}\``);
  }

  lines.push('');
  lines.push(`## ${t('header_best_practices')}`);
  lines.push('');

  const bpChecks = results.checks.filter(c => c.category === 'best_practices' || c.category === 'package.json');
  for (const check of bpChecks) {
    const severity = check.severity === SEVERITY.SUCCESS ? '✅' :
                     check.severity === SEVERITY.WARNING ? '⚠️' : '❌';
    lines.push(`- ${severity} **${check.name}**: ${check.message || 'OK'}`);
  }

  if (results.recommendations.length > 0) {
    lines.push('');
    lines.push(`## ${t('header_recommendations')}`);
    lines.push('');
    for (const rec of results.recommendations) {
      lines.push(`- ${rec}`);
    }
  }

  return lines.join('\n');
}

export { SEVERITY, BEST_PRACTICES };
