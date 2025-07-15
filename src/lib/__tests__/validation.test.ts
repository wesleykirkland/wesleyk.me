import {
  isValidEmail,
  isValidName,
  isValidSubject,
  isValidMessage,
  sanitizeInput,
  validateContactForm
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user_name@sub.domain.co.uk')).toBe(true);
      expect(isValidEmail('test123@example-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('test@domain.')).toBe(false);
      expect(isValidEmail('test@.domain.com')).toBe(false);
    });

    it('should handle length constraints', () => {
      // Too short
      expect(isValidEmail('a@b')).toBe(false);

      // Too long email (over 254 characters)
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);

      // Too long local part (over 64 characters)
      const longLocal = 'a'.repeat(65) + '@example.com';
      expect(isValidEmail(longLocal)).toBe(false);

      // Too long domain part (over 253 characters)
      const longDomain = 'test@' + 'a'.repeat(250) + '.com';
      expect(isValidEmail(longDomain)).toBe(false);
    });

    it('should validate domain parts correctly', () => {
      expect(isValidEmail('test@domain-with-hyphens.com')).toBe(true);
      expect(isValidEmail('test@-invalid.com')).toBe(false);
      expect(isValidEmail('test@invalid-.com')).toBe(false);
      expect(isValidEmail('test@domain.c')).toBe(false); // TLD too short
      expect(isValidEmail('test@domain.123')).toBe(false); // TLD with numbers
    });

    it('should handle special characters safely', () => {
      expect(isValidEmail('test+tag@example.com')).toBe(false); // + not allowed in our implementation
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.email@example.com')).toBe(true);
      expect(isValidEmail('test_email@example.com')).toBe(true);
      expect(isValidEmail('test-email@example.com')).toBe(true);
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Mary-Jane')).toBe(true);
      expect(isValidName('  John  ')).toBe(true); // Should trim
    });

    it('should reject invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('J')).toBe(false); // Too short
      expect(isValidName('a'.repeat(101))).toBe(false); // Too long
      expect(isValidName('   ')).toBe(false); // Only whitespace
    });
  });

  describe('isValidSubject', () => {
    it('should validate correct subjects', () => {
      expect(isValidSubject('Hello')).toBe(true);
      expect(isValidSubject('Contact Form Inquiry')).toBe(true);
      expect(isValidSubject('  Subject  ')).toBe(true); // Should trim
    });

    it('should reject invalid subjects', () => {
      expect(isValidSubject('')).toBe(false);
      expect(isValidSubject('Hi')).toBe(false); // Too short
      expect(isValidSubject('a'.repeat(201))).toBe(false); // Too long
      expect(isValidSubject('   ')).toBe(false); // Only whitespace
    });
  });

  describe('isValidMessage', () => {
    it('should validate correct messages', () => {
      expect(
        isValidMessage('This is a valid message with enough content.')
      ).toBe(true);
      expect(isValidMessage('  Valid message  ')).toBe(true); // Should trim
    });

    it('should reject invalid messages', () => {
      expect(isValidMessage('')).toBe(false);
      expect(isValidMessage('Short')).toBe(false); // Too short
      expect(isValidMessage('a'.repeat(5001))).toBe(false); // Too long
      expect(isValidMessage('   ')).toBe(false); // Only whitespace
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  text  ')).toBe('text');
      expect(sanitizeInput('\n\ttext\n\t')).toBe('text');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });
  });

  describe('validateContactForm', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a valid message with enough content to pass validation.'
    };

    it('should validate correct form data', () => {
      const result = validateContactForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid name', () => {
      const result = validateContactForm({
        ...validData,
        name: 'J'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe(
        'Name must be between 2 and 100 characters'
      );
    });

    it('should return errors for invalid email', () => {
      const result = validateContactForm({
        ...validData,
        email: 'invalid-email'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    it('should return specific error for empty email', () => {
      const result = validateContactForm({
        ...validData,
        email: ''
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
    });

    it('should return errors for invalid subject', () => {
      const result = validateContactForm({
        ...validData,
        subject: 'Hi'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.subject).toBe(
        'Subject must be between 3 and 200 characters'
      );
    });

    it('should return errors for invalid message', () => {
      const result = validateContactForm({
        ...validData,
        message: 'Short'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toBe(
        'Message must be between 10 and 5000 characters'
      );
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateContactForm({
        name: 'J',
        email: 'invalid',
        subject: 'Hi',
        message: 'Short'
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.subject).toBeDefined();
      expect(result.errors.message).toBeDefined();
    });
  });
});
