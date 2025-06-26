import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, validateContactForm, type ContactFormData } from '@/lib/email';

interface HCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
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

    // Validate required fields
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

    // Prepare form data
    const formData: ContactFormData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    // Validate form data
    const validationErrors = validateContactForm(formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors 
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
