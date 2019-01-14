function createToken(config) {
  return config;
}

class Lexer {
  constructor(tokens) {
    this.tokens = tokens;
  }

  tokenize(string) {
    return this.tokens.map((token) => token(string));
  }
}

module.exports = {
  createToken,
  Lexer,
};
