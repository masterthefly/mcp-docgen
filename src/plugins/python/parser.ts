import Parser, { Query } from 'tree-sitter';
import Python from 'tree-sitter-python';
import { ParseResult, DocumentationElement, Language, SourceLocation } from '../../types/core';

export class PythonParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Python as unknown as Parser.Language);
  }

  async parse(content: string, filePath: string): Promise<ParseResult> {
    const tree = this.parser.parse(content);
    const elements = await this.extractElements(tree, content, filePath);
    const imports = this.extractImports(tree, content);
    const exports = this.extractExports(tree, content);

    return {
      elements,
      imports,
      exports,
      metadata: {
        language: Language.Python,
        filePath,
        hasAsyncCode: this.hasAsyncCode(tree, content),
        hasDecorators: this.hasDecorators(tree, content),
        mcpImports: this.extractMcpImports(tree, content)
      }
    };
  }

  private async extractElements(
    tree: Parser.Tree, 
    content: string, 
    filePath: string
  ): Promise<DocumentationElement[]> {
    const elements: DocumentationElement[] = [];
    const lines = content.split('\n');

    // Extract functions with decorators (simplified query)
    const functionQuery = `
      (decorated_definition
        (function_definition
          name: (identifier) @function_name
        )
      ) @function
    `;

    try {
      const functionMatches = this.query(tree, functionQuery);
      
      for (const match of functionMatches) {
        const functionNode = match.captures.find(c => c.name === 'function_name');
        
        if (functionNode && this.hasMcpDecorator(match.captures[0].node, content)) {
          const element = await this.extractFunction(
            functionNode.node, 
            undefined, // We'll extract params separately
            undefined, // We'll extract body separately
            content, 
            filePath, 
            lines
          );
          elements.push(element);
        }
      }
    } catch (error: any) {
      console.warn('Function query failed, trying fallback:', error.message);
    }

    // Fallback: Extract all functions and check for decorators manually
    const simpleFunctionQuery = `
      (function_definition
        name: (identifier) @function_name
      ) @function
    `;

    try {
      const simpleFunctionMatches = this.query(tree, simpleFunctionQuery);
      
      for (const match of simpleFunctionMatches) {
        const functionNode = match.captures.find(c => c.name === 'function_name');
        
        if (functionNode && this.checkForMcpDecoratorInContext(functionNode.node, content)) {
          const element = await this.extractFunction(
            functionNode.node, 
            undefined,
            undefined,
            content, 
            filePath, 
            lines
          );
          // Avoid duplicates
          if (!elements.some(e => e.name === element.name)) {
            elements.push(element);
          }
        }
      }
    } catch (error: any) {
      console.warn('Simple function query failed:', error.message);
    }

    // Extract classes with simplified query
    const classQuery = `
      (class_definition
        name: (identifier) @class_name
      ) @class
    `;

    try {
      const classMatches = this.query(tree, classQuery);
      
      for (const match of classMatches) {
        const classNode = match.captures.find(c => c.name === 'class_name');

        if (classNode) {
          const classElement = await this.extractClass(
            classNode.node, 
            match.captures[0].node, // Use full class node for body
            content, 
            filePath, 
            lines
          );
          elements.push(classElement);
        }
      }
    } catch (error: any) {
      console.warn('Class query failed:', error.message);
    }

    return elements;
  }

  private async extractFunction(
    functionNode: Parser.SyntaxNode,
    paramsNode: Parser.SyntaxNode | undefined,
    bodyNode: Parser.SyntaxNode | undefined,
    content: string,
    filePath: string,
    lines: string[]
  ): Promise<DocumentationElement> {
    const name = functionNode.text;
    const location = this.nodeToLocation(functionNode, filePath);
    const parameters = paramsNode ? this.extractParameters(paramsNode, content) : [];
    const docstring = this.extractDocstring(bodyNode, content, functionNode);
    const signature = this.extractFunctionSignature(functionNode, paramsNode, content);
    const returnType = this.extractReturnType(functionNode, content);

    return {
      type: 'tool',
      name,
      signature,
      documentation: docstring,
      parameters,
      returnType,
      language: Language.Python,
      location,
      crossReferences: [],
      mcpSpecific: {
        toolName: name,
      }
    };
  }

  private async extractClass(
    classNode: Parser.SyntaxNode,
    bodyNode: Parser.SyntaxNode,
    content: string,
    filePath: string,
    lines: string[]
  ): Promise<DocumentationElement> {
    const name = classNode.text;
    const location = this.nodeToLocation(classNode, filePath);
    const docstring = this.extractDocstring(bodyNode, content, classNode);

    return {
      type: 'class',
      name,
      signature: `class ${name}`,
      documentation: docstring,
      parameters: [],
      language: Language.Python,
      location,
      crossReferences: []
    };
  }

  private query(tree: Parser.Tree, queryString: string): Parser.QueryMatch[] {
    try {
      const query = new Query(Python as Parser.Language, queryString);
      return query.matches(tree.rootNode);
    } catch (error: any) {
      // If query fails, return empty array and let caller handle it
      console.warn('Tree-sitter query failed:', error.message);
      return [];
    }
  }

  private isMcpDecorator(node: Parser.SyntaxNode, content: string): boolean {
    const decoratorText = node.text;
    return decoratorText.includes('mcp.tool') || 
           decoratorText.includes('@tool') ||
           decoratorText.includes('mcp.resource') ||
           decoratorText.includes('mcp.prompt');
  }

  private hasMcpDecorator(node: Parser.SyntaxNode, content: string): boolean {
    // Check if the decorated_definition contains MCP decorators
    const nodeText = node.text;
    return nodeText.includes('@mcp.tool') || 
           nodeText.includes('@tool') ||
           nodeText.includes('@mcp.resource') ||
           nodeText.includes('@mcp.prompt');
  }

  private checkForMcpDecoratorInContext(functionNode: Parser.SyntaxNode, content: string): boolean {
    // Check lines above the function for decorators
    const lines = content.split('\n');
    const functionLine = functionNode.startPosition.row;
    
    // Check up to 5 lines before the function
    for (let i = Math.max(0, functionLine - 5); i < functionLine; i++) {
      const line = lines[i]?.trim() || '';
      if (line.includes('@mcp.tool') || line.includes('@tool') || 
          line.includes('@mcp.resource') || line.includes('@mcp.prompt')) {
        return true;
      }
    }
    
    return false;
  }

  private extractParameters(paramsNode: Parser.SyntaxNode, content: string): any[] {
    const parameters: any[] = [];
    
    // For now, return empty array - this can be enhanced later
    // with proper parameter parsing from Tree-sitter
    
    return parameters;
  }

  private extractDocstring(bodyNode: Parser.SyntaxNode | undefined, content: string, functionNode?: Parser.SyntaxNode): string {
    // If we have a body node, try Tree-sitter first
    if (bodyNode) {
      const stringQuery = `(string) @docstring`;
      
      try {
        const query = new Query(Python as Parser.Language, stringQuery);
        const matches = query.matches(bodyNode);
        
        if (matches.length > 0) {
          const docstringNode = matches[0].captures[0].node;
          return this.cleanDocstring(docstringNode.text);
        }
      } catch (error: any) {
        console.warn('Docstring extraction failed, using fallback');
      }
    }
    
    // Fallback: look for docstring manually using function position
    const lines = content.split('\n');
    let startLine = 0;
    
    if (functionNode) {
      startLine = functionNode.startPosition.row;
    } else if (bodyNode) {
      startLine = bodyNode.startPosition.row;
    }
    
    // Look for function definition line first
    let functionDefLine = startLine;
    for (let i = startLine; i < Math.min(startLine + 5, lines.length); i++) {
      const line = lines[i]?.trim() || '';
      if (line.includes('def ')) {
        functionDefLine = i;
        break;
      }
    }
    
    // Look for docstring after function definition
    let searchStartLine = functionDefLine + 1;
    
    // Skip any lines that are just whitespace or comments until we find the function body
    while (searchStartLine < lines.length) {
      const line = lines[searchStartLine]?.trim() || '';
      if (line === '' || line.startsWith('#')) {
        searchStartLine++;
        continue;
      }
      break;
    }
    
    // Look for first string after function definition
    for (let i = searchStartLine; i < Math.min(searchStartLine + 10, lines.length); i++) {
      const line = lines[i]?.trim() || '';
      
      // Check for triple-quoted docstring
      if (line.match(/^\s*['"]{3}/)) {
        let docstring = line;
        let j = i + 1;
        
        // Collect lines until closing triple quotes
        const quoteChar = line.includes('"""') ? '"""' : "'''";
        
        // If the closing quotes are on the same line
        if (line.includes(quoteChar) && line.indexOf(quoteChar) !== line.lastIndexOf(quoteChar)) {
          return this.cleanDocstring(docstring);
        }
        
        // Multi-line docstring
        while (j < lines.length) {
          const nextLine = lines[j] || '';
          docstring += '\n' + nextLine;
          if (nextLine.includes(quoteChar)) {
            break;
          }
          j++;
        }
        
        return this.cleanDocstring(docstring);
      }
      
      // Check for single-quoted docstring
      if (line.match(/^\s*['"]/) && !line.match(/^\s*['"].*['"].*=/)) {
        let docstring = line;
        let j = i + 1;
        
        const quoteChar = line.charAt(line.indexOf('"') !== -1 ? line.indexOf('"') : line.indexOf("'"));
        
        // Single line string
        if (line.lastIndexOf(quoteChar) > line.indexOf(quoteChar)) {
          return this.cleanDocstring(docstring);
        }
        
        // Multi-line string
        while (j < lines.length) {
          const nextLine = lines[j] || '';
          docstring += '\n' + nextLine;
          if (nextLine.includes(quoteChar)) {
            break;
          }
          j++;
        }
        
        return this.cleanDocstring(docstring);
      }
      
      // If we hit actual code (not a string), stop looking
      if (line && !line.match(/^\s*['"]/)) {
        break;
      }
    }
    
    return '';
  }

  private cleanDocstring(rawDocstring: string): string {
    if (!rawDocstring) return '';
    
    // Remove leading/trailing whitespace
    let cleaned = rawDocstring.trim();
    
    // Remove triple quotes
    cleaned = cleaned.replace(/^['"]{3}|['"]{3}$/g, '');
    
    // Remove single quotes if they wrap the entire string
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Clean up indentation - find minimum indentation (excluding first line)
    const lines = cleaned.split('\n');
    if (lines.length > 1) {
      const indentedLines = lines.slice(1).filter(line => line.trim() !== '');
      if (indentedLines.length > 0) {
        const minIndent = Math.min(...indentedLines.map(line => {
          const match = line.match(/^(\s*)/);
          return match ? match[1].length : 0;
        }));
        
        // Remove common indentation
        if (minIndent > 0) {
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
              lines[i] = lines[i].substring(minIndent);
            }
          }
        }
      }
      
      cleaned = lines.join('\n');
    }
    
    // Final trim
    return cleaned.trim();
  }

  private extractFunctionSignature(
    functionNode: Parser.SyntaxNode,
    paramsNode: Parser.SyntaxNode | undefined,
    content: string
  ): string {
    const name = functionNode.text;
    
    // Try to find the full function definition line
    const lines = content.split('\n');
    const functionLine = functionNode.startPosition.row;
    
    // Look for the def line and potentially following lines for complete signature
    let signature = '';
    for (let i = functionLine; i < Math.min(functionLine + 5, lines.length); i++) {
      const line = lines[i] || '';
      if (line.includes('def ') && line.includes(name)) {
        // Found the function definition line
        signature = line.trim();
        
        // Check if signature continues on next lines (multi-line parameters)
        let j = i + 1;
        while (j < lines.length && !signature.includes(':')) {
          const nextLine = lines[j]?.trim() || '';
          if (nextLine) {
            signature += ' ' + nextLine;
          }
          j++;
          if (j > i + 10) break; // Safety limit
        }
        
        break;
      }
    }
    
    // If we found a signature, clean it up
    if (signature) {
      // Remove any content after the colon
      const colonIndex = signature.indexOf(':');
      if (colonIndex !== -1) {
        signature = signature.substring(0, colonIndex);
      }
      
      return signature.trim();
    }
    
    // Fallback: construct basic signature
    const params = paramsNode ? paramsNode.text : '()';
    return `def ${name}${params}`;
  }

  private extractReturnType(functionNode: Parser.SyntaxNode, content: string): any {
    // Extract return type annotation if present
    return { name: 'Any', generic: false, parameters: [], nullable: false, languageSpecific: {} };
  }

  private nodeToLocation(node: Parser.SyntaxNode, filePath: string): SourceLocation {
    return {
      file: filePath,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      endLine: node.endPosition.row + 1,
      endColumn: node.endPosition.column + 1
    };
  }

  private extractImports(tree: Parser.Tree, content: string): string[] {
    const imports = [];
    
    // Try Tree-sitter query first
    const importQuery = `
      (import_statement
        name: (dotted_name) @import_name
      )
      (import_from_statement
        module_name: (dotted_name) @module_name
      )
    `;

    try {
      const matches = this.query(tree, importQuery);
      for (const match of matches) {
        for (const capture of match.captures) {
          imports.push(capture.node.text);
        }
      }
    } catch (error: any) {
      console.warn('Import extraction failed, using fallback');
    }
    
    // Fallback: parse imports manually
    if (imports.length === 0) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
          // Extract module name
          const importMatch = trimmed.match(/(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/);
          if (importMatch) {
            imports.push(importMatch[1]);
          }
        }
      }
    }

    return imports;
  }

  private extractExports(tree: Parser.Tree, content: string): string[] {
    // Python doesn't have explicit exports, but we can look for __all__
    const exports = [];
    
    try {
      const exportQuery = `
        (assignment
          left: (identifier) @var_name
          right: (list) @list_content
        )
      `;

      const matches = this.query(tree, exportQuery);
      for (const match of matches) {
        const varName = match.captures.find(c => c.name === 'var_name');
        if (varName && varName.node.text === '__all__') {
          const listContent = match.captures.find(c => c.name === 'list_content');
          if (listContent) {
            // Extract items from __all__ list
            const items = this.extractListItems(listContent.node, content);
            exports.push(...items);
          }
        }
      }
    } catch (error: any) {
      console.warn('Export extraction failed, using fallback');
      
      // Fallback: look for __all__ manually
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('__all__')) {
          // Simple extraction of strings in list
          const matches = trimmed.match(/["']([^"']+)["']/g);
          if (matches) {
            exports.push(...matches.map(m => m.replace(/["']/g, '')));
          }
        }
      }
    }

    return exports;
  }

  private extractListItems(listNode: Parser.SyntaxNode, content: string): string[] {
    const items = [];
    
    try {
      const itemQuery = `(string) @item`;
      const query = new Query(Python as Parser.Language, itemQuery);
      const matches = query.matches(listNode);

      for (const match of matches) {
        const itemNode = match.captures[0].node;
        const itemText = itemNode.text.replace(/["']/g, '');
        items.push(itemText);
      }
    } catch (error: any) {
      console.warn('List item extraction failed');
    }

    return items;
  }

  private hasAsyncCode(tree: Parser.Tree, content: string): boolean {
    try {
      const asyncQuery = `(function_definition (async) @async_func)`;
      const matches = this.query(tree, asyncQuery);
      return matches.length > 0;
    } catch (error: any) {
      // Fallback: check manually
      return content.includes('async def');
    }
  }

  private hasDecorators(tree: Parser.Tree, content: string): boolean {
    try {
      const decoratorQuery = `(decorator) @decorator`;
      const matches = this.query(tree, decoratorQuery);
      return matches.length > 0;
    } catch (error: any) {
      // Fallback: check manually
      return content.includes('@');
    }
  }

  private extractMcpImports(tree: Parser.Tree, content: string): string[] {
    const mcpImports = [];
    
    try {
      const importQuery = `
        (import_from_statement
          module_name: (dotted_name) @module_name
        )
      `;

      const matches = this.query(tree, importQuery);
      for (const match of matches) {
        const moduleNode = match.captures[0].node;
        const moduleName = moduleNode.text;
        if (moduleName.includes('mcp') || moduleName.includes('fastmcp')) {
          mcpImports.push(moduleName);
        }
      }
    } catch (error: any) {
      console.warn('MCP import extraction failed, using fallback');
      
      // Fallback: look for MCP imports manually
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if ((trimmed.startsWith('from ') || trimmed.startsWith('import ')) && 
            (trimmed.includes('mcp') || trimmed.includes('fastmcp'))) {
          const importMatch = trimmed.match(/(?:from|import)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/);
          if (importMatch) {
            mcpImports.push(importMatch[1]);
          }
        }
      }
    }

    return mcpImports;
  }
}