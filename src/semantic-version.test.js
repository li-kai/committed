const semanticVersion = require('./semantic-version');

const {
  parseCommit,
  getVersionBumpType,
  increaseVersionBump,
} = semanticVersion;

const typeAndDesc = 'fix: something';
const typeAndScopeAndDesc = 'fix(bug): something';
const headerWithBody = ['fix: something', '', 'content'].join('\n');
const headerAndBreakingBody = [
  'fix: something',
  '',
  'BREAKING CHANGE: content',
].join('\n');
const headerAndBodyAndBreakingFooter = [
  'fix: something',
  '',
  'content',
  '',
  'BREAKING CHANGE: content',
].join('\n');

describe('semanticVersion.getCommit', () => {
  it('should turn a header into normalized object', () => {
    expect(parseCommit(typeAndDesc)).toMatchObject({
      type: 'fix',
      scope: undefined,
      description: 'something',
      body: undefined,
      footer: undefined,
    });
  });

  it('should turn a header with scope into an object', () => {
    expect(parseCommit(typeAndScopeAndDesc)).toMatchObject({
      type: 'fix',
      scope: 'bug',
      description: 'something',
      body: undefined,
      footer: undefined,
    });
  });

  it('should turn a header with body into an object', () => {
    expect(parseCommit(headerWithBody)).toMatchObject({
      type: 'fix',
      scope: undefined,
      description: 'something',
      body: 'content',
      footer: undefined,
    });
  });

  it('should turn a header with breaking changes in body into an object', () => {
    expect(parseCommit(headerAndBreakingBody)).toMatchObject({
      type: 'fix',
      scope: undefined,
      description: 'something',
      body: 'content',
      footer: undefined,
    });
  });

  it('should turn a header with breaking changes into an object', () => {
    expect(parseCommit(headerAndBodyAndBreakingFooter)).toMatchObject({
      type: 'fix',
      scope: undefined,
      description: 'something',
      body: 'content',
      footer: 'content',
    });
  });

  function pickVersionBump(str) {
    return parseCommit(str).proposedVersionBump;
  }

  it('should propose major for breaking', () => {
    expect(pickVersionBump(headerAndBreakingBody)).toEqual('major');
    expect(pickVersionBump(headerAndBodyAndBreakingFooter)).toEqual('major');
  });

  it('should propose minor for features', () => {
    expect(pickVersionBump('feat: something')).toEqual('minor');
  });

  it('should propose patch for anything else', () => {
    expect(pickVersionBump(typeAndDesc)).toEqual('patch');
    expect(pickVersionBump(typeAndScopeAndDesc)).toEqual('patch');
  });
});

describe('semanticVersion.getVersionBumpType', () => {
  it('should get patch if there are only patches', () => {
    expect(
      getVersionBumpType([
        { proposedVersionBump: 'patch' },
        { proposedVersionBump: 'patch' },
      ])
    ).toEqual('patch');
  });

  it('should get minor if there is no major', () => {
    expect(
      getVersionBumpType([
        { proposedVersionBump: 'patch' },
        { proposedVersionBump: 'patch' },
        { proposedVersionBump: 'minor' },
        { proposedVersionBump: 'patch' },
      ])
    ).toEqual('minor');
  });

  it('should get major if there is any major', () => {
    expect(
      getVersionBumpType([
        { proposedVersionBump: 'patch' },
        { proposedVersionBump: 'major' },
        { proposedVersionBump: 'minor' },
        { proposedVersionBump: 'patch' },
      ])
    ).toEqual('major');
  });

  describe('semanticVersion.increaseVersionBump', () => {
    const version = { major: 0, minor: 0, patch: 0 };
    it('should increase major version accordingly', () => {
      expect(increaseVersionBump(version, 'major')).toEqual({
        ...version,
        major: 1,
      });
    });

    it('should increase minor version accordingly', () => {
      expect(increaseVersionBump(version, 'minor')).toEqual({
        ...version,
        minor: 1,
      });
    });

    it('should increase patch version accordingly', () => {
      expect(increaseVersionBump(version, 'patch')).toEqual({
        ...version,
        patch: 1,
      });
    });
  });
});
