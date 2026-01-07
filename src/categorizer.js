import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_RULES = {
  work: ['bricsys', 'company', 'work', 'client'],
  sideProject: ['/projects/', 'portfolio', 'experiment', 'learning', 'side-project', 'hobby', 'personal']
};

function loadRules(configPath) {
  configPath = configPath || path.join(__dirname, '..', 'config.json');

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.categories) {
        return {
          work: config.categories.work || DEFAULT_RULES.work,
          sideProject: config.categories.sideProject || DEFAULT_RULES.sideProject
        };
      }
    } catch (error) {
      console.error('Error loading config.json:', error.message);
    }
  }

  return DEFAULT_RULES;
}

export function createCategorizer(rules = DEFAULT_RULES) {
  return function(projectPath) {
    if (!projectPath) return 'other';

    const lowerPath = projectPath.toLowerCase();

    for (const pattern of rules.work) {
      if (lowerPath.includes(pattern.toLowerCase())) return 'work';
    }

    for (const pattern of rules.sideProject) {
      if (lowerPath.includes(pattern.toLowerCase())) return 'sideProject';
    }

    return 'other';
  };
}

export function getCategorizer(configPath) {
  return createCategorizer(loadRules(configPath));
}
