import { DocumentationElement, Parameter, TypeInfo } from '../../types/core';

export class PythonDocstringExtractor {
  /**
   * Extract and parse Python docstrings in various formats
   */
  extractDocumentation(docstring: string): {
    description: string;
    parameters: Parameter[];
    returns: TypeInfo | null;
    examples: string[];
  } {
    if (!docstring) {
      return {
        description: '',
        parameters: [],
        returns: null,
        examples: []
      };
    }

    // Detect docstring style
    const style = this.detectDocstringStyle(docstring);
    
    switch (style) {
      case 'google':
        return this.parseGoogleDocstring(docstring);
      case 'numpy':
        return this.parseNumpyDocstring(docstring);
      case 'sphinx':
        return this.parseSphinxDocstring(docstring);
      default:
        return this.parseSimpleDocstring(docstring);
    }
  }

  private detectDocstringStyle(docstring: string): 'google' | 'numpy' | 'sphinx' | 'simple' {
    if (docstring.includes('Args:') || docstring.includes('Returns:')) {
      return 'google';
    }
    if (docstring.includes('Parameters\n----------')) {
      return 'numpy';
    }
    if (docstring.includes(':param') || docstring.includes(':return')) {
      return 'sphinx';
    }
    return 'simple';
  }

private parseGoogleDocstring(docstring: string): {
  description: string;
  parameters: Parameter[];
  returns: TypeInfo | null;
  examples: string[];
} {
  const lines = docstring.split('\n');
  let description = '';
  let parameters: Parameter[] = [];
  let returns: TypeInfo | null = null;
  let examples: string[] = [];

  let currentSection = 'description';
  let currentParam: Partial<Parameter> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('Args:')) {
      currentSection = 'args';
      continue;
    } else if (trimmed.startsWith('Returns:')) {
      currentSection = 'returns';
      continue;
    } else if (trimmed.startsWith('Example:') || trimmed.startsWith('Examples:')) {
      currentSection = 'examples';
      continue;
    }

    switch (currentSection) {
      case 'description':
        if (trimmed) {
          description += (description ? '\n' : '') + trimmed;
        }
        break;

      case 'args':
        if (trimmed) {
          // Try pattern with explicit type: param_name (type): description
          const paramWithTypeMatch = trimmed.match(/^(\w+)\s*\(([^)]+)\):\s*(.*)$/);
          if (paramWithTypeMatch) {
            // Save previous parameter if exists
            if (currentParam.name) {
              parameters.push(currentParam as Parameter);
            }
            
            currentParam = {
              name: paramWithTypeMatch[1],
              type: this.parseTypeString(paramWithTypeMatch[2]),
              description: paramWithTypeMatch[3],
              optional: false
            };
          } else {
            // Try pattern without explicit type: param_name: description
            const paramMatch = trimmed.match(/^(\w+):\s*(.*)$/);
            if (paramMatch) {
              // Save previous parameter if exists
              if (currentParam.name) {
                parameters.push(currentParam as Parameter);
              }
              
              currentParam = {
                name: paramMatch[1],
                type: this.parseTypeString('Any'), // Default type
                description: paramMatch[2],
                optional: false
              };
            } else if (currentParam.name && trimmed.length > 0) {
              // Continuation of parameter description
              currentParam.description = (currentParam.description || '') + ' ' + trimmed;
            }
          }
        }
        break;

      case 'returns':
        if (trimmed) {
          const returnMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
          if (returnMatch) {
            returns = this.parseTypeString(returnMatch[1]);
          } else {
            // If no type specified, assume the whole line is description
            returns = this.parseTypeString('Any');
          }
        }
        break;

