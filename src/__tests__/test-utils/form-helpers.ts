/**
 * Form interaction utilities for tests
 * Centralizes form testing patterns to reduce duplication
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ContactFormData } from './test-data';

// Generic form filling utility
export const fillFormField = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp,
  value: string,
  clear: boolean = true
) => {
  const field = screen.getByLabelText(labelText);
  if (clear) {
    await user.clear(field);
  }
  await user.type(field, value);
  return field;
};

// Contact form specific utilities
export const fillContactForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: ContactFormData,
  clearFirst: boolean = true
) => {
  const fields = {
    name: await fillFormField(user, /name/i, formData.name, clearFirst),
    email: await fillFormField(user, /email/i, formData.email, clearFirst),
    subject: await fillFormField(
      user,
      /subject/i,
      formData.subject,
      clearFirst
    ),
    message: await fillFormField(user, /message/i, formData.message, clearFirst)
  };

  return fields;
};

// Submit form utility
export const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  buttonText: string | RegExp = /submit/i
) => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
  return submitButton;
};

// Captcha interaction utilities
export const verifyCaptcha = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  const verifyButton = screen.getByTestId('captcha-verify');
  await user.click(verifyButton);
  return verifyButton;
};

export const expireCaptcha = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  const expireButton = screen.getByTestId('captcha-expire');
  await user.click(expireButton);
  return expireButton;
};

// Form validation utilities
export const expectFieldError = (fieldName: string, errorMessage?: string) => {
  const errorElement = screen.getByText(
    errorMessage || new RegExp(fieldName, 'i')
  );
  expect(errorElement).toBeInTheDocument();
  return errorElement;
};

export const expectNoFieldError = (fieldName: string) => {
  const errorElement = screen.queryByText(new RegExp(fieldName, 'i'));
  expect(errorElement).not.toBeInTheDocument();
  return errorElement;
};

// Form state utilities
export const expectFormSubmitting = () => {
  const submittingElement = screen.getByText(/sending|submitting/i);
  expect(submittingElement).toBeInTheDocument();
  return submittingElement;
};

export const expectFormSuccess = (message?: string) => {
  const successElement = screen.getByText(message || /success|sent|thank you/i);
  expect(successElement).toBeInTheDocument();
  return successElement;
};

export const expectFormError = (message?: string) => {
  const errorElement = screen.getByText(message || /error|failed|try again/i);
  expect(errorElement).toBeInTheDocument();
  return errorElement;
};

// Search form utilities
export const fillSearchForm = async (
  user: ReturnType<typeof userEvent.setup>,
  query: string,
  clearFirst: boolean = true
) => {
  const searchInput =
    screen.getByRole('searchbox') || screen.getByLabelText(/search/i);
  if (clearFirst) {
    await user.clear(searchInput);
  }
  await user.type(searchInput, query);
  return searchInput;
};

export const submitSearchForm = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  const searchButton =
    screen.getByRole('button', { name: /search/i }) ||
    screen.getByTestId('search-submit');
  await user.click(searchButton);
  return searchButton;
};

// Generic form utilities
export const getFormField = (labelText: string | RegExp) => {
  return screen.getByLabelText(labelText);
};

export const getFormButton = (buttonText: string | RegExp) => {
  return screen.getByRole('button', { name: buttonText });
};

export const expectFormFieldValue = (
  labelText: string | RegExp,
  expectedValue: string
) => {
  const field = getFormField(labelText) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  expect(field.value).toBe(expectedValue);
  return field;
};

export const expectFormFieldEmpty = (labelText: string | RegExp) => {
  const field = getFormField(labelText) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  expect(field.value).toBe('');
  return field;
};

// Form accessibility utilities
export const expectFormFieldAccessible = (labelText: string | RegExp) => {
  const field = getFormField(labelText);
  expect(field).toBeInTheDocument();
  expect(field).toHaveAccessibleName();
  return field;
};

export const expectFormFieldRequired = (labelText: string | RegExp) => {
  const field = getFormField(labelText);
  expect(field).toBeRequired();
  return field;
};

export const expectFormFieldOptional = (labelText: string | RegExp) => {
  const field = getFormField(labelText);
  expect(field).not.toBeRequired();
  return field;
};

// Form interaction patterns
export const fillAndSubmitContactForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: ContactFormData,
  verifyCaptchaFirst: boolean = true
) => {
  // Fill form fields
  await fillContactForm(user, formData);

  // Verify captcha if needed
  if (verifyCaptchaFirst) {
    await verifyCaptcha(user);
  }

  // Submit form
  await submitForm(user);
};

export const fillAndSubmitSearchForm = async (
  user: ReturnType<typeof userEvent.setup>,
  query: string
) => {
  await fillSearchForm(user, query);
  await submitSearchForm(user);
};

// Form reset utilities
export const resetForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const resetButton = screen.getByRole('button', { name: /reset|clear/i });
  await user.click(resetButton);
  return resetButton;
};

// Form validation helpers
export const triggerFieldValidation = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp
) => {
  const field = getFormField(labelText);
  await user.click(field);
  await user.tab(); // Trigger blur event
  return field;
};

// File upload utilities
export const uploadFile = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp,
  file: File
) => {
  const fileInput = getFormField(labelText) as HTMLInputElement;
  await user.upload(fileInput, file);
  return fileInput;
};

// Select/dropdown utilities
export const selectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp,
  optionText: string | RegExp
) => {
  const select = getFormField(labelText);
  await user.selectOptions(
    select,
    screen.getByRole('option', { name: optionText })
  );
  return select;
};

// Checkbox/radio utilities
export const toggleCheckbox = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp
) => {
  const checkbox = getFormField(labelText);
  await user.click(checkbox);
  return checkbox;
};

export const selectRadio = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp
) => {
  const radio = getFormField(labelText);
  await user.click(radio);
  return radio;
};
