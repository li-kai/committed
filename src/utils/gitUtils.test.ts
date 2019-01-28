/**
 * E2E tests for git, because we want to execute against
 * the real git repo in order to test.
 */

import path from 'path';
import gitUtils, { GitBranchStatus } from './gitUtils';

describe('gitUtils', () => {
  it('should return git root path', async () => {
    const repoRoot = path.resolve(__dirname, '..', '..');
    await expect(gitUtils.getGitRootPath()).resolves.toEqual(repoRoot);
  });

  it('should return git hooks path', async () => {
    const repoRoot = path.resolve(__dirname, '..', '..', '.git', 'hooks');
    await expect(gitUtils.getGitHooksPath()).resolves.toEqual(repoRoot);
  });

  it('should return git current head files', async () => {
    await expect(gitUtils.getFiles()).resolves.toEqual(
      expect.arrayContaining([
        '.editorconfig',
        '.gitignore',
        'LICENSE',
        'README.md',
        'package.json',
        'src/index.ts',
        'yarn.lock',
      ])
    );
  });

  describe('gitUtils.getFiles', () => {
    it('should return files from HEAD', async () => {
      await expect(gitUtils.getFiles()).resolves.toEqual(
        expect.arrayContaining([
          '.editorconfig',
          '.gitignore',
          'LICENSE',
          'README.md',
          'package.json',
          'src/index.ts',
          'yarn.lock',
        ])
      );
    });

    it('should return files from folder when given path', async () => {
      await expect(gitUtils.getFiles('src')).resolves.toEqual(
        expect.arrayContaining(['src/index.ts', 'src/utils/afs.ts'])
      );
    });
  });

  it('should return all commits', async () => {
    expect.assertions(1);
    const commits = await gitUtils.getCommitsFromRef();
    expect(commits.slice(-3)).toMatchInlineSnapshot(`
Array [
  Object {
    "meta": Object {
      "author": "Li Kai",
      "hash": "03216e2b64939c8182b4d83644257d4c3d2acaa4",
      "ts": "1547280107",
    },
    "rawString": "chore: add style config",
  },
  Object {
    "meta": Object {
      "author": "Li Kai",
      "hash": "75957492161e55efff8b7bcad8685f6a689cff4d",
      "ts": "1547269242",
    },
    "rawString": "chore: add MIT license",
  },
  Object {
    "meta": Object {
      "author": "Li Kai",
      "hash": "277f77bf87c950cfae6f2eaf917ee191aef61742",
      "ts": "1547269128",
    },
    "rawString": "chore: add essential config files",
  },
]
`);
  });

  it('should return all tags', async () => {
    expect.assertions(1);
    const tags = await gitUtils.getAllTags();
    expect(tags.slice(-3)).toMatchInlineSnapshot(`
Array [
  "0.0.0",
]
`);
  });

  it('should tell current branch status', async () => {
    expect.assertions(1);
    const status = await gitUtils.getBranchStatus();
    expect(
      status === GitBranchStatus.Ahead || status === GitBranchStatus.Exact
    ).toBeTruthy();
  });

  it.each`
    url                                                     | owner              | repository
    ${'git://github.com/jamesor/mongoose-v'}                | ${'jamesor'}       | ${'mongoose-v'}
    ${'git://github.com/trey-griffith/cellar.git'}          | ${'trey-griffith'} | ${'cellar'}
    ${'https://github.com/Empeeric/i18n_node'}              | ${'Empeeric'}      | ${'i18n_node'}
    ${'https://jpillora@github.com/banchee/tranquil.git'}   | ${'banchee'}       | ${'tranquil'}
    ${'git@github.com:bcoe/thumbd.git'}                     | ${'bcoe'}          | ${'thumbd'}
    ${'git@github.com:/bcoe/thumbd.git'}                    | ${'bcoe'}          | ${'thumbd'}
    ${'git@github.com:bcoe/thumbd.git#2.7.0-rc'}            | ${'bcoe'}          | ${'thumbd'}
    ${'git+https://github.com/bcoe/thumbd.git'}             | ${'bcoe'}          | ${'thumbd'}
    ${'git+ssh://github.com/bcoe/thumbd.git'}               | ${'bcoe'}          | ${'thumbd'}
    ${'https://EastCloud@github.com/EastCloud/node-ws.git'} | ${'EastCloud'}     | ${'node-ws'}
  `('returns %1/$repository given $url', ({ url, owner, repository }) => {
    expect(gitUtils.getGitHubUrlFromGitUrl(url)).toEqual({
      host: 'https://github.com',
      owner,
      repository,
    });
  });

  it.each(['git://github.com/justgord/.git', 'https://gitlab.com/test/utils'])(
    'returns null for malformed url %s',
    (url) => {
      expect(gitUtils.getGitHubUrlFromGitUrl(url)).toBeNull();
    }
  );
});
