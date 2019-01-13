#!/usr/bin/env node

const childProcess = require('child_process');
const report = require('./report');

/**
 * Ensure that git is installed before proceeding
 */
childProcess.execFile('git', ['--version'], (error) => {
  if (error) {
    report.error('Program “git” not found in PATH, did you install git?');
  }
});
