// Mock Next.js server components before importing
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

// Mock the email sending module
jest.mock('../../../../lib/server-only-email', () => ({
  sendContactEmail: jest.fn()
}));

// Mock the validation module
jest.mock('../../../../lib/validation', () => ({
  sanitizeInput: jest.fn((input: string) => input.trim()),
  validateContactForm: jest.fn()
}));

import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '../route';

const mockSendContactEmail =
  require('../../../../lib/server-only-email').sendContactEmail;
const mockValidateContactForm =
  require('../../../../lib/validation').validateContactForm;
const mockSanitizeInput = require('../../../../lib/validation').sanitizeInput;

// Mock fetch for hCaptcha verification
global.fetch = jest.fn();

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('/api/contact Route', () => {
  const validFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message:
      'This is a test message with sufficient length to pass validation.',
    captchaToken: 'valid-captcha-token'
  };

  const mockCaptchaSuccessResponse = {
    success: true,
    challenge_ts: '2024-03-15T10:00:00Z',
    hostname: 'localhost'
  };

  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
    jest.clearAllMocks();

    // Set up default environment variables
    process.env.HCAPTCHA_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('POST Method', () => {
    beforeEach(() => {
      // Mock successful captcha verification by default
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaptchaSuccessResponse
      });

      // Mock successful form validation by default
      mockValidateContactForm.mockReturnValue({
        isValid: true,
        errors: {}
      });

      // Mock successful email sending by default
      mockSendContactEmail.mockResolvedValue(undefined);
    });

    it('successfully processes valid form submission', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Your message has been sent successfully');
    });

    it('validates form data using validation module', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await POST(request);

      expect(mockValidateContactForm).toHaveBeenCalledWith({
        name: validFormData.name,
        email: validFormData.email,
        subject: validFormData.subject,
        message: validFormData.message
      });
    });

    it('returns validation errors when form data is invalid', async () => {
      mockValidateContactForm.mockReturnValue({
        isValid: false,
        errors: {
          email: 'Please enter a valid email address',
          message: 'Message is too short'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toEqual([
        'Please enter a valid email address',
        'Message is too short'
      ]);
    });

    it('returns error when required fields are missing', async () => {
      const incompleteData = {
        name: 'John Doe'
        // Missing email, subject, message, captchaToken
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('All fields including captcha are required');
    });

    it('verifies captcha token', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hcaptcha.com/siteverify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: expect.any(URLSearchParams)
        })
      );

      // Verify the URLSearchParams contains the correct data
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get('secret')).toBe('test-secret-key');
      expect(body.get('response')).toBe('valid-captcha-token');
    });

    it('returns error when captcha verification fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response']
        })
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Captcha verification failed. Please try again.');
    });

    it('returns error when HCAPTCHA_SECRET_KEY is not set', async () => {
      delete process.env.HCAPTCHA_SECRET_KEY;

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Captcha verification failed. Please try again.');
    });

    it('detects and blocks suspicious content', async () => {
      // Mock successful captcha verification for this test
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaptchaSuccessResponse
      });

      const suspiciousData = {
        ...validFormData,
        message:
          'This message contains <script>alert("xss")</script> malicious content'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(suspiciousData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid content detected');
    });

    it('calls sendContactEmail with sanitized data', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await POST(request);

      expect(mockSendContactEmail).toHaveBeenCalledWith({
        name: validFormData.name,
        email: validFormData.email,
        subject: validFormData.subject,
        message: validFormData.message
      });
    });

    it('handles email sending errors gracefully', async () => {
      mockSendContactEmail.mockRejectedValue(new Error('SMTP error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        'Failed to send email. Please try again later or contact me directly via social media.'
      );
    });

    it('handles malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        'An error occurred while sending your message. Please try again later.'
      );
    });

    it('handles captcha verification network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Captcha verification failed. Please try again.');
    });
  });

  describe('Security Features', () => {
    it('blocks common spam patterns', async () => {
      // Mock successful captcha verification for this test
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaptchaSuccessResponse
      });

      const spamPatterns = [
        'viagra',
        'casino',
        'lottery',
        'winner',
        'congratulations'
      ];

      for (const pattern of spamPatterns) {
        const spamData = {
          ...validFormData,
          message: `This message contains ${pattern} which should be blocked`
        };

        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify(spamData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const response = await POST(request);

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid content detected');
      }
    });

    it('blocks messages with excessive URLs', async () => {
      // Mock successful captcha verification for this test
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaptchaSuccessResponse
      });

      const urlSpamData = {
        ...validFormData,
        message:
          'Check out http://site1.com and http://site2.com and http://site3.com'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(urlSpamData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid content detected');
    });

    it('should handle missing environment variables', async () => {
      const originalSecret = process.env.HCAPTCHA_SECRET_KEY;
      delete process.env.HCAPTCHA_SECRET_KEY;

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message:
            'This is a test message that is long enough to pass validation requirements.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Captcha verification failed');

      // Restore environment variable
      if (originalSecret) {
        process.env.HCAPTCHA_SECRET_KEY = originalSecret;
      }
    });

    it('should handle malformed request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain(
        'An error occurred while sending your message'
      );
    });

    it('should handle missing required fields', async () => {
      mockValidateContactForm.mockReturnValue({
        isValid: false,
        errors: ['Name is required', 'Email is required']
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: '',
          subject: '',
          message: '',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('All fields including captcha are required');
    });

    it('should handle email sending failure', async () => {
      mockValidateContactForm.mockReturnValue({ isValid: true, errors: [] });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      mockSendContactEmail.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message:
            'This is a test message that is long enough to pass validation requirements.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Your message has been sent successfully');
    });

    it('should handle captcha verification network errors', async () => {
      mockValidateContactForm.mockReturnValue({ isValid: true, errors: [] });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message:
            'This is a test message that is long enough to pass validation requirements.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Captcha verification failed');
    });

    it('should handle captcha verification HTTP errors', async () => {
      mockValidateContactForm.mockReturnValue({ isValid: true, errors: [] });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message:
            'This is a test message that is long enough to pass validation requirements.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Captcha verification failed');
    });

    it('should handle email service exceptions', async () => {
      mockValidateContactForm.mockReturnValue({ isValid: true, errors: [] });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      mockSendContactEmail.mockRejectedValue(new Error('SMTP error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message:
            'This is a test message that is long enough to pass validation requirements.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to send email');
    });

    it('should sanitize input data', async () => {
      // Set up environment variables
      process.env.HCAPTCHA_SECRET_KEY = 'test-secret-key';

      // Mock successful captcha verification
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      mockValidateContactForm.mockReturnValue({ isValid: true, errors: [] });
      mockSendContactEmail.mockResolvedValue(true);

      // Use clean input that won't trigger spam detection
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message:
            'This is a legitimate test message that is long enough to pass all validation requirements and should not trigger any spam detection.',
          captchaToken: 'test-token'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify the request was successful
      expect(data.success).toBe(true);

      // Verify that sanitizeInput was called for each field
      expect(mockSanitizeInput).toHaveBeenCalledWith('John Doe');
      expect(mockSanitizeInput).toHaveBeenCalledWith('john@example.com');
      expect(mockSanitizeInput).toHaveBeenCalledWith('Test Subject');
      expect(mockSanitizeInput).toHaveBeenCalledWith(
        'This is a legitimate test message that is long enough to pass all validation requirements and should not trigger any spam detection.'
      );
    });
  });

  describe('HTTP Methods', () => {
    it('should return method not allowed for GET requests', async () => {
      const response = await GET();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use POST to send contact messages.'
      );
    });

    it('should return method not allowed for PUT requests', async () => {
      const response = await PUT();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use POST to send contact messages.'
      );
    });

    it('should return method not allowed for DELETE requests', async () => {
      const response = await DELETE();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use POST to send contact messages.'
      );
    });
  });
});
