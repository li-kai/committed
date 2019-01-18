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
    expect.assertions(1);
    const commits = await git.getCommitsFromRef();
    expect(commits.slice(-3)).toMatchInlineSnapshot(`
Array [
  Object {
    "author": "Li Kai",
    "content": "chore: add style config",
    "hash": "03216e2b64939c8182b4d83644257d4c3d2acaa4",
    "ts": "1547280107",
  },
  Object {
    "author": "Li Kai",
    "content": "chore: add MIT license",
    "hash": "75957492161e55efff8b7bcad8685f6a689cff4d",
    "ts": "1547269242",
  },
  Object {
    "author": "Li Kai",
    "content": "chore: add essential config files",
    "hash": "277f77bf87c950cfae6f2eaf917ee191aef61742",
    "ts": "1547269128",
  },
]
`);
  });

  it('should return all tags', async () => {
    expect.assertions(1);
    const tags = await git.getAllTags();
    expect(tags.slice(-3)).toMatchInlineSnapshot(`
Array [
  Object {
    "major": "0",
    "minor": "0",
    "name": undefined,
    "patch": "0",
    "prerelease": undefined,
  },
]
`);
  });
});
