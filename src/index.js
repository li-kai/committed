#!/usr/bin/env node

const childProcess = require('child_process');

const utils = {
  error(message, exit = true) {
    console.error(message);
    if (exit) process.exit(1);
  },
};

/**
 * Ensure that git is installed before proceeding
 */
childProcess.execFile('git', ['--version'], (error) => {
  if (error) {
    utils.error('Program “git” not found in PATH, did you install git?');
  }
});
