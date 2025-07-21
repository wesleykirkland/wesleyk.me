import { NextRequest, NextResponse } from 'next/server';
import {
  sendContactEmail,
  type ContactFormData
} from '@/lib/server-only-email';
import { sanitizeInput, validateContactForm } from '@/lib/validation';

interface HCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

// Server-side validation now uses shared functions from @/lib/validation

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
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token
      })
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
  } catch {
    // Avoid logging detailed error to prevent potential information exposure
    console.error('Error verifying captcha');
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
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string' ||
      typeof captchaToken !== 'string'
    ) {
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

    // Check for common spam patterns
    const spamPatterns = [
      /viagra/i,
      /casino/i,
      /lottery/i,
      /winner/i,
      /congratulations/i
    ];

    const allFields = [name, email, subject, message];
    for (const field of allFields) {
      // Check for injection attempts
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

      // Check for spam patterns
      for (const pattern of spamPatterns) {
        if (pattern.test(field)) {
          console.log('Spam content detected in form submission');
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

    // Check for excessive URLs in message
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urlMatches = message.match(urlPattern);
    if (urlMatches && urlMatches.length > 2) {
      console.log('Excessive URLs detected in form submission');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content detected'
        },
        { status: 400 }
      );
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
      message: sanitizeInput(message)
    };

    // Server-side validation
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors);
      console.log('Server-side validation failed:', errorMessages);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errorMessages
        },
        { status: 400 }
      );
    }

    // Send email
    try {
      await sendContactEmail(formData);
    } catch (emailError) {
      // Avoid logging detailed error to prevent credential exposure
      console.error('Email sending failed');

      // Check if it's a configuration error
      if (
        emailError instanceof Error &&
        emailError.message.includes('Missing required environment variable')
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Email service is not configured. Please contact the administrator.'
          },
          { status: 503 }
        );
      }

      // Generic email error
      return NextResponse.json(
        {
          success: false,
          error:
            'Failed to send email. Please try again later or contact me directly via social media.'
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Your message has been sent successfully! I'll get back to you soon."
      },
      { status: 200 }
    );
  } catch {
    // Avoid logging detailed error to prevent potential information exposure
    console.error('Contact form submission error');

    // Return generic error message to avoid exposing internal details
    return NextResponse.json(
      {
        success: false,
        error:
          'An error occurred while sending your message. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send contact messages.' },
    { status: 405 }
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
