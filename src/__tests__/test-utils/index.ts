/**
 * Test utilities index
 * Central export point for all test utilities
 */

// Re-export all utilities for easy importing
export * from './common-mocks';
export * from './test-data';
export * from './form-helpers';
export * from './api-helpers';

// Common test setup function
export const setupTestSuite = () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
};

// Common async test utilities
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();

  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Test timing utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Test assertion utilities
export const expectToThrow = async (
  fn: () => Promise<any>,
  expectedError?: string
) => {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (expectedError) {
      expect(error.message).toContain(expectedError);
    }
  }
};

export const expectNotToThrow = async (fn: () => Promise<any>) => {
  try {
    await fn();
  } catch (error) {
    throw new Error(
      `Expected function not to throw, but got: ${error.message}`
    );
  }
};

// Test data validation utilities
export const validateTestData = (data: any, schema: any): boolean => {
  // Simple validation - could be extended with a proper schema validator
  for (const [key, type] of Object.entries(schema)) {
    if (typeof data[key] !== type) {
      return false;
    }
  }
  return true;
};

// Test cleanup utilities
export const cleanupTestState = () => {
  // Reset any global state
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }

  // Reset document state
  if (typeof document !== 'undefined') {
    document.documentElement.className = '';
    document.body.className = '';
  }
};

// Test environment detection
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

export const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined';
};

export const isNodeEnvironment = (): boolean => {
  return typeof window === 'undefined';
};

// Test performance utilities
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
};

// Test retry utilities
export const retryTest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Test snapshot utilities
export const createSnapshot = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const compareSnapshots = (actual: any, expected: any): boolean => {
  return createSnapshot(actual) === createSnapshot(expected);
};

// Test debugging utilities
export const debugTest = (label: string, data?: any) => {
  if (process.env.DEBUG_TESTS) {
    console.log(`[DEBUG] ${label}`, data || '');
  }
};

export const logTestState = (state: any) => {
  if (process.env.DEBUG_TESTS) {
    console.log('[TEST STATE]', JSON.stringify(state, null, 2));
  }
};

// Test configuration utilities
export const getTestConfig = () => ({
  timeout: parseInt(process.env.TEST_TIMEOUT || '10000'),
  retries: parseInt(process.env.TEST_RETRIES || '0'),
  verbose: process.env.TEST_VERBOSE === 'true',
  debug: process.env.DEBUG_TESTS === 'true'
});

// Test file utilities
export const createTestFile = (
  name: string,
  content: string,
  type: string = 'text/plain'
): File => {
  return new File([content], name, { type });
};

export const createTestImageFile = (name: string = 'test.jpg'): File => {
  // Create a minimal valid image file for testing
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], name, { type: 'image/jpeg' }));
    }, 'image/jpeg');
  }) as any; // Type assertion for test purposes
};

// Test URL utilities
export const createTestUrl = (
  path: string = '/',
  params?: Record<string, string>
): string => {
  const url = new URL(path, 'http://localhost:3000');

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

// Test component utilities
export const getComponentDisplayName = (component: any): string => {
  return component.displayName || component.name || 'Component';
};

// Test error utilities
export const createTestError = (message: string, code?: string): Error => {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
};

// Test promise utilities
export const createResolvedPromise = <T>(value: T): Promise<T> => {
  return Promise.resolve(value);
};

export const createRejectedPromise = (error: Error): Promise<never> => {
  return Promise.reject(error);
};

// Test array utilities
export const createTestArray = <T>(
  length: number,
  factory: (index: number) => T
): T[] => {
  return Array.from({ length }, (_, index) => factory(index));
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
