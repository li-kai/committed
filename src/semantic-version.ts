import os from 'os';
import patterns from './patterns';
import { ICommitContent, ISemanticVersionTag, VersionBump } from './types';

function parseCommit(commitStr: string): ICommitContent {
  const lines = commitStr.replace(os.EOL, '\n').split('\n');

  const header = lines[0];
  const match = patterns.HEADER.exec(header);

  if (!match || !match.groups) {
    throw new Error('No header');
  }

  let { type, scope, description } = match.groups;
  let body;
  let footer;
  let proposedVersionBump: VersionBump = 'patch';

  if (type === 'feat') {
    proposedVersionBump = 'minor';
  }

  function parseContent(content: string) {
    const contentMatch = patterns.BODY.exec(content);

    if (!contentMatch || !contentMatch.groups) {
      throw new Error('No content');
    }

    if (contentMatch.groups.breakingChange) {
      proposedVersionBump = 'major';
    }
    return contentMatch.groups.content;
  }

  if (lines.length >= 3) {
    body = parseContent(lines[2]);
  }

  if (lines.length >= 5) {
    footer = parseContent(lines[4]);
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
function getVersionBump(versionBumps: VersionBump[]): VersionBump {
  let maxVersionBump: VersionBump = 'patch';
  for (const versionBump of versionBumps) {
    if (versionBump === 'major') {
      return 'major';
    }
    if (versionBump === 'minor') {
      maxVersionBump = 'minor';
    }
  }
  return maxVersionBump;
}

/**
 * Returns the version that results from this bump type
 */
function increaseVersionBump(
  previousTag: ISemanticVersionTag,
  versionBumpType: VersionBump
) {
  const newVersion = { ...previousTag };
  if (versionBumpType === 'major') {
    newVersion.major += 1;
  } else if (versionBumpType === 'minor') {
    newVersion.minor += 1;
  } else if (versionBumpType === 'patch') {
    newVersion.patch += 1;
  }

  const { major, minor, patch, prerelease } = newVersion;
  const prereleaseStr = prerelease ? `-${prerelease}` : '';
  newVersion.versionStr = `${major}.${minor}.${patch}${prereleaseStr}`;

  return newVersion;
}

export default {
  parseCommit,
  getVersionBump,
  increaseVersionBump,
};
