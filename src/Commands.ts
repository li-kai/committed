import path from 'path';
import afs from './utils/afs';
import findUp from './utils/find-up';
import isCommittedHook from './utils/is-committed-hook';
import logger from './utils/logger';
import pathExists from './utils/path-exists';
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

function changelog() {
  // TODO: generate changelog
  return;
}

function release() {
  // TODO: release packages
  return;
}

function uninstall() {
  // TODO: remove hooks
  return;
}

export { install, commit, changelog, release, uninstall };