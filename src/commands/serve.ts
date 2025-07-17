import { Command } from 'commander';
import chalk from 'chalk';
import { DevServer } from '../core/dev-server';

export const serveCommand = new Command('serve')
  .description('Serve documentation locally with hot reload')
  .argument('<docs-dir>', 'Documentation directory')
  .option('-p, --port <number>', 'Port number', '3000')
  .option('--host <host>', 'Host address', 'localhost')
  .option('--open', 'Open browser automatically')
  .action(async (docsDir: string, options) => {
    try {
      const server = new DevServer({
        docsDir,
        port: parseInt(options.port),
        host: options.host,
        open: options.open
      });
      
      await server.start();
      
      console.log(chalk.green('🚀 Documentation server started!'));
      console.log(chalk.blue(`📖 Docs available at: http://${options.host}:${options.port}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Server failed to start:'), error.message);
      process.exit(1);
    }
  });