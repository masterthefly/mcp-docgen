import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { MCPAnalyzer } from '../core/analyzer';
import { DocumentationGenerator } from '../core/generator';

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
      console.log(chalk.blue('🔍 Analyzing MCP server...'));
      
      const analyzer = new MCPAnalyzer();
      const serverInfo = await analyzer.analyze(path.resolve(serverPath));
      
      console.log(chalk.green('✅ Server analysis complete'));
      console.log(chalk.blue('📝 Generating documentation...'));
      
      const generator = new DocumentationGenerator({
        template: options.template,
        format: options.format,
        outputDir: path.resolve(options.output),
        verbose: options.verbose
      });
      
      await generator.generate(serverInfo);
      
      console.log(chalk.green('🎉 Documentation generated successfully!'));
      console.log(chalk.gray(`Output: ${options.output}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Generation failed:'), error.message);
      process.exit(1);
    }
  });