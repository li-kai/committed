import childProcess, { ExecFileOptionsWithStringEncoding } from 'child_process';

type ExecFileOpts = Pick<
  ExecFileOptionsWithStringEncoding,
  Exclude<keyof ExecFileOptionsWithStringEncoding, 'encoding'>
>;
function makeProgram(prog: string) {
  return (args: string[], options?: ExecFileOpts): Promise<string> =>
    new Promise((resolve, reject) => {
      const opts: ExecFileOptionsWithStringEncoding = {
        encoding: 'utf8',
        cwd: process.env.INIT_CWD,
        ...options,
      };
      childProcess.execFile(prog, args, opts, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          process.stderr.write(stderr);
          resolve(stdout.trimRight());
        }
      });
    });
}

export { makeProgram };
