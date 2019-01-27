import os from 'os';
import patterns from './patterns';
import {
  ICommit,
  ICommitMeta,
  IConventionalCommit,
  VersionBump,
} from './types';

class ConventionalCommit implements IConventionalCommit {
  public static parse(commit: ICommit): ConventionalCommit {
    const lines = commit.rawString.replace(os.EOL, '\n').split('\n');

    const header = lines[0];
    const match = patterns.HEADER.exec(header);

    if (!match || !match.groups) {
      throw new Error('No header');
    }

    const { type, scope, description } = match.groups;
    let body;
    let footer;
    let proposedVersionBump: VersionBump = 'patch';

    if (type === 'feat') {
      proposedVersionBump = 'minor';
    }

    function parseContent(content: string) {
      const contentMatch = patterns.BODY.exec(content);

      if (!contentMatch || !contentMatch.groups) {
        throw new Error('No content');
      }

      if (contentMatch.groups.breakingChange) {
        proposedVersionBump = 'major';
      }
      return contentMatch.groups.content;
    }

    if (lines.length >= 3) {
      body = parseContent(lines[2]);
    }

    if (lines.length >= 5) {
      footer = parseContent(lines[4]);
    }

    return new ConventionalCommit(
      commit.rawString,
      commit.meta,
      type,
      scope,
      description,
      body,
      footer,
      proposedVersionBump
    );
  }

  protected constructor(
    readonly rawString: string,
    readonly meta: Readonly<ICommitMeta>,
    readonly type: string,
    readonly scope: string | undefined,
    readonly description: string,
    readonly body: string | undefined,
    readonly footer: string | undefined,
    readonly versionBumpType: VersionBump
  ) {}

  get hasBreakingChange() {
    return this.versionBumpType === 'major';
  }
}

export default ConventionalCommit;
