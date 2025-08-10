// Mock blog utilities BEFORE importing the route to avoid loading ESM remark via lib/blog
jest.mock('@/lib/blog', () => {
  return {
    parsePostDate: (s: string) => new Date(s),
    getSortedPostsData: jest.fn(() =>
      Array.from({ length: 12 }).map((_, i) => ({
        slug: `post-${i + 1}`,
        title: `Title ${i + 1}`,
        date: '2024-01-0' + ((i % 9) + 1),
        excerpt: `Excerpt ${i + 1}`,
        tags: [],
        author: 'Author'
      }))
    ),
    getSafePostUrl: jest.fn((post: any) => `/${post.slug}`)
  };
});

import { GET } from '../route';

function createRequest(url: string) {
  return new Request(url);
}

describe('/rss.xml Route', () => {
  it('returns RSS XML with 10 items', async () => {
    const req = createRequest('http://localhost:3000/rss.xml');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/rss+xml');

    const text = await res.text();
    const itemCount = (text.match(/<item>/g) || []).length;
    expect(itemCount).toBe(10);
    expect(text).toContain('<rss');
    expect(text).toContain('<channel>');
    expect(text).toContain('<title>');
  });
});
