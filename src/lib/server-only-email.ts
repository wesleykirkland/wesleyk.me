import 'server-only';
import nodemailer from 'nodemailer';
import {
  isValidEmail,
  isValidName,
  isValidSubject,
  isValidMessage,
  sanitizeInput
} from './validation';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  to: string;
  tls: boolean;
}

function getEmailConfig(): EmailConfig {
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'SMTP_TO',
    'SMTP_TLS'
  ];

  // Check if all required environment variables are present
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    username: process.env.SMTP_USERNAME!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.SMTP_FROM!,
    to: process.env.SMTP_TO!,
    tls: process.env.SMTP_TLS === 'true'
  };
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendContactEmail(
  formData: ContactFormData
): Promise<void> {
  // Server-side validation using shared validation functions
  if (!isValidName(formData.name)) {
    throw new Error('Name must be between 2 and 100 characters long');
  }

  if (!isValidEmail(formData.email)) {
    throw new Error('Valid email address is required');
  }

  if (!isValidSubject(formData.subject)) {
    throw new Error('Subject must be between 3 and 200 characters long');
  }

  if (!isValidMessage(formData.message)) {
    throw new Error('Message must be between 10 and 5000 characters long');
  }

  // Sanitize input data to prevent XSS
  const sanitizedData = {
    name: sanitizeInput(formData.name),
    email: sanitizeInput(formData.email),
    subject: sanitizeInput(formData.subject),
    message: sanitizeInput(formData.message)
  };

  // Additional security checks for potential injection attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i
  ];

  const allFields = [
    sanitizedData.name,
    sanitizedData.email,
    sanitizedData.subject,
    sanitizedData.message
  ];
  for (const field of allFields) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(field)) {
        throw new Error('Invalid content detected in form submission');
      }
    }
  }

  const config = getEmailConfig();

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.username,
      pass: config.password
    },
    tls: config.tls
      ? {
          rejectUnauthorized: false
        }
      : undefined
  });

  // Verify connection configuration
  try {
    await transporter.verify();
  } catch {
    // Avoid logging detailed error to prevent credential exposure in build logs
    console.error('SMTP connection verification failed');
    throw new Error('Failed to connect to email server');
  }

  // Email content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Contact Details</h3>
        <p><strong>Name:</strong> ${escapeHtml(sanitizedData.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(sanitizedData.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(sanitizedData.subject)}</p>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #1e40af; margin-top: 0;">Message</h3>
        <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(
          sanitizedData.message
        )}</div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Note:</strong> This email was sent from the contact form on wesleyk.me
        </p>
      </div>
    </div>
  `;

  const textContent = `
New Contact Form Submission

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

---
This email was sent from the contact form on wesleyk.me
  `;

  // Send email
  const mailOptions = {
    from: `"${sanitizedData.name}" <${config.from}>`,
    to: config.to,
    replyTo: sanitizedData.email,
    subject: `Contact Form: ${sanitizedData.subject}`,
    text: textContent,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    // Avoid logging message ID to prevent potential information exposure
    console.log('Email sent successfully');
  } catch {
    // Avoid logging detailed error to prevent credential exposure in build logs
    console.error('Failed to send email');
    throw new Error('Failed to send email');
  }
}
