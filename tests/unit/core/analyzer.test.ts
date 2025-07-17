import { MCPAnalyzer } from '../../../src/core/analyzer';

describe('MCPAnalyzer', () => {
  let analyzer: MCPAnalyzer;
  
  beforeEach(() => {
    analyzer = new MCPAnalyzer();
  });
  
  test('should create analyzer instance', () => {
    expect(analyzer).toBeInstanceOf(MCPAnalyzer);
  });
  
  test('should throw error for unimplemented analyze method', async () => {
    await expect(analyzer.analyze('/fake/path')).rejects.toThrow(
      'MCP analysis not yet implemented'
    );
  });
});