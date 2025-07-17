import { MCPServerInfo } from './analyzer';

export interface GeneratorOptions {
  template: string;
  format: 'html' | 'markdown' | 'json';
  outputDir: string;
  verbose?: boolean;
}

export class DocumentationGenerator {
  constructor(private options: GeneratorOptions) {}
  
  async generate(serverInfo: MCPServerInfo): Promise<void> {
    // TODO: Implement documentation generation
    // This will be implemented in Phase 2
    throw new Error('Documentation generation not yet implemented');
  }
}