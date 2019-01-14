const pt = {
  TYPE: /(?<type>[a-zA-Z]+)/,
  SCOPE: /\((?<scope>[\w-]+)\)/,
  OPTIONAL_SCOPE: /(?:\((?<scope>[\w-]+)?\))?/,
  DESCRIPTION: /(?<description>\w.+)/,
  BREAKING_CHANGE: /(?<breakingChange>BREAKING CHANGE)/,
  CONTENT: /(?<content>(?:(?:[^\r\n]|\r(?!\n))+(?:\r\n|\n)?)+)/,
};

pt.HEADER = new RegExp(
  `^${pt.TYPE.source}${pt.OPTIONAL_SCOPE.source}: ${pt.DESCRIPTION.source}$`
);

pt.BODY = new RegExp(
  `^(?:${pt.BREAKING_CHANGE.source}: )?${pt.CONTENT.source}`
);

module.exports = pt;
