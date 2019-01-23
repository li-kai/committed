import {
  ISemanticVersionTag,
  IPackageMeta,
  IRepoMeta,
  VersionBump,
  IRelease,
} from '../types';

const defaultRepoMeta: IRepoMeta = {
  host: 'https://github.com',
  owner: 'ones-io',
  repository: 'committed',
};

const defaultTag: ISemanticVersionTag = {
  name: '@ones-io/main',
  versionStr: '0.1.0',
  major: 0,
  minor: 1,
  patch: 0,
  prerelease: undefined,
};

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
  content: 'feat: test',
};

const commitContentA = {
  type: 'feat',
  scope: undefined,
  description: 'test',
  body: undefined,
  footer: undefined,
  proposedVersionBump: 'major' as VersionBump,
};

const releaseCommitA: IRelease['commits'][0] = {
  meta: commitMetaA,
  content: commitContentA,
};

const commitMetaB = {
  hash: 'asdfasdfasdfa',
  author: 'b',
  ts: '123123122',
  content: 'fix: test',
};

const commitContentB = {
  type: 'fix',
  scope: undefined,
  description: 'test',
  body: undefined,
  footer: undefined,
  proposedVersionBump: 'minor' as VersionBump,
};

const releaseCommitB: IRelease['commits'][0] = {
  meta: commitMetaB,
  content: commitContentB,
};

export default {
  defaultRepoMeta,
  defaultTag,
  defaultPackageMeta,
  commitMetaA,
  commitContentA,
  releaseCommitA,
  commitMetaB,
  commitContentB,
  releaseCommitB,
};
