import ConventionalCommit from '../ConventionalCommit';
import SemanticVersionTag from '../SemanticVersionTag';
import { IPackageMeta, IRepoMeta, ISemanticVersionTag } from '../types';

const defaultRepoMeta: IRepoMeta = {
  host: 'https://github.com',
  owner: 'ones-io',
  repository: 'committed',
};

const defaultTag: ISemanticVersionTag = SemanticVersionTag.parse(
  '@ones-io/package@0.1.0'
);

const defaultPackageMeta: IPackageMeta = {
  dir: '.',
  name: '@ones-io/main',
  version: '0.2.0',
  private: false,
  previousTag: defaultTag,
};

const commitMetaA = {
  hash: 'asdfasdfasdfa',
  author: 'a',
  ts: '123123121',
};

const releaseCommitA = ConventionalCommit.parse({
  meta: commitMetaA,
  rawString: 'feat: commit a',
});

const commitMetaB = {
  hash: 'asdfasdfasdfa',
  author: 'b',
  ts: '123123122',
};

const releaseCommitB = ConventionalCommit.parse({
  meta: commitMetaB,
  rawString: 'fix: commit b',
});

const commitMetaC = {
  hash: 'asdfasdfasdfa',
  author: 'c',
  ts: '123123122',
};

const releaseCommitC = ConventionalCommit.parse({
  meta: commitMetaC,
  rawString: 'fix: commit c\n\nBREAKING CHANGE: something',
});

export default {
  defaultRepoMeta,
  defaultTag,
  defaultPackageMeta,
  commitMetaA,
  releaseCommitA,
  commitMetaB,
  releaseCommitB,
  commitMetaC,
  releaseCommitC,
};
