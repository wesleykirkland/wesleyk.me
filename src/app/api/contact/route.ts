import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, type ContactFormData } from '@/lib/email';

interface HCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

// Server-side validation functions - Safe from ReDoS attacks
function isValidEmail(email: string): boolean {
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

function isValidName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

function isValidSubject(subject: string): boolean {
  if (!subject) return false;
  const trimmed = subject.trim();
  return trimmed.length >= 3 && trimmed.length <= 200;
}

function isValidMessage(message: string): boolean {
  if (!message) return false;
  const trimmed = message.trim();
  return trimmed.length >= 10 && trimmed.length <= 5000;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateContactFormServer(data: ContactFormData): ValidationResult {
  const errors: string[] = [];

  if (!isValidName(data.name)) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!isValidSubject(data.subject)) {
    errors.push('Subject must be between 3 and 200 characters');
  }

  if (!isValidMessage(data.message)) {
    errors.push('Message must be between 10 and 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('HCAPTCHA_SECRET_KEY environment variable is not set');
    return false;
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error('HCaptcha verification request failed:', response.status);
      return false;
    }

    const data: HCaptchaResponse = await response.json();
    
    if (!data.success) {
      console.error('HCaptcha verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    // Basic type and presence validation
    if (!name || !email || !subject || !message || !captchaToken) {
      console.log('Missing required fields:', {
        name: !!name,
        email: !!email,
        subject: !!subject,
        message: !!message,
        captchaToken: !!captchaToken
      });
      return NextResponse.json(
        {
          success: false,
          error: 'All fields including captcha are required'
        },
        { status: 400 }
      );
    }

    // Type validation - ensure all fields are strings
    if (typeof name !== 'string' || typeof email !== 'string' ||
        typeof subject !== 'string' || typeof message !== 'string' ||
        typeof captchaToken !== 'string') {
      console.log('Invalid field types detected');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid field types'
        },
        { status: 400 }
      );
    }

    // Check for potential injection attempts
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    const allFields = [name, email, subject, message];
    for (const field of allFields) {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(field)) {
          console.log('Suspicious content detected in form submission');
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid content detected'
            },
            { status: 400 }
          );
        }
      }
    }

    // Verify captcha
    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Captcha verification failed. Please try again.' 
        },
        { status: 400 }
      );
    }

    // Sanitize and prepare form data
    const formData: ContactFormData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
    };

    // Server-side validation
    const validation = validateContactFormServer(formData);
    if (!validation.isValid) {
      console.log('Server-side validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Send email
    try {
      await sendContactEmail(formData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);

      // Check if it's a configuration error
      if (emailError instanceof Error && emailError.message.includes('Missing required environment variable')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email service is not configured. Please contact the administrator.'
          },
          { status: 503 }
        );
      }

      // Generic email error
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email. Please try again later or contact me directly via social media.'
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully! I\'ll get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Return generic error message to avoid exposing internal details
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while sending your message. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
