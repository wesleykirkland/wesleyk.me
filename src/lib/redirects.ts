import { NextResponse } from 'next/server';

// Custom 301 redirect function that works in both development and production
export function redirect301(url: string): NextResponse {
  return NextResponse.redirect(url, 301);
}

// For use in middleware
export function createRedirect301(request: Request, newPath: string): NextResponse {
  const url = new URL(newPath, request.url);
  return NextResponse.redirect(url, 301);
}
