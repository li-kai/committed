/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const Terser = require('terser');
const prettyBytes = require('./pretty-bytes');

const options = {
  warnings: true,
  mangle: { toplevel: true },
  compress: {
    ecma: 6,
  },
  ecma: 6,
};

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

function uglify([destFilePath, srcFilePath]) {
  let srcFileSize;
  let destFileSize;

  readFileAsync(path.resolve(srcFilePath), 'utf-8')
    .then((data) => {
      const result = Terser.minify(data, options);
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
