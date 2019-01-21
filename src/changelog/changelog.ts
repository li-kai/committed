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

export interface ITemplate {
  header: string | (() => string) | (() => Promise<string>);
  release:
    | string
    | ((data: IChangelog) => string)
    | ((data: IChangelog) => Promise<string>);
}

const defaultTemplate = {
  header: '# Changelog',
  release(data: IChangelog) {
    return `
    ## [${data.version}] - ${data.date}

    ${data.commits.map((commit) => {
      return `- ${commit.content.description} [${commit.meta.author}]`;
    })}
    `.trim();
  },
};

async function generateChangelog(template: ITemplate): Promise<string> {
  if (typeof template.header !== 'string') {
    return Promise.resolve(template.header());
  }
  return template.header;
}

export default generateChangelog;
export { defaultTemplate };
