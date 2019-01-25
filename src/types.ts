export type VersionBump = 'major' | 'minor' | 'patch';

export interface ICommitMeta {
  hash: string;
  author: string;
  ts: string;
  content: string;
}

export interface IConventionalCommit {
  type: string;
  scope: string | undefined;
  description: string;
  body: string | undefined;
  footer: string | undefined;
  proposedVersionBump: VersionBump;
}

export interface ISemanticVersionTag {
  name: string | undefined;
  major: number;
  minor: number;
  patch: number;
  preReleaseName: string | undefined;
  preReleaseVersion: number | undefined;
  toString(): string;
  getVersionString(): string;
  bump(type: VersionBump): ISemanticVersionTag;
}

export interface IRepoMeta {
  host: string;
  owner: string;
  repository: string;
}

export interface IPackageMeta {
  dir: string;
  name: string;
  version: string;
  private: boolean;
  previousTag: ISemanticVersionTag;
}

export interface IRelease {
  context: IPackageMeta & IRepoMeta;
  version: ISemanticVersionTag;
  commits: ({ meta: ICommitMeta; content: IConventionalCommit })[];
}

export interface IConfig {
  dryRun: boolean;
  genChangelog: (
    currentChangelog: string,
    release: IRelease
  ) => Promise<string> | string;
}
