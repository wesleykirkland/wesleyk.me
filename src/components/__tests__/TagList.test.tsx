import { render, screen } from '@testing-library/react';
import TagList from '../TagList';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock the client blog utils
jest.mock('@/lib/client-blog-utils', () => ({
  getTagSlug: jest.fn((tag: string) => tag.toLowerCase().replace(/\s+/g, '-'))
}));

describe('TagList Component', () => {
  const mockTags = ['JavaScript', 'React', 'Next.js', 'TypeScript'];

  describe('Basic Rendering', () => {
    it('renders tags correctly', () => {
      render(<TagList tags={mockTags} />);

      mockTags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('renders nothing when tags array is empty', () => {
      const { container } = render(<TagList tags={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when tags is null/undefined', () => {
      const { container } = render(<TagList tags={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('applies custom className', () => {
      const { container } = render(
        <TagList tags={mockTags} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      render(<TagList tags={['Test']} size="sm" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('applies medium size classes (default)', () => {
      render(<TagList tags={['Test']} size="md" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-3', 'py-1', 'text-xs');
    });

    it('applies large size classes', () => {
      render(<TagList tags={['Test']} size="lg" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-4', 'py-2', 'text-sm');
    });
  });

  describe('Style Variants', () => {
    it('applies default variant classes', () => {
      render(<TagList tags={['Test']} variant="default" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('applies outline variant classes', () => {
      render(<TagList tags={['Test']} variant="outline" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('border', 'border-blue-300', 'text-blue-700');
    });

    it('applies solid variant classes', () => {
      render(<TagList tags={['Test']} variant="solid" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  describe('Current Tag Highlighting', () => {
    it('highlights current tag with special styling', () => {
      render(<TagList tags={mockTags} currentTag="React" />);
      const reactLink = screen.getByText('React').closest('a');
      expect(reactLink).toHaveClass('bg-blue-600', 'text-white');
    });

    it('does not highlight other tags when current tag is set', () => {
      render(<TagList tags={mockTags} currentTag="React" variant="outline" />);
      const jsLink = screen.getByText('JavaScript').closest('a');
      expect(jsLink).toHaveClass('border', 'border-blue-300');
      expect(jsLink).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Links and Navigation', () => {
    it('creates correct href for each tag', () => {
      render(<TagList tags={['JavaScript', 'React Native']} />);

      const jsLink = screen.getByText('JavaScript').closest('a');
      expect(jsLink).toHaveAttribute('href', '/tag/javascript');

      const reactNativeLink = screen.getByText('React Native').closest('a');
      expect(reactNativeLink).toHaveAttribute('href', '/tag/react-native');
    });

    it('includes proper title attributes for accessibility', () => {
      render(<TagList tags={['Test Tag']} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'title',
        'View all posts tagged with "Test Tag"'
      );
    });
  });

  describe('Show Count Feature', () => {
    it('renders count span when showCount is true', () => {
      render(<TagList tags={['Test']} showCount={true} />);
      const countSpan = screen
        .getByText('Test')
        .parentElement?.querySelector('.ml-1');
      expect(countSpan).toBeInTheDocument();
      expect(countSpan).toHaveClass('ml-1', 'text-xs', 'opacity-75');
    });

    it('does not render count span when showCount is false', () => {
      render(<TagList tags={['Test']} showCount={false} />);
      const countSpan = screen
        .getByText('Test')
        .parentElement?.querySelector('.ml-1');
      expect(countSpan).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string tags', () => {
      render(<TagList tags={['', 'Valid Tag']} />);
      expect(screen.getByText('Valid Tag')).toBeInTheDocument();

      // Should still render the empty tag with a fallback key
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });

    it('handles duplicate tags', () => {
      render(<TagList tags={['React', 'React', 'JavaScript']} />);
      const reactLinks = screen.getAllByText('React');
      expect(reactLinks).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<TagList tags={mockTags} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(mockTags.length);

      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link).toHaveAttribute('title');
      });
    });
  });
});
