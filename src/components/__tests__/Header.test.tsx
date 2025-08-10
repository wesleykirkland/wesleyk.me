import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, ...props }: any) {
    return (
      <a href={href} onClick={onClick} {...props}>
        {children}
      </a>
    );
  };
});

// Mock DarkModeToggle component
jest.mock('../DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button data-testid="dark-mode-toggle">Dark Mode Toggle</button>;
  };
});

// Mock environment variables
const originalEnv = process.env;

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_NAME: 'Test Name',
      NEXT_PUBLIC_TAGLINE: 'Test Tagline',
      NEXT_PUBLIC_GITHUB_URL: 'https://github.com/testuser',
      NEXT_PUBLIC_LINKEDIN_URL: 'https://linkedin.com/in/testuser',
      NEXT_PUBLIC_YOUTUBE_PLAYLIST: 'https://youtube.com/playlist?list=test'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Basic Rendering', () => {
    it('renders header with proper structure', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-white', 'dark:bg-gray-900', 'shadow-sm');
    });

    it('displays site name and tagline from environment variables', () => {
      render(<Header />);

      expect(screen.getByText('Test Name')).toBeInTheDocument();
      expect(screen.getByText('Test Tagline')).toBeInTheDocument();
    });

    it('displays logo with initials', () => {
      render(<Header />);

      const logo = screen.getByText('PS');
      expect(logo).toBeInTheDocument();
      expect(logo.parentElement).toHaveClass(
        'w-12',
        'h-12',
        'bg-blue-600',
        'rounded-lg'
      );
    });
  });

  describe('Desktop Navigation', () => {
    it('renders all navigation links', () => {
      render(<Header />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
        'href',
        '/'
      );
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
        'href',
        '/blog'
      );
      expect(screen.getByRole('link', { name: 'About Me' })).toHaveAttribute(
        'href',
        '/about'
      );
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
        'href',
        '/contact'
      );
      expect(
        screen.getByRole('link', { name: 'Security Research/Case Studies' })
      ).toHaveAttribute('href', '/security-research');
      expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute(
        'href',
        '/rss.xml'
      );
    });

    it('applies proper styling to navigation links', () => {
      render(<Header />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass(
        'text-gray-700',
        'dark:text-gray-300',
        'hover:text-blue-600'
      );
    });

    it('hides navigation on mobile', () => {
      render(<Header />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Social Links', () => {
    it('renders GitHub link with correct URL', () => {
      render(<Header />);

      const githubLinks = screen.getAllByLabelText('GitHub');
      expect(githubLinks[0]).toHaveAttribute(
        'href',
        'https://github.com/testuser'
      );
      expect(githubLinks[0]).toHaveAttribute('target', '_blank');
      expect(githubLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders LinkedIn link with correct URL', () => {
      render(<Header />);

      const linkedinLinks = screen.getAllByLabelText('LinkedIn');
      expect(linkedinLinks[0]).toHaveAttribute(
        'href',
        'https://linkedin.com/in/testuser'
      );
      expect(linkedinLinks[0]).toHaveAttribute('target', '_blank');
      expect(linkedinLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders YouTube link with correct URL', () => {
      render(<Header />);

      const youtubeLinks = screen.getAllByLabelText('YouTube');
      expect(youtubeLinks[0]).toHaveAttribute(
        'href',
        'https://youtube.com/playlist?list=test'
      );
      expect(youtubeLinks[0]).toHaveAttribute('target', '_blank');
      expect(youtubeLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('includes proper SVG icons for social links', () => {
      render(<Header />);

      const githubLink = screen.getAllByLabelText('GitHub')[0];
      const githubSvg = githubLink.querySelector('svg');
      expect(githubSvg).toBeInTheDocument();
      expect(githubSvg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Dark Mode Toggle', () => {
    it('renders dark mode toggle in desktop view', () => {
      render(<Header />);

      const darkModeToggles = screen.getAllByTestId('dark-mode-toggle');
      expect(darkModeToggles.length).toBeGreaterThan(0);
    });

    it('renders dark mode toggle in mobile view', () => {
      render(<Header />);

      // Should have both desktop and mobile dark mode toggles
      const darkModeToggles = screen.getAllByTestId('dark-mode-toggle');
      expect(darkModeToggles.length).toBe(2); // Desktop and mobile
      // Ensure RSS link present in desktop nav (hidden on mobile)
      expect(screen.getByRole('link', { name: 'RSS' })).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton.parentElement).toHaveClass('md:hidden');
    });

    it('shows hamburger icon when menu is closed', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');
      const hamburgerPath = menuButton.querySelector(
        'path[d="M4 6h16M4 12h16M4 18h16"]'
      );
      expect(hamburgerPath).toBeInTheDocument();
    });

    it('toggles mobile menu when button is clicked', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');

      // Initially menu should be closed - check for mobile-specific content
      expect(
        screen.queryByText('Home', { selector: '.block' })
      ).not.toBeInTheDocument();

      // Click to open menu
      fireEvent.click(menuButton);

      // Menu should now be open with mobile navigation links
      const mobileHomeLink = screen.getByText('Home', { selector: '.block' });
      expect(mobileHomeLink).toBeInTheDocument();
    });

    it('shows close icon when menu is open', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      const closeIcon = menuButton.querySelector(
        'path[d="M6 18L18 6M6 6l12 12"]'
      );
      expect(closeIcon).toBeInTheDocument();
    });

    it('updates aria-expanded attribute', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(menuButton);

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Mobile Menu Content', () => {
    beforeEach(() => {
      render(<Header />);
      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);
    });

    it('renders all mobile navigation links', () => {
      // Check for mobile-specific links (with .block class)
      expect(
        screen.getByText('Home', { selector: '.block' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Blog', { selector: '.block' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('About Me', { selector: '.block' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Contact', { selector: '.block' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Security Research/Case Studies', {
          selector: '.block'
        })
      ).toBeInTheDocument();
    });

    it('closes menu when mobile link is clicked', () => {
      const mobileHomeLink = screen.getByText('Home', { selector: '.block' });

      fireEvent.click(mobileHomeLink);

      // Menu should close - mobile links should no longer be visible
      expect(
        screen.queryByText('Home', { selector: '.block' })
      ).not.toBeInTheDocument();
    });

    it('renders mobile social links', () => {
      const githubLinks = screen.getAllByLabelText('GitHub');
      expect(githubLinks.length).toBe(2); // Desktop + mobile

      const linkedinLinks = screen.getAllByLabelText('LinkedIn');
      expect(linkedinLinks.length).toBe(2); // Desktop + mobile

      const youtubeLinks = screen.getAllByLabelText('YouTube');
      expect(youtubeLinks.length).toBe(2); // Desktop + mobile
    });

    it('applies proper mobile styling', () => {
      const mobileContainer = screen
        .getByText('Home', { selector: '.block' })
        .closest('.md\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('hides desktop elements on mobile', () => {
      render(<Header />);

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');

      const desktopSocialContainer = desktopNav.nextElementSibling;
      expect(desktopSocialContainer).toHaveClass('hidden', 'md:flex');
    });

    it('shows mobile elements only on mobile', () => {
      render(<Header />);

      const darkModeToggles = screen.getAllByTestId('dark-mode-toggle');
      const mobileToggle = darkModeToggles.find((toggle) =>
        toggle.closest('.md\\:hidden')
      );
      expect(mobileToggle).toBeInTheDocument();

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton.parentElement).toHaveClass('md:hidden');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('provides proper aria labels', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveClass('focus:outline-none');
    });
  });

  describe('Logo Link', () => {
    it('links to home page', () => {
      render(<Header />);

      const logoLink = screen.getByText('PS').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('includes both logo and text in link', () => {
      render(<Header />);

      const logoLink = screen.getByText('PS').closest('a');
      expect(logoLink).toContainElement(screen.getByText('Test Name'));
      expect(logoLink).toContainElement(screen.getByText('Test Tagline'));
    });
  });
});