      case 'examples':
        if (trimmed) {
          examples.push(trimmed);
        }
        break;
    }
  }

  // Add last parameter if exists
  if (currentParam.name) {
    parameters.push(currentParam as Parameter);
  }

  return { description, parameters, returns, examples };
}

  private parseNumpyDocstring(docstring: string): {
    description: string;
    parameters: Parameter[];
    returns: TypeInfo | null;
    examples: string[];
  } {
    // Simplified NumPy docstring parser
    const lines = docstring.split('\n');
    let description = '';
    let parameters: Parameter[] = [];
    let returns: TypeInfo | null = null;
    let examples: string[] = [];

    let currentSection = 'description';
    let inParameterSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === 'Parameters' || trimmed === 'Parameters\n----------') {
        currentSection = 'parameters';
        inParameterSection = true;
        continue;
      } else if (trimmed === 'Returns' || trimmed === 'Returns\n----------') {
        currentSection = 'returns';
        inParameterSection = false;
        continue;
      } else if (trimmed === 'Examples' || trimmed === 'Examples\n----------') {
        currentSection = 'examples';
        inParameterSection = false;
        continue;
      }

      if (trimmed === '----------') {
        continue;
      }

      switch (currentSection) {
        case 'description':
          if (trimmed) {
            description += (description ? '\n' : '') + trimmed;
          }
          break;

        case 'parameters':
          if (trimmed) {
            const paramMatch = trimmed.match(/^(\w+)\s*:\s*(.+)$/);
            if (paramMatch) {
              parameters.push({
                name: paramMatch[1],
                type: this.parseTypeString(paramMatch[2]),
                description: '',
                optional: false
              });
            }
          }
          break;

        case 'returns':
          if (trimmed) {
            returns = this.parseTypeString(trimmed);
          }
          break;

        case 'examples':
          if (trimmed) {
            examples.push(trimmed);
          }
          break;
      }
    }

    return { description, parameters, returns, examples };
  }

  private parseSphinxDocstring(docstring: string): {
    description: string;
    parameters: Parameter[];
    returns: TypeInfo | null;
    examples: string[];
  } {
    const lines = docstring.split('\n');
    let description = '';
    let parameters: Parameter[] = [];
    let returns: TypeInfo | null = null;
    let examples: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      const paramMatch = trimmed.match(/^:param\s+(\w+):\s*(.*)$/);
      if (paramMatch) {
        parameters.push({
          name: paramMatch[1],
          type: { name: 'Any', generic: false, parameters: [], nullable: false, languageSpecific: {} },
          description: paramMatch[2],
          optional: false
        });
        continue;
      }

      const typeMatch = trimmed.match(/^:type\s+(\w+):\s*(.*)$/);
      if (typeMatch) {
        const param = parameters.find(p => p.name === typeMatch[1]);
        if (param) {
          param.type = this.parseTypeString(typeMatch[2]);
        }
        continue;
      }

      const returnMatch = trimmed.match(/^:return:\s*(.*)$/);
      if (returnMatch) {
        // Return description - we'll parse type separately
        continue;
      }

      const rtypeMatch = trimmed.match(/^:rtype:\s*(.*)$/);
      if (rtypeMatch) {
        returns = this.parseTypeString(rtypeMatch[1]);
        continue;
      }

      if (trimmed && !trimmed.startsWith(':')) {
        description += (description ? '\n' : '') + trimmed;
      }
    }

    return { description, parameters, returns, examples };
  }

  private parseSimpleDocstring(docstring: string): {
    description: string;
    parameters: Parameter[];
    returns: TypeInfo | null;
    examples: string[];
  } {
    return {
      description: docstring,
      parameters: [],
      returns: null,
      examples: []
    };
  }

  private parseTypeString(typeStr: string): TypeInfo {
    // Simple type parsing - can be enhanced for complex types
    const cleaned = typeStr.trim();
    
    // Check for optional types
    const nullable = cleaned.includes('Optional') || cleaned.includes('None');
    
    // Extract base type
    let baseName = cleaned;
    if (cleaned.includes('Optional[')) {
      baseName = cleaned.match(/Optional\[([^\]]+)\]/)?.[1] || cleaned;
    }

    // Check for generic types
    const generic = cleaned.includes('[') && cleaned.includes(']');
    let parameters: TypeInfo[] = [];
    
    if (generic) {
      const match = cleaned.match(/([^[]+)\[([^\]]+)\]/);
      if (match) {
        baseName = match[1];
        const paramStr = match[2];
        // Simple parameter parsing - can be enhanced
        parameters = paramStr.split(',').map(p => this.parseTypeString(p.trim()));
      }
    }

    return {
      name: baseName,
      generic,
      parameters,
      nullable,
      languageSpecific: {
        python: {
          original: typeStr
        }
      }
    };
  }
}