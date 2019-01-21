import { ICommitMeta, ICommitContent, ISemanticVersionTag } from '../types';

interface ICommitData {
  meta: ICommitMeta;
  content: ICommitContent;
}

interface IChangelog {
  date: Date;
  meta: ICommitMeta;
  version: ISemanticVersionTag;
  commits: ICommitData[];
}

function generateChangelog(template: (changelogData: IChangelog) => string) {
  return template;
}

function defaultChangelog(data: IChangelog) {
  return `
## [${data.version}] - ${data.date}

${data.commits.map((commit) => {
  return `- ${commit.content.description} [${commit.meta.author}]`;
})}
  `.trim();
}

export { generateChangelog, defaultChangelog };
