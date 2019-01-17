/**
 * E2E tests for git, because we want to execute against
 * the real git repo in order to test.
 */

const path = require('path');
const git = require('./git');

describe('git', () => {
  it('should return git root path', async () => {
    const repoRoot = path.resolve(__dirname, '..', '..');
    await expect(git.getGitRootPath()).resolves.toEqual(repoRoot);
  });

  it('should return git hooks path', async () => {
    const repoRoot = path.resolve(__dirname, '..', '..', '.git', 'hooks');
    await expect(git.getGitHooksPath()).resolves.toEqual(repoRoot);
  });

  it('should return git current head files', async () => {
    await expect(git.getFilesFromHead()).resolves.toEqual(
      expect.arrayContaining([
        '.editorconfig',
        '.gitignore',
        'LICENSE',
        'README.md',
        'package.json',
        'src/index.js',
        'yarn.lock',
      ])
    );
  });
});
