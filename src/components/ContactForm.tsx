'use client';

import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  validateName,
  validateEmail,
  validateSubject,
  validateMessage
} from '@/lib/validation';
import { trackingEvents } from '@/hooks/usePageTracking';

interface ContactFormProps {
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  captcha?: string;
  general?: string;
}

export default function ContactForm({
  className = ''
}: Readonly<ContactFormProps>) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Use React ref for the official hCaptcha component
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  // Handle captcha verification
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setErrors((prev) => ({ ...prev, captcha: undefined }));
  };

  // Handle captcha expiration
  const handleCaptchaExpire = () => {
    setCaptchaToken('');
    setErrors((prev) => ({
      ...prev,
      captcha: 'Captcha expired. Please try again.'
    }));
  };

  // Handle captcha error
  const handleCaptchaError = () => {
    setCaptchaToken('');
    setErrors((prev) => ({
      ...prev,
      captcha: 'Captcha error. Please try again.'
    }));
  };

  // Real-time validation
  const validateField = (name: string, value: string) => {
    let error: string | null = null;

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'subject':
        error = validateSubject(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear submit status when user starts typing
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }

    // Real-time validation (only show errors after user has started typing)
    if (value.length > 0) {
      validateField(name, value);
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus('idle');

    try {
      // Validate all fields
      const fieldErrors: FormErrors = {};

      const nameError = validateName(formData.name);
      if (nameError) fieldErrors.name = nameError;

      const emailError = validateEmail(formData.email);
      if (emailError) fieldErrors.email = emailError;

      const subjectError = validateSubject(formData.subject);
      if (subjectError) fieldErrors.subject = subjectError;

      const messageError = validateMessage(formData.message);
      if (messageError) fieldErrors.message = messageError;

      // Validate captcha token
      if (!captchaToken) {
        fieldErrors.captcha = 'Please complete the captcha verification';
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit contact form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          captchaToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setSubmitMessage(
          data.message ||
            'Thank you for your message! We have received it and will get back to you as soon as we can.'
        );
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setCaptchaToken('');
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }

        // Track successful form submission
        trackingEvents.contactFormSubmit(true);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          data.error ?? 'An error occurred while sending your message'
        );

        if (data.details && Array.isArray(data.details)) {
          setSubmitMessage(data.details.join(', '));
        }

        // Track failed form submission
        trackingEvents.contactFormSubmit(false, data.error ?? 'Unknown error');

        // Reset captcha on error to allow retry
        setCaptchaToken('');
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        'Network error. Please check your connection and try again.'
      );
      setCaptchaToken('');
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }

      // Track network error
      trackingEvents.contactFormSubmit(false, 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Contact form is temporarily unavailable. Please use the social media
          links to reach out.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-gray-100`}
            placeholder="Your full name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-gray-100`}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.subject
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-gray-100`}
            placeholder="What's this about?"
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              errors.message
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-gray-100`}
            placeholder="Tell us what's on your mind..."
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.message}
            </p>
          )}
        </div>

        {/* HCaptcha - Secure React Component */}
        <div>
          <div className="flex justify-center min-h-[78px]">
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              onError={handleCaptchaError}
              theme="light"
              size="normal"
            />
          </div>
          {errors.captcha && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
              {errors.captcha}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-center">
              {submitMessage}
            </p>
          </div>
        )}

        {submitStatus === 'error' && submitMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-center">
              {submitMessage}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
