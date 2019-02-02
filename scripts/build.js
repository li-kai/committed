const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const util = require('util');
const prettyBytes = require('./pretty-bytes');

const options = {
  warnings: true,
  mangle: {
    toplevel: true
  },
  ecma: 6,
};

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

function uglify([destFilePath, srcFilePath]) {
  let srcFileSize;
  let destFileSize;

  readFileAsync(path.resolve(srcFilePath), 'utf-8')
    .then((data) => {
      const result = Terser.minify(data, options);
      if (!result.code) {
        throw new Error('No code');
      }

      srcFileSize = prettyBytes(data.length);
      destFileSize = prettyBytes(result.code.length);

      if (result.error) {
        throw result.error;
      }
      if (result.warnings) {
        console.warn(result.warnings);
      }

      return writeFileAsync(path.resolve(destFilePath), result.code);
    })
    .then(() => {
      console.log(
        `src : ${srcFilePath} [${srcFileSize}]
dest: ${destFilePath} [${destFileSize}]`
      );
    })
    .catch((err) => {
      if (err) {
        throw err;
      }
    });
}

const code = {
  './bin/index.js': './dist/index.js',
  './bin/lint.js': './dist/lint.js',
};

fs.mkdir(path.resolve('./bin'), () => {
  Promise.all(Object.entries(code).map(uglify));
});
