import { Language, LanguageCapabilities, ParseResult, DocumentationElement } from '../types/core';

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

export interface PluginConfig {
  [key: string]: any;
}