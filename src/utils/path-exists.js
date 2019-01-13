const afs = require('./afs');

async function pathExists(filePath) {
  try {
    await afs.access(filePath, afs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = pathExists;
