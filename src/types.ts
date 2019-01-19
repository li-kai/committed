export type VersionBump = 'major' | 'minor' | 'patch';

export interface IProposedVersionBump {
  proposedVersionBump: VersionBump;
}

export interface ICommitMeta {
  hash: string;
  author: string;
  ts: string;
  content: string;
}

export interface ICommit extends IProposedVersionBump {
  type: string;
  scope: string | undefined;
  description: string;
  body: string | undefined;
  footer: string | undefined;
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
  dir: string;
  name: string;
  version: string;
  private: boolean;
  previousVersion: ISemanticVersionTag;
}
