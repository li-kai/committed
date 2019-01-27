import genChangelog from '../changelog/genChangelog';
import { IConfig } from '../types';

const defaultConfig: IConfig = {
  dryRun: false,
  genChangelog,
};

export default defaultConfig;
