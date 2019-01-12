#!/usr/bin/env node

const childProcess = require('child_process');
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const util = require('util');
const path = require('path');

const utils = {
  error(message, exit = true) {
    console.error(message);
    if (exit) process.exit(1);
  },
};

const args = process.argv;

if (args.length !== 3) {
  utils.error('Path to commit message not found');
}

const commitMessagePath = args[2];

const readFileAsync = util.promisify(fs.readFile);

const types = [
  'build',
  'ci',
  'chore',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];

function typesValidator(config) {
  const typesRegex = new RegExp(types.join('|'));

  const res = typesRegex.exec(config.string);
  if (res === null) {
    const errorMsg = `commit must start with the following types: ${types.join(
      ', '
    )}`;

    return {
      ...config,
      errors: config.errors.concat(errorMsg),
    };
  }

  return {
    ...config,
    string: config.string.slice(res.index + res[0].length),
    matches: {
      ...config.matches,
      type: res[0],
    },
  };
}

function scopeValidator(config) {
  const typesRegex = /(\([\w+]\))/;

  const res = typesRegex.exec(config.string);
  if (res === null) {
    return config;
  }

  return {
    ...config,
    string: config.string.slice(res.index + res[0].length),
    matches: {
      ...config.matches,
      scope: res[0],
    },
  };
}

function colonSpaceValidator(config) {
  const res = config.string.startsWith(': ');
  if (!res) {
    const errorMsg = '": " must exist in the header';
    return {
      ...config,
      errors: config.errors.concat(errorMsg),
    };
  }

  return {
    ...config,
    string: config.string.slice(2),
  };
}

function subjectValidator(config) {
  const subjectRegex = /^(\w.+)$/;

  const res = subjectRegex.exec(config.string);
  if (res === null) {
    const errorMsg = `commit must contain a message`;

    return {
      ...config,
      errors: config.errors.concat(errorMsg),
    };
  }

  return {
    ...config,
    string: config.string.slice(res.index + res[0].length),
    matches: {
      ...config.matches,
      subject: res[0],
    },
  };
}

function compose(fns) {
  return (config) => fns.reduce((pre, fn) => fn(pre), config);
}

function lintCommitMessage(message) {
  // Remove right EOL
  const lines = message.trimRight().split(os.EOL);
  if (lines.length >= 1) {
    const validator = compose([
      typesValidator,
      scopeValidator,
      colonSpaceValidator,
      subjectValidator,
    ]);

    const result = validator({
      string: lines[0],
      matches: {},
      errors: [],
    });

    if (result.errors.length) {
      utils.error(result.errors.join(os.EOL));
    }
  } else if (lines.length === 3) {
  }
}

readFileAsync(path.normalize(commitMessagePath))
  .then((data) => {
    const msg = data.toString().trimRight();
    lintCommitMessage(msg);
  })
  .catch((err) => utils.error(err.message))
  .then(() => {
    console.log('object');
    process.exit(0);
  });

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   terminal: false,
// });

// const utils = {
//   error(message, exit = true) {
//     console.error(message);
//     if (exit) process.exit(1);
//   },
// };

// rl.on('line', (line) => {
//   console.log(`Received: ${line}`);
// });
