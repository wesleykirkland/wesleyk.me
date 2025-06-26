// Client-side validation utilities - Safe from ReDoS attacks

// Validate email format - Safe from ReDoS attacks
export function isValidEmail(email: string): boolean {
  // Basic length and character checks first
  if (!email || email.length > 254 || email.length < 5) {
    return false;
  }
  
  // Check for single @ symbol
  const atIndex = email.indexOf('@');
  const lastAtIndex = email.lastIndexOf('@');
  if (atIndex === -1 || atIndex !== lastAtIndex) {
    return false;
  }
  
  // Split into local and domain parts
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);
  
  // Validate local part (before @)
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Validate domain part (after @)
  if (domainPart.length === 0 || domainPart.length > 253) {
    return false;
  }
  
  // Check for valid characters using safe, non-backtracking patterns
  const localPartRegex = /^[a-zA-Z0-9._-]+$/;
  const domainPartRegex = /^[a-zA-Z0-9.-]+$/;
  
  if (!localPartRegex.test(localPart) || !domainPartRegex.test(domainPart)) {
    return false;
  }
  
  // Check domain has at least one dot and valid TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return false;
  }
  
  // Validate each domain part
  for (const part of domainParts) {
    if (part.length === 0 || part.length > 63) {
      return false;
    }
    // Domain parts cannot start or end with hyphen
    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
  }
  
  // Check TLD (last part) is valid
  const tld = domainParts[domainParts.length - 1];
  const tldRegex = /^[a-zA-Z]{2,}$/;
  
  return tldRegex.test(tld);
}

// Validate name field
export function isValidName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

// Validate subject field
export function isValidSubject(subject: string): boolean {
  if (!subject) return false;
  const trimmed = subject.trim();
  return trimmed.length >= 3 && trimmed.length <= 200;
}

// Validate message field
export function isValidMessage(message: string): boolean {
  if (!message) return false;
  const trimmed = message.trim();
  return trimmed.length >= 10 && trimmed.length <= 5000;
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Comprehensive form validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = 'Name must be between 2 and 100 characters';
  }

  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isValidSubject(data.subject)) {
    errors.subject = 'Subject must be between 3 and 200 characters';
  }

  if (!isValidMessage(data.message)) {
    errors.message = 'Message must be between 10 and 5000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
