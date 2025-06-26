import nodemailer from 'nodemailer';
import { isValidEmail } from './validation';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  to: string;
  tls: boolean;
}

export function getEmailConfig(): EmailConfig {
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
    port: parseInt(process.env.SMTP_PORT!, 10),
    username: process.env.SMTP_USERNAME!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.SMTP_FROM!,
    to: process.env.SMTP_TO!,
    tls: process.env.SMTP_TLS === 'true'
  };
}

export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  const config = getEmailConfig();

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.username,
      pass: config.password,
    },
    tls: config.tls ? {
      rejectUnauthorized: false
    } : undefined,
  });

  // Verify connection configuration
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
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
        <p><strong>Name:</strong> ${escapeHtml(formData.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(formData.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(formData.subject)}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #1e40af; margin-top: 0;">Message</h3>
        <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(formData.message)}</div>
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

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
This email was sent from the contact form on wesleyk.me
  `;

  // Send email
  const mailOptions = {
    from: `"${formData.name}" <${config.from}>`,
    to: config.to,
    replyTo: formData.email,
    subject: `Contact Form: ${formData.subject}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

// Helper function to escape HTML characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}



// Validate form data
export function validateContactForm(data: ContactFormData): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.subject || data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters long');
  }

  if (!data.message || data.message.trim().length < 100) {
    errors.push('Message must be at least 100 characters long');
  }

  // Check for reasonable length limits
  if (data.name && data.name.length > 100) {
    errors.push('Name is too long (maximum 100 characters)');
  }

  if (data.subject && data.subject.length > 200) {
    errors.push('Subject is too long (maximum 200 characters)');
  }

  if (data.message && data.message.length > 5000) {
    errors.push('Message is too long (maximum 5000 characters)');
  }

  return errors;
}
