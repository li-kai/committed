#!/usr/bin/env node
const childProcess = require('child_process');
const path = require('path');
const EventEmitter = require('events');
const afs = require('./utils/afs');
const findUp = require('./utils/find-up');
const pathExists = require('./utils/path-exists');
const isCommittedHook = require('./utils/is-committed-hook');
const readdirRecursive = require('./utils/readdir-recursive');
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
function stdinLineByLine(stdin) {
  const emitter = new EventEmitter();
  let buff = '';

  stdin
    .on('data', (data) => {
      buff += data;
      const lines = buff.split(/[\r\n|\n]/);
      buff = lines.pop();
      lines.forEach((line) => emitter.emit('line', line));
    })
    .on('end', () => {
      if (buff.length > 0) emitter.emit('line', buff);
    });

  return emitter;
}

async function findPkgJson(rootPath) {
  const contents = await readdirRecursive(rootPath);

  const gitEmitter = childProcess.spawn('git', ['rev-list', '--all']);
  const stdin = stdinLineByLine(gitEmitter.stdout);
  stdin.on('line', console.log);
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

  const rootDirPath = path.resolve(gitDir, '..');
  return findPkgJson(rootDirPath);
}

linkFiles().catch((err) => {
  console.error(err);
});
