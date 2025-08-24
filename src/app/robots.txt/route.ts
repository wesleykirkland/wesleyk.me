import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const host = origin.replace(/^https?:\/\//, '');

  const sitemapUrl = `${origin}/sitemap.xml`;
  const rssUrl = `${origin}/rss.xml`;

  // Allow overriding disallow rules via env var, default to protecting API
  const disallowPaths = (process.env.ROBOTS_DISALLOW || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const rules = disallowPaths.length
    ? disallowPaths.map((p) => `Disallow: ${p}`)
    : ['Allow: /'];

  const body = [
    'User-agent: *',
    ...rules,
    `Host: ${host}`,
    `Sitemap: ${sitemapUrl}`,
    `Sitemap: ${rssUrl}`
  ].join('\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
