import { vol } from 'memfs';
import fixtures from '../__fixtures__/fixtures';
import npmUtils from './npmUtils';

jest.mock('fs');

describe('npmUtils', () => {
  const NPM_TOKEN = process.env.NPM_TOKEN;
  const testToken = 'test_token';

  describe('ensureAuth', () => {
    beforeAll(() => {
      vol.reset();
    });

    beforeEach(() => {
      vol.fromJSON({}, '/');
      delete process.env.NPM_TOKEN;
    });

    afterEach(() => {
      vol.reset();
    });

    afterAll(() => {
      process.env.NPM_TOKEN = NPM_TOKEN;
    });

    it('should ensureAuth given that npmrc exists', async () => {
      vol.writeFileSync('/.npmrc', testToken);
      await expect(npmUtils.ensureAuth('/.npmrc')).resolves.toBeTruthy();
    });

    it('should ensureAuth given that process.env.NPM_TOKEN exists', async () => {
      process.env.NPM_TOKEN = testToken;
      await expect(npmUtils.ensureAuth('/.npmrc')).resolves.toBeTruthy();
      expect(vol.readFileSync('/.npmrc', 'utf8')).toMatchInlineSnapshot(
        `"//registry.npmjs.org/:_authToken=\${NPM_TOKEN}"`
      );
    });
  });

  // takes too long
  describe.skip('publish', () => {
    it('should ensure that publish dry runs completes', async () => {
      expect.assertions(1);
      const publishRes = await npmUtils.publish('.', { dryRun: true });
      expect(typeof publishRes).toBe('string');
    });
  });

  describe('version', () => {
    it('should ensure that version dry runs completes', async () => {
      await expect(
        npmUtils.version('.', fixtures.defaultTag, { dryRun: true })
      ).resolves.toBe('');
    });
  });
});
