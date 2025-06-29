import { render } from '@testing-library/react';
import Overtracking from '../Overtracking';

// Mock Next.js Script component
jest.mock('next/script', () => {
  return function MockScript({
    src,
    onLoad,
    onError,
    ...props
  }: {
    src: string;
    onLoad?: () => void;
    onError?: (e: Error) => void;
    [key: string]: unknown;
  }) {
    return (
      <div
        data-src={src}
        data-onload={onLoad ? 'true' : 'false'}
        data-onerror={onError ? 'true' : 'false'}
        data-testid="overtracking-script"
        {...props}
      />
    );
  };
});

describe('Overtracking Component', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders script when site ID is provided and enabled', () => {
    process.env.NODE_ENV = 'production';

    const { getByTestId } = render(
      <Overtracking siteId="test-site-id" enabled={true} />
    );

    const script = getByTestId('overtracking-script');
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute(
      'data-src',
      'https://cdn.overtracking.com/t/test-site-id/'
    );
  });

  it('does not render when site ID is missing', () => {
    const { queryByTestId } = render(<Overtracking siteId="" enabled={true} />);

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    const { queryByTestId } = render(
      <Overtracking siteId="test-site-id" enabled={false} />
    );

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });

  it('uses environment variable for site ID by default', () => {
    process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = 'env-site-id';
    process.env.NODE_ENV = 'production';

    const { getByTestId } = render(<Overtracking />);

    const script = getByTestId('overtracking-script');
    expect(script).toHaveAttribute(
      'data-src',
      'https://cdn.overtracking.com/t/env-site-id/'
    );
  });

  it('defaults to production-only when no enabled prop provided', () => {
    process.env.NODE_ENV = 'development';

    const { queryByTestId } = render(<Overtracking siteId="test-site-id" />);

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });
});
