/* eslint-disable no-global-assign */
const report = require('./report');

describe('makeValidator', () => {
  const realProcess = process;
  const realConsole = console;

  beforeAll(() => {
    process = {
      exit: jest.fn(),
    };
    console = {
      error: jest.fn(),
    };
  });

  afterAll(() => {
    process = realProcess;
    console = realConsole;
  });

  it('should log and exit the process', () => {
    const msg = 'msg';
    report.error(msg);
    expect(console.error).toHaveBeenCalledWith(msg);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
