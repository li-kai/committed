import path from 'path';
import getConfig from './config/config';
import afs from './utils/afs';
import { findUp, pathExists } from './utils/fileSystemUtils';
import isCommittedHook from './utils/is-committed-hook';
import logger from './utils/logger';
import packageJsonUtils from './utils/packageJsonUtils';
import * as strings from './utils/strings';

// Only client side hooks listed in
// https://git-scm.com/docs/githooks
const hooksList = [
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'pre-rebase',
  'post-checkout',
  'post-merge',
  'pre-push',
];

async function linkHook(sourceHook: string, targetHook: string) {
  try {
    const sourceHookExists = await pathExists(sourceHook);
    if (!sourceHookExists) {
      return;
    }

    await afs.symlink(sourceHook, targetHook);
    await afs.chmod(sourceHook, '0755');
    console.log(strings.installedHook(sourceHook, targetHook));
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(error);
      return;
    }

    if (isCommittedHook(targetHook)) {
      console.log(strings.installedHook(sourceHook, targetHook));
    } else {
      console.warn(strings.skippingHook(targetHook));
    }
  }
}
async function install() {
  const gitDir = await findUp('.git');

  if (gitDir == null) {
    logger.fatal(strings.gitRepoNotFoundMessage);
    return;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  // Ensure folder exists
  // tslint:disable-next-line:no-empty
  afs.mkdir(hooksDir).catch(() => {});

  const hookInstallations = hooksList.map((hook) => {
    const sourceHook = path.resolve(__dirname, `${hook}.js`);
    const targetHook = path.resolve(hooksDir, hook);
    return linkHook(sourceHook, targetHook);
  });
  await Promise.all(hookInstallations);
}

function commit() {
  // TODO: interactive commit
  return;
}

async function changelog(dirPath?: string): Promise<void[]> {
  const config = await getConfig(dirPath || '');
  const pkgJsons = await packageJsonUtils.getSemanticVersionPkgMetas(dirPath);
  const releases = await packageJsonUtils.getSemanticReleaseData(pkgJsons);
  const releasePromises = releases.map(async (releaseData) => {
    const changelogPath = path.join(releaseData.context.dir, 'CHANGELOG.md');
    const changelogContent = await afs
      .readFile(changelogPath, 'utf8')
      .catch(() => '');
    const newChangelogContent = await config.genChangelog(
      changelogContent,
      releaseData
    );
    return afs.writeFile(changelogPath, newChangelogContent);
  });
  return Promise.all(releasePromises);
}

async function release(dirPath?: string): Promise<void[]> {
  const config = await getConfig(dirPath || '');
  const pkgJsons = await packageJsonUtils.getSemanticVersionPkgMetas(dirPath);
  const releases = await packageJsonUtils.getSemanticReleaseData(pkgJsons);
  const releasePromises = releases.map(async (releaseData) => {
    const changelogPath = path.join(releaseData.context.dir, 'CHANGELOG.md');
    const changelogContent = await afs
      .readFile(changelogPath, 'utf8')
      .catch(() => '');
    const newChangelogContent = await config.genChangelog(
      changelogContent,
      releaseData
    );
    return afs.writeFile(changelogPath, newChangelogContent);
  });
  return Promise.all(releasePromises);
}

changelog();

function uninstall() {
  // TODO: remove hooks
  return;
}

export { install, commit, changelog, release, uninstall };
