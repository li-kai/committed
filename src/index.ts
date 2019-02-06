#!/usr/bin/env node
import path from 'path';
import * as commands from './commands';

type CommandStruct = {
  description: string;
  // tslint:disable-next-line:ban-types
  fn: Function;
  args?: string[];
};

class CommandLineProgram {
  private commandMap: { [key: string]: CommandStruct } = {};

  constructor() {
    this.command('help', 'Displays help information', () => {
      const keys = Object.keys(this.commandMap);
      const maxLength = Math.max(...keys.map((key) => key.length)) + 4;
      const commandStr = keys
        .map((key) => {
          const desc = this.commandMap[key].description;
          return `  ${key.padEnd(maxLength)}${desc}`;
        })
        .join('\n');
      const helpStr = `Usage: committed <command> [flags]\n\n${commandStr}`;
      console.log(helpStr);
    });
  }

  // tslint:disable-next-line:ban-types
  public command = (command: string, description: string, fn: Function) => {
    this.commandMap[command] = { description, fn };
    return this;
  };

  public execute(processArgs: string[] = process.argv) {
    const args = processArgs.slice(2);

    if (!args.length || ['help', '--help', '-h'].includes(args[0])) {
      this.commandMap.help.fn();
      return;
    }
    const [command, ...flags] = args;
    if (command === '--version' || command === '-v') {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      import(packageJsonPath).then((pkgJson) => {
        console.log(pkgJson.version);
      });
    } else if (command in this.commandMap) {
      this.commandMap[command].fn(...flags);
    } else {
      console.log(
        `Unknown command given: '${command}'. See 'committed --help'.`
      );
    }
  }
}

new CommandLineProgram()
  .command('install', 'Install commit linting git hooks', commands.install)
  .command(
    'uninstall',
    'Uninstall commit linting git hooks',
    commands.uninstall
  )
  .command(
    'changelog',
    'Generate changelogs for every package',
    commands.changelog
  )
  .command('release', 'Release packages', commands.release)
  .execute();
