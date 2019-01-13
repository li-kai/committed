const validation = require('./validation');

function getConfig(string) {
  return {
    string,
    matches: {},
    errors: [],
  };
}

describe('makeValidator', () => {
  const { makeValidator } = validation;

  it('should create a validation function', () => {
    expect(makeValidator()).toBeInstanceOf(Function);
  });

  describe('when there is a match', () => {
    it('should consume the string', () => {
      const validateFn = makeValidator('', /(a)/, '');
      const config = getConfig('<---> a <--->');
      const result = validateFn(config);

      expect(result.string).toStrictEqual(' <--->');
    });
  });

  describe('when there is no error message', () => {
    it('should treat error message as optional', () => {
      const validateFn = makeValidator('', /(a)/, '');
      const config = getConfig('b');
      const result = validateFn(config);

      expect(result.errors).toHaveLength(0);
    });
  });

  describe('when there is a error message', () => {
    const errMsg = 'error';
    const validateFn = makeValidator('', /(a)/, errMsg);

    it('should add error message on missing match', () => {
      const config = getConfig('b');
      const result = validateFn(config);

      expect(result.errors).toHaveLength(1);
      expect(result.errors).toContainEqual(errMsg);
    });

    it('should not add error message on match', () => {
      const config = getConfig('a');
      const result = validateFn(config);

      expect(result.errors).toHaveLength(0);
    });
  });

  describe('when there is no key', () => {
    it('should not add match to "matches" key', () => {
      const validateFn = makeValidator('', /(a)/, '');
      const config = getConfig('a');
      const result = validateFn(config);

      expect(result.string).toStrictEqual('');
      expect(result.matches).toStrictEqual({});
    });
  });

  describe('when there is a key', () => {
    it('should add match to "matches" key', () => {
      const key = 'a';
      const validateFn = makeValidator(key, /(a)/, '');
      const config = getConfig(key);
      const result = validateFn(config);

      expect(result.string).toStrictEqual('');
      expect(result.matches).toStrictEqual({ a: key });
    });
  });
});
