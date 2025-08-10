jest.mock('@/lib/blog', () => ({
  getSortedPostsData: jest.fn(() => [
    { slug: 'post-1', title: 'P1', date: '2024-01-01' },
    { slug: 'post-2', title: 'P2', date: '2024-01-02' }
  ]),
  getSafePostUrl: (p: any) => `/${p.slug}`,
  parsePostDate: (s: string) => new Date(s)
}));

import { GET } from '../route';

function createRequest(url: string) {
  return new Request(url);
}

describe('/sitemap.xml Route', () => {
  it('returns XML including static and post URLs', async () => {
    const req = createRequest('http://localhost:3000/sitemap.xml');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/xml');

    const text = await res.text();
    expect(text).toContain('<urlset');
    // Static paths
    expect(text).toContain('http://localhost:3000/');
    expect(text).toContain('http://localhost:3000/blog');
    // Posts
    expect(text).toContain('http://localhost:3000/post-1');
    expect(text).toContain('http://localhost:3000/post-2');
  });
});
