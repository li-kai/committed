#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const util = require('util');
const path = require('path');

const report = {
  error(message, exit = true) {
    console.error(message);
    if (exit) process.exit(1);
  },
};

const args = process.argv;

if (args.length !== 3) {
  report.error('Path to commit message not found');
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

function validator(key, regex, errorMsg) {
  return (config) => {
    const res = regex.exec(config.string);
    if (res === null) {
      if (!errorMsg) {
        return { ...config };
      }

      return {
        ...config,
        errors: config.errors.concat(errorMsg),
      };
    }

    const value = res[0];
    const endIndex = res.index + value.length;
    const restOfString = config.string.slice(endIndex);

    const result = {
      ...config,
      string: restOfString,
      matches: { ...config.matches },
    };

    if (key) {
      result.matches[key] = value;
    }

    return result;
  };
}

const typesValidator = validator(
  'type',
  new RegExp(`^${types.join('|')}`),
  `commit must start with the following types:
  feat:      A new feature
  fix:       A bug fix
  docs:      Documentation only changes
  style:     Markup-only changes (white-space, formatting, missing semi-colons, etc)
  refactor:  A code change that neither fixes a bug or adds a feature
  perf:      A code change that improves performance
  test:      Adding or updating tests
  chore:     Build process or auxiliary tool changes
  ci:        CI related changes`
);
const scopeValidator = validator('scope', /\(([\w+])\)/, '');
const colonSpaceValidator = validator(
  '',
  /(: )/,
  'colon and a space is missing'
);
const descriptionValidator = validator(
  'description',
  /^(\w.+)$/,
  `description is missing or has redundant whitespace`
);
const newLineValidator = validator('', /(\r\n|\r|\n)^$/, `line must be empty`);

function compose(fns) {
  return (config) => fns.reduce((pre, fn) => fn(pre), config);
}

function lintCommitMessage(message) {
  // Remove right EOL
  const lines = message.trimRight().split(os.EOL);
  const headerValidator = compose([
    typesValidator,
    scopeValidator,
    colonSpaceValidator,
    descriptionValidator,
  ]);

  const errors = [];

  if (lines.length >= 1) {
    const result = headerValidator({
      string: lines[0],
      matches: {},
      errors: [],
    });

    if (result.errors.length) {
      errors.push(
        `header expects "<type>[optional scope]: <description>" format`
      );
      errors.push(...result.errors);
    }
  }
  if (lines.length >= 2) {
    const result = newLineValidator({
      string: lines[1],
      matches: {},
      errors: [],
    });
    errors.push(...result.errors);
  }

  if (errors.length) {
    report.error(errors.join(os.EOL));
  }
}

readFileAsync(path.normalize(commitMessagePath))
  .then((data) => {
    const msg = data.toString().trimRight();
    lintCommitMessage(msg);
  })
  .catch((err) => report.error(err.message))
  .then(() => {
    process.exit(0);
  });
