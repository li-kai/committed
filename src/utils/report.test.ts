/* eslint-disable no-global-assign */
import report from './report';

jest.mock('process');
jest.mock('console');

describe('makeValidator', () => {
  const realProcess = process;
  const realConsole = console;

  beforeAll(() => {
    process = { exit: jest.fn() as any } as any;
    console = { error: jest.fn() as any } as any;
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
