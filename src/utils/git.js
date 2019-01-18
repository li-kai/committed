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

const TAG_REGEX = /(?<hash>\w+) refs\/tags\/(?<tag>[\S]+)\^{}/;
async function getAllTags() {
  const str = await gitCmd(['show-ref', '-d', '--tags']);
  const lines = [];

  str.split(os.EOL).forEach((line) => {
    const result = TAG_REGEX.exec(line);
    if (!result) return;

    lines.push(result.groups);
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
