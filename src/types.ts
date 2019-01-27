export type VersionBump = 'major' | 'minor' | 'patch';

export interface ICommitMeta {
  hash: string;
  author: string;
  ts: string;
}

export interface ICommit {
  meta: ICommitMeta;
  rawString: string;
}

export interface IConventionalCommit extends ICommit {
  type: string;
  scope: string | undefined;
  description: string;
  body: string | undefined;
  footer: string | undefined;
  versionBumpType: VersionBump;
  hasBreakingChange: boolean;
}

export interface ISemanticVersionTag {
  name: string | undefined;
  major: number;
  minor: number;
  patch: number;
  preReleaseName: string | undefined;
  preReleaseVersion: number | undefined;
  isPreRelease: boolean;
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

export interface ISemanticRelease {
  context: IPackageMeta & IRepoMeta;
  version: ISemanticVersionTag;
  commits: IConventionalCommit[];
}

export interface IConfig {
  dryRun: boolean;
  genChangelog: (
    currentChangelog: string,
    release: ISemanticRelease
  ) => Promise<string> | string;
}
