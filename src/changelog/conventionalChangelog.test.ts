import { advanceTo } from 'jest-date-mock';
import fixtures from '../__fixtures__/fixtures';
import conventionalChangelog from './conventionalChangelog';

const releaseCommits = [
  fixtures.releaseCommitA,
  fixtures.releaseCommitB,
  fixtures.releaseCommitC,
];

describe('genChangelog', () => {
  beforeAll(() => {
    advanceTo(); // To start of epoch
  });

  it("generates a commit's markdown", () => {
    const currentChangelog = '';

    const release = {
      context: { ...fixtures.defaultPackageMeta, ...fixtures.defaultRepoMeta },
      version: fixtures.defaultTag,
      commits: releaseCommits,
    };
    expect(conventionalChangelog.generate(currentChangelog, release)).resolves
      .toMatchInlineSnapshot(`
"# Changelog

## 0.1.0 - Jan 1, 1970

### Breaking Changes

commit c (asdfasd)

### Feature

commit a (asdfasd)

### Bug Fixes

commit b (asdfasd)
"
`);
  });
});
