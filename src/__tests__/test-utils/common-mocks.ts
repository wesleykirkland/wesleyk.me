/**
 * Common mock utilities for Jest tests
 * Centralizes mock setup to reduce code duplication
 */

import React from 'react';

// Mock Next.js modules
export const mockNextServer = () => {
  jest.mock('next/server', () => ({
    NextRequest: jest.fn().mockImplementation((url, init) => {
      const request = new Request(url, init);
      return Object.assign(request, {
        nextUrl: new URL(url),
        cookies: new Map(),
        geo: {},
        ip: '127.0.0.1',
        json: async () => {
          if (init?.body) {
            return JSON.parse(init.body as string);
          }
          return {};
        }
      });
    }),
    NextResponse: {
      json: jest.fn((data, init) => {
        const response = new Response(JSON.stringify(data), {
          status: init?.status || 200,
          headers: {
            'content-type': 'application/json',
            ...init?.headers
          }
        });
        return response;
      })
    }
  }));
};

// Mock Next.js Image component
export const mockNextImage = () => {
  jest.mock('next/image', () => {
    return function MockImage({ src, alt, className, ...props }: any) {
      return React.createElement('img', {
        src,
        alt,
        className,
        'data-testid': 'next-image',
        ...props
      });
    };
  });
};

// Mock HCaptcha component
export const mockHCaptcha = () => {
  jest.mock('@hcaptcha/react-hcaptcha', () => {
    return function MockHCaptcha({ onVerify, onExpire, ...props }: any) {
      return React.createElement(
        'div',
        { 'data-testid': 'hcaptcha-mock' },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => onVerify('mock-captcha-token'),
            'data-testid': 'captcha-verify'
          },
          'Verify Captcha'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => onExpire(),
            'data-testid': 'captcha-expire'
          },
          'Expire Captcha'
        )
      );
    };
  });
};

// Mock file system operations
export const mockFileSystem = () => {
  jest.mock('fs', () => ({
    readdirSync: jest.fn(),
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  }));
};

// Mock path operations
export const mockPath = () => {
  jest.mock('path', () => ({
    join: jest.fn((...args: string[]) => args.join('/')),
    resolve: jest.fn((...args: string[]) => args.join('/')),
    extname: jest.fn((file: string) =>
      file.includes('.') ? '.' + file.split('.').pop() : ''
    )
  }));
};

// Mock gray-matter
export const mockGrayMatter = () => {
  jest.mock('gray-matter', () => jest.fn());
};

// Mock remark and related packages
export const mockRemark = () => {
  jest.mock('remark', () => ({
    remark: jest.fn(() => ({
      use: jest.fn().mockReturnThis(),
      process: jest.fn().mockResolvedValue({
        toString: jest.fn().mockReturnValue('<p>Test content</p>')
      })
    }))
  }));

  jest.mock('remark-html', () => jest.fn());
  jest.mock('remark-gfm', () => jest.fn());
};

// Mock sanitize-html
export const mockSanitizeHtml = () => {
  jest.mock('sanitize-html', () => jest.fn((html: string) => html));
};

// Mock validation module
export const mockValidation = () => {
  jest.mock('../../lib/validation', () => ({
    sanitizeInput: jest.fn((input: string) => input.trim()),
    validateContactForm: jest.fn(),
    isValidEmail: jest.fn((email: string) => email.includes('@'))
  }));
};

// Mock email module
export const mockEmail = () => {
  jest.mock('../../lib/server-only-email', () => ({
    sendContactEmail: jest.fn()
  }));
};

// Mock tracking hooks
export const mockTracking = () => {
  jest.mock('../../hooks/usePageTracking', () => ({
    trackingEvents: {
      contactFormSubmit: jest.fn(),
      linkClick: jest.fn(),
      blogPostView: jest.fn(),
      searchPerformed: jest.fn(),
      tagClicked: jest.fn(),
      socialLinkClick: jest.fn(),
      fileDownload: jest.fn(),
      errorOccurred: jest.fn()
    }
  }));
};

// Mock global fetch
export const mockFetch = () => {
  global.fetch = jest.fn();
};

// Console mocking utilities
export interface ConsoleMocks {
  originalError: typeof console.error;
  originalLog: typeof console.log;
  originalWarn: typeof console.warn;
  mockError: jest.Mock;
  mockLog: jest.Mock;
  mockWarn: jest.Mock;
}

export const setupConsoleMocks = (): ConsoleMocks => {
  const originalError = console.error;
  const originalLog = console.log;
  const originalWarn = console.warn;

  const mockError = jest.fn();
  const mockLog = jest.fn();
  const mockWarn = jest.fn();

  console.error = mockError;
  console.log = mockLog;
  console.warn = mockWarn;

  return {
    originalError,
    originalLog,
    originalWarn,
    mockError,
    mockLog,
    mockWarn
  };
};

export const restoreConsoleMocks = (mocks: ConsoleMocks) => {
  console.error = mocks.originalError;
  console.log = mocks.originalLog;
  console.warn = mocks.originalWarn;
};

// Environment variable utilities
export const setupTestEnv = (vars: Record<string, string>) => {
  const originalEnv = { ...process.env };
  Object.assign(process.env, vars);
  return originalEnv;
};

export const restoreTestEnv = (originalEnv: Record<string, string>) => {
  process.env = originalEnv;
};

// Common test environment setup
export const setupCommonTestEnv = () => {
  return setupTestEnv({
    NODE_ENV: 'test',
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: 'test-site-key',
    HCAPTCHA_SECRET_KEY: 'test-secret-key',
    NEXT_PUBLIC_OVERTRACKING_SITE_ID: 'test-site-id'
  });
};
