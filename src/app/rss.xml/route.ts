import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import {
  getSortedPostsData,
  getSafePostUrl,
  parsePostDate,
  type BlogPostMetadata
} from '@/lib/blog';

// Revalidate the RSS feed periodically (1 hour)
export const revalidate = 3600;

function sanitizeText(input: string | undefined): string {
  return sanitizeHtml(input ?? '', {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

function toCdata(input: string | undefined): string {
  // Sanitize content to plain text and ensure CDATA safety
  const clean = sanitizeText(input);
  // Prevent closing the CDATA section prematurely
  return clean.replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET(request: Request) {
  // Determine absolute site origin from the request
  const origin = new URL(request.url).origin;

  // Get the latest 10 posts (already sorted newest-first)
  const posts: BlogPostMetadata[] = getSortedPostsData().slice(0, 10);

  const siteTitle =
    process.env.NEXT_PUBLIC_FULL_TITLE ??
    process.env.NEXT_PUBLIC_NAME ??
    'wesleyk.me';
  const siteDescription =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? 'Latest blog posts';
  const siteLink = `${origin}/blog`;

  const itemsXml = posts
    .map((post) => {
      const linkPath = getSafePostUrl(post);
      const link = `${origin}${linkPath}`;
      const guid = link; // Use canonical absolute URL as GUID
      const pubDate = parsePostDate(post.date).toUTCString();
      const title = sanitizeText(post.title);
      const description = toCdata(post.excerpt);

      return [
        '  <item>',
        `    <title>${title}</title>`,
        `    <link>${link}</link>`,
        `    <guid>${guid}</guid>`,
        `    <pubDate>${pubDate}</pubDate>`,
        `    <description><![CDATA[${description}]]></description>`,
        '  </item>'
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `  <title>${sanitizeText(siteTitle)}</title>`,
    `  <link>${siteLink}</link>`,
    `  <description>${sanitizeText(siteDescription)}</description>`,
    '  <language>en-us</language>',
    `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    itemsXml,
    '</channel>',
    '</rss>'
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
