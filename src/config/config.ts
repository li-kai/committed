import path from 'path';
import defaultConfig from './defaultConfig';

/**
 * Merges config with the default config if available, else, uses default config.
 * @param rootPath rootPath of folder to find config
 */
async function getConfig(rootPath: string) {
  try {
    const config = await import(path.join(rootPath, 'committed.config.js'));
    return { ...defaultConfig, config };
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  return defaultConfig;
}

export default getConfig;
