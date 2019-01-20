#!/usr/bin/env node
// @ones-io/committed
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import commitTypes from './utils/commit-types';
import report from './utils/report';
import * as strings from './utils/strings';
import { Config, makeValidator } from './validation';

const args = process.argv;

if (args.length !== 3) {
  report.error('Path to commit message not found');
}

const commitMessagePath = args[2];

const readFileAsync = util.promisify(fs.readFile);

function compose<T>(fns: Array<(input: T) => T>) {
  return (config: T) => fns.reduce((pre, fn) => fn(pre), config);
}

const typesValidator = makeValidator({
  errorMsg: strings.typeTokenizeError,
  name: 'type',
  pattern: new RegExp(`^${commitTypes.types.join('|')}`),
});
const scopeValidator = makeValidator({
  errorMsg: '',
  name: 'scope',
  pattern: /\(([\w+])\)/,
});
const colonSpaceValidator = makeValidator({
  errorMsg: 'colon and a space is missing',
  name: '',
  pattern: /(: )/,
});
const descriptionValidator = makeValidator({
  errorMsg: `description is missing or has redundant whitespace`,
  name: 'description',
  pattern: /^(\w.+)$/,
});
const newLineValidator = makeValidator({
  errorMsg: `line must be empty`,
  name: '',
  pattern: /^(\r\n|\r|\n)$/,
});

function lintHeader(headerConfig: Config) {
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

function lintSection(bodyConfig: Config, section: string) {
  const breakingChange = 'BREAKING CHANGE';
  const breakingChangeRegex = /^BREAKING CHANGE: \w/;

  const { string: str } = bodyConfig;
  if (str.includes(breakingChange) && !breakingChangeRegex.test(str)) {
    return {
      ...bodyConfig,
      errors: bodyConfig.errors.concat(
        `breaking change must be at start of ${section}`
      ),
    };
  }
  return bodyConfig;
}

function lintCommitMessage(message: string) {
  // Remove right EOL
  const lines = message.trimRight().split(os.EOL);
  const errors = [];

  if (lines.length >= 1) {
    const result = lintHeader({
      errors: [],
      matches: {},
      string: lines[0],
    });
    errors.push(...result.errors);
  }
  if (lines.length >= 2) {
    const result = newLineValidator({
      errors: [],
      matches: {},
      string: lines[1],
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
          errors: [],
          matches: {},
          string: bodyAndFooter[0],
        },
        'body'
      );
      errors.push(...result.errors);
    }

    if (bodyAndFooter.length === 2) {
      const result = lintSection(
        {
          errors: [],
          matches: {},
          string: bodyAndFooter[1],
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
