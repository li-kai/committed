import { IConfig } from '../types';
import genChangelog from '../changelog/genChangelog';

const defaultConfig: IConfig = {
  dryRun: false,
  genChangelog,
};

export default defaultConfig;
