import conventionalCommit from '../conventionalCommit';
import semanticVersionTag from '../semanticVersionTag';
import { IConventionalCommit, ISemanticVersionTag } from '../types';
import { formatWithPrettier } from '../utils/formatter';

const HEADER = '# Changelog';
const UNRELEASED_HEADER = '## Unreleased';
const BREAKING_CHANGE_HEADER = '### Breaking Changes';
const FEAT_HEADER = '### Feature';
const FIX_HEADER = '### Bug Fixes';

type ConventionalChangelogDetails = {
  version?: ISemanticVersionTag;
  commits: IConventionalCommit[];
};

function generateCommitNotes(details: ConventionalChangelogDetails) {
  let notes = '';

  const commitsByType = conventionalCommit.getCommitsByType(details.commits, {
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
          return ` - ${scopeStr}${description} (${meta.hash.slice(0, 7)})`;
        })
        .join('\n');
      notes = `${notes}\n${typeHeader}\n${body}`;
    });
  return notes;
}

async function generateChangelog(
  currentChangelog: string,
  details: ConventionalChangelogDetails
) {
  let releaseHeader = '';
  if (details.version) {
    const date = new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    releaseHeader = `## ${semanticVersionTag.getVersionString(
      details.version
    )} - ${date}`;
  } else {
    releaseHeader = UNRELEASED_HEADER;
  }

  // Remove header, and append new content
  const commitNotes = generateCommitNotes(details);
  const previousChangelog = currentChangelog.slice(HEADER.length);
  const changelog = `${HEADER}\n${releaseHeader}${commitNotes}${previousChangelog}`;

  return formatWithPrettier(changelog);
}

export default {
  generateCommitNotes,
  generateChangelog,
};
