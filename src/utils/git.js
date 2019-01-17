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

function getFilesFromCurrentTree() {
  return gitCmd(['ls-tree', '-r', 'HEAD', '--name-only']).then((str) =>
    str.split(os.EOL)
  );
}

module.exports = {
  getGitRootPath,
  getGitHooksPath,
  getFilesFromCurrentTree,
};
