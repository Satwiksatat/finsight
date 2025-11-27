import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

async function proxy() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/dashboard/alerts`, { cache: 'no-store' });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Dashboard alerts proxy failed', error);
  }
  return null;
}

export async function GET() {
  const backendData = await proxy();
  if (!backendData) {
    return NextResponse.json(
      { error: 'Alerts service unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json({ alerts: backendData.alerts ?? [] });
}
