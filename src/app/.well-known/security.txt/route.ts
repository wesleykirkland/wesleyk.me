import { NextResponse } from 'next/server';

export const revalidate = 604800; // 7 days

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  // Use env variables if provided
  const contact = process.env.SECURITY_CONTACT || 'mailto:security@wesleyk.me';
  const policy = process.env.SECURITY_POLICY_URL || `${origin}/security-policy`;
  const preferredLang = process.env.SECURITY_PREFERRED_LANG || 'en';
  const expiresDays = parseInt(process.env.SECURITY_EXPIRES_DAYS || '30', 10);
  const expiresDate = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  const body = [
    `Contact: ${contact}`,
    `Policy: ${policy}`,
    `Preferred-Languages: ${preferredLang}`,
    `Expires: ${expiresDate.toISOString()}`
  ].join('\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=604800, stale-while-revalidate=1209600'
    }
  });
}
