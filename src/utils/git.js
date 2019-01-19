const childProcess = require('child_process');
const os = require('os');
const path = require('path');

/**
 * E2E tests for git, because we want to execute against
 * the real git repo in order to test.
 */
function gitCmd(args) {
  return new Promise((resovle, reject) => {
    childProcess.execFile('git', args, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resovle(stdout.trimRight());
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
async function getCommitsFromRef(fromHash) {
  const str = await gitCmd([
    'rev-list',
    '--first-parent',
    `--format=%an%n%at%n%B%x00`,
    fromHash ? `${fromHash}..HEAD` : 'HEAD',
  ]);
  const commits = [];

  str
    .replace(os.EOL, '\n')
    .split('\x00\n')
    .forEach((commit) => {
      const result = COMMIT_REGEX.exec(commit);
      if (!result) return;

      commits.push(result.groups);
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
async function getAllTags() {
  // https://stackoverflow.com/a/52680984/4819795
  const str = await gitCmd([
    '-c',
    'versionsort.suffix=-',
    'for-each-ref',
    '--sort=-v:refname',
    '--format=%(refname:lstrip=2)',
    'refs/tags',
  ]);
  const lines = [];

  str.split(os.EOL).forEach((line) => {
    const versionResult = VERSION_REGEX.exec(line);
    if (!versionResult) return;
    const result = SEMANTIC_VERSIONING_REGEX.exec(versionResult.groups.version);
    if (!result) return;

    lines.push({ ...versionResult.groups, ...result.groups });
  });

  return lines;
}

module.exports = {
  getGitRootPath,
  getGitHooksPath,
  getFilesFromHead,
  getCommitsFromRef,
  getAllTags,
};
