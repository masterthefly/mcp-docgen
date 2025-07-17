#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './commands/generate';
import { serveCommand } from './commands/serve';
import { deployCommand } from './commands/deploy';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('mcp-docgen')
  .description('Generate beautiful documentation for Model Context Protocol servers')
  .version('0.1.0');

// Add commands
program.addCommand(generateCommand);
program.addCommand(serveCommand);
program.addCommand(deployCommand);
program.addCommand(initCommand);

// Parse arguments with error handling
try {
  program.parse();
} catch (error: any) {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}