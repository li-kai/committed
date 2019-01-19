#!/usr/bin/env node
import childProcess from 'child_process';
import path from 'path';
import semanticVersion from './semantic-version';
import { IRepoMeta } from './types';
import afs from './utils/afs';
import findUp from './utils/find-up';
import gitUtils from './utils/git';
import isCommittedHook from './utils/is-committed-hook';
import pathExists from './utils/path-exists';
import report from './utils/report';
import * as strings from './utils/strings';

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

async function findPkgJson() {
  const PACKAGE_JSON_REGEX = /package\.json$/;
  const filePaths = await gitUtils.getFilesFromHead();

  const pkgJsonPaths: string[] = filePaths.filter((file) =>
    PACKAGE_JSON_REGEX.test(file)
  );

  const repoMetas: IRepoMeta[] = [];
  const initialVersion = {
    versionStr: '0.1.0',
    major: 0,
    minor: 1,
    patch: 0,
    prerelease: undefined,
  };

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
        previousTag: { name: pkgJson.name, ...initialVersion },
      });
    })
  );

  if (repoMetas.length === 0) {
    report.error('no package.json file found');
  }
  const isMonoRepo = repoMetas.length > 1;

  if (!isMonoRepo) {
    repoMetas[0].previousTag.name = undefined;
  }

  const existingTags = await gitUtils.getAllTags();

  interface IPkgNameToRepoMeta {
    [key: string]: IRepoMeta;
  }
  const nameToData: IPkgNameToRepoMeta = {};
  repoMetas.forEach((repoMeta) => {
    nameToData[repoMeta.name] = repoMeta;
  });
  if (isMonoRepo) {
    existingTags.forEach((tag) => {
      const tagName = tag.name;
      if (tagName === undefined) {
        report.error('No tag name given');
        return;
      }

      const data = nameToData[tagName];
      if (!data.previousTag) {
        nameToData[tagName].previousTag = tag;
      }
    });
  } else if (existingTags.length > 0) {
    const repoMeta = repoMetas[0];
    const tag = existingTags[0];
    nameToData[repoMeta.name].previousTag = tag;
  }

  await Promise.all(
    Object.values(nameToData).map(async (data) => {
      const previousTag = data.previousTag!;
      let previousTagString;
      if (previousTag && previousTag.versionStr) {
        previousTagString = previousTag.versionStr;
      }
      const commits = await gitUtils.getCommitsFromRef(previousTagString);
      const parsedCommits = commits.map((commit) =>
        semanticVersion.parseCommit(commit.content)
      );

      const maxVersionBump = semanticVersion.getVersionBumpType(parsedCommits);
      const newVersion = semanticVersion.increaseVersionBump(
        previousTag,
        maxVersionBump
      );
    })
  );
}

async function linkFiles() {
  const gitDir = await findUp('.git');

  if (gitDir == null) {
    report.error(strings.gitRepoNotFoundMessage);
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

  const rootDirPath = path.resolve(gitDir, '..');
  return findPkgJson();
}

linkFiles().catch((err) => {
  console.error(err);
});