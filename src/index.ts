#!/usr/bin/env node
import gitUtils, { GitBranchStatus } from './utils/gitUtils';
import logger from './utils/logger';
import npmUtils from './utils/npmUtils';

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
