import { PluginManager } from '../plugins/manager';
import { LanguageDetector } from './language-detector';
import { DocumentationElement, Language } from '../types/core';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface GeneratorOptions {
  outputDir: string;
  outputFormat: 'markdown' | 'html' | 'json';
  includePrivate: boolean;
  configFile?: string;
}

export class DocumentGenerator {
  private pluginManager: PluginManager;
  private languageDetector: LanguageDetector;

  constructor() {
    this.pluginManager = new PluginManager();
    this.languageDetector = new LanguageDetector();
  }

  async generateDocumentation(
    sourceDir: string, 
    options: GeneratorOptions
  ): Promise<void> {
    try {
      // Discover source files
      const files = await this.discoverFiles(sourceDir);
      
      // Process each file
      const allElements: DocumentationElement[] = [];
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const language = this.languageDetector.detect(file, content);
        
        if (!this.languageDetector.isSupported(language)) {
          console.warn(`Skipping unsupported language file: ${file}`);
          continue;
        }

        try {
          const elements = await this.processFile(file, content, language);
          allElements.push(...elements);
        } catch (error: any) {
          console.error(`Error processing file ${file}:`, error.message);
        }
      }

      // Generate documentation
      await this.generateOutput(allElements, options);
      
    } catch (error: any) {
      throw new Error(`Documentation generation failed: ${error.message}`);
    }
  }

  private async discoverFiles(sourceDir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scanDirectory(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip common directories to ignore
          if (!['node_modules', '.git', '__pycache__', '.pytest_cache', 'dist', 'build'].includes(entry.name)) {
            await scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if file has a supported extension
          const ext = path.extname(entry.name).toLowerCase();
          if (['.js', '.ts', '.py', '.go', '.rs', '.java'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    await scanDirectory(sourceDir);
    return files;
  }

  private async processFile(
    filePath: string, 
    content: string, 
    language: Language
  ): Promise<DocumentationElement[]> {
    const plugin = await this.pluginManager.getPlugin(language);
    
    // Parse the file
    const parseResult = await plugin.parse(content, filePath);
    
    // Extract documentation elements
    const elements = await plugin.extract(parseResult);
    
    // Transform elements
    const transformedElements = await plugin.transform(elements);
    
    return transformedElements;
  }

  private async generateOutput(
    elements: DocumentationElement[], 
    options: GeneratorOptions
  ): Promise<void> {
    // Create output directory
    await fs.mkdir(options.outputDir, { recursive: true });
    
    switch (options.outputFormat) {
      case 'markdown':
        await this.generateMarkdown(elements, options);
        break;
      case 'html':
        await this.generateHTML(elements, options);
        break;
      case 'json':
        await this.generateJSON(elements, options);
        break;
    }
  }

  private async generateMarkdown(
    elements: DocumentationElement[], 
    options: GeneratorOptions
  ): Promise<void> {
    const markdown = this.elementsToMarkdown(elements);
    const outputPath = path.join(options.outputDir, 'README.md');
    await fs.writeFile(outputPath, markdown);
  }

  private async generateHTML(
    elements: DocumentationElement[], 
    options: GeneratorOptions
  ): Promise<void> {
    const html = this.elementsToHTML(elements);
    const outputPath = path.join(options.outputDir, 'index.html');
    await fs.writeFile(outputPath, html);
  }

  private async generateJSON(
    elements: DocumentationElement[], 
    options: GeneratorOptions
  ): Promise<void> {
    const outputPath = path.join(options.outputDir, 'documentation.json');
    await fs.writeFile(outputPath, JSON.stringify(elements, null, 2));
  }

  private elementsToMarkdown(elements: DocumentationElement[]): string {
    let markdown = '# MCP Server Documentation\n\n';
    
    // Group elements by type
    const tools = elements.filter(e => e.type === 'tool');
    const resources = elements.filter(e => e.type === 'resource');
    const classes = elements.filter(e => e.type === 'class');
    const functions = elements.filter(e => e.type === 'function');

    if (tools.length > 0) {
      markdown += '## Tools\n\n';
      for (const tool of tools) {
        markdown += `### ${tool.name}\n\n`;
        markdown += `**Signature:** \`${tool.signature}\`\n\n`;
        if (tool.documentation) {
          markdown += `${tool.documentation}\n\n`;
        }
        
        if (tool.parameters.length > 0) {
          markdown += '**Parameters:**\n\n';
          for (const param of tool.parameters) {
            markdown += `- \`${param.name}\` (${param.type.name}): ${param.description || ''}\n`;
          }
          markdown += '\n';
        }
        
        if (tool.returnType) {
          markdown += `**Returns:** ${tool.returnType.name}\n\n`;
        }
        
        markdown += '---\n\n';
      }
    }

    if (resources.length > 0) {
      markdown += '## Resources\n\n';
      for (const resource of resources) {
        markdown += `### ${resource.name}\n\n`;
        markdown += `**Signature:** \`${resource.signature}\`\n\n`;
        if (resource.documentation) {
          markdown += `${resource.documentation}\n\n`;
        }
        markdown += '---\n\n';
      }
    }

    if (classes.length > 0) {
      markdown += '## Classes\n\n';
      for (const cls of classes) {
        markdown += `### ${cls.name}\n\n`;
        markdown += `**Signature:** \`${cls.signature}\`\n\n`;
        if (cls.documentation) {
          markdown += `${cls.documentation}\n\n`;
        }
        markdown += '---\n\n';
      }
    }

    if (functions.length > 0) {
      markdown += '## Functions\n\n';
      for (const func of functions) {
        markdown += `### ${func.name}\n\n`;
        markdown += `**Signature:** \`${func.signature}\`\n\n`;
        if (func.documentation) {
          markdown += `${func.documentation}\n\n`;
        }
        markdown += '---\n\n';
      }
    }

    return markdown;
  }

  private elementsToHTML(elements: DocumentationElement[]): string {
    // Basic HTML template - can be enhanced with CSS/JS
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MCP Server Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .tool { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }
        .signature { background: #f5f5f5; padding: 10px; font-family: monospace; }
        .parameter { margin: 5px 0; }
    </style>
</head>
<body>
    <h1>MCP Server Documentation</h1>
    ${elements.map(el => `
        <div class="tool">
            <h2>${el.name}</h2>
            <div class="signature">${el.signature}</div>
            <p>${el.documentation}</p>
            ${el.parameters.length > 0 ? `
                <h3>Parameters:</h3>
                <ul>
                    ${el.parameters.map(p => `
                        <li class="parameter">
                            <strong>${p.name}</strong> (${p.type.name}): ${p.description || ''}
                        </li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>
    `;
    
    return html;
  }

  async cleanup(): Promise<void> {
    await this.pluginManager.cleanup();
  }
}