import { IConventionalCommit, ISemanticVersionTag } from '../types';
import conventionalCommit from '../conventionalCommit';
import semanticVersionTag from '../semanticVersionTag';

const HEADER = '# Changelog';
const UNRELEASED_HEADER = '## Unreleased';
const BREAKING_CHANGE_HEADER = '### Breaking Changes';
const FEAT_HEADER = '### Feature';
const FIX_HEADER = '### Bug Fixes';

type ConventionalChangelogDetails = {
  version?: ISemanticVersionTag;
  commits: IConventionalCommit[];
};

async function genChangelog(
  currentChangelog: string,
  details: ConventionalChangelogDetails
) {
  let newChangelog = '';

  if (details.version) {
    const date = new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    newChangelog = `## ${semanticVersionTag.getVersionString(
      details.version
    )} - ${date}`;
  } else {
    newChangelog = UNRELEASED_HEADER;
  }

  const commitsByType = getCommitsByType(details.commits, {
    breakingChangesFirst: true,
  });

  Object.keys(commitsByType)
    .sort((a, b) => {
      if (a === 'breakingChanges') return -1;
      if (b === 'breakingChanges') return 1;
      if (a === 'feat') return -1;
      if (b === 'feat') return 1;
      if (a === 'fix') return -1;
      if (b === 'fix') return 1;
      return a.localeCompare(b);
    })
    .forEach((type) => {
      let typeHeader = `#### ${type[0].toUpperCase()}${type.slice(1)}`;

      if (type === 'breakingChanges') {
        typeHeader = BREAKING_CHANGE_HEADER;
      } else if (type === 'feat') {
        typeHeader = FEAT_HEADER;
      } else if (type === 'fix') {
        typeHeader = FIX_HEADER;
      }

      const body = commitsByType[type]
        .map((commit: IConventionalCommit) => {
          const { meta, scope, description } = commit;
          const scopeStr = scope ? `**${scope}:** ` : '';
          return `${scopeStr}${description} (${meta.hash.slice(0, 7)})`;
        })
        .join('\n');
      newChangelog = `${newChangelog}\n${typeHeader}\n${body}`;
    });

  // Remove header, and append new content
  const previousChangelog = currentChangelog.slice(0, HEADER.length);
  const changelog = `${HEADER}\n${newChangelog}${previousChangelog}`;

  return formatWithPrettier(changelog);
}

function getCommitsByType(
  commits: IConventionalCommit[],
  options?: { breakingChangesFirst: boolean }
) {
  const commitsByKey: { [key: string]: typeof commits } = {};

  commits.forEach((commit) => {
    let key = commit.type;
    if (
      options &&
      options.breakingChangesFirst &&
      conventionalCommit.hasBreakingChange(commit)
    ) {
      key = 'breakingChanges';
    }
    commitsByKey[key] = commitsByKey[key] || [];
    commitsByKey[key].push(commit);
  });

  return commitsByKey;
}

// Format with prettier, if there exists a prettier plugin
async function formatWithPrettier(str: string): Promise<string> {
  try {
    // tslint:disable-next-line:no-implicit-dependencies
    const prettier = await import('prettier');
    return prettier.format(str, { parser: 'markdown' });
  } catch {
    return str;
  }
}

export default genChangelog;
export { getCommitsByType, formatWithPrettier };
