import { advanceTo } from 'jest-date-mock';
import prettier from 'prettier';
import fixtures from '../__fixtures__/fixtures';
import genChangelog, {
  formatWithPrettier,
  getCommitsByType,
} from './genChangelog';

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
    expect(genChangelog(currentChangelog, release)).resolves
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

describe('getCommitsByType', () => {
  it('keys commits by their types', () => {
    const result = getCommitsByType([
      fixtures.releaseCommitA,
      fixtures.releaseCommitB,
    ]);
    expect(result).toEqual({
      feat: [fixtures.releaseCommitA],
      fix: [fixtures.releaseCommitB],
    });
  });

  it('overrides breakingChanges if there exists major bumps', () => {
    const commits = [fixtures.releaseCommitA, fixtures.releaseCommitC];
    const result = getCommitsByType(commits, {
      breakingChangesFirst: true,
    });
    expect(result).toEqual({
      breakingChanges: [fixtures.releaseCommitC],
      feat: [fixtures.releaseCommitA],
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
