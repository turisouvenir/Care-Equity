import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);
    const res = await fetch(`${BACKEND}/hospitals`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Proxy /api/hospitals error:', err);
    return NextResponse.json(
      { success: false, message: 'Could not reach backend.' },
      { status: 502 }
    );
  }
}
