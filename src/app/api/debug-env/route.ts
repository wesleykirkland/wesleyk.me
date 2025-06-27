import { NextResponse } from 'next/server';

// This API route helps debug server-side environment variables
// Remove this file after debugging

export async function GET() {
  // Server-side environment variables
  const serverEnvVars = {
    // Build variables
    NODE_VERSION: process.env.NODE_VERSION,
    NPM_VERSION: process.env.NPM_VERSION,
    
    // Public variables (should also be available client-side)
    NEXT_PUBLIC_PROFESSIONAL_TITLE: process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE,
    NEXT_PUBLIC_FULL_TITLE: process.env.NEXT_PUBLIC_FULL_TITLE,
    NEXT_PUBLIC_NAME: process.env.NEXT_PUBLIC_NAME,
    NEXT_PUBLIC_TAGLINE: process.env.NEXT_PUBLIC_TAGLINE,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    NEXT_PUBLIC_YOUTUBE_PLAYLIST: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    NEXT_PUBLIC_OVERTRACKING_SITE_ID: process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID,
    
    // Secret variables (values hidden for security)
    SMTP_HOST: process.env.SMTP_HOST ? '✅ SET' : '❌ MISSING',
    SMTP_PORT: process.env.SMTP_PORT ? '✅ SET' : '❌ MISSING',
    SMTP_USERNAME: process.env.SMTP_USERNAME ? '✅ SET' : '❌ MISSING',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ SET' : '❌ MISSING',
    SMTP_FROM: process.env.SMTP_FROM ? '✅ SET' : '❌ MISSING',
    SMTP_TO: process.env.SMTP_TO ? '✅ SET' : '❌ MISSING',
    SMTP_TLS: process.env.SMTP_TLS ? '✅ SET' : '❌ MISSING',
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY ? '✅ SET' : '❌ MISSING',
    
    // Environment info
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY ? '✅ Running on Netlify' : '❌ Not on Netlify',
  };

  // Count missing variables
  const missingVars = Object.entries(serverEnvVars)
    .filter(([, value]) => value === '❌ MISSING' || !value)
    .map(([key]) => key);

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    isNetlify: !!process.env.NETLIFY,
    timestamp: new Date().toISOString(),
    variables: serverEnvVars,
    summary: {
      total: Object.keys(serverEnvVars).length,
      missing: missingVars.length,
      missingVariables: missingVars
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}

// Handle other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
