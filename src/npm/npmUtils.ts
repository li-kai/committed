import path from 'path';
import gitUtils from '../git/gitUtils';
import afs from '../utils/afs';
import logger from '../utils/logger';
import pathExists from '../utils/path-exists';

/**
 * Checks if there is a npmrc file, else,
 * check if the environment variable NPM_TOKEN is set,
 * and writes the npmrc file if needed.
 * If no npmrc is written at the end, returns false
 */
async function ensureAuth(npmrcPath?: string): Promise<boolean> {
  let filePath = npmrcPath as string;

  if (!npmrcPath) {
    const rootPath = await gitUtils.getGitRootPath();
    filePath = path.join(rootPath, '.npmrc');
  }
  logger.debug(`npmrcPath: ${filePath}`);

  const npmrcPathExists = await pathExists(filePath);
  if (npmrcPathExists) {
    return true;
  }

  if (process.env.NPM_TOKEN) {
    await afs.writeFile(
      filePath,
      // tslint:disable-next-line:no-invalid-template-strings
      '//registry.npmjs.org/:_authToken=${NPM_TOKEN}'
    );

    return true;
  }

  return false;
}

export default { ensureAuth };
