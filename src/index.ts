#!/usr/bin/env node
import path from 'path';
import getConfig from './config/config';
import conventionalCommit from './conventionalCommit';
import semanticVersionTag, {
  INITIAL_SEMANTIC_VERSION_TAG,
} from './semanticVersionTag';
import { IConfig, IPackageMeta, ISemanticRelease } from './types';
import afs from './utils/afs';
import gitUtils, { GitBranchStatus } from './utils/gitUtils';
import logger from './utils/logger';
import npmUtils from './utils/npmUtils';

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
