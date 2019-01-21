import path from 'path';

function readConfig(rootPath: string) {
  return import(path.join(rootPath, 'committed.config.js')).catch((error) => {
    console.error(error);
  });
}

export default readConfig;
