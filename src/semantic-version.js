const os = require('os');
const patterns = require('./patterns');

function parseCommit(commitStr) {
  const lines = commitStr.replace(os.EOL, '\n').split('\n');

  let type;
  let scope;
  let description;
  let body;
  let footer;
  let proposedVersionBump = 'patch';

  if (lines.length >= 1) {
    const header = lines[0];
    const match = patterns.HEADER.exec(header);

    type = match.groups.type;
    scope = match.groups.scope;
    description = match.groups.description;

    if (type === 'feat') {
      proposedVersionBump = 'minor';
    }
  }

  if (lines.length >= 3) {
    const content = lines[2];
    const match = patterns.BODY.exec(content);
    body = match.groups.content;
    if (match.groups.breakingChange) {
      proposedVersionBump = 'major';
    }
  }

  if (lines.length >= 5) {
    const content = lines[4];
    const match = patterns.BODY.exec(content);
    footer = match.groups.content;
    if (match.groups.breakingChange) {
      proposedVersionBump = 'major';
    }
  }

  return {
    type,
    scope,
    description,
    body,
    footer,
    proposedVersionBump,
  };
}

/**
 * Returns the largest version type recommended in that range
 */
function getVersionBumpType(commits) {
  let maxVersionBump = 'patch';
  for (let i = 0; i < commits.length; i += 1) {
    const commit = commits[i];
    if (commit.proposedVersionBump === 'major') {
      return 'major';
    }
    if (commit.proposedVersionBump === 'minor') {
      maxVersionBump = 'minor';
    }
  }
  return maxVersionBump;
}

/**
 * Returns the version that results from this bump type
 */
function increaseVersionBump(previousVersion, versionBumpType) {
  const newVersion = { ...previousVersion };
  if (versionBumpType === 'major') {
    newVersion.major += 1;
  } else if (versionBumpType === 'minor') {
    newVersion.minor += 1;
  } else if (versionBumpType === 'patch') {
    newVersion.patch += 1;
  }
  return newVersion;
}

module.exports = {
  parseCommit,
  getVersionBumpType,
  increaseVersionBump,
};
