import SemanticVersionTag from './SemanticVersionTag';
import { parseCommit, getVersionBump } from './SemanticVersionTag';

const patch: 'patch' = 'patch';
const minor: 'minor' = 'minor';
const major: 'major' = 'major';
const tagObj = {
  name: undefined,
  major: 0,
  minor: 0,
  patch: 0,
  preReleaseName: undefined,
  preReleaseVersion: undefined,
};

describe('SemanticVersionTag', () => {
  describe('parse', () => {
    it('should parse valid semantic patch versions', () => {
      expect(SemanticVersionTag.parse('0.0.1')).toMatchObject({
        ...tagObj,
        patch: 1,
      });
    });

    it('should parse valid semantic minor versions', () => {
      expect(SemanticVersionTag.parse('0.1.0')).toMatchObject({
        ...tagObj,
        minor: 1,
      });
    });

    it('should parse valid semantic major versions', () => {
      expect(SemanticVersionTag.parse('1.0.0')).toMatchObject({
        ...tagObj,
        major: 1,
      });
    });

    it('should parse valid package names', () => {
      expect(SemanticVersionTag.parse('committed@0.0.0')).toMatchObject({
        ...tagObj,
        name: 'committed',
      });
      expect(
        SemanticVersionTag.parse('@ones-io/committed@0.0.0')
      ).toMatchObject({
        ...tagObj,
        name: '@ones-io/committed',
      });
    });

    it('should parse simple prerelease versions', () => {
      expect(SemanticVersionTag.parse('0.0.0-rc')).toMatchObject({
        ...tagObj,
        preReleaseName: 'rc',
      });
      expect(SemanticVersionTag.parse('0.0.0-beta.32')).toMatchObject({
        ...tagObj,
        preReleaseName: 'beta',
        preReleaseVersion: 32,
      });
    });

    it('should throw error on invalid tags', () => {
      expect(() => SemanticVersionTag.parse('0.0-rc')).toThrowError();
      expect(() => SemanticVersionTag.parse('@sd0.0.0')).toThrowError();
      expect(() => SemanticVersionTag.parse('sd0-alphaweuir#(')).toThrowError();
      expect(() => SemanticVersionTag.parse('-1..0.0')).toThrowError();
    });
  });

  describe('toString', () => {
    it('should give back full string', () => {
      const str = 'committed@0.0.0';
      expect(SemanticVersionTag.parse(str).toString()).toEqual(str);
      const str2 = '@ones-io/committed@0.0.0';
      expect(SemanticVersionTag.parse(str2).toString()).toEqual(str2);
      const str3 = '@ones-io/committed@0.0.0-alpha.32';
      expect(SemanticVersionTag.parse(str3).toString()).toEqual(str3);
    });
  });

  describe('getVersionString', () => {
    it('should give version portion only', () => {
      const str = 'committed@0.0.0';
      expect(SemanticVersionTag.parse(str).getVersionString()).toEqual('0.0.0');
      const str2 = '@ones-io/committed@0.0.0';
      expect(SemanticVersionTag.parse(str2).getVersionString()).toEqual(
        '0.0.0'
      );
      const str3 = '@ones-io/committed@0.0.0-alpha.32';
      expect(SemanticVersionTag.parse(str3).getVersionString()).toEqual(
        '0.0.0-alpha.32'
      );
    });
  });

  describe('bump', () => {
    const tag = SemanticVersionTag.parse('0.0.0');
    const preReleaseTag = SemanticVersionTag.parse('0.0.0-alpha');

    it('should increase major version accordingly', () => {
      expect(tag.bump(major)).toMatchObject({
        ...tagObj,
        major: 1,
      });
    });

    it('should increase minor version accordingly', () => {
      expect(tag.bump(minor)).toMatchObject({
        ...tagObj,
        minor: 1,
      });
    });

    it('should increase patch version accordingly', () => {
      expect(tag.bump(patch)).toMatchObject({
        ...tagObj,
        patch: 1,
      });
    });

    it('should increase prerelease version accordingly', () => {
      const bumped = preReleaseTag.bump(patch);
      expect(bumped).toMatchObject({
        ...tagObj,
        preReleaseName: 'alpha',
        preReleaseVersion: 1,
      });
      expect(bumped.bump('major')).toMatchObject({
        preReleaseVersion: 2,
      });
    });
  });
});

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
  it('should get patch if there are only patches', () => {
    expect(getVersionBump([patch, patch])).toEqual(patch);
  });

  it('should get minor if there is no major', () => {
    expect(getVersionBump([patch, patch, minor, patch])).toEqual(minor);
  });

  it('should get major if there is any major', () => {
    expect(getVersionBump([patch, major, minor, patch])).toEqual(major);
  });
});
