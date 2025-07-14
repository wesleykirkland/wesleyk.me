import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import SearchBox from '../SearchBox';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the blog search functions
jest.mock('@/lib/blog', () => ({
  getSearchSuggestions: jest.fn()
}));

const mockPush = jest.fn();
<<<<<<< HEAD
import { getSearchSuggestions } from '@/lib/blog';

const mockGetSearchSuggestions = getSearchSuggestions as jest.MockedFunction<
  typeof getSearchSuggestions
>;
=======
const mockGetSearchSuggestions = require('@/lib/blog').getSearchSuggestions;
>>>>>>> e3faeb4 (Add search functionality)

describe('SearchBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    mockGetSearchSuggestions.mockReturnValue([]);
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search blog posts...');
    });

    it('renders with custom placeholder', () => {
      render(<SearchBox placeholder="Custom placeholder" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('renders with initial value', () => {
      render(<SearchBox initialValue="test query" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('test query');
    });

    it('applies custom className', () => {
      const { container } = render(<SearchBox className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<SearchBox size="sm" />);
      let input = screen.getByRole('combobox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');

      rerender(<SearchBox size="lg" />);
      input = screen.getByRole('combobox');
      expect(input).toHaveClass('px-6', 'py-4', 'text-lg');
    });
  });

  describe('User Interactions', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test query');

      expect(input).toHaveValue('test query');
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test query');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('focuses input when autoFocus is true', () => {
      render(<SearchBox autoFocus />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveFocus();
    });
  });

  describe('Search Functionality', () => {
    it('navigates to search page on Enter key', async () => {
      const user = userEvent.setup();
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test query');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=test+query');
    });

    it('calls onSearch callback when provided', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test query');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('test query');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('does not search with empty query', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);

      await user.keyboard('{Enter}');

      expect(mockOnSearch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('trims whitespace from search query', async () => {
      const user = userEvent.setup();
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, '  test query  ');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=test+query');
    });
  });

  describe('Suggestions', () => {
    const mockSuggestions = [
      'JavaScript Tutorial',
      'React Hooks Guide',
      'Security Analysis'
    ];

    it('shows suggestions when typing', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={mockSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Java');

      await waitFor(() => {
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      });
    });

    it('hides suggestions when showSuggestions is false', async () => {
      const user = userEvent.setup();
      render(<SearchBox showSuggestions={false} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Java');

      await waitFor(() => {
        expect(
          screen.queryByText('JavaScript Tutorial')
        ).not.toBeInTheDocument();
      });
    });

    it('selects suggestion with arrow keys and Enter', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={mockSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Java');

      await waitFor(() => {
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=JavaScript+Tutorial');
    });

    it('clicks on suggestion to search', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={mockSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Java');

      await waitFor(() => {
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      });

      await user.click(screen.getByText('JavaScript Tutorial'));

      expect(mockPush).toHaveBeenCalledWith('/search?q=JavaScript+Tutorial');
    });

    it('handles keyboard navigation correctly', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={mockSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Java');

      await waitFor(() => {
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      });

      // Test arrow down navigation
      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', 'suggestion-0');

      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', 'suggestion-1');

      // Test arrow up navigation
      await user.keyboard('{ArrowUp}');
      expect(input).toHaveAttribute('aria-activedescendant', 'suggestion-0');

      // Test escape key
      await user.keyboard('{Escape}');
      expect(screen.queryByText('JavaScript Tutorial')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Search blog posts');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('updates ARIA attributes when suggestions are shown', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={['Test Suggestion']} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('has proper role attributes for suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={['Test Suggestion']} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();

        const option = screen.getByRole('option');
        expect(option).toBeInTheDocument();
        expect(option).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty suggestions gracefully', async () => {
      mockGetSearchSuggestions.mockReturnValue([]);
      const user = userEvent.setup();
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'nonexistent');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('debounces search suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={['test suggestion']} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      // Should show suggestions after debounce delay
      await waitFor(
        () => {
          expect(screen.getByText('test suggestion')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('handles focus and blur events correctly', async () => {
      const user = userEvent.setup();
      render(<SearchBox suggestions={['Test Suggestion']} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(screen.getByText('Test Suggestion')).toBeInTheDocument();
      });

      // Focus should show suggestions if they exist
      await user.click(input);
      expect(screen.getByText('Test Suggestion')).toBeInTheDocument();

      // Blur should hide suggestions (with delay)
      await user.tab();
      await waitFor(
        () => {
          expect(screen.queryByText('Test Suggestion')).not.toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });
  });
});
