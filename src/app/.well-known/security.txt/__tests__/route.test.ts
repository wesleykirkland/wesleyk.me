import { GET } from '../route';

function createRequest(url: string) {
  return new Request(url);
}

describe('/.well-known/security.txt Route', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns defaults when env not set', async () => {
    delete process.env.SECURITY_CONTACT;
    const req = createRequest('http://localhost:3000/.well-known/security.txt');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');

    const text = await res.text();
    expect(text).toContain('Contact: mailto:security@wesleyk.me');
    expect(text).toContain('Policy: http://localhost:3000/security-policy');
    expect(text).toContain('Preferred-Languages: en');
    expect(text).toContain('Expires: ');
  });

  it('uses env when provided', async () => {
    process.env.SECURITY_CONTACT = 'mailto:sec@example.com';
    process.env.SECURITY_POLICY_URL = 'https://example.com/policy';
    process.env.SECURITY_PREFERRED_LANG = 'en,fr';
    process.env.SECURITY_EXPIRES_DAYS = '60';

    const req = createRequest('http://localhost:3000/.well-known/security.txt');
    const res = await GET(req);
    const text = await res.text();

    expect(text).toContain('Contact: mailto:sec@example.com');
    expect(text).toContain('Policy: https://example.com/policy');
    expect(text).toContain('Preferred-Languages: en,fr');
  });
});
