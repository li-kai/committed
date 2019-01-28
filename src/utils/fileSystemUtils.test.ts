// tslint:disable:no-implicit-dependencies
import { vol } from 'memfs';
import path from 'path';
import { readdirRecursive, findUp, pathExists } from './fileSystemUtils';

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
      { path: path.resolve('/a/e/w.txt'), isDir: false },
    ]);
  });

  it('should return files recursively', async () => {
    await expect(readdirRecursive('/a')).resolves.toEqual(
      expect.arrayContaining([
        { isDir: true, path: path.resolve('/a/b') },
        { isDir: true, path: path.resolve('/a/e') },
        { isDir: false, path: path.resolve('/a/e/w.txt') },
        { isDir: false, path: path.resolve('/a/b/c/d/x.txt') },
        { isDir: false, path: path.resolve('/a/b/c/y.txt') },
        { isDir: false, path: path.resolve('/a/z.txt') },
      ])
    );
  });

  it('should ignore node modules', async () => {
    await expect(readdirRecursive('/b')).resolves.toEqual([
      { isDir: true, path: path.resolve('/b/c') },
      { isDir: false, path: path.resolve('/b/c/d.txt') },
    ]);
  });

  it('should ignore hidden files', async () => {
    await expect(readdirRecursive('/c')).resolves.toEqual([]);
  });
});

describe('findUp', () => {
  beforeAll(() => {
    const json = {
      '/a/b/c/z.txt': 'test',
      '/a/b/c/d/e/f/g/h/i.txt': 'test',
      '/a/b/y.txt': 'test',
    };
    vol.fromJSON(json, '/');
  });

  afterAll(() => {
    vol.reset();
  });

  it('should return null if path is not present', async () => {
    await expect(findUp('...')).resolves.toBe(null);
  });

  it('should traverse up parent nodes to find file', async () => {
    await expect(findUp('z.txt', { cwd: '/a/b/c/d/e' })).resolves.toBe(
      path.resolve('/a/b/c/z.txt')
    );
  });

  it('should not find file with different ext', async () => {
    await expect(findUp('y.png', { cwd: '/a/b/c' })).resolves.toBe(null);
  });

  it('should return relative path if it finds folder', async () => {
    await expect(findUp('b', { cwd: '/a/b/c' })).resolves.toBe(
      path.resolve('/a/b')
    );
  });

  it('should not traverse down to find folder', async () => {
    await expect(findUp('b', { cwd: '/' })).resolves.toBe(null);
  });
});

describe('pathExists', () => {
  beforeAll(() => {
    const json = {
      '/z.txt': 'test',
    };
    vol.fromJSON(json, '/');
  });

  afterAll(() => {
    vol.reset();
  });

  it('should return false if path is not present', async () => {
    await expect(pathExists('...')).resolves.toBe(false);
  });

  it('should return true if path exists', async () => {
    await expect(pathExists('/z.txt')).resolves.toBe(true);
  });
});
