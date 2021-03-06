import os from 'os';
import path from 'path';
import semanticVersionTag from '../semanticVersionTag';
import { ISemanticVersionTag } from '../types';
import afs from './afs';
import { makeProgram } from './commandLineUtils';
import { pathExists } from './fileSystemUtils';
import gitUtils from './gitUtils';
import logger from './logger';

const npmCmd = makeProgram(os.platform() === 'win32' ? 'npm.cmd' : 'npm');

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

type PublishOptions = {
  registry?: string;
  dryRun?: boolean;
};
async function publish(dirPath: string, options?: PublishOptions) {
  const args = ['publish', dirPath];
  if (options && options.registry) {
    args.push('--registry', options.registry);
  }
  if (options && options.dryRun) {
    args.push('--dry-run');
  }
  return npmCmd(args);
}

async function version(
  dirPath: string,
  tag: ISemanticVersionTag,
  options?: { dryRun: boolean }
) {
  if (options && options.dryRun) return '';

  const tagVerString = semanticVersionTag.getVersionString(tag);
  return npmCmd(['--no-git-tag-version', 'version', tagVerString], {
    cwd: dirPath,
  });
}

export default { ensureAuth, publish, version };
