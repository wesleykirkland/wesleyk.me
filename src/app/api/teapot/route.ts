import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      message: "I'm a teapot 🫖",
      status: 418,
      tip: "Don't brew coffee with me."
    },
    { status: 418 }
  );
}
