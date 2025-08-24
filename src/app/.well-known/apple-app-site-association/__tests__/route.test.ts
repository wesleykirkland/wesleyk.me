import { GET } from '../route';

describe('/.well-known/apple-app-site-association Route', () => {
  it('returns JSON with applinks structure', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(data).toHaveProperty('applinks');
    expect(data.applinks).toHaveProperty('apps');
    expect(data.applinks).toHaveProperty('details');
  });
});
