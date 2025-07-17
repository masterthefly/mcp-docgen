import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { MCPAnalyzer } from '../core/analyzer';
import { DocumentationGenerator } from '../core/generator';
import { Logger } from '../utils/logger';

const logger = new Logger();

export const generateCommand = new Command('generate')
  .description('Generate documentation for MCP server')
  .argument('<server-path>', 'Path to MCP server directory or config file')
  .option('-o, --output <dir>', 'Output directory', './docs')
  .option('-t, --template <name>', 'Documentation template', 'default')
  .option('-f, --format <type>', 'Output format (html|markdown|json)', 'html')
  .option('--no-interactive', 'Disable interactive mode')
  .option('--verbose', 'Verbose output')
  .action(async (serverPath: string, options) => {
    try {
      logger.info('🔍 Analyzing MCP server...');
      
      const analyzer = new MCPAnalyzer();
      const serverInfo = await analyzer.analyze(path.resolve(serverPath));
      
      logger.success('✅ Server analysis complete');
      logger.info('📝 Generating documentation...');
      
      const generator = new DocumentationGenerator({
        template: options.template,
        format: options.format,
        outputDir: path.resolve(options.output),
        verbose: options.verbose
      });
      
      await generator.generate(serverInfo);
      
      logger.success('🎉 Documentation generated successfully!');
      console.log(chalk.gray(`Output: ${options.output}`));
      
    } catch (error: any) {
      logger.error('❌ Generation failed:', error.message);
      if (options.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });