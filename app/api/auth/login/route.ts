import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  USER_COOKIE_NAME,
  createMockToken,
  demoUsers,
  defaultAuthUser,
  encodeUser,
} from '@/lib/auth';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email: string | undefined = payload.email;
  const persona: string | undefined = payload.personaId;

  const matchedUser =
    demoUsers.find((user) => user.email === email) ||
    demoUsers.find((user) => user.id === persona) ||
    defaultAuthUser;

  const token = createMockToken(matchedUser.email);

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const detectedProto = forwardedProto?.split(',')[0]?.trim();
  const urlFromRequest = new URL(request.url);
  const isSecureCookie = detectedProto
    ? detectedProto === 'https'
    : urlFromRequest.protocol === 'https:';

  const response = NextResponse.json({ ok: true, user: matchedUser });
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: isSecureCookie,
    maxAge: AUTH_COOKIE_MAX_AGE,
  };

  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
  response.cookies.set(USER_COOKIE_NAME, encodeUser(matchedUser), {
    path: '/',
    sameSite: 'lax',
    secure: isSecureCookie,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return response;
}
