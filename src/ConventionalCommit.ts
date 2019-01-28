import os from 'os';
import patterns from './patterns';
import { ICommit, IConventionalCommit, VersionBump } from './types';

function parse(commit: ICommit): IConventionalCommit {
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

  return {
    rawString: commit.rawString,
    meta: commit.meta,
    type: type,
    scope: scope,
    description: description,
    body: body,
    footer: footer,
    versionBumpType: proposedVersionBump,
  };
}

function hasBreakingChange(conventionalCommit: IConventionalCommit) {
  return conventionalCommit.versionBumpType === 'major';
}

export default {
  parse,
  hasBreakingChange,
};
