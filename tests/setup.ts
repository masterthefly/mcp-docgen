import { Logger, LogLevel } from '../src/utils/logger';

// Set up test environment
beforeAll(() => {
  // Suppress logs during testing
  const logger = new Logger(LogLevel.ERROR);
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});