import { ISemanticVersionTag, VersionBump } from './types';

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

function parse(str: string): ISemanticVersionTag {
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
  return {
    name: versionGroups.name,
    major: parseInt(semanticGroups.major, 10),
    minor: parseInt(semanticGroups.minor, 10),
    patch: parseInt(semanticGroups.patch, 10),
    preReleaseName: semanticGroups.preReleaseName,
    preReleaseVersion:
      parseInt(semanticGroups.preReleaseVersion, 10) || undefined,
  };
}

const INITIAL_SEMANTIC_VERSION_TAG = parse('0.1.0');

function getVersionString(tag: ISemanticVersionTag) {
  const optStr = (str: string | number | undefined, prefix: string) =>
    str ? `${prefix}${str}` : '';

  const preReleaseName = optStr(tag.preReleaseName, '-');
  const preReleaseVersion = optStr(tag.preReleaseVersion, '.');
  const { major, minor, patch } = tag;
  return `${major}.${minor}.${patch}${preReleaseName}${preReleaseVersion}`;
}

/**
 * Returns the full string representation of the tag, including name
 */
function toString(tag: ISemanticVersionTag) {
  const name = tag.name ? `${tag.name}@` : '';
  return `${name}${getVersionString(tag)}`;
}

/**
 * Increases a new tag with the appropriate version bump
 */
function bump(tag: ISemanticVersionTag, type: VersionBump) {
  const { name, preReleaseName } = tag;
  let { major, minor, patch, preReleaseVersion } = tag;
  if (tag.preReleaseName != null) {
    preReleaseVersion = (preReleaseVersion || 0) + 1;
  } else if (type === 'major') {
    major++;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor++;
    patch = 0;
  } else if (type === 'patch') {
    patch++;
  }
  return {
    name,
    major,
    minor,
    patch,
    preReleaseName,
    preReleaseVersion,
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

export default {
  parse,
  getVersionString,
  toString,
  bump,
  getVersionBump,
};
export { INITIAL_SEMANTIC_VERSION_TAG };
