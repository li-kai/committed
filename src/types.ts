export type VersionBump = 'major' | 'minor' | 'patch';

export interface ICommitMeta {
  hash: string;
  author: string;
  ts: string;
  content: string;
}

export interface ICommitContent {
  type: string;
  scope: string | undefined;
  description: string;
  body: string | undefined;
  footer: string | undefined;
  proposedVersionBump: VersionBump;
}

export interface ISemanticVersionTag {
  name: string | undefined;
  versionStr: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string | undefined;
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
  commits: ({ meta: ICommitMeta; content: ICommitContent })[];
}

export interface IConfig {
  dryRun: boolean;
  genChangelog: (
    currentChangelog: string,
    release: IRelease
  ) => Promise<string> | string;
}
