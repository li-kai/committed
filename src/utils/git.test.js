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

  it('should return all commits', async () => {
    await expect(git.getCommitsFromRef()).resolves.toContainEqual(
      expect.objectContaining({
        author: 'Li Kai',
        hash: '277f77bf87c950cfae6f2eaf917ee191aef61742',
        ts: '1547269128',
        content: 'chore: add essential config files',
      })
    );
  });

  it('should return all tags', async () => {
    await expect(git.getAllTags()).resolves.toContainEqual({
      hash: 'a6fd67344a3090d667fc171688dcd01f334c8f5f',
      tag: 'v0.0.0',
    });
  });
});
