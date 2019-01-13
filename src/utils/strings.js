const gitNotFoundMessage = `
program “git” is not installed or not in the PATH

using windows? try https://stackoverflow.com/a/4493004/4819795
`.trim();

const commitedHeader = '// @ones-io/committed';

const installedHook = (sourceHook, targetHook) =>
  `installed ${sourceHook} at ${targetHook}`;

const skippingHook = (hookPath) =>
  `skipping existing user installed hook at ${hookPath}`;

module.exports = {
  gitNotFoundMessage,
  commitedHeader,
  installedHook,
  skippingHook,
};
