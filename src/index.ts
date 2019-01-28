#!/usr/bin/env node
import path from 'path';
import getConfig from './config/config';
import conventionalCommit from './conventionalCommit';
import gitUtils, { GitBranchStatus } from './git/gitUtils';
import npmUtils from './npm/npmUtils';
import semanticVersionTag, {
  INITIAL_SEMANTIC_VERSION_TAG,
} from './semanticVersionTag';
import { IConfig, IPackageMeta, ISemanticRelease } from './types';
import afs from './utils/afs';
import logger from './utils/logger';

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
    const tag = semanticVersionTag.parse(tagString);
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
): Promise<ISemanticRelease[]> {
  const remoteUrl = await gitUtils.getRemoteUrl();
  const repoMeta = gitUtils.getGitHubUrlFromGitUrl(remoteUrl);
  if (repoMeta == null) {
    return logger.fatal('No upstream url obtained');
  }

  return Promise.all(
    packageMetas.map(async (data) => {
      const previousTag = data.previousTag!;
      const commits = await gitUtils.getCommitsFromRef(previousTag.toString());
      const conventionalCommits = commits.map((commit) =>
        conventionalCommit.parse(commit)
      );

      const versionBumps = conventionalCommits.map(
        (cmt) => cmt.versionBumpType
      );
      const maxVersionBump = semanticVersionTag.getVersionBump(versionBumps);
      const newVersion = semanticVersionTag.bump(previousTag, maxVersionBump);

      return {
        context: { ...data, ...repoMeta },
        version: newVersion,
        commits: conventionalCommits,
      };
    })
  );
}

async function generateChangelog(config: IConfig) {
  const changelog = '';
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
