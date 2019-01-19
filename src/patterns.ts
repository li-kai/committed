export interface IPattern {
  TYPE: RegExp;
  SCOPE: RegExp;
  OPTIONAL_SCOPE: RegExp;
  DESCRIPTION: RegExp;
  HEADER: RegExp;
  BREAKING_CHANGE: RegExp;
  CONTENT: RegExp;
  BODY: RegExp;
}

const pt: IPattern = {} as any;
pt.TYPE = /(?<type>[a-zA-Z]+)/;
pt.SCOPE = /\((?<scope>[\w-]+)\)/;
pt.OPTIONAL_SCOPE = /(?:\((?<scope>[\w-]+)?\))?/;
pt.DESCRIPTION = /(?<description>\w.+)/;
pt.HEADER = new RegExp(
  `^${pt.TYPE.source}${pt.OPTIONAL_SCOPE.source}: ${pt.DESCRIPTION.source}$`
);
pt.BREAKING_CHANGE = /(?<breakingChange>BREAKING CHANGE)/;
pt.CONTENT = /(?<content>(?:[^\n]+\n?)+)/;
pt.BODY = new RegExp(
  `^(?:${pt.BREAKING_CHANGE.source}: )?${pt.CONTENT.source}`
);

export default pt;
