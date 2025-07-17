import path from 'path';
import { FileUtils } from '../utils/file-utils';
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
    await FileUtils.ensureDir(this.options.outputDir);
    
    if (this.options.format === 'markdown') {
      await this.generateMarkdown(serverInfo);
    } else if (this.options.format === 'json') {
      await this.generateJSON(serverInfo);
    } else {
      await this.generateHTML(serverInfo);
    }
  }
  
  private async generateMarkdown(serverInfo: MCPServerInfo): Promise<void> {
    const content = `# ${serverInfo.name}

${serverInfo.description || 'No description provided'}

## Version
${serverInfo.version}

## Tools

${serverInfo.tools.map(tool => `### ${tool.name}
${tool.description || 'No description'}

**Input Schema:**
\`\`\`json
${JSON.stringify(tool.inputSchema, null, 2)}
\`\`\`
`).join('\n')}

## Resources
${serverInfo.resources.length === 0 ? 'No resources defined' : serverInfo.resources.map(r => `- ${r.uri}`).join('\n')}

## Prompts
${serverInfo.prompts.length === 0 ? 'No prompts defined' : serverInfo.prompts.map(p => `- ${p.name}`).join('\n')}
`;
    
    await FileUtils.writeFile(
      path.join(this.options.outputDir, 'README.md'),
      content
    );
  }
  
  private async generateJSON(serverInfo: MCPServerInfo): Promise<void> {
    await FileUtils.writeFile(
      path.join(this.options.outputDir, 'server-info.json'),
      JSON.stringify(serverInfo, null, 2)
    );
  }
  
  private async generateHTML(serverInfo: MCPServerInfo): Promise<void> {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>${serverInfo.name} Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .tool { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>${serverInfo.name}</h1>
    <p>${serverInfo.description || 'No description provided'}</p>
    <p><strong>Version:</strong> ${serverInfo.version}</p>
    
    <h2>Tools</h2>
    ${serverInfo.tools.map(tool => `
        <div class="tool">
            <h3>${tool.name}</h3>
            <p>${tool.description || 'No description'}</p>
            <h4>Input Schema:</h4>
            <pre>${JSON.stringify(tool.inputSchema, null, 2)}</pre>
        </div>
    `).join('')}
    
    <h2>Resources</h2>
    ${serverInfo.resources.length === 0 ? '<p>No resources defined</p>' : 
      '<ul>' + serverInfo.resources.map(r => `<li>${r.uri}</li>`).join('') + '</ul>'}
    
    <h2>Prompts</h2>
    ${serverInfo.prompts.length === 0 ? '<p>No prompts defined</p>' : 
      '<ul>' + serverInfo.prompts.map(p => `<li>${p.name}</li>`).join('') + '</ul>'}
</body>
</html>`;
    
    await FileUtils.writeFile(
      path.join(this.options.outputDir, 'index.html'),
      html
    );
  }
}