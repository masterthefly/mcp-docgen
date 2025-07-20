import { 
  LanguagePlugin, 
  Language, 
  LanguageCapabilities, 
  Feature, 
  OutputFormat, 
  ParseResult, 
  DocumentationElement 
} from '../../types/core';
import { PythonParser } from './parser';
import { PythonDocstringExtractor } from './extractor';

export class PythonPlugin implements LanguagePlugin {
  language = Language.Python;
  capabilities: LanguageCapabilities = {
    supportedFeatures: [
      Feature.Docstrings,
      Feature.TypeHints,
      Feature.Decorators
    ],
    configurationOptions: [
      {
        name: 'docstringStyle',
        type: 'string',
        description: 'Docstring style to parse (google, numpy, sphinx, auto)',
        default: 'auto'
      },
      {
        name: 'includePrivate',
        type: 'boolean',
        description: 'Include private methods and functions',
        default: false
      },
      {
        name: 'typeHints',
        type: 'boolean',
        description: 'Extract type hints from function signatures',
        default: true
      },
      {
        name: 'packageMetadata',
        type: 'string',
        description: 'Package metadata file (pyproject.toml, setup.py)',
        default: 'pyproject.toml'
      }
    ],
    outputFormats: [OutputFormat.Markdown, OutputFormat.HTML, OutputFormat.JSON],
    dependencies: ['tree-sitter-python']
  };

  private parser: PythonParser;
  private extractor: PythonDocstringExtractor;
  private config: Record<string, any> = {};

  constructor() {
    this.parser = new PythonParser();
    this.extractor = new PythonDocstringExtractor();
  }

  async initialize(config: Record<string, any>): Promise<void> {
    this.config = {
      docstringStyle: 'auto',
      includePrivate: false,
      typeHints: true,
      packageMetadata: 'pyproject.toml',
      ...config
    };
  }

  async parse(content: string, filePath: string): Promise<ParseResult> {
    try {
      return await this.parser.parse(content, filePath);
    } catch (error: any) {
      throw new Error(`Failed to parse Python file ${filePath}: ${error.message}`);
    }
  }

  async extract(parseResult: ParseResult): Promise<DocumentationElement[]> {
    const elements: DocumentationElement[] = [];

    for (const element of parseResult.elements) {
      if (element.documentation) {
        const docInfo = this.extractor.extractDocumentation(element.documentation);
        
        // Enhance element with extracted documentation
        const enhancedElement: DocumentationElement = {
          ...element,
          documentation: docInfo.description,
          parameters: docInfo.parameters.length > 0 ? docInfo.parameters : element.parameters,
          returnType: docInfo.returns || element.returnType
        };

        // Skip private methods if configured
        if (!this.config.includePrivate && element.name.startsWith('_')) {
          continue;
        }

        elements.push(enhancedElement);
      } else {
        elements.push(element);
      }
    }

    return elements;
  }

  async transform(elements: DocumentationElement[]): Promise<DocumentationElement[]> {
    // Apply Python-specific transformations
    return elements.map(element => {
      // Add MCP-specific metadata for decorated functions
      if (element.type === 'tool' && element.mcpSpecific) {
        return {
          ...element,
          mcpSpecific: {
            ...element.mcpSpecific,
            framework: 'fastmcp',
            decoratorType: 'tool'
          }
        };
      }
      
      return element;
    });
  }

  async cleanup(): Promise<void> {
    // Cleanup resources if needed
  }
}