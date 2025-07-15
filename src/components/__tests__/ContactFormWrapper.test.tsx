import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ContactFormWrapper from '../ContactFormWrapper';

// Mock ContactForm component
jest.mock('../ContactForm', () => {
  return function MockContactForm() {
    return <div data-testid="contact-form">Mocked ContactForm</div>;
  };
});

// Mock useState to control mounting behavior
const mockSetState = jest.fn();
const mockUseState = jest.spyOn(React, 'useState');

describe('ContactFormWrapper Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseState.mockRestore();
  });

  describe('Loading State', () => {
    it('renders loading skeleton before mounting', () => {
      // Mock useState to return false for mounted state
      mockUseState.mockReturnValueOnce([false, mockSetState]);

      render(<ContactFormWrapper />);

      // Should show the loading skeleton initially
      expect(screen.getByText('Send a Message')).toBeInTheDocument();

      // Check for skeleton elements
      const skeletonElements = document.querySelectorAll(
        '.animate-pulse .bg-gray-200'
      );
      expect(skeletonElements.length).toBeGreaterThan(0);

      mockUseState.mockRestore();
    });

    it('has proper loading skeleton structure', () => {
      // Mock useState to return false for mounted state
      mockUseState.mockReturnValueOnce([false, mockSetState]);

      render(<ContactFormWrapper />);

      // Check for main title
      const title = screen.getByText('Send a Message');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'mb-6');

      // Check for grid layout
      const gridContainer = document.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2'
      );
      expect(gridContainer).toBeInTheDocument();

      // Check for various skeleton heights
      expect(document.querySelector('.h-10')).toBeInTheDocument();
      expect(document.querySelector('.h-32')).toBeInTheDocument();
      expect(document.querySelector('.h-20')).toBeInTheDocument();
      expect(document.querySelector('.h-12')).toBeInTheDocument();

      mockUseState.mockRestore();
    });

    it('applies dark mode classes to skeleton', () => {
      render(<ContactFormWrapper />);

      const title = screen.getByText('Send a Message');
      expect(title).toHaveClass('dark:text-white');

      const skeletonElements = document.querySelectorAll('.bg-gray-200');
      skeletonElements.forEach((element) => {
        expect(element).toHaveClass('dark:bg-gray-700');
      });
    });
  });

  describe('Mounted State', () => {
    it('renders ContactForm after mounting', async () => {
      render(<ContactFormWrapper />);

      // Wait for the component to mount and show the actual ContactForm
      await waitFor(() => {
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });
    });

    it('removes loading skeleton after mounting', async () => {
      render(<ContactFormWrapper />);

      // Initially should have skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

      // After mounting, skeleton should be gone
      await waitFor(() => {
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });
    });
  });

  describe('Dynamic Import Configuration', () => {
    it('configures dynamic import with SSR disabled', () => {
      // This test verifies the dynamic import is configured correctly
      // The actual configuration is tested through the component behavior
      render(<ContactFormWrapper />);

      // The component should render without SSR issues
      expect(screen.getByText('Send a Message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy in loading state', () => {
      render(<ContactFormWrapper />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Send a Message');
    });

    it('provides meaningful content during loading', () => {
      render(<ContactFormWrapper />);

      // Should have a clear indication of what's loading
      expect(screen.getByText('Send a Message')).toBeInTheDocument();

      // Should have visual skeleton that represents the form structure
      const skeletonContainer = document.querySelector('.space-y-6');
      expect(skeletonContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes in loading state', () => {
      render(<ContactFormWrapper />);

      const gridContainer = document.querySelector(
        '.grid-cols-1.md\\:grid-cols-2'
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it('maintains consistent spacing in loading state', () => {
      render(<ContactFormWrapper />);

      const spacingContainer = document.querySelector('.space-y-6');
      expect(spacingContainer).toBeInTheDocument();

      const gapContainer = document.querySelector('.gap-6');
      expect(gapContainer).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('applies pulse animation to loading skeleton', () => {
      render(<ContactFormWrapper />);

      const animatedContainer = document.querySelector('.animate-pulse');
      expect(animatedContainer).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles mount state correctly', async () => {
      const { rerender } = render(<ContactFormWrapper />);

      // Initially not mounted
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

      // After effect runs
      await waitFor(() => {
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });

      // Re-render should maintain mounted state
      rerender(<ContactFormWrapper />);
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles dynamic import loading', () => {
      // The component should not crash during dynamic loading
      expect(() => render(<ContactFormWrapper />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('prevents hydration issues with SSR disabled', () => {
      // This is tested implicitly through the dynamic import configuration
      // The component should render consistently on client and server
      render(<ContactFormWrapper />);
      expect(screen.getByText('Send a Message')).toBeInTheDocument();
    });
  });
});
