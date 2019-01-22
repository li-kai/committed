import childProcess from 'child_process';
import os from 'os';
import path from 'path';
import { ICommitMeta, ISemanticVersionTag, IRepoMeta } from '../types';

/**
 * E2E tests for git, because we want to execute against
 * the real git repo in order to test.
 */
function gitCmd(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    childProcess.execFile('git', args, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout.trimRight());
      }
    });
  });
}

function getDotGitPath() {
  return gitCmd(['rev-parse', '--git-dir']);
}

async function getGitHooksPath() {
  const dotGitPath = await getDotGitPath();
  return path.join(process.cwd(), dotGitPath, 'hooks');
}

function getGitRootPath() {
  return gitCmd(['rev-parse', '--show-toplevel']);
}

async function getFilesFromHead() {
  const str = await gitCmd(['ls-tree', '-r', 'HEAD', '--name-only']);
  return str.split(os.EOL);
}

const COMMIT_REGEX = /commit (?<hash>\w+)\n(?<author>.+)\n(?<ts>\d+)\n(?<content>[\S\s]+)\n/;
async function getCommitsFromRef(fromHash?: string): Promise<ICommitMeta[]> {
  const str = await gitCmd([
    'rev-list',
    '--first-parent',
    `--format=%an%n%at%n%B%x00`,
    fromHash ? `${fromHash}..HEAD` : 'HEAD',
  ]);
  const commits: ICommitMeta[] = [];

  str
    .replace(os.EOL, '\n')
    .split('\x00\n')
    .forEach((commit) => {
      const result = COMMIT_REGEX.exec(commit);
      if (!result) {
        return;
      }
      const groups = result.groups;
      if (!groups) {
        return;
      }

      commits.push({
        hash: groups.hash,
        author: groups.author,
        ts: groups.ts,
        content: groups.content,
      });
    });

  return commits;
}

// Follows yarn/npm specific version syntax e.g. pkg@1.12.0
const NAME_REGEX = /(?:(?<name>.+)@)?/;
const VERSION_REGEX = new RegExp(`${NAME_REGEX.source}(?<version>.+)`);
// https://semver.org/
const MAJOR_REGEX = /(?<major>\d+)/;
const MINOR_REGEX = /(?<minor>\d+)/;
const PATCH_REGEX = /(?<patch>\d+)/;
const PRERELEASE_REGEX = /(?:-(?<prerelease>[\w.]+))?/;
const SEMANTIC_VERSIONING_REGEX = new RegExp(
  `${MAJOR_REGEX.source}.${MINOR_REGEX.source}.${PATCH_REGEX.source}${
    PRERELEASE_REGEX.source
  }`
);

function getSemanticVersionFromString(str: string): ISemanticVersionTag | null {
  const versionMatch = VERSION_REGEX.exec(str);
  if (!versionMatch || !versionMatch.groups) {
    return null;
  }
  const versionGroups = versionMatch.groups;
  const semanticMatch = SEMANTIC_VERSIONING_REGEX.exec(versionGroups.version);
  if (!semanticMatch || !semanticMatch.groups) {
    return null;
  }
  const semanticGroups = semanticMatch.groups;

  const semanticVersion: ISemanticVersionTag = {
    name: versionGroups.name,
    versionStr: versionGroups.version,
    major: parseInt(semanticGroups.major, 10),
    minor: parseInt(semanticGroups.minor, 10),
    patch: parseInt(semanticGroups.patch, 10),
    prerelease: semanticGroups.prerelease,
  };
  return semanticVersion;
}

async function getAllTags(): Promise<ISemanticVersionTag[]> {
  // https://stackoverflow.com/a/52680984/4819795
  const str = await gitCmd([
    '-c',
    'versionsort.suffix=-',
    'for-each-ref',
    '--sort=-v:refname',
    '--format=%(refname:lstrip=2)',
    'refs/tags',
  ]);
  const lines: ISemanticVersionTag[] = [];

  str.split(os.EOL).forEach((line) => {
    const versionResult = getSemanticVersionFromString(line);
    if (!versionResult) {
      return;
    }
    lines.push(versionResult);
  });

  return lines;
}

export const enum GitBranchStatus {
  Diverged,
  Exact,
  Ahead,
  Behind,
}
async function getBranchStatus(): Promise<GitBranchStatus> {
  const LOCAL = await gitCmd(['rev-parse', '@']);
  const REMOTE = await gitCmd(['rev-parse', '@{u}']);
  const BASE = await gitCmd(['merge-base', '@', '@{u}']);

  if (LOCAL === REMOTE) {
    return GitBranchStatus.Exact;
  } else if (LOCAL === BASE) {
    return GitBranchStatus.Behind;
  } else if (REMOTE === BASE) {
    return GitBranchStatus.Ahead;
  } else {
    return GitBranchStatus.Diverged;
  }
}

async function getBranchName() {
  return gitCmd(['rev-parse', '--abbrev-ref', 'HEAD']);
}

async function fetchRemote() {
  return gitCmd(['remote', 'update']);
}

async function getRemoteUrl() {
  return gitCmd(['config', 'remote.origin.url']);
}

// Adapted from https://github.com/tj/node-github-url-from-git
function getGitHubUrlFromGitUrl(url: string): IRepoMeta | null {
  const re = /github.com:?\/?(?<owner>[\w-]+)\/(?<repository>[\w-]+)(?:.git)?(?:#[\w-.]+)?$/;
  const match = re.exec(url);
  if (match && match.groups) {
    return {
      host: 'https://github.com',
      owner: match.groups.owner,
      repository: match.groups.repository,
    };
  }
  return null;
}

export default {
  getGitRootPath,
  getGitHooksPath,
  getFilesFromHead,
  getCommitsFromRef,
  getAllTags,
  getBranchName,
  getBranchStatus,
  fetchRemote,
  getRemoteUrl,
  getGitHubUrlFromGitUrl,
};
