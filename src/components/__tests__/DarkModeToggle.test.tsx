import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock window.matchMedia
const matchMediaMock = jest.fn();

describe('DarkModeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true
    });

    // Reset document.documentElement.classList
    document.documentElement.classList.remove('dark');
  });

  describe('Initial Rendering', () => {
    it('renders loading state before mounting', () => {
      // Mock useState to return false for mounted state
      const mockUseState = jest.spyOn(React, 'useState');
      mockUseState.mockReturnValueOnce([false, jest.fn()]); // mounted = false
      mockUseState.mockReturnValueOnce([false, jest.fn()]); // darkMode = false

      render(<DarkModeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-label');

      // Should have placeholder content
      const placeholder = button.querySelector('.bg-gray-400');
      expect(placeholder).toBeInTheDocument();

      mockUseState.mockRestore();
    });

    it('renders with proper button structure', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: false });

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveClass('w-10', 'h-10', 'rounded-lg');
      });
    });
  });

  describe('Dark Mode Initialization', () => {
    it('initializes from localStorage when available', async () => {
      localStorageMock.getItem.mockReturnValue('true');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('initializes from system preference when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: true });

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('defaults to light mode when no preference is found', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: false });

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('Toggle Functionality', () => {
    it('toggles from light to dark mode', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'darkMode',
          'true'
        );
      });
    });

    it('toggles from dark to light mode', async () => {
      localStorageMock.getItem.mockReturnValue('true');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'darkMode',
          'false'
        );
      });
    });
  });

  describe('Icon Display', () => {
    it('shows moon icon in light mode', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        const moonIcon = button.querySelector('svg');
        expect(moonIcon).toBeInTheDocument();
        expect(moonIcon).toHaveClass('text-gray-700');
      });
    });

    it('shows sun icon in dark mode', async () => {
      localStorageMock.getItem.mockReturnValue('true');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        const sunIcon = button.querySelector('svg');
        expect(sunIcon).toBeInTheDocument();
        expect(sunIcon).toHaveClass('text-yellow-500');
      });
    });

    it('changes icon when toggled', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        const moonIcon = button.querySelector('.text-gray-700');
        expect(moonIcon).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const button = screen.getByRole('button');
        const sunIcon = button.querySelector('.text-yellow-500');
        expect(sunIcon).toBeInTheDocument();
      });
    });
  });

  describe('DOM Manipulation', () => {
    it('adds dark class to documentElement when enabling dark mode', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('removes dark class from documentElement when disabling dark mode', async () => {
      localStorageMock.getItem.mockReturnValue('true');

      render(<DarkModeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for screen readers', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      });
    });

    it('updates aria-label when mode changes', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      let button: HTMLElement;
      await waitFor(() => {
        button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      });
    });

    it('is keyboard accessible', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Styling', () => {
    it('applies hover styles', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass(
          'hover:bg-gray-300',
          'dark:hover:bg-gray-600'
        );
      });
    });

    it('applies transition styles', async () => {
      localStorageMock.getItem.mockReturnValue('false');

      render(<DarkModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('transition-colors', 'duration-200');
      });
    });
  });
});
