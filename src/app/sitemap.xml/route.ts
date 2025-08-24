import { NextResponse } from 'next/server';
import { getSortedPostsData, getSafePostUrl, parsePostDate } from '@/lib/blog';

export const revalidate = 86400; // 24 hours

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const staticPaths = [
    '/',
    '/blog',
    '/about',
    '/contact',
    '/security-research'
  ];

  const posts = getSortedPostsData();

  const urls = [
    ...staticPaths.map((p) => ({ url: `${origin}${p}`, lastmod: new Date() })),
    ...posts.map((p) => ({
      url: `${origin}${getSafePostUrl(p)}`,
      lastmod: parsePostDate(p.date)
    }))
  ];

  const urlset = urls
    .map(
      (u) =>
        `  <url><loc>${
          u.url
        }</loc><lastmod>${u.lastmod.toISOString()}</lastmod></url>`
    ) // keep minimal
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlset,
    '</urlset>'
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
