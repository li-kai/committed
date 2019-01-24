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
    await expect(gitUtils.getFilesFromHead()).resolves.toEqual(
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

  it('should return all commits', async () => {
    expect.assertions(1);
    const commits = await gitUtils.getCommitsFromRef();
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
    const tags = await gitUtils.getAllTags();
    expect(tags.slice(-3)).toMatchInlineSnapshot(`
Array [
  Object {
    "major": 0,
    "minor": 0,
    "name": undefined,
    "patch": 0,
    "prerelease": undefined,
    "versionStr": "0.0.0",
  },
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
