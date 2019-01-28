import semanticVersionTag from './semanticVersionTag';

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

describe('semanticVersionTag.parse', () => {
  it('should parse valid semantic patch versions', () => {
    expect(semanticVersionTag.parse('0.0.1')).toMatchObject({
      ...tagObj,
      patch: 1,
    });
  });

  it('should parse valid semantic minor versions', () => {
    expect(semanticVersionTag.parse('0.1.0')).toMatchObject({
      ...tagObj,
      minor: 1,
    });
  });

  it('should parse valid semantic major versions', () => {
    expect(semanticVersionTag.parse('1.0.0')).toMatchObject({
      ...tagObj,
      major: 1,
    });
  });

  it('should parse valid package names', () => {
    expect(semanticVersionTag.parse('committed@0.0.0')).toMatchObject({
      ...tagObj,
      name: 'committed',
    });
    expect(semanticVersionTag.parse('@ones-io/committed@0.0.0')).toMatchObject({
      ...tagObj,
      name: '@ones-io/committed',
    });
  });

  it('should parse simple prerelease versions', () => {
    expect(semanticVersionTag.parse('0.0.0-rc')).toMatchObject({
      ...tagObj,
      preReleaseName: 'rc',
    });
    expect(semanticVersionTag.parse('0.0.0-beta.32')).toMatchObject({
      ...tagObj,
      preReleaseName: 'beta',
      preReleaseVersion: 32,
    });
  });

  it('should throw error on invalid tags', () => {
    expect(() => semanticVersionTag.parse('0.0-rc')).toThrowError();
    expect(() => semanticVersionTag.parse('@sd0.0.0')).toThrowError();
    expect(() => semanticVersionTag.parse('sd0-alphaweuir#(')).toThrowError();
    expect(() => semanticVersionTag.parse('-1..0.0')).toThrowError();
  });
});

describe('semanticVersionTag string utils', () => {
  const str = 'committed@0.0.0';
  const tag = semanticVersionTag.parse(str);
  const str2 = '@ones-io/committed@0.0.0';
  const tag2 = semanticVersionTag.parse(str2);
  const str3 = '@ones-io/committed@0.0.0-alpha.32';
  const tag3 = semanticVersionTag.parse(str3);

  describe('semanticVersionTag.toString', () => {
    it('should give back full string', () => {
      expect(semanticVersionTag.toString(tag)).toEqual(str);
      expect(semanticVersionTag.toString(tag2)).toEqual(str2);
      expect(semanticVersionTag.toString(tag3)).toEqual(str3);
    });
  });

  describe('semanticVersionTag.getVersionString', () => {
    it('should give version portion only', () => {
      expect(semanticVersionTag.getVersionString(tag)).toEqual('0.0.0');
      expect(semanticVersionTag.getVersionString(tag2)).toEqual('0.0.0');
      expect(semanticVersionTag.getVersionString(tag3)).toEqual(
        '0.0.0-alpha.32'
      );
    });
  });
});

describe('semanticVersionTag.bump', () => {
  const tag = semanticVersionTag.parse('0.0.0');
  const preReleaseTag = semanticVersionTag.parse('0.0.0-alpha');

  it('should increase major version accordingly', () => {
    expect(semanticVersionTag.bump(tag, major)).toMatchObject({
      ...tagObj,
      major: 1,
    });
  });

  it('should increase minor version accordingly', () => {
    expect(semanticVersionTag.bump(tag, minor)).toMatchObject({
      ...tagObj,
      minor: 1,
    });
  });

  it('should increase patch version accordingly', () => {
    expect(semanticVersionTag.bump(tag, patch)).toMatchObject({
      ...tagObj,
      patch: 1,
    });
  });

  it('should increase prerelease version accordingly', () => {
    const bumped = semanticVersionTag.bump(preReleaseTag, patch);
    expect(bumped).toMatchObject({
      ...tagObj,
      preReleaseName: 'alpha',
      preReleaseVersion: 1,
    });
    expect(semanticVersionTag.bump(bumped, 'major')).toMatchObject({
      preReleaseVersion: 2,
    });
  });
});

describe('semanticVersionTag.getVersionBump', () => {
  it('should get patch if there are only patches', () => {
    expect(semanticVersionTag.getVersionBump([patch, patch])).toEqual(patch);
  });

  it('should get minor if there is no major', () => {
    expect(
      semanticVersionTag.getVersionBump([patch, patch, minor, patch])
    ).toEqual(minor);
  });

  it('should get major if there is any major', () => {
    expect(
      semanticVersionTag.getVersionBump([patch, major, minor, patch])
    ).toEqual(major);
  });
});
