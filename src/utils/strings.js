const commitTypes = require('../utils/commit-types');

const gitNotFoundMessage = `
program “git” is not installed or not in the PATH

using windows? try https://stackoverflow.com/a/4493004/4819795
`.trim();

const gitRepoNotFoundMessage = `git repository not found, try running 'git init' first?`;

const commitedHeader = '// @ones-io/committed';

const installedHook = (sourceHook, targetHook) =>
  `installed ${sourceHook} at ${targetHook}`;

const skippingHook = (hookPath) =>
  `skipping existing user installed hook at ${hookPath}`;

const typeTokenizeError = `commit must start with the following types:
${Object.entries(commitTypes.typeDescriptions)
  .map(([type, desc]) => `${type}: `.padEnd(10) + desc)
  .join('')}`;

module.exports = {
  gitNotFoundMessage,
  gitRepoNotFoundMessage,
  commitedHeader,
  installedHook,
  skippingHook,
  typeTokenizeError,
};
