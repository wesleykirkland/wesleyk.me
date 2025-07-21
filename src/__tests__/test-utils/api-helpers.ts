/**
 * API testing utilities
 * Centralizes API testing patterns to reduce duplication
 */

import { NextRequest } from 'next/server';

// Request creation utilities
export const createTestRequest = (
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) => {
  const { method = 'GET', body, headers = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body && method !== 'GET') {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
};

// Common request factories
export const createGetRequest = (
  url: string,
  headers?: Record<string, string>
) => {
  return createTestRequest(url, { method: 'GET', headers });
};

export const createPostRequest = (
  url: string,
  body: any,
  headers?: Record<string, string>
) => {
  return createTestRequest(url, { method: 'POST', body, headers });
};

export const createPutRequest = (
  url: string,
  body: any,
  headers?: Record<string, string>
) => {
  return createTestRequest(url, { method: 'PUT', body, headers });
};

export const createDeleteRequest = (
  url: string,
  headers?: Record<string, string>
) => {
  return createTestRequest(url, { method: 'DELETE', headers });
};

// Response assertion utilities
export const expectSuccessResponse = async (
  response: Response,
  expectedData?: any
) => {
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  if (expectedData) {
    const data = await response.json();
    expect(data).toMatchObject(expectedData);
    return data;
  }

  return response;
};

export const expectErrorResponse = async (
  response: Response,
  expectedStatus: number,
  expectedError?: string
) => {
  expect(response.ok).toBe(false);
  expect(response.status).toBe(expectedStatus);

  if (expectedError) {
    const data = await response.json();
    expect(data.error || data.message).toContain(expectedError);
    return data;
  }

  return response;
};

export const expectJsonResponse = async (
  response: Response,
  expectedData: any
) => {
  const data = await response.json();
  expect(data).toMatchObject(expectedData);
  return data;
};

// HTTP method testing utilities
export const testMethodNotAllowed = async (
  handler: Function,
  allowedMethods: string[] = ['POST']
) => {
  const disallowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].filter(
    (method) => !allowedMethods.includes(method)
  );

  for (const method of disallowedMethods) {
    const request = createTestRequest('http://localhost:3000/api/test', {
      method
    });
    const response = await handler(request);
    await expectErrorResponse(response, 405, 'Method not allowed');
  }
};

// Validation testing utilities
export const testRequiredFields = async (
  handler: Function,
  validData: any,
  requiredFields: string[]
) => {
  for (const field of requiredFields) {
    const invalidData = { ...validData };
    delete invalidData[field];

    const request = createPostRequest(
      'http://localhost:3000/api/test',
      invalidData
    );
    const response = await handler(request);
    await expectErrorResponse(response, 400);
  }
};

export const testFieldValidation = async (
  handler: Function,
  baseData: any,
  fieldTests: Array<{
    field: string;
    value: any;
    expectedStatus?: number;
    expectedError?: string;
  }>
) => {
  for (const test of fieldTests) {
    const testData = { ...baseData, [test.field]: test.value };
    const request = createPostRequest(
      'http://localhost:3000/api/test',
      testData
    );
    const response = await handler(request);

    const expectedStatus = test.expectedStatus || 400;
    await expectErrorResponse(response, expectedStatus, test.expectedError);
  }
};

// Authentication testing utilities
export const testAuthRequired = async (
  handler: Function,
  url: string = 'http://localhost:3000/api/test'
) => {
  const request = createGetRequest(url);
  const response = await handler(request);
  await expectErrorResponse(response, 401, 'Unauthorized');
};

export const testWithAuth = async (
  handler: Function,
  token: string,
  url: string = 'http://localhost:3000/api/test'
) => {
  const request = createGetRequest(url, { Authorization: `Bearer ${token}` });
  const response = await handler(request);
  return response;
};

// Rate limiting testing utilities
export const testRateLimit = async (
  handler: Function,
  requestCount: number,
  url: string = 'http://localhost:3000/api/test'
) => {
  const requests = Array.from({ length: requestCount }, () =>
    createGetRequest(url)
  );

  const responses = await Promise.all(
    requests.map((request) => handler(request))
  );

  return responses;
};

// Error handling testing utilities
export const testErrorHandling = async (
  handler: Function,
  mockError: Error,
  url: string = 'http://localhost:3000/api/test'
) => {
  // This would typically involve mocking dependencies to throw errors
  const request = createGetRequest(url);
  const response = await handler(request);
  await expectErrorResponse(response, 500, 'Internal server error');
};

// Content type testing utilities
export const testContentType = async (
  handler: Function,
  contentType: string,
  body: any,
  url: string = 'http://localhost:3000/api/test'
) => {
  const request = createPostRequest(url, body, { 'Content-Type': contentType });
  const response = await handler(request);
  return response;
};

// Query parameter utilities
export const createUrlWithParams = (
  baseUrl: string,
  params: Record<string, string>
) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export const testQueryParams = async (
  handler: Function,
  baseUrl: string,
  paramTests: Array<{
    params: Record<string, string>;
    expectedStatus?: number;
    expectedData?: any;
  }>
) => {
  for (const test of paramTests) {
    const url = createUrlWithParams(baseUrl, test.params);
    const request = createGetRequest(url);
    const response = await handler(request);

    if (test.expectedStatus) {
      expect(response.status).toBe(test.expectedStatus);
    }

    if (test.expectedData) {
      await expectJsonResponse(response, test.expectedData);
    }
  }
};

// File upload testing utilities
export const createFileUploadRequest = (
  url: string,
  files: Record<string, File>,
  fields?: Record<string, string>
) => {
  const formData = new FormData();

  Object.entries(files).forEach(([key, file]) => {
    formData.append(key, file);
  });

  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return new NextRequest(url, {
    method: 'POST',
    body: formData
  });
};

// Mock response utilities
export const createMockApiResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const createMockErrorResponse = (
  error: string,
  status: number = 400
) => {
  return createMockApiResponse({ error, success: false }, status);
};

// Database testing utilities (for when database is involved)
export const setupTestDatabase = async () => {
  // This would set up test database state
  // Implementation depends on your database setup
};

export const cleanupTestDatabase = async () => {
  // This would clean up test database state
  // Implementation depends on your database setup
};

// External API mocking utilities
export const mockExternalApi = (
  url: string,
  response: any,
  status: number = 200
) => {
  (global.fetch as jest.Mock).mockImplementation((requestUrl: string) => {
    if (requestUrl.includes(url)) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response)
      });
    }
    return Promise.reject(new Error(`Unexpected request to ${requestUrl}`));
  });
};

export const mockExternalApiError = (
  url: string,
  error: string = 'Network error'
) => {
  (global.fetch as jest.Mock).mockImplementation((requestUrl: string) => {
    if (requestUrl.includes(url)) {
      return Promise.reject(new Error(error));
    }
    return Promise.reject(new Error(`Unexpected request to ${requestUrl}`));
  });
};
