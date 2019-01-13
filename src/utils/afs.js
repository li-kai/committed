/**
 * Async File System
 *
 * Exports a version of fs using utils.promisify
 * TODO: replace with async version of fs in node 10 when
 * node 8 is deprecated
 */

const fs = require('fs');
const { promisify } = require('util');

module.exports = {
  ...fs,
  readFile: promisify(fs.readFile),
  lstat: promisify(fs.lstat),
  readdir: promisify(fs.readdir),
  access: promisify(fs.access),
};
