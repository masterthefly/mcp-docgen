import { Language } from '../types/core';
import { LanguagePlugin } from './interface';

export class PluginManager {
  private plugins = new Map<Language, LanguagePlugin>();
  private loadedPlugins = new Set<Language>();

  async loadPlugin(language: Language): Promise<LanguagePlugin> {
    if (this.plugins.has(language)) {
      return this.plugins.get(language)!;
    }

    try {
      const plugin = await this.dynamicImport(language);
      this.plugins.set(language, plugin);
      this.loadedPlugins.add(language);
      return plugin;
    } catch (error: any) {
      throw new Error(`Failed to load plugin for ${language}: ${error.message}`);
    }
  }

  private async dynamicImport(language: Language): Promise<LanguagePlugin> {
    switch (language) {
      case Language.Python:
        const { PythonPlugin } = await import('./python/plugin');
        return new PythonPlugin();
      case Language.JavaScript:
        const { JavaScriptPlugin } = await import('./javascript/plugin');
        return new JavaScriptPlugin();
      case Language.TypeScript:
        const { TypeScriptPlugin } = await import('./typescript/plugin');
        return new TypeScriptPlugin();
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async getPlugin(language: Language): Promise<LanguagePlugin> {
    if (!this.plugins.has(language)) {
      await this.loadPlugin(language);
    }
    return this.plugins.get(language)!;
  }

  getSupportedLanguages(): Language[] {
    return Object.values(Language);
  }

  async cleanup(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.cleanup();
    }
    this.plugins.clear();
    this.loadedPlugins.clear();
  }
}