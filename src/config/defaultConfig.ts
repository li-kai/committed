import conventionalChangelog from '../changelog/conventionalChangelog';
import { IConfig } from '../types';

const defaultConfig: IConfig = {
  dryRun: false,
  genChangelog: conventionalChangelog.generate,
};

export default defaultConfig;
