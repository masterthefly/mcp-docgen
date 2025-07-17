import { MCPAnalyzer } from '../../../src/core/analyzer';

describe('MCPAnalyzer', () => {
  let analyzer: MCPAnalyzer;
  
  beforeEach(() => {
    analyzer = new MCPAnalyzer();
  });
  
  test('should create analyzer instance', () => {
    expect(analyzer).toBeInstanceOf(MCPAnalyzer);
  });
  
  test('should throw error for non-existent directory', async () => {
    await expect(analyzer.analyze('/fake/path')).rejects.toThrow(
      'No package.json found in server directory'
    );
  });
  
  test('should analyze valid server directory', async () => {
    // Use the fixture directory we created
    const fixturePath = 'tests/fixtures/sample-mcp-server';
    
    const result = await analyzer.analyze(fixturePath);
    
    expect(result.name).toBe('sample-mcp-server');
    expect(result.version).toBe('1.0.0');
    expect(result.description).toBe('Sample MCP server for testing');
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('sample_tool');
  });
});