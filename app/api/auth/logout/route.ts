import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const expired = { path: '/', expires: new Date(0) };
  response.cookies.set(AUTH_COOKIE_NAME, '', expired);
  response.cookies.set(USER_COOKIE_NAME, '', expired);
  return response;
}
