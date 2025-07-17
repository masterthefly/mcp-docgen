import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  constructor(private level: LogLevel = LogLevel.INFO) {}
  
  error(message: string, ...args: any[]): void {
    console.error(chalk.red('❌ ERROR:'), message, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(chalk.yellow('⚠️  WARN:'), message, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(chalk.blue('ℹ️  INFO:'), message, ...args);
    }
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(chalk.gray('🐛 DEBUG:'), message, ...args);
    }
  }
  
  success(message: string, ...args: any[]): void {
    console.log(chalk.green('✅ SUCCESS:'), message, ...args);
  }
}