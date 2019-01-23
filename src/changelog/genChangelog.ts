import { IRelease } from '../types';

const HEADER = '# Changelog';
const BREAKING_CHANGE_HEADER = '### Breaking Changes';
const FEAT_HEADER = '### Feature';
const FIX_HEADER = '### Bug Fixes';

async function genChangelog(currentChangelog: string, release: IRelease) {
  let newReleaseChangelog = '';

  const date = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  newReleaseChangelog = `## ${release.version.versionStr} - ${date}`;

  const commitsByType = getCommitsByType(release.commits, {
    breakingChangesFirst: true,
  });

  const genCommitStr = (commit: IRelease['commits'][0]) => {
    const { content, meta } = commit;
    const scope = content.scope ? `**${content.scope}:** ` : '';
    return `${scope}${content.description} (${meta.hash.slice(0, 7)})`;
  };

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
    .map((type) => {
      let typeHeader = `#### ${type[0].toUpperCase()}${type.slice(1)}`;

      if (type === 'breakingChanges') {
        typeHeader = BREAKING_CHANGE_HEADER;
      } else if (type === 'feat') {
        typeHeader = FEAT_HEADER;
      } else if (type === 'fix') {
        typeHeader = FIX_HEADER;
      }

      const body = commitsByType[type].map(genCommitStr).join('\n');
      newReleaseChangelog = `${newReleaseChangelog}\n${typeHeader}\n${body}`;
    })
    .join('\n');

  // Remove header, and append new content
  const previousChangelog = currentChangelog.slice(0, HEADER.length);
  let changelog = `${HEADER}\n${newReleaseChangelog}${previousChangelog}`;

  return formatWithPrettier(changelog);
}

function getCommitsByType(
  commits: IRelease['commits'],
  options?: { breakingChangesFirst: boolean }
) {
  const commitsByKey: { [key: string]: typeof commits } = {};

  commits.forEach((commit) => {
    let key = commit.content.type;
    if (
      options &&
      options.breakingChangesFirst &&
      commit.content.proposedVersionBump === 'major'
    ) {
      key = 'breakingChanges';
    }
    commitsByKey[key] = (commitsByKey[key] || []).concat(commit);
  });

  return commitsByKey;
}

// Format with prettier, if there exists a prettier plugin
async function formatWithPrettier(str: string): Promise<string> {
  try {
    const prettier = await import('prettier');
    return prettier.format(str, { parser: 'markdown' });
  } catch {
    return str;
  }
}

export default genChangelog;
export { getCommitsByType, formatWithPrettier };
