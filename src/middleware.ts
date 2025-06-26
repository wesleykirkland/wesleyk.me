import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /blog/permalink redirects to root-level permalinks
  if (pathname.startsWith('/blog/') && pathname !== '/blog' && pathname !== '/blog/') {
    // Extract the permalink part after /blog/
    const permalink = pathname.replace('/blog/', '');

    // Skip if it's the blog listing page or API routes
    if (permalink && !permalink.startsWith('api/')) {
      // 301/308 permanent redirect to root-level permalink
      const newUrl = `${request.nextUrl.origin}/${permalink}`;
      return NextResponse.redirect(newUrl, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
