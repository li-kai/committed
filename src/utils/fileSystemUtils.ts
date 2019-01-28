import path from 'path';
import afs from './afs';

const NODE_PATHS = /^(?:\.|node_modules)/;

async function readdirRecursive(startPath: string) {
  const results = [];

  const queue = [path.resolve(startPath)];

  while (queue.length) {
    // Thanks to check above, pop is never undefined
    const current = queue.pop()!;

    try {
      const contents = await afs.readdir(current, {
        withFileTypes: true,
      });
      if (!contents.length) {
        continue;
      }

      for (const content of contents) {
        const contentPath = path.join(current, content.name);
        if (NODE_PATHS.test(content.name)) {
          continue;
        }

        const isDir = content.isDirectory();

        results.push({ path: contentPath, isDir });
        if (isDir) {
          queue.push(contentPath);
        }
      }
    } catch (error) {
      continue;
    }
  }

  return results;
}

/**
 * Traverses upwards from cwd to find file name
 *
 * @param {string} filename
 * @param {{ cwd: string }} options
 */

type Options = {
  cwd?: string;
};
function findUp(filename: string, options?: Options): Promise<string | null> {
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

async function pathExists(filePath: string) {
  try {
    await afs.access(filePath, afs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

export { readdirRecursive, findUp, pathExists };
