#!/usr/bin/env node
// @ones-io/committed
const fs = require('fs');
const os = require('os');
const util = require('util');
const path = require('path');
const { makeValidator } = require('./validation');
const report = require('./utils/report');
const commitTypes = require('./utils/commit-types');
const strings = require('./utils/strings');

const args = process.argv;

if (args.length !== 3) {
  report.error('Path to commit message not found');
}

const commitMessagePath = args[2];

const readFileAsync = util.promisify(fs.readFile);

function compose(fns) {
  return (config) => fns.reduce((pre, fn) => fn(pre), config);
}
const typesValidator = makeValidator({
  name: 'type',
  pattern: new RegExp(`^${commitTypes.types.join('|')}`),
  errorMsg: strings.typeTokenizeError,
});
const scopeValidator = makeValidator({
  name: 'scope',
  pattern: /\(([\w+])\)/,
  errorMsg: '',
});
const colonSpaceValidator = makeValidator({
  name: '',
  pattern: /(: )/,
  errorMsg: 'colon and a space is missing',
});
const descriptionValidator = makeValidator({
  name: 'description',
  pattern: /^(\w.+)$/,
  errorMsg: `description is missing or has redundant whitespace`,
});
const newLineValidator = makeValidator({
  name: '',
  pattern: /^(\r\n|\r|\n)$/,
  errorMsg: `line must be empty`,
});

function lintHeader(headerConfig) {
  const headerValidator = compose([
    typesValidator,
    scopeValidator,
    colonSpaceValidator,
    descriptionValidator,
  ]);

  const result = headerValidator(headerConfig);

  if (result.errors.length) {
    result.errors.unshift(
      `header expects "<type>[optional scope]: <description>" format`
    );
  }
  return result;
}

function lintSection(bodyConfig, section) {
  const breakingChange = 'BREAKING CHANGE';
  const breakingChangeRegex = /^BREAKING CHANGE: \w/;

  const { string } = bodyConfig;
  if (string.includes(breakingChange) && !breakingChangeRegex.test(string)) {
    return {
      ...bodyConfig,
      errors: bodyConfig.errors.concat(
        `breaking change must be at start of ${section}`
      ),
    };
  }
  return bodyConfig;
}

function lintCommitMessage(message) {
  // Remove right EOL
  const lines = message.trimRight().split(os.EOL);
  const errors = [];

  if (lines.length >= 1) {
    const result = lintHeader({
      string: lines[0],
      matches: {},
      errors: [],
    });
    errors.push(...result.errors);
  }
  if (lines.length >= 2) {
    const result = newLineValidator({
      string: lines[1],
      matches: {},
      errors: [],
    });
    errors.push(...result.errors);
  }

  if (lines.length >= 3) {
    const bodyAndFooter = lines
      .slice(2)
      .join('')
      .split(os.EOL);

    if (bodyAndFooter.length >= 1) {
      const result = lintSection(
        {
          string: bodyAndFooter[0],
          matches: {},
          errors: [],
        },
        'body'
      );
      errors.push(...result.errors);
    }

    if (bodyAndFooter.length === 2) {
      const result = lintSection(
        {
          string: bodyAndFooter[1],
          matches: {},
          errors: [],
        },
        'footer'
      );
      errors.push(...result.errors);
    } else if (bodyAndFooter.length > 2) {
      errors.push('only body and footer sections are allowed');
    }
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
