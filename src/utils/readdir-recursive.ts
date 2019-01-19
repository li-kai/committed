import path from 'path';
import afs from './afs';

const NODE_PATHS = /^(?:\.|node_modules)/;

/* eslint-disable no-await-in-loop, no-continue, no-plusplus */
async function readdirRecursive(startPath: string) {
  const results = [];

  const queue = [startPath];

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

export default readdirRecursive;
