import afs from './afs';

async function pathExists(filePath: string) {
  try {
    await afs.access(filePath, afs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

export default pathExists;
