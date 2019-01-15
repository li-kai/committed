#!/usr/bin/env node
const childProcess = require('child_process');
const path = require('path');
const afs = require('./utils/afs');
const findUp = require('./utils/find-up');
const pathExists = require('./utils/path-exists');
const isCommittedHook = require('./utils/is-committed-hook');
const report = require('./utils/report');
const strings = require('./utils/strings');

/**
 * Ensure that git is installed before proceeding
 */
childProcess.execFile('git', ['--version'], (error) => {
  if (error) {
    report.error(strings.gitNotFoundMessage);
  }
});

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

async function linkHook(sourceHook, targetHook) {
  try {
    const sourceHookExists = await pathExists(sourceHook);
    if (!sourceHookExists) {
      return;
    }

    await afs.symlink(sourceHook, targetHook);
    await afs.chmod(sourceHook, '0755');
    console.log(strings.installedHook(sourceHook, targetHook));
  } catch (error) {
    if (!error.code === 'EEXIST') {
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

async function linkFiles() {
  const gitDir = await findUp('.git');

  if (gitDir == null) {
    report.error(strings.gitRepoNotFoundMessage);
  }

  const hooksDir = path.join(gitDir, 'hooks');
  // Ensure folder exists
  afs.mkdir(hooksDir).catch(() => {});

  const hookInstallations = hooksList.map((hook) => {
    const sourceHook = path.resolve(__dirname, `${hook}.js`);
    const targetHook = path.resolve(hooksDir, hook);
    return linkHook(sourceHook, targetHook);
  });
  await Promise.all(hookInstallations);
}

linkFiles().catch((err) => {
  console.error(err);
});
