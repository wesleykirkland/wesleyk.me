import { GET } from '../route';

function createRequest(url: string) {
  return new Request(url);
}

describe('/robots.txt Route', () => {
  it('returns text/plain with expected directives', async () => {
    const req = createRequest('http://localhost:3000/robots.txt');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();

    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: http://localhost:3000/sitemap.xml');
    expect(text).toContain('Sitemap: http://localhost:3000/rss.xml');
  });
});
