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

// Required files for a valid skill (per PDF guide)
const REQUIRED_FILES = [
  'SKILL.md'  // Most important! Required by Claude Code
];

// Recommended files for a well-structured skill
const RECOMMENDED_FILES = [
  'package.json',
  'README.md',
  'polyglot.json',
  '.skill.yml'
];

// Optional but recommended for CLI skills
const CLI_RECOMMENDED = [
  'dist/cli/index.js'
];

// Bundled resources (optional directories per PDF guide)
const BUNDLED_RESOURCES = [
  'scripts',     // Executable code
  'references',   // Documentation for context
  'assets'       // Files used in output
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
 * Get description for a bundled resource directory
 */
function getResourceDescription(resourceDir) {
  const descriptions = {
    'scripts': 'executable code that is repeatedly rewritten or requires deterministic reliability',
    'references': 'documentation and reference material to be loaded into context as needed',
    'assets': 'files used in the output Claude produces (templates, images, fonts, etc.)'
  };
  return descriptions[resourceDir] || 'additional resources';
}

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

  // 2.5. Validate SKILL.md (per PDF guide - most important!)
  console.log(`${t('info_checking_skill_md')}`);
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    try {
      const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');

      // Check for YAML frontmatter
      const hasFrontmatter = skillMdContent.startsWith('---');
      addCheck('SKILL.md', 'has_frontmatter', hasFrontmatter,
        hasFrontmatter ? SEVERITY.SUCCESS : SEVERITY.ERROR,
        hasFrontmatter ? '' : 'SKILL.md must start with YAML frontmatter (---)');

      // Extract and parse frontmatter
      if (hasFrontmatter) {
        const frontmatterEnd = skillMdContent.indexOf('---', 4);
        if (frontmatterEnd > 0) {
          const frontmatterText = skillMdContent.substring(4, frontmatterEnd);

          // Check for required field: name
          const hasName = frontmatterText.includes('name:');
          addCheck('SKILL.md', 'frontmatter_has_name', hasName,
            hasName ? SEVERITY.SUCCESS : SEVERITY.ERROR,
            hasName ? '' : 'Frontmatter must include "name:" field');

          // Check for required field: description
          const hasDescription = frontmatterText.includes('description:');
          addCheck('SKILL.md', 'frontmatter_has_description', hasDescription,
            hasDescription ? SEVERITY.SUCCESS : SEVERITY.ERROR,
            hasDescription ? '' : 'Frontmatter must include "description:" field');

          // Check for optional field: license
          const hasLicense = frontmatterText.includes('license:');
          addCheck('SKILL.md', 'frontmatter_has_license', hasLicense,
            hasLicense ? SEVERITY.SUCCESS : SEVERITY.INFO,
            hasLicense ? '' : 'Consider adding "license:" field to frontmatter');

          // Best practice: description should explain when to use the skill
          if (hasDescription) {
            const descMatch = frontmatterText.match(/description:\s*(.+)/);
            if (descMatch) {
              const description = descMatch[1].toLowerCase();
              const describesUsage = description.includes('use when') ||
                                    description.includes('use this skill') ||
                                    description.includes('should be used') ||
                                    description.includes('when to');
              addCheck('SKILL.md', 'describes_when_to_use', describesUsage,
                describesUsage ? SEVERITY.SUCCESS : SEVERITY.WARNING,
                describesUsage ? '' : 'Description should explain when to use this skill (e.g., "Use this skill when...")');
            }
          }
        }
      }

      // Check for markdown body content
      const bodyStart = skillMdContent.indexOf('---', 4);
      const hasBody = bodyStart > 0 && skillMdContent.substring(bodyStart + 3).trim().length > 0;
      addCheck('SKILL.md', 'has_markdown_body', hasBody,
        hasBody ? SEVERITY.SUCCESS : SEVERITY.WARNING,
        hasBody ? '' : 'SKILL.md should have markdown body content after frontmatter');

    } catch (e) {
      addCheck('SKILL.md', 'readable', false, SEVERITY.ERROR,
        'Could not read SKILL.md');
    }
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

  // Check for LICENSE file (open source best practice)
  const licensePath = path.join(skillPath, 'LICENSE');
  const hasLicense = fs.existsSync(licensePath);
  addCheck('best_practices', 'has_license_file', hasLicense,
    hasLicense ? SEVERITY.SUCCESS : SEVERITY.WARNING,
    hasLicense ? '' : 'Add LICENSE file for proper open source distribution');

  // Check for CONTRIBUTING.md (open source best practice)
  const contributingPath = path.join(skillPath, 'CONTRIBUTING.md');
  const hasContributing = fs.existsSync(contributingPath);
  addCheck('best_practices', 'has_contributing', hasContributing,
    hasContributing ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasContributing ? '' : 'Consider adding CONTRIBUTING.md for contributors');

  // Check for CHANGELOG.md (open source best practice)
  const changelogPath = path.join(skillPath, 'CHANGELOG.md');
  const hasChangelog = fs.existsSync(changelogPath);
  addCheck('best_practices', 'has_changelog', hasChangelog,
    hasChangelog ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasChangelog ? '' : 'Consider adding CHANGELOG.md for version tracking');

  // 9. Check marketplace readiness (SkillsMP, DayMade, etc.)
  console.log(`${t('info_checking_marketplace')}`);
  const marketplacePath = path.join(skillPath, 'marketplace.json');
  const hasMarketplaceJson = fs.existsSync(marketplacePath);
  addCheck('marketplace', 'has_marketplace_json', hasMarketplaceJson,
    hasMarketplaceJson ? SEVERITY.SUCCESS : SEVERITY.INFO,
    hasMarketplaceJson ? '' : 'Consider adding marketplace.json for market distribution');

  if (hasMarketplaceJson) {
    try {
      const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));

      // Check required marketplace fields
      const requiredMarketplaceFields = ['name', 'version', 'description', 'categories', 'keywords', 'author', 'license', 'repository', 'homepage', 'bugs', 'marketplace'];
      for (const field of requiredMarketplaceFields) {
        const hasField = marketplace[field] !== undefined;
        addCheck('marketplace', `field_${field}`, hasField,
          hasField ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          hasField ? '' : `Missing marketplace field: ${field}`);
      }

      // Check if categories is an array
      if (marketplace.categories) {
        const hasCategories = Array.isArray(marketplace.categories) && marketplace.categories.length > 0;
        addCheck('marketplace', 'has_valid_categories', hasCategories,
          hasCategories ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          hasCategories ? '' : 'categories should be a non-empty array');
      }

      // Check if keywords is an array
      if (marketplace.keywords) {
        const hasKeywords = Array.isArray(marketplace.keywords) && marketplace.keywords.length > 0;
        addCheck('marketplace', 'has_valid_keywords', hasKeywords,
          hasKeywords ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          hasKeywords ? '' : 'keywords should be a non-empty array');
      }

      // Check if marketplace field is valid
      if (marketplace.marketplace) {
        const validMarketplaces = ['skillsmp', 'daymade', 'hexrays', 'smartscope'];
        const isValidMarketplace = validMarketplaces.includes(marketplace.marketplace);
        addCheck('marketplace', 'valid_marketplace', isValidMarketplace,
          isValidMarketplace ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          isValidMarketplace ? '' : `marketplace should be one of: ${validMarketplaces.join(', ')}`);
      }

      // Check if repository URL is valid
      if (marketplace.repository) {
        const isValidUrl = marketplace.repository.startsWith('https://');
        addCheck('marketplace', 'valid_repository_url', isValidUrl,
          isValidUrl ? SEVERITY.SUCCESS : SEVERITY.WARNING,
          isValidUrl ? '' : 'repository should be a valid HTTPS URL');
      }

    } catch (e) {
      addCheck('marketplace', 'valid_json', false, SEVERITY.ERROR,
        'marketplace.json contains invalid JSON');
    }
  }

  // 8. Check Bundled Resources (per PDF guide)
  console.log(`${t('info_checking_resources')}`);

  for (const resourceDir of BUNDLED_RESOURCES) {
    const resourcePath = path.join(skillPath, resourceDir);
    const exists = fs.existsSync(resourcePath) && fs.statSync(resourcePath).isDirectory();
    if (exists) {
      addCheck('bundled_resources', `has_${resourceDir}`, true, SEVERITY.SUCCESS,
        `Found ${resourceDir}/ directory`);
    } else {
      addCheck('bundled_resources', `has_${resourceDir}`, true, SEVERITY.INFO,
        `Consider adding ${resourceDir}/ for ${getResourceDescription(resourceDir)}`);
    }
  }

  // Check for SKILL.md content bloat (per PDF: concise is key)
  if (fs.existsSync(skillMdPath)) {
    const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
    const wordCount = skillMdContent.split(/\s+/).length;

    if (wordCount > 5000) {
      addCheck('SKILL.md', 'concise_content', false, SEVERITY.WARNING,
        `SKILL.md is quite long (${wordCount} words). Consider moving detailed reference material to references/ directory per PDF guide (Concise is Key principle)`);
    } else {
      addCheck('SKILL.md', 'concise_content', true, SEVERITY.SUCCESS,
        `SKILL.md is concise (${wordCount} words)`);
    }
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
