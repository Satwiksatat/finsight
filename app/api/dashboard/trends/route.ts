import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

async function proxy(path: string) {
  try {
    const response = await fetch(`${BACKEND_API_URL}${path}`, { cache: 'no-store' });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Dashboard trends proxy failed', error);
  }
  return null;
}

export async function GET() {
  const backendData = await proxy('/api/dashboard/trends');
  if (!backendData) {
    return NextResponse.json(
      { error: 'Trend service unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json(backendData);
}
