const typeDescriptions = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style:
    'Markup - only changes(white - space, formatting, missing semi - colons, etc)',
  refactor: 'A code change that neither fixes a bug or adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding or updating tests',
  chore: 'Build process or auxiliary tool changes',
  ci: 'CI related changes',
};

module.exports = {
  types: Object.keys(typeDescriptions),
  typeDescriptions,
};
