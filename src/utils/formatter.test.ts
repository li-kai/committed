import prettier from 'prettier';
import { formatWithPrettier } from './formatter';

describe('formatWithPrettier', () => {
  it("generates a commit's markdown with prettier", () => {
    const testStr = `Test`;
    prettier.format = jest.fn().mockImplementationOnce(() => testStr);

    expect(formatWithPrettier('')).resolves.toBe(testStr);
  });

  it('generates returns markdown if prettier is missing', () => {
    prettier.format = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    const testString = '3. one \n1. two';
    expect(formatWithPrettier(testString)).resolves.toBe(testString);
  });
});
