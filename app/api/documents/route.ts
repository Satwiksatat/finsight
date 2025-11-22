import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  const response = await fetch(`${backendUrl}/api/documents?user_id=${encodeURIComponent(userId)}`, {
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

