import { NextResponse } from 'next/server';

export const revalidate = 604800; // 7 days

export async function GET() {
  // Prepopulate with empty array; user can customize if needed for Android app links
  const payload: unknown[] = [];
  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=604800, stale-while-revalidate=1209600'
    }
  });
}
