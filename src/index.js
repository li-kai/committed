#!/usr/bin/env node
const childProcess = require('child_process');
const path = require('path');
const gitUtils = require('./utils/git');
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

async function findPkgJson() {
  const PACKAGE_JSON_REGEX = /package\.json$/;
  const filePaths = await gitUtils.getFilesFromHead();

  const pkgJsonPaths = filePaths.filter((file) =>
    PACKAGE_JSON_REGEX.test(file)
  );
  const repoMetas = [];
  await Promise.all(
    pkgJsonPaths.map(async (filePath) => {
      const fileContent = await afs.readFile(filePath, 'utf8');
      const dir = path.dirname(filePath);
      const pkgJson = JSON.parse(fileContent);

      if (!pkgJson.name) {
        report.error('no package name found');
      }

      repoMetas.push({
        dir,
        name: pkgJson.name,
        version: pkgJson.version,
        private: pkgJson.private === true,
      });
    })
  );

  if (repoMetas.length === 0) {
    report.error('no package.json file found');
  }

  const existingTags = await gitUtils.getAllTags();
  const isMonoRepo = repoMetas.length > 1;

  const nameToData = {};
  repoMetas.forEach((repoMeta) => {
    nameToData[repoMeta.name] = repoMeta;
  });
  if (isMonoRepo) {
    existingTags.forEach((tag) => {
      const data = nameToData[tag.name];
      if (!data) {
        nameToData[tag.name] = { previousVersion: tag };
      } else if (!data.previousVersion) {
        nameToData[tag.name].previousVersion = tag;
      }
    });
  } else if (existingTags.length > 0) {
    const repoMeta = repoMetas[0];
    const tag = existingTags[0];
    nameToData[repoMeta.name].previousVersion = tag;
  }

  await Promise.all(
    Object.values(nameToData).map(async (data) => {
      const { previousVersion } = data;
      const commits = await gitUtils.getCommitsFromRef(previousVersion.version);
      console.log(commits);
    })
  );
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
