import childProcess from 'child_process';

function makeProgram(prog: string): (args: string[]) => Promise<string> {
  return (args: string[]) => new Promise((resolve, reject) => {
    childProcess.execFile(prog, args, (err, stdout, stderr) => {
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
