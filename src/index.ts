#!/usr/bin/env node
import childProcess from 'child_process';
import path from 'path';
import SemanticVersionTag, {
  INITIAL_SEMANTIC_VERSION_TAG,
  getVersionBump,
  parseCommit,
} from './SemanticVersionTag';
import { IPackageMeta, IRelease, IConfig } from './types';
import afs from './utils/afs';
import findUp from './utils/find-up';
import gitUtils, { GitBranchStatus } from './git/gitUtils';
import npmUtils from './npm/npmUtils';
import isCommittedHook from './utils/is-committed-hook';
import pathExists from './utils/path-exists';
import getConfig from './config/config';
import logger from './utils/logger';
import * as strings from './utils/strings';

/**
 * Ensure that git is installed before proceeding
 */
childProcess.execFile('git', ['--version'], (error) => {
  if (error) {
    logger.fatal(strings.gitNotFoundMessage);
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

async function release() {}

async function findPkgJson(): Promise<IPackageMeta[]> {
  const PACKAGE_JSON_REGEX = /package\.json$/;
  const filePaths = await gitUtils.getFilesFromHead();

  const pkgJsonPaths: string[] = filePaths.filter((file) =>
    PACKAGE_JSON_REGEX.test(file)
  );

  const packageMetas: IPackageMeta[] = [];

  await Promise.all(
    pkgJsonPaths.map(async (filePath) => {
      const fileContent = await afs.readFile(filePath, 'utf8');
      const dir = path.dirname(filePath);
      const pkgJson = JSON.parse(fileContent);

      if (!pkgJson.name) {
        logger.fatal('no package name found');
      }

      packageMetas.push({
        dir,
        name: pkgJson.name,
        version: pkgJson.version,
        private: pkgJson.private === true,
        previousTag: INITIAL_SEMANTIC_VERSION_TAG,
      });
    })
  );

  if (packageMetas.length === 0) {
    return logger.fatal('no package.json file found');
  }

  const isMonoRepo = packageMetas.length > 1;
  if (!isMonoRepo) {
    packageMetas[0].previousTag.name = undefined;
  }
  return packageMetas;
}

async function getLatestTagsForPackages(
  packageMetas: IPackageMeta[]
): Promise<IPackageMeta[]> {
  const rawTags = await gitUtils.getAllTags();
  const existingTags = rawTags.map((tagString) => {
    const tag = SemanticVersionTag.parse(tagString);
    if (tag == null) {
      return logger.fatal(`Invalid tag found: ${tagString}`);
    }
    return tag;
  });

  const nameToData: { [key: string]: IPackageMeta } = {};
  packageMetas.forEach((repoMeta) => {
    nameToData[repoMeta.name] = repoMeta;
  });

  const isMonoRepo = packageMetas.length > 1;
  if (isMonoRepo) {
    // Obtain the latest of the different packages' tag
    existingTags.forEach((tag) => {
      const tagName = tag.name;
      if (tagName === undefined) {
        return logger.fatal('No tag name given');
      }

      const data = nameToData[tagName];
      if (!data.previousTag) {
        nameToData[tagName].previousTag = tag;
      }
    });
  } else if (existingTags.length > 0) {
    // Simply take the first tag, as it is sorted already
    const repoMeta = packageMetas[0];
    const tag = existingTags[0];
    nameToData[repoMeta.name].previousTag = tag;
  }

  return Object.values(nameToData);
}

async function getReleaseData(
  packageMetas: IPackageMeta[]
): Promise<IRelease[]> {
  const remoteUrl = await gitUtils.getRemoteUrl();
  const repoMeta = gitUtils.getGitHubUrlFromGitUrl(remoteUrl);
  if (repoMeta == null) {
    return logger.fatal('No upstream url obtained');
  }

  return Promise.all(
    packageMetas.map(async (data) => {
      const previousTag = data.previousTag!;
      const commitMetas = await gitUtils.getCommitsFromRef(
        previousTag.toString()
      );
      const commits = commitMetas.map((commitMeta) => {
        return {
          meta: commitMeta,
          content: parseCommit(commitMeta.content),
        };
      });

      const versionBumps = commits.map(
        (cmt) => cmt.content.proposedVersionBump
      );
      const maxVersionBump = getVersionBump(versionBumps);
      const newVersion = previousTag.bump(maxVersionBump);

      return {
        context: { ...data, ...repoMeta },
        version: newVersion,
        commits,
      };
    })
  );
}

async function generateChangelog(config: IConfig) {
  let changelog = '';
  // try {
  //   changelog = await afs.readFile('../', 'utf8');
  // } catch (error) {
  //   return logger.fatal(error);
  // }

  const pkgJsons = await findPkgJson();
  const tags = await getLatestTagsForPackages(pkgJsons);
  const releases = await getReleaseData(tags);

  return Promise.all(
    releases.map((release) => config.genChangelog(changelog, release))
  );
}

async function linkFiles() {
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

  const rootDirPath = path.resolve(gitDir, '..');
  return findPkgJson();
}

getConfig('')
  .then((config) => generateChangelog(config))
  .then((changelog) => {
    console.log(changelog[0]);
  })
  .catch((err) => {
    console.error(err);
  });

async function main() {
  // 1. Verify git, npm login presence
  const gitStatus = await gitUtils.getBranchStatus();
  if (gitStatus === GitBranchStatus.Behind) {
    logger.fatal('your branch is behind origin');
  } else if (gitStatus === GitBranchStatus.Diverged) {
    logger.fatal('your branch has diverged from origin');
  }
  const npmAuth = await npmUtils.ensureAuth();
  if (!npmAuth) {
    logger.fatal(`npm authentication not set up`);
  }
  // 2. Parse git tags and obtain their latest versions
  // 3. Check for each tag whether there are changes
  // 4. Get version upgrade, find out if it is needed at all
  // 5. Generate the changelogs for all the version upgrades
  // 6. Create the git tag
  // 7. Publish the libraries
  // 8. Notify eternal parties (Github Releases etc)
}
