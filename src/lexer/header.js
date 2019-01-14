const { createToken } = require('./lexer');
const strings = require('../utils/strings');
const commitTypes = require('../utils/commit-types');

const typesToken = createToken({
  name: 'type',
  pattern: new RegExp(`^${commitTypes.types.join('|')}`),
  errorMsg: strings.typeTokenizeError,
});
const scopeToken = createToken({
  name: 'scope',
  pattern: /\(([\w+])\)/,
  errorMsg: '',
});
const colonSpaceToken = createToken({
  name: '',
  pattern: /(: )/,
  errorMsg: 'colon and a space is missing',
});
const descriptionToken = createToken({
  name: 'description',
  pattern: /^(\w.+)$/,
  errorMsg: `description is missing or has redundant whitespace`,
});
const newLineToken = createToken({
  name: '',
  pattern: /^(\r\n|\r|\n)$/,
  errorMsg: `line must be empty`,
});

module.exports = {
  typesToken,
  scopeToken,
  colonSpaceToken,
  descriptionToken,
  newLineToken,
};
