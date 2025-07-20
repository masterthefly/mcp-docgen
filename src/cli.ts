#!/usr/bin/env node

import { Command } from 'commander';
import { DocumentGenerator } from '../src/core/document-generator';
import * as path from 'path';

const program = new Command();

program
  .name('mcp-docgen')
  .description('Generate documentation for MCP servers')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate documentation for an MCP server')
  .argument('<source>', 'Source directory containing MCP server code')
  .option('-o, --output <dir>', 'Output directory for generated documentation', './docs')
  .option('-f, --format <format>', 'Output format (markdown|html|json)', 'markdown')
  .option('--include-private', 'Include private methods and functions', false)
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (source: string, options) => {
    try {
      const generator = new DocumentGenerator();
      
      const sourcePath = path.resolve(source);
      const outputPath = path.resolve(options.output);
      
      console.log(`Generating documentation for: ${sourcePath}`);
      console.log(`Output directory: ${outputPath}`);
      console.log(`Output format: ${options.format}`);
      
      await generator.generateDocumentation(sourcePath, {
        outputDir: outputPath,
        outputFormat: options.format,
        includePrivate: options.includePrivate,
        configFile: options.config
      });
      
      console.log('Documentation generated successfully!');
      
      await generator.cleanup();
    } catch (error: any) {
      console.error('Error generating documentation:', error.message);
      process.exit(1);
    }
  });

program.parse();