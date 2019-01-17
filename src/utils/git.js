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

function getGitHooksPath() {
  return getDotGitPath().then((dotGitPath) =>
    path.join(process.cwd(), dotGitPath, 'hooks')
  );
}

function getGitRootPath() {
  return gitCmd(['rev-parse', '--show-toplevel']);
}

function getFilesFromHead() {
  return gitCmd(['ls-tree', '-r', 'HEAD', '--name-only']).then((str) =>
    str.split(os.EOL)
  );
}

function getCommitsFromHead() {
  return gitCmd(['ls-tree', '-r', 'HEAD', '--name-only']).then((str) =>
    str.split(os.EOL)
  );
}

const TAG_REGEX = /(?<hash>\w+) refs\/tags\/(?<tag>[\S]+)\^{}/;
function getAllTags() {
  return gitCmd(['show-ref', '-d', '--tags']).then((str) => {
    const lines = [];

    str.split(os.EOL).forEach((line) => {
      const result = TAG_REGEX.exec(line);
      if (!result) return;

      lines.push(result.groups);
    });

    return lines;
  });
}

module.exports = {
  getGitRootPath,
  getGitHooksPath,
  getFilesFromHead,
  getCommitsFromHead,
  getAllTags,
};
