import { Language } from '../types/core';
import * as path from 'path';

export class LanguageDetector {
  private static readonly EXTENSION_MAP: Record<string, Language> = {
    '.js': Language.JavaScript,
    '.ts': Language.TypeScript,
    '.py': Language.Python,
    '.go': Language.Go,
    '.rs': Language.Rust,
    '.java': Language.Java,
  };

  private static readonly CONTENT_PATTERNS: Record<Language, RegExp[]> = {
    [Language.Python]: [
      /^#!.*python/,
      /^# -\*- coding:/,
      /from\s+\w+\s+import/,
      /import\s+\w+/,
      /def\s+\w+\s*\(/,
      /class\s+\w+/,
      /@\w+/  // Decorators
    ],
    [Language.JavaScript]: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*{/,
      /require\s*\(/,
      /module\.exports/
    ],
    [Language.TypeScript]: [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /:\s*\w+\s*=/,
      /export\s+\w+/,
      /import.*from/
    ],
    [Language.Go]: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /import\s*\(/,
      /var\s+\w+\s+\w+/,
      /type\s+\w+\s+struct/
    ],
    [Language.Rust]: [
      /fn\s+\w+\s*\(/,
      /struct\s+\w+/,
      /impl\s+\w+/,
      /use\s+\w+/,
      /extern\s+crate/
    ],
    [Language.Java]: [
      /public\s+class\s+\w+/,
      /private\s+\w+\s+\w+/,
      /public\s+static\s+void\s+main/,
      /import\s+\w+/,
      /package\s+\w+/
    ]
  };

  detect(filePath: string, content?: string): Language {
    // Try extension-based detection first
    const ext = path.extname(filePath).toLowerCase();
    const langByExt = LanguageDetector.EXTENSION_MAP[ext];
    
    if (langByExt) {
      return langByExt;
    }

    // Try content-based detection
    if (content) {
      const langByContent = this.detectByContent(content);
      if (langByContent) {
        return langByContent;
      }
    }

    // Default fallback
    return Language.JavaScript;
  }

  private detectByContent(content: string): Language | null {
    const lines = content.split('\n').slice(0, 50); // Check first 50 lines
    const firstLines = lines.join('\n');

    for (const [language, patterns] of Object.entries(LanguageDetector.CONTENT_PATTERNS)) {
      const matchCount = patterns.reduce((count, pattern) => {
        return count + (pattern.test(firstLines) ? 1 : 0);
      }, 0);

      // If we find multiple pattern matches, this is likely the language
      if (matchCount >= 2) {
        return language as Language;
      }
    }

    return null;
  }

  getSupportedLanguages(): Language[] {
    return Object.values(Language);
  }

  isSupported(language: Language): boolean {
    return this.getSupportedLanguages().includes(language);
  }
}