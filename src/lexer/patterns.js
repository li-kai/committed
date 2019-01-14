const pt = {
  TYPE: /(?<type>[a-zA-Z]+)/,
  SCOPE: /\((?<scope>[\w-]+)\)/,
  OPTIONAL_SCOPE: /(?:\((?<scope>[\w-]+)?\))?/,
  DESCRIPTION: /(?<description>\w.+)/,
};

pt.HEADER = new RegExp(
  `^${pt.TYPE.source}${pt.OPTIONAL_SCOPE.source}: ${pt.DESCRIPTION.source}$`
);

module.exports = pt;
