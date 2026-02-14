/**
 * Update existing skill configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function updateSkill(skillPath, options = {}) {
  const {
    addLanguage = null,
    addDependency = null,
    translations = {}
  } = options;

  const t = (key) => translations[key]?.[''] || key;

  const results = {
    success: true,
    path: skillPath,
    updated: [],
    errors: []
  };

  // Check if skill exists
  if (!fs.existsSync(skillPath)) {
    results.success = false;
    results.errors.push(`Skill not found: ${skillPath}`);
    return results;
  }

  // Update: Add language to polyglot.json
  if (addLanguage) {
    const polyglotPath = join(skillPath, 'polyglot.json');
    if (fs.existsSync(polyglotPath)) {
      try {
        const polyglot = JSON.parse(fs.readFileSync(polyglotPath, 'utf-8'));

        // Add empty translations for new language
        for (const key of Object.keys(polyglot)) {
          if (!polyglot[key][addLanguage]) {
            polyglot[key][addLanguage] = '';
          }
        }

        fs.writeFileSync(polyglotPath, JSON.stringify(polyglot, null, 2));
        results.updated.push(`Added language "${addLanguage}" to polyglot.json`);
      } catch (e) {
        results.success = false;
        results.errors.push(`Failed to update polyglot.json: ${e.message}`);
      }
    } else {
      results.errors.push('polyglot.json not found');
    }
  }

  // Update: Add dependency to package.json
  if (addDependency) {
    const packageJsonPath = join(skillPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Parse dependency (supports "package" and "package@version" formats)
        let packageName, version;
        if (addDependency.includes('@')) {
          [packageName, version] = addDependency.split('@');
        } else {
          packageName = addDependency;
          version = 'latest';
        }

        // Add to dependencies
        if (!packageJson.dependencies) {
          packageJson.dependencies = {};
        }
        packageJson.dependencies[packageName] = `^${version}`;

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        results.updated.push(`Added dependency "${packageName}@${version}" to package.json`);
      } catch (e) {
        results.success = false;
        results.errors.push(`Failed to update package.json: ${e.message}`);
      }
    } else {
      results.errors.push('package.json not found');
    }
  }

  if (results.updated.length === 0 && results.errors.length === 0) {
    results.message = 'No updates specified. Use --add-language or --add-dependency.';
  } else {
    results.message = `✅ Updated ${results.updated.length} item(s)`;
  }

  return results;
}

/**
 * Add multiple languages at once
 */
export async function addLanguages(skillPath, languages) {
  const results = {
    success: true,
    added: [],
    skipped: []
  };

  const polyglotPath = join(skillPath, 'polyglot.json');
  if (!fs.existsSync(polyglotPath)) {
    results.success = false;
    results.error = 'polyglot.json not found';
    return results;
  }

  try {
    const polyglot = JSON.parse(fs.readFileSync(polyglotPath, 'utf-8'));

    for (const lang of languages) {
      let isNew = false;
      for (const key of Object.keys(polyglot)) {
        if (!polyglot[key][lang]) {
          polyglot[key][lang] = '';
          isNew = true;
        }
      }

      if (isNew) {
        results.added.push(lang);
      } else {
        results.skipped.push(lang);
      }
    }

    fs.writeFileSync(polyglotPath, JSON.stringify(polyglot, null, 2));
  } catch (e) {
    results.success = false;
    results.error = e.message;
  }

  return results;
}

/**
 * Update package.json version
 */
export async function bumpVersion(skillPath, versionType = 'patch') {
  const packageJsonPath = join(skillPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { success: false, error: 'package.json not found' };
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const currentVersion = packageJson.version.split('.').map(Number);

    switch (versionType) {
      case 'major':
        currentVersion[0]++;
        currentVersion[1] = 0;
        currentVersion[2] = 0;
        break;
      case 'minor':
        currentVersion[1]++;
        currentVersion[2] = 0;
        break;
      case 'patch':
        currentVersion[2]++;
        break;
    }

    packageJson.version = currentVersion.join('.');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return {
      success: true,
      oldVersion: packageJson.version,
      newVersion: currentVersion.join('.')
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export { addLanguages, bumpVersion };
