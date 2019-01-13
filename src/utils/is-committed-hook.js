/**
 * Async File System
 *
 * Exports a version of fs using utils.promisify
 * TODO: replace with async version of fs in node 10 when
 * node 8 is deprecated
 */

const afs = require('./afs');

const { commitedHeader } = require('./strings');

function isCommittedHook(path) {
  return afs
    .readFile(path, 'utf8')
    .then((fileContent) => fileContent.includes(commitedHeader))
    .catch(() => false);
}

module.exports = isCommittedHook;
