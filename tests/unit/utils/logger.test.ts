import { Logger, LogLevel } from '../../../src/utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });
  
  test('should log info messages when level is INFO', () => {
    const logger = new Logger(LogLevel.INFO);
    logger.info('test message');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO:'),
      'test message'
    );
  });
  
  test('should not log debug messages when level is INFO', () => {
    const logger = new Logger(LogLevel.INFO);
    logger.debug('debug message');
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});