import os from 'os';
import patterns from './patterns';
import { IConventionalCommit, ISemanticVersionTag, VersionBump } from './types';

// Follows yarn/npm specific version syntax e.g. pkg@1.12.0
const NAME_REGEX = /(?:(?<name>.+)@)?/;
const VERSION_REGEX = new RegExp(`^${NAME_REGEX.source}(?<version>.+)$`);
// https://semver.org/
const MAJOR_REGEX = /(?<major>\d+)/;
const MINOR_REGEX = /(?<minor>\d+)/;
const PATCH_REGEX = /(?<patch>\d+)/;
const PRERELEASE_NAME_REGEX = /(?<preReleaseName>\w+)/;
const PRERELEASE_VERSION_REGEX = /(?:\.(?<preReleaseVersion>\d+))?/;
const PRERELEASE_REGEX = new RegExp(
  `(?:-${PRERELEASE_NAME_REGEX.source}${PRERELEASE_VERSION_REGEX.source})?`
);
const SEMANTIC_VERSIONING_REGEX = new RegExp(
  `^${MAJOR_REGEX.source}.${MINOR_REGEX.source}.${PATCH_REGEX.source}${
    PRERELEASE_REGEX.source
  }$`
);

class SemanticVersionTag implements ISemanticVersionTag {
  protected constructor(
    readonly name: string | undefined,
    readonly major: number,
    readonly minor: number,
    readonly patch: number,
    readonly preReleaseName: string | undefined,
    readonly preReleaseVersion: number | undefined
  ) {}

  static parse(str: string): SemanticVersionTag {
    const versionMatch = VERSION_REGEX.exec(str);
    if (!versionMatch || !versionMatch.groups) {
      throw Error('tag format invalid');
    }
    const versionGroups = versionMatch.groups;
    const semanticMatch = SEMANTIC_VERSIONING_REGEX.exec(versionGroups.version);
    if (!semanticMatch || !semanticMatch.groups) {
      throw Error('semantic versioning numbers invalid');
    }
    const semanticGroups = semanticMatch.groups;
    return new SemanticVersionTag(
      versionGroups.name,
      parseInt(semanticGroups.major, 10),
      parseInt(semanticGroups.minor, 10),
      parseInt(semanticGroups.patch, 10),
      semanticGroups.preReleaseName,
      parseInt(semanticGroups.preReleaseVersion, 10) || undefined
    );
  }

  isPreRelease() {
    return this.preReleaseName != null;
  }

  getVersionString() {
    const optStr = (str: string | number | undefined, prefix: string) =>
      str ? `${prefix}${str}` : '';

    const preReleaseName = optStr(this.preReleaseName, '-');
    const preReleaseVersion = optStr(this.preReleaseVersion, '.');
    const { major, minor, patch } = this;
    return `${major}.${minor}.${patch}${preReleaseName}${preReleaseVersion}`;
  }

  /**
   * Returns the full string representation of the tag, including name
   */
  toString() {
    const name = this.name ? `${this.name}@` : '';
    return `${name}${this.getVersionString()}`;
  }

  /**
   * Increases a new tag with the appropriate version bump
   */
  bump(type: VersionBump) {
    let { name, major, minor, patch, preReleaseName, preReleaseVersion } = this;
    if (this.isPreRelease()) {
      preReleaseVersion = (preReleaseVersion || 0) + 1;
    } else if (type === 'major') {
      major++;
    } else if (type === 'minor') {
      minor++;
    } else if (type === 'patch') {
      patch++;
    }
    return new SemanticVersionTag(
      name,
      major,
      minor,
      patch,
      preReleaseName,
      preReleaseVersion
    );
  }
}

const INITIAL_SEMANTIC_VERSION_TAG = SemanticVersionTag.parse('0.1.0')!;

function parseCommit(commitStr: string): IConventionalCommit {
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

export default SemanticVersionTag;
export { parseCommit, getVersionBump, INITIAL_SEMANTIC_VERSION_TAG };
