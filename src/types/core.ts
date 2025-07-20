export enum Language {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Go = 'go',
  Rust = 'rust',
  Java = 'java'
}

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface Parameter {
  name: string;
  type: TypeInfo;
  description?: string;
  optional?: boolean;
  default?: any;
}

export interface TypeInfo {
  name: string;
  generic: boolean;
  parameters: TypeInfo[];
  nullable: boolean;
  languageSpecific: Record<string, any>;
}

export interface DocumentationElement {
  type: 'function' | 'class' | 'interface' | 'variable' | 'tool' | 'resource' | 'prompt';
  name: string;
  signature: string;
  documentation: string;
  parameters: Parameter[];
  returnType?: TypeInfo;
  language: Language;
  location: SourceLocation;
  crossReferences: Reference[];
  mcpSpecific?: {
    toolName?: string;
    resourceType?: string;
    promptTemplate?: string;
    framework?: string;
    decoratorType?: string;
  };
}

export interface Reference {
  name: string;
  type: string;
  location: SourceLocation;
  language: Language;
}

export interface ParseResult {
  elements: DocumentationElement[];
  imports: string[];
  exports: string[];
  metadata: Record<string, any>;
}

export interface LanguageCapabilities {
  supportedFeatures: Feature[];
  configurationOptions: ConfigOption[];
  outputFormats: OutputFormat[];
  dependencies: string[];
}

export enum Feature {
  JSDoc = 'jsdoc',
  TypeScript = 'typescript',
  Docstrings = 'docstrings',
  TypeHints = 'type-hints',
  Decorators = 'decorators',
  Annotations = 'annotations'
}

export enum OutputFormat {
  Markdown = 'markdown',
  HTML = 'html',
  JSON = 'json'
}

export interface ConfigOption {
  name: string;
  type: string;
  description: string;
  default: any;
}

export interface LanguagePlugin {
  language: Language;
  capabilities: LanguageCapabilities;
  
  /**
   * Parse source code and extract AST
   */
  parse(content: string, filePath: string): Promise<ParseResult>;
  
  /**
   * Extract documentation elements from parsed AST
   */
  extract(parseResult: ParseResult): Promise<DocumentationElement[]>;
  
  /**
   * Transform elements for output
   */
  transform(elements: DocumentationElement[]): Promise<DocumentationElement[]>;
  
  /**
   * Initialize plugin with configuration
   */
  initialize(config: Record<string, any>): Promise<void>;
  
  /**
   * Cleanup plugin resources
   */
  cleanup(): Promise<void>;
}