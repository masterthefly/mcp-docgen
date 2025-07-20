import { PythonPlugin } from '../plugin';
import { Language } from '../../../types/core';

describe('PythonPlugin', () => {
  let plugin: PythonPlugin;

  beforeEach(() => {
    plugin = new PythonPlugin();
  });

  afterEach(async () => {
    await plugin.cleanup();
  });

  describe('Plugin Configuration', () => {
    it('should have correct language', () => {
      expect(plugin.language).toBe(Language.Python);
    });

    it('should have correct capabilities', () => {
      expect(plugin.capabilities.supportedFeatures).toContain('docstrings');
      expect(plugin.capabilities.supportedFeatures).toContain('decorators');
    });
  });

  describe('Parse Python MCP Server', () => {
    it('should parse function with @mcp.tool decorator', async () => {
      const pythonCode = `
from mcp import FastMCP

mcp = FastMCP("test-server")

@mcp.tool()
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together.
    
    Args:
        a: First number
        b: Second number
        
    Returns:
        Sum of a and b
    """
    return a + b
`;

      const parseResult = await plugin.parse(pythonCode, 'test.py');
      expect(parseResult.elements).toHaveLength(1);
      
      const element = parseResult.elements[0];
      expect(element.type).toBe('tool');
      expect(element.name).toBe('add_numbers');
      expect(element.language).toBe(Language.Python);
    });

    it('should extract docstring information', async () => {
      const pythonCode = `
from mcp import FastMCP

mcp = FastMCP("test-server")

@mcp.tool()
def process_data(data: str, format: str = "json") -> dict:
    """Process data in the specified format.
    
    Args:
        data: Input data to process
        format: Output format (default: json)
        
    Returns:
        Processed data as dictionary
    """
    return {"processed": data, "format": format}
`;

      const parseResult = await plugin.parse(pythonCode, 'test.py');
      const elements = await plugin.extract(parseResult);
      
      expect(elements).toHaveLength(1);
      
      const element = elements[0];
      expect(element.documentation).toContain('Process data in the specified format');
      expect(element.parameters).toHaveLength(2);
      expect(element.parameters[0].name).toBe('data');
      expect(element.parameters[1].name).toBe('format');
    });
  });

  describe('Extract Documentation', () => {
    it('should parse Google-style docstrings', async () => {
      const pythonCode = `
@mcp.tool()
def example_function(param1: str, param2: int) -> bool:
    """Example function with Google-style docstring.
    
    Args:
        param1 (str): First parameter description
        param2 (int): Second parameter description
        
    Returns:
        bool: True if successful
    """
    return True
`;

      const parseResult = await plugin.parse(pythonCode, 'test.py');
      const elements = await plugin.extract(parseResult);
      
      const element = elements[0];
      expect(element.parameters).toHaveLength(2);
      expect(element.parameters[0].type.name).toBe('str');
      expect(element.parameters[1].type.name).toBe('int');
      expect(element.returnType?.name).toBe('bool');
    });
  });

  describe('Transform Elements', () => {
    it('should add MCP-specific metadata', async () => {
      const pythonCode = `
@mcp.tool()
def test_tool():
    """Test tool"""
    pass
`;

      const parseResult = await plugin.parse(pythonCode, 'test.py');
      const elements = await plugin.extract(parseResult);
      const transformed = await plugin.transform(elements);
      
      expect(transformed[0].mcpSpecific?.framework).toBe('fastmcp');
      expect(transformed[0].mcpSpecific?.decoratorType).toBe('tool');
    });
  });
});