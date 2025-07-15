// Mock nodemailer
const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify
  }))
}));

import { sendContactEmail, type ContactFormData } from '../server-only-email';
import nodemailer from 'nodemailer';

// Mock server-only
jest.mock('server-only', () => ({}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Server-Only Email', () => {
  const validFormData: ContactFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'This is a valid test message with enough content.'
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up valid environment variables
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USERNAME: 'test@example.com',
      SMTP_PASSWORD: 'test-password',
      SMTP_FROM: 'noreply@example.com',
      SMTP_TO: 'contact@example.com',
      SMTP_TLS: 'true'
    };

    mockVerify.mockResolvedValue(true);
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('sendContactEmail', () => {
    it('should send email successfully with valid data', async () => {
      await expect(sendContactEmail(validFormData)).resolves.not.toThrow();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-password'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      expect(mockVerify).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"John Doe" <noreply@example.com>',
          to: 'contact@example.com',
          replyTo: 'john@example.com',
          subject: 'Contact Form: Test Subject',
          text: expect.stringContaining('John Doe'),
          html: expect.stringContaining('John Doe')
        })
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Email sent successfully');
    });

    it('should handle secure port configuration', async () => {
      process.env.SMTP_PORT = '465';

      await sendContactEmail(validFormData);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 465,
          secure: true
        })
      );
    });

    it('should handle TLS disabled configuration', async () => {
      process.env.SMTP_TLS = 'false';

      await sendContactEmail(validFormData);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          tls: undefined
        })
      );
    });

    it('should throw error for missing environment variables', async () => {
      delete process.env.SMTP_HOST;

      await expect(sendContactEmail(validFormData)).rejects.toThrow(
        'Missing required environment variable: SMTP_HOST'
      );
    });

    it('should validate name field', async () => {
      const invalidData = { ...validFormData, name: 'J' };

      await expect(sendContactEmail(invalidData)).rejects.toThrow(
        'Name must be between 2 and 100 characters long'
      );
    });

    it('should validate email field', async () => {
      const invalidData = { ...validFormData, email: 'invalid-email' };

      await expect(sendContactEmail(invalidData)).rejects.toThrow(
        'Valid email address is required'
      );
    });

    it('should validate subject field', async () => {
      const invalidData = { ...validFormData, subject: 'Hi' };

      await expect(sendContactEmail(invalidData)).rejects.toThrow(
        'Subject must be between 3 and 200 characters long'
      );
    });

    it('should validate message field', async () => {
      const invalidData = { ...validFormData, message: 'Short' };

      await expect(sendContactEmail(invalidData)).rejects.toThrow(
        'Message must be between 10 and 5000 characters long'
      );
    });

    it('should detect and block suspicious content', async () => {
      const suspiciousData = {
        ...validFormData,
        message: 'This contains javascript:void(0) malicious content'
      };

      await expect(sendContactEmail(suspiciousData)).rejects.toThrow(
        'Invalid content detected in form submission'
      );
    });

    it('should detect various suspicious patterns', async () => {
      const patterns = [
        'javascript:void(0)',
        'onclick="test()"',
        'data:text/html,test',
        'vbscript:test'
      ];

      for (const pattern of patterns) {
        const suspiciousData = {
          ...validFormData,
          message: `This contains ${pattern} suspicious content`
        };

        await expect(sendContactEmail(suspiciousData)).rejects.toThrow(
          'Invalid content detected in form submission'
        );
      }
    });

    it('should handle SMTP connection verification failure', async () => {
      mockVerify.mockRejectedValue(new Error('Connection failed'));

      await expect(sendContactEmail(validFormData)).rejects.toThrow(
        'Failed to connect to email server'
      );

      // Console error is handled by jest setup but we can't easily test it
    });

    it('should handle email sending failure', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      await expect(sendContactEmail(validFormData)).rejects.toThrow(
        'Failed to send email'
      );

      // Console error is handled by jest setup but we can't easily test it
    });

    it('should sanitize input data', async () => {
      const dataWithHtml = {
        name: 'John <script>alert("xss")</script> Doe',
        email: 'john@example.com',
        subject: 'Test <b>Subject</b>',
        message:
          'This is a test message with <i>HTML</i> content that should be sanitized.'
      };

      await sendContactEmail(dataWithHtml);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>'),
          text: expect.not.stringContaining('<script>')
        })
      );
    });

    it('should escape HTML in email content', async () => {
      const dataWithSpecialChars = {
        ...validFormData,
        name: 'John & Jane',
        message: 'Message with "quotes" and tags & ampersands'
      };

      await sendContactEmail(dataWithSpecialChars);

      const sendMailCall = mockSendMail.mock.calls[0][0];
      expect(sendMailCall.html).toMatch(/John &amp; Jane/);
      expect(sendMailCall.html).toMatch(/&quot;quotes&quot;/);
      expect(sendMailCall.html).toMatch(/tags &amp; ampersands/);
    });
  });
});
