import fixtures from './__fixtures__/fixtures';
import conventionalCommit from './conventionalCommit';

describe('getCommitsByType', () => {
  it('keys commits by their types', () => {
    const result = conventionalCommit.getCommitsByType([
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
    const result = conventionalCommit.getCommitsByType(commits, {
      breakingChangesFirst: true,
    });
    expect(result).toEqual({
      breakingChanges: [fixtures.releaseCommitC],
      feat: [fixtures.releaseCommitA],
    });
  });
});
