const { vol } = require('memfs');
const readdirRecursive = require('./readdir-recursive');

jest.mock('fs');

describe('readdirRecursive', () => {
  beforeAll(() => {
    const json = {
      '/a/z.txt': 'z',
      '/a/b/c/y.txt': 'y',
      '/a/b/c/d/x.txt': 'x',
      '/a/e/w.txt': 'w',
      '/b/c/d.txt': 'a',
      '/b/node_modules/a.txt': 'a',
      '/c/.git/commit-msg': 'a',
    };
    vol.fromJSON(json, '/');
    vol.mkdirSync('/empty');
  });

  afterAll(() => {
    vol.reset();
  });

  it('should return empty if path is not present', async () => {
    await expect(readdirRecursive('/_')).resolves.toEqual([]);
  });

  it('should return empty if path exists but no files are found', async () => {
    await expect(readdirRecursive('/empty')).resolves.toEqual([]);
  });

  it('should return content of folder', async () => {
    await expect(readdirRecursive('/a/e')).resolves.toEqual([
      { path: '/a/e/w.txt', isDir: false },
    ]);
  });

  it('should return files recursively', async () => {
    await expect(readdirRecursive('/a')).resolves.toEqual(
      expect.arrayContaining([
        { isDir: true, path: '/a/b' },
        { isDir: true, path: '/a/e' },
        { isDir: false, path: '/a/e/w.txt' },
        { isDir: false, path: '/a/b/c/d/x.txt' },
        { isDir: false, path: '/a/b/c/y.txt' },
        { isDir: false, path: '/a/z.txt' },
      ])
    );
  });

  it('should ignore node modules', async () => {
    await expect(readdirRecursive('/b')).resolves.toEqual([
      { isDir: true, path: '/b/c' },
      { isDir: false, path: '/b/c/d.txt' },
    ]);
  });

  it('should ignore hidden files', async () => {
    await expect(readdirRecursive('/c')).resolves.toEqual([]);
  });
});
