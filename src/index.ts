// Export main classes for programmatic usage
export { MCPAnalyzer } from './core/analyzer';
export { DocumentationGenerator } from './core/generator';
export { DevServer } from './core/dev-server';
export { Logger, LogLevel } from './utils/logger';
export { FileUtils } from './utils/file-utils';

// Export types
export type {
  MCPServerInfo,
  MCPTool,
  MCPResource,
  MCPPrompt
} from './core/analyzer';

export type { GeneratorOptions } from './core/generator';
export type { DevServerOptions } from './core/dev-server';