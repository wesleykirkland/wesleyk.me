import { GET } from '../route';

describe('/.well-known/assetlinks.json Route', () => {
  it('returns JSON array and correct content-type', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
