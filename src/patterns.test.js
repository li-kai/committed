const patterns = require('./patterns');

describe('patterns', () => {
  function getGroups(pattern) {
    return (str) => {
      const res = pattern.exec(str);
      return res ? res.groups : null;
    };
  }

  describe('type', () => {
    const testType = getGroups(patterns.TYPE);
    const input = 'test';
    const output = { type: 'test' };

    it('should match single word', () => {
      expect(testType(input)).toEqual(output);
    });

    it('should match word of any casing', () => {
      expect(testType(input)).toEqual(output);
      expect(testType('TEST')).toEqual({ type: 'TEST' });
      expect(testType('teST')).toEqual({ type: 'teST' });
    });

    it('should not match multiple words', () => {
      expect(testType('test test')).toEqual(output);
    });

    it('should not allow numbers, only nouns', () => {
      expect(testType('2')).toBeNull();
      expect(testType('test: ')).toEqual(output);
    });

    it('should not match symbols or white space', () => {
      expect(testType('#')).toBeNull();
      expect(testType('-')).toBeNull();
      expect(testType('  ')).toBeNull();
      expect(testType('')).toBeNull();
      expect(testType('test: ')).toEqual(output);
    });
  });

  describe('scope', () => {
    const testType = getGroups(patterns.SCOPE);
    const testOptionalType = getGroups(patterns.OPTIONAL_SCOPE);
    const input = '(test)';
    const output = { scope: 'test' };
    const optionalOutput = { scope: undefined };

    it('should match single word with parenthesis', () => {
      expect(testType(input)).toEqual(output);
      expect(testType('(test-suite)')).toEqual({ scope: 'test-suite' });
      expect(testType('(_lodash)')).toEqual({ scope: '_lodash' });
      expect(testOptionalType(input)).toEqual(output);
      expect(testOptionalType('(test-suite)')).toEqual({
        scope: 'test-suite',
      });
      expect(testOptionalType('(_lodash)')).toEqual({ scope: '_lodash' });
    });

    it('should not match invalid parenthesis', () => {
      expect(testType('test')).toBeNull();
      expect(testType('(test')).toBeNull();
      expect(testOptionalType('test')).toEqual(optionalOutput);
      expect(testOptionalType('(test')).toEqual(optionalOutput);
    });

    it('should not match multiple words', () => {
      expect(testType('(test test)')).toBeNull();
      expect(testOptionalType('(test test)')).toEqual(optionalOutput);
    });

    it('should not match non-words', () => {
      expect(testType('(#)')).toBeNull();
      expect(testType('(?)')).toBeNull();
      expect(testType('(  )')).toBeNull();
      expect(testType('')).toBeNull();
      expect(testOptionalType('(#)')).toEqual(optionalOutput);
      expect(testOptionalType('(?)')).toEqual(optionalOutput);
      expect(testOptionalType('(  )')).toEqual(optionalOutput);
      expect(testOptionalType('')).toEqual(optionalOutput);
    });
  });

  describe('description', () => {
    const testType = getGroups(patterns.DESCRIPTION);
    const input = 'lorem ipsum';
    const output = { description: 'lorem ipsum' };

    it('should match a sentence', () => {
      expect(testType(input)).toEqual(output);
    });

    it('should start with a word character', () => {
      ['t #$', 'T #$', '0 #$'].forEach((key) => {
        expect(testType(key)).toEqual({ description: key });
      });
    });

    it('should not match non-word character', () => {
      expect(testType('()')).toBeNull();
      expect(testType('   ')).toBeNull();
      expect(testType('')).toBeNull();
    });
  });

  describe('header', () => {
    const testType = getGroups(patterns.HEADER);

    it('should match a proper header', () => {
      expect(testType('type(scope): lorem ipsum')).toEqual({
        type: 'type',
        scope: 'scope',
        description: 'lorem ipsum',
      });
      expect(testType('type: lorem ipsum')).toEqual({
        type: 'type',
        scope: undefined,
        description: 'lorem ipsum',
      });
    });

    it('should not match invalid header', () => {
      expect(testType('type3(scope): lorem ipsum')).toBeNull();
      expect(testType('type ( scope ): lorem ipsum')).toBeNull();
      expect(testType('type(scope):     sd')).toBeNull();
      expect(testType('type[s]: asdf')).toBeNull();
      expect(testType('type(s: adf')).toBeNull();
      expect(testType('type(s): ')).toBeNull();
      expect(testType('123(s): ')).toBeNull();
    });
  });

  describe('breakingChange', () => {
    const testType = getGroups(patterns.BREAKING_CHANGE);
    const input = 'BREAKING CHANGE';
    const output = { breakingChange: 'BREAKING CHANGE' };

    it('should match "BREAKING CHANGE"', () => {
      expect(testType(input)).toEqual(output);
    });

    it('should not match anything else', () => {
      expect(testType('BREAKINGCHANGE')).toBeNull();
      expect(testType('BREAKIN GCHANGE')).toBeNull();
      expect(testType('BREAKING BAD')).toBeNull();
      expect(testType('BREAKING change')).toBeNull();
      expect(testType('breaking change')).toBeNull();
      expect(testType('')).toBeNull();
      expect(testType('1')).toBeNull();
      expect(testType('-')).toBeNull();
    });
  });

  describe('content', () => {
    const testType = getGroups(patterns.CONTENT);

    it('should match paragraphs without two consecutive new lines', () => {
      expect(testType('a\na\n')).toEqual({
        content: 'a\na\n',
      });
      expect(testType('a\t\rab $\r')).toEqual({
        content: 'a\t\rab $\r',
      });
    });

    it('should not match paragraphs following two consecutive new lines', () => {
      expect(testType('a b c\n\nab $\r')).toEqual({
        content: 'a b c\n',
      });
    });
  });

  describe('body', () => {
    const testType = getGroups(patterns.BODY);

    it('should match paragraphs without two consecutive new lines', () => {
      expect(testType('a\na\n')).toEqual({
        breakingChange: undefined,
        content: 'a\na\n',
      });
      expect(testType('BREAKING CHANGE: a\rab $\r')).toEqual({
        breakingChange: 'BREAKING CHANGE',
        content: 'a\rab $\r',
      });
    });

    it('should not match paragraphs following two consecutive new lines', () => {
      expect(testType('BREAKING CHANGE: a b c\n\nab $\r')).toEqual({
        breakingChange: 'BREAKING CHANGE',
        content: 'a b c\n',
      });
      expect(testType('a b c\n\nab $\r')).toEqual({
        content: 'a b c\n',
      });
    });

    it('should not match invalid breaking change', () => {
      expect(testType('BREAKING CHANGE:a b c\n\nab $\r')).toEqual({
        breakingChange: undefined,
        content: 'BREAKING CHANGE:a b c\n',
      });
    });

    it('should not match invalid bodies', () => {
      expect(testType('')).toBeNull();
      expect(testType('\n')).toBeNull();
    });
  });
});
