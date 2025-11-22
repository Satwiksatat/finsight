import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_USER_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const userId = (formData.get('user_id') as string) || DEFAULT_USER_ID;
  const title = formData.get('title') as string | null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.append('file', file);
  backendFormData.append('user_id', userId);
  if (title) {
    backendFormData.append('title', title);
  }

  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  const response = await fetch(`${backendUrl}/api/documents/upload`, {
    method: 'POST',
    body: backendFormData,
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

