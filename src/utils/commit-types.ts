const typeDescriptions = {
  chore: 'Build process or auxiliary tool changes',
  ci: 'CI related changes',
  docs: 'Documentation only changes',
  feat: 'A new feature',
  fix: 'A bug fix',
  perf: 'A code change that improves performance',
  refactor: 'A code change that neither fixes a bug or adds a feature',
  style:
    'Markup - only changes(white - space, formatting, missing semi - colons, etc)',
  test: 'Adding or updating tests',
};

const types = Object.keys(typeDescriptions);

export default { typeDescriptions, types };
