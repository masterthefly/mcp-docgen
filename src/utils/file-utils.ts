import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export class FileUtils {
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }
  
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  }
  
  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
  }
  
  static async copyDir(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest);
  }
  
  static async findFiles(pattern: string, cwd?: string): Promise<string[]> {
    return glob(pattern, { cwd });
  }
  
  static async exists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }
}