import path from 'path';
import afs from './afs';

/**
 * Traverses upwards from cwd to find file name
 *
 * @param {string} filename
 * @param {{ cwd: string }} options
 */

type Options = {
  cwd?: string;
};
function findUp(filename: string, options?: Options) {
  const startDir = path.resolve((options && options.cwd) || '');

  const { root } = path.parse(startDir);

  async function find(dir: string): Promise<string | null> {
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

export default findUp;
