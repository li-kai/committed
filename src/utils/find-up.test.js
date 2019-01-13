const { vol } = require('memfs');
const findUp = require('./find-up');

jest.mock('fs');

describe('find-up', () => {
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
      '/a/b/c/z.txt'
    );
  });

  it('should not find file with different ext', async () => {
    await expect(findUp('y.png', { cwd: '/a/b/c' })).resolves.toBe(null);
  });

  it('should return relative path if it finds folder', async () => {
    await expect(findUp('b', { cwd: '/a/b/c' })).resolves.toBe('/a/b');
  });

  it('should not traverse down to find folder', async () => {
    await expect(findUp('b', { cwd: '/' })).resolves.toBe(null);
  });
});
