import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

async function fetchBackend(path: string) {
  try {
    const response = await fetch(`${BACKEND_API_URL}${path}`, { cache: 'no-store' });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Dashboard KPI proxy failed', error);
  }
  return null;
}

export async function GET() {
  const backendData = await fetchBackend('/api/dashboard/kpis');
  if (!backendData) {
    return NextResponse.json(
      { error: 'Dashboard service unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json(backendData);
}
