// tslint:disable:no-implicit-dependencies
import { vol } from 'memfs';
import gitUtils from './gitUtils';
import logger from './logger';
import packageJsonUtils from './packageJsonUtils';

jest.mock('fs');
jest.mock('./logger');

const pkgJson = `{
    "name": "@ones/committed",
    "version": "0.1.0",
    "description": "A coventional commits workflow tool"
}
`;

describe('packageJsonUtils', () => {
  let getFiles: typeof gitUtils.getFiles;

  beforeAll(() => {
    const json = {
      // '/package.json': pkgJson,
      '/a/b/c/y.txt': 'y',
      '/a/b/c/d/x.txt': 'x',
      '/a/e/w.txt': 'w',
      '/b/c/d.txt': 'a',
      '/b/node_modules/a.txt': 'a',
      '/c/.git/commit-msg': 'a',
    };
    vol.fromJSON(json, '/');
    vol.mkdirSync('/empty');

    getFiles = gitUtils.getFiles;
    gitUtils.getFiles = jest.fn(() =>
      Promise.resolve(Object.keys(vol.toJSON()))
    );
  });

  afterAll(() => {
    vol.reset();
    gitUtils.getFiles = getFiles;
  });

  describe('getPkgMetas', () => {
    it('should fatally exit if no package.json found', async () => {
      expect.assertions(2);
      await expect(packageJsonUtils.getPkgMetas()).rejects.toThrowError();
      expect(logger.fatal).toHaveBeenCalled();
    });

    it('should get package jsons from folder', async () => {
      vol.writeFileSync('/package.json', pkgJson);

      const result = await packageJsonUtils.getPkgMetas();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        dir: '/',
        name: '@ones/committed',
        version: '0.1.0',
        private: false,
      });
    });
  });
});
