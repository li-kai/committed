import path from 'path';
/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import { promisify } from 'util';
import Terser, { ECMA } from 'terser';

import prettyBytes from './pretty-bytes';

const options = {
  warnings: true,
  mangle: { toplevel: true },
  ecma: 6 as ECMA,
};

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

function uglify([destFilePath, srcFilePath]: string[]) {
  let srcFileSize: string;
  let destFileSize: string;

  readFileAsync(path.resolve(srcFilePath), 'utf-8')
    .then((data) => {
      const result = Terser.minify(data, options);
      if (!result.code) throw new Error('No code');

      srcFileSize = prettyBytes(data.length);
      destFileSize = prettyBytes(result.code.length);

      if (result.error) throw result.error;
      if (result.warnings) console.warn(result.warnings);

      return writeFileAsync(path.resolve(destFilePath), result.code);
    })
    .then(() => {
      console.log(
        `src : ${srcFilePath} [${srcFileSize}]
dest: ${destFilePath} [${destFileSize}]`
      );
    })
    .catch((err) => {
      if (err) throw err;
    });
}

const code = {
  './bin/index.js': './src/index.js',
  './bin/lint.js': './src/lint.js',
};

fs.mkdir(path.resolve('./bin'), () => {
  Promise.all(Object.entries(code).map(uglify));
});
