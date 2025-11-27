import { NextRequest, NextResponse } from 'next/server';
import { USER_COOKIE_NAME, decodeUser, defaultAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(USER_COOKIE_NAME)?.value;
  const user = decodeUser(cookieValue) || defaultAuthUser;
  return NextResponse.json({ user });
}
