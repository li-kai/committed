import semanticVersion from './semantic-version';

const { parseCommit, getVersionBump, increaseVersionBump } = semanticVersion;

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
      body: undefined,
      description: 'something',
      footer: undefined,
      scope: undefined,
      type: 'fix',
    });
  });

  it('should turn a header with scope into an object', () => {
    expect(parseCommit(typeAndScopeAndDesc)).toMatchObject({
      body: undefined,
      description: 'something',
      footer: undefined,
      scope: 'bug',
      type: 'fix',
    });
  });

  it('should turn a header with body into an object', () => {
    expect(parseCommit(headerWithBody)).toMatchObject({
      body: 'content',
      description: 'something',
      footer: undefined,
      scope: undefined,
      type: 'fix',
    });
  });

  it('should turn a header with breaking changes in body into an object', () => {
    expect(parseCommit(headerAndBreakingBody)).toMatchObject({
      body: 'content',
      description: 'something',
      footer: undefined,
      scope: undefined,
      type: 'fix',
    });
  });

  it('should turn a header with breaking changes into an object', () => {
    expect(parseCommit(headerAndBodyAndBreakingFooter)).toMatchObject({
      body: 'content',
      description: 'something',
      footer: 'content',
      scope: undefined,
      type: 'fix',
    });
  });

  function pickVersionBump(str: string) {
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

describe('semanticVersion.getVersionBump', () => {
  const patch: 'patch' = 'patch';
  const minor: 'minor' = 'minor';
  const major: 'major' = 'major';

  it('should get patch if there are only patches', () => {
    expect(getVersionBump([patch, patch])).toEqual(patch);
  });

  it('should get minor if there is no major', () => {
    expect(getVersionBump([patch, patch, minor, patch])).toEqual(minor);
  });

  it('should get major if there is any major', () => {
    expect(getVersionBump([patch, major, minor, patch])).toEqual(major);
  });

  describe('semanticVersion.increaseVersionBump', () => {
    const version = {
      name: undefined,
      versionStr: '',
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: undefined,
    };

    it('should increase major version accordingly', () => {
      expect(increaseVersionBump(version, major)).toEqual({
        ...version,
        versionStr: '1.0.0',
        major: 1,
      });
    });

    it('should increase minor version accordingly', () => {
      expect(increaseVersionBump(version, minor)).toEqual({
        ...version,
        versionStr: '0.1.0',
        minor: 1,
      });
    });

    it('should increase patch version accordingly', () => {
      expect(increaseVersionBump(version, patch)).toEqual({
        ...version,
        versionStr: '0.0.1',
        patch: 1,
      });
    });
  });
});
