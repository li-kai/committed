import genChangelog, {
  getCommitsByType,
  formatWithPrettier,
} from './genChangelog';
import fixtures from '../__fixtures__/fixtures';
import prettier from 'prettier';
import { VersionBump } from '../types';

const releaseCommits = [fixtures.releaseCommitA, fixtures.releaseCommitB];

describe('genChangelog', () => {
  it("generates a commit's markdown", () => {
    const currentChangelog = '';

    const release = {
      context: { ...fixtures.defaultPackageMeta, ...fixtures.defaultRepoMeta },
      version: fixtures.defaultTag,
      commits: releaseCommits,
    };
    expect(genChangelog(currentChangelog, release)).resolves
      .toMatchInlineSnapshot(`
"# Changelog

## 0.1.0 - Jan 23, 2019

### Breaking Changes

test (asdfasd)

### Bug Fixes

test (asdfasd)
"
`);
  });
});

describe('getCommitsByType', () => {
  it('keys commits by their types', () => {
    const result = getCommitsByType(releaseCommits);
    expect(result).toEqual({
      feat: [fixtures.releaseCommitA],
      fix: [fixtures.releaseCommitB],
    });
  });

  it('overrides breakingChanges if there exists major bumps', () => {
    const commits = [
      fixtures.releaseCommitA,
      {
        meta: fixtures.commitMetaB,
        content: {
          ...fixtures.commitContentB,
          proposedVersionBump: 'major' as VersionBump,
        },
      },
    ];

    const result = getCommitsByType(commits, {
      breakingChangesFirst: true,
    });
    expect(result).toEqual({
      breakingChanges: commits,
    });
  });
});

describe('formatWithPrettier', () => {
  it("generates a commit's markdown with prettier", () => {
    const testStr = `Test`;
    prettier.format = jest.fn().mockImplementationOnce(() => testStr);

    expect(formatWithPrettier('')).resolves.toBe(testStr);
  });

  it('generates returns markdown if prettier is missing', () => {
    prettier.format = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    const testString = '3. one \n1. two';
    expect(formatWithPrettier(testString)).resolves.toBe(testString);
  });
});
