import commitTypes from '../utils/commit-types';

const gitNotFoundMessage = `
program “git” is not installed or not in the PATH

using windows? try https://stackoverflow.com/a/4493004/4819795
`.trim();

const gitRepoNotFoundMessage = `git repository not found, try running 'git init' first?`;

const commitedHeader = '// @ones-io/committed';

const installedHook = (sourceHook: string, targetHook: string) =>
  `installed ${sourceHook} at ${targetHook}`;

const skippingHook = (hookPath: string) =>
  `skipping existing user installed hook at ${hookPath}`;

const typeTokenizeError = `commit must start with the following types:
${Object.entries(commitTypes.typeDescriptions)
  .map(([type, desc]) => `${type}: `.padEnd(10) + desc)
  .join('')}`;

export {
  commitedHeader,
  gitNotFoundMessage,
  gitRepoNotFoundMessage,
  installedHook,
  skippingHook,
  typeTokenizeError,
};
