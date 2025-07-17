export interface MCPServerInfo {
  name: string;
  version: string;
  description?: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  metadata: Record<string, any>;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: any;
  outputSchema?: any;
}

export interface MCPResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: any[];
}

export class MCPAnalyzer {
  async analyze(serverPath: string): Promise<MCPServerInfo> {
    // TODO: Implement MCP server analysis
    // This will be implemented in Phase 1
    throw new Error('MCP analysis not yet implemented');
  }
}