#!/usr/bin/env node
import path from 'path';
import * as commands from './commands';

type CommandStruct = {
  description: string;
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

  command = (command: string, description: string, fn: Function) => {
    this.commandMap[command] = { description, fn };
    return this;
  };

  execute(processArgs: string[] = process.argv) {
    const args = processArgs.slice(2);

    if (!args.length || ['help', '--help', '-h'].includes(args[0])) {
      this.commandMap.help.fn();
      return;
    }
    const [command, ...flags] = args;
    switch (command) {
      case '--version':
      case '-v': {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        import(packageJsonPath).then((pkgJson) => {
          console.log(pkgJson.version);
        });
        break;
      }
      default: {
        this.commandMap[command].fn(...flags);
      }
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
