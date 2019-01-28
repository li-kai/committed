import path from 'path';
import conventionalCommit from '../conventionalCommit';
import semanticVersionTag, {
  INITIAL_SEMANTIC_VERSION_TAG,
} from '../semanticVersionTag';
import {
  IPackageMeta,
  ISemanticRelease,
  ISemanticVersionPackageMeta,
  ISemanticVersionTag,
} from '../types';
import afs from './afs';
import gitUtils from './gitUtils';
import logger from './logger';

async function getPkgMetas(dirPath?: string): Promise<IPackageMeta[]> {
  const PACKAGE_JSON_REGEX = /package\.json$/;
  const filePaths = await gitUtils.getFiles(dirPath);

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
      });
    })
  );

  if (packageMetas.length === 0) {
    return logger.fatal('no package.json file found');
  }

  return packageMetas;
}

async function getSemanticVersionPkgMetas(
  dirPath?: string
): Promise<ISemanticVersionPackageMeta[]> {
  const packageMetas = await getPkgMetas(dirPath);
  interface TempPackageMeta extends IPackageMeta {
    tag?: ISemanticVersionTag;
  }
  const nameToData: { [key: string]: TempPackageMeta } = {};
  packageMetas.forEach((repoMeta) => {
    nameToData[repoMeta.name] = repoMeta;
  });

  const rawTags = await gitUtils.getAllTags();
  const existingTags = rawTags.map((tagString) =>
    semanticVersionTag.parse(tagString)
  );

  const isMonoRepo = packageMetas.length > 1;
  if (isMonoRepo) {
    // Obtain the latest of the different packages' tag
    existingTags.forEach((tag) => {
      const tagName = tag.name;
      if (tagName === undefined) {
        return logger.fatal('No tag name given');
      }

      const data = nameToData[tagName];
      if (!data.tag) {
        nameToData[tagName].tag = tag;
      }
    });
  } else if (existingTags.length > 0) {
    // Simply take the first tag, as it is sorted already
    const repoMeta = packageMetas[0];
    const tag = existingTags[0];
    nameToData[repoMeta.name].tag = tag;
  }

  // If no tag found, assume initial tag v0.1.0
  return Object.values(nameToData).map((meta) => ({
    ...meta,
    tag: meta.tag || INITIAL_SEMANTIC_VERSION_TAG,
  }));
}

async function getSemanticReleaseData(
  packageMetas: ISemanticVersionPackageMeta[]
): Promise<ISemanticRelease[]> {
  const remoteUrl = await gitUtils.getRemoteUrl();
  const repoMeta = gitUtils.getGitHubUrlFromGitUrl(remoteUrl);
  if (repoMeta == null) {
    return logger.fatal('No upstream url obtained');
  }

  return Promise.all(
    packageMetas.map(async (meta) => {
      const versionStr = semanticVersionTag.toString(meta.tag);
      const commits = await gitUtils.getCommitsFromRef(versionStr);
      const conventionalCommits = commits.map(conventionalCommit.parse);

      const versionBumps = conventionalCommits.map(
        (cmt) => cmt.versionBumpType
      );
      const maxVersionBump = semanticVersionTag.getVersionBump(versionBumps);
      const newVersion = semanticVersionTag.bump(meta.tag, maxVersionBump);

      return {
        context: { ...meta, ...repoMeta },
        version: newVersion,
        commits: conventionalCommits,
      };
    })
  );
}

export default {
  getPkgMetas,
  getSemanticVersionPkgMetas,
  getSemanticReleaseData,
};
