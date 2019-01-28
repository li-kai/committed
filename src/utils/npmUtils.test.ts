import { vol } from 'memfs';
import npmUtils from './npmUtils';

jest.mock('fs');

describe('npmUtils', () => {
  const NPM_TOKEN = process.env.NPM_TOKEN;
  const testToken = 'test_token';

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

  it('should not ensureAuth given that both npmrc and token do not exist', async () => {
    await expect(npmUtils.ensureAuth('/dev/null')).resolves.toBeFalsy();
  });
});
