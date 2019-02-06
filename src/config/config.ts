import path from 'path';
import defaultConfig from './defaultConfig';

/**
 * Merges config with the default config if available, else, uses default config.
 * @param rootPath rootPath of folder to find config
 */
async function getConfig(rootPath: string) {
  try {
    const configPath = path.resolve(rootPath, 'committed.config.js');
    const fullConfig = await import(configPath);
    const config = fullConfig.default || fullConfig;
    return { ...defaultConfig, ...config };
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  return defaultConfig;
}

export default getConfig;
