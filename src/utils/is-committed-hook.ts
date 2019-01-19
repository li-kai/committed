/**
 * Async File System
 *
 * Exports a version of fs using utils.promisify
 * TODO: replace with async version of fs in node 10 when
 * node 8 is deprecated
 */

import afs from './afs';

import { commitedHeader } from './strings';

function isCommittedHook(path: string) {
  return afs
    .readFile(path, 'utf8')
    .then((fileContent) => fileContent.includes(commitedHeader))
    .catch(() => false);
}

export default isCommittedHook;
