import { render, screen } from '@testing-library/react';
import About from '../page';

describe('About Page', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
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
      screen.getByRole('heading', { name: 'Certifications' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Fun Fact' })
    ).toBeInTheDocument();
  });
});
