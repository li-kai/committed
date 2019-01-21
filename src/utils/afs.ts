/**
 * Async File System
 *
 * Exports a version of fs using utils.promisify
 * TODO: replace with async version of fs in node 10 when
 * node 8 is deprecated
 */

import fs from 'fs';
import { promisify } from 'util';

export default {
  ...fs,
  chmod: promisify(fs.chmod),
  symlink: promisify(fs.symlink),
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  lstat: promisify(fs.lstat),
  mkdir: promisify(fs.mkdir),
  readdir: promisify(fs.readdir),
  access: promisify(fs.access),
};
