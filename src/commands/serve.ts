import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { DevServer } from '../core/dev-server';
import { FileUtils } from '../utils/file-utils';
import { Logger } from '../utils/logger';

const logger = new Logger();

export const serveCommand = new Command('serve')
  .description('Serve documentation locally with hot reload')
  .argument('<docs-dir>', 'Documentation directory')
  .option('-p, --port <number>', 'Port number', '3000')
  .option('--host <host>', 'Host address', 'localhost')
  .option('--open', 'Open browser automatically')
  .option('--verbose', 'Verbose output')
  .action(async (docsDir: string, options) => {
    try {
      const resolvedDocsDir = path.resolve(docsDir);
      
      // Check if docs directory exists
      if (!(await FileUtils.exists(resolvedDocsDir))) {
        throw new Error(`Documentation directory not found: ${docsDir}`);
      }
      
      logger.info(`📂 Serving documentation from: ${resolvedDocsDir}`);
      
      const server = new DevServer({
        docsDir: resolvedDocsDir,
        port: parseInt(options.port),
        host: options.host,
        open: options.open
      });
      
      await server.start();
      
      logger.success('🚀 Documentation server started!');
      console.log(chalk.blue(`📖 Documentation available at: http://${options.host}:${options.port}`));
      console.log(chalk.gray('Press Ctrl+C to stop the server'));
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        logger.info('\n🛑 Shutting down server...');
        logger.success('👋 Server stopped');
        process.exit(0);
      });
      
    } catch (error: any) {
      logger.error('❌ Server failed to start:', error.message);
      if (options.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });