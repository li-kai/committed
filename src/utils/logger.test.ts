import logger from './logger';

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
    logger.fatal(msg);
    expect(console.error).toHaveBeenCalledWith(msg);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
