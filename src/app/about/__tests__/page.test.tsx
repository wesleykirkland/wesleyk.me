import { render, screen } from '@testing-library/react';
import About from '../page';

describe('About Page', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.NEXT_PUBLIC_FULL_TITLE =
      'Sr. Cloud Development and DevOps Engineer';
    process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE =
      'Sr. Cloud Development and DevOps Engineer';
    process.env.NEXT_PUBLIC_NAME = 'Test Name';
    process.env.NEXT_PUBLIC_LINKEDIN_URL = 'https://linkedin.com/in/testuser';
    process.env.NEXT_PUBLIC_GITHUB_URL = 'https://github.com/testuser';
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('renders key sections and headings', () => {
    render(<About />);

    expect(
      screen.getByRole('heading', { name: 'About Me' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'History' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { name: 'Skills' }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole('heading', { name: 'Current Focus' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Experience Highlights' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Publications' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Awards & Recognition' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Education' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Elsewhere' })
    ).toBeInTheDocument();
  });

  it('includes publication links', () => {
    const { container } = render(<About />);

    // PowerShell Conference Book external link
    const book = screen.getByRole('link', {
      name: 'The PowerShell Conference Book'
    });
    expect(book).toHaveAttribute(
      'href',
      'https://leanpub.com/powershell-conference-book'
    );

    // Internal case study link - assert by href to avoid text normalization differences
    const caseStudy = container.querySelector(
      'a[href*="/2020/01/10/my-first-vulnerability-mimecast-sender-address-verification"]'
    );
    expect(caseStudy).not.toBeNull();
  });

  it('renders external profile links when env is set', () => {
    render(<About />);

    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute(
      'href',
      'https://linkedin.com/in/testuser'
    );

    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', 'https://github.com/testuser');
  });
});
