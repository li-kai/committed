const path = require('path');
const afs = require('./afs');

/**
 * Traverses upwards from cwd to find file name
 *
 * @param {string} filename
 * @param {{ cwd: string }} options
 */
function findUp(filename, options) {
  const startDir = path.resolve((options && options.cwd) || '');

  const { root } = path.parse(startDir);

  async function find(dir) {
    const children = await afs.readdir(dir);
    // Found parent that contains file, return full path
    if (children.includes(filename)) {
      return path.join(dir, filename);
    }
    // Reached top most root path, return null
    if (dir === root) {
      return null;
    }
    // Cannot find parent that contains file, keep going up
    return find(path.dirname(dir));
  }
  return find(startDir).catch(() => null);
}

module.exports = findUp;
