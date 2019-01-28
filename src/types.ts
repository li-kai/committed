export type VersionBump = 'major' | 'minor' | 'patch';

export interface ICommitMeta {
  readonly hash: string;
  readonly author: string;
  readonly ts: string;
}

export interface ICommit {
  readonly meta: ICommitMeta;
  readonly rawString: string;
}

export interface IConventionalCommit extends ICommit {
  readonly type: string;
  readonly scope: string | undefined;
  readonly description: string;
  readonly body: string | undefined;
  readonly footer: string | undefined;
  readonly versionBumpType: VersionBump;
}

export interface ISemanticVersionTag {
  readonly name: string | undefined;
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly preReleaseName: string | undefined;
  readonly preReleaseVersion: number | undefined;
}

export interface IRepoMeta {
  host: string;
  owner: string;
  repository: string;
}

export interface IPackageMeta {
  readonly dir: string;
  readonly name: string;
  readonly version: string;
  readonly private: boolean;
  readonly previousTag: ISemanticVersionTag;
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
