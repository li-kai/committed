import os from 'os';
import patterns from './patterns';

type VersionBump = 'major' | 'minor' | 'patch';

interface IProposedVersionBump {
  proposedVersionBump: VersionBump;
}
interface ICommit extends IProposedVersionBump {
  type: string | undefined;
  scope: string | undefined;
  description: string | undefined;
  body: string | undefined;
  footer: string | undefined;
}

function parseCommit(commitStr: string): ICommit {
  const lines = commitStr.replace(os.EOL, '\n').split('\n');

  let type;
  let scope;
  let description;
  let body;
  let footer;
  let proposedVersionBump: VersionBump = 'patch';

  if (lines.length >= 1) {
    const header = lines[0];
    const match = patterns.HEADER.exec(header);

    if (!match || !match.groups) throw new Error('No header');

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

    if (!match || !match.groups) throw new Error('No content');

    body = match.groups.content;
    if (match.groups.breakingChange) {
      proposedVersionBump = 'major';
    }
  }

  if (lines.length >= 5) {
    const content = lines[4];
    const match = patterns.BODY.exec(content);

    if (!match || !match.groups) throw new Error('No content');

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
function getVersionBumpType(commits: IProposedVersionBump[]): VersionBump {
  let maxVersionBump: VersionBump = 'patch';
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

interface IVersion {
  major: number;
  minor: number;
  patch: number;
}
/**
 * Returns the version that results from this bump type
 */
function increaseVersionBump(previousVersion: IVersion, versionBumpType: VersionBump) {
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

export default {
  parseCommit,
  getVersionBumpType,
  increaseVersionBump,
};
