import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/auth';

const PUBLIC_FILES = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthApi = pathname.startsWith('/api/auth');
  const isLoginRoute = pathname === '/login';

  if (pathname.startsWith('/_next') || pathname.startsWith('/api/preview') || pathname.startsWith('/static') || PUBLIC_FILES.test(pathname)) {
    return NextResponse.next();
  }

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (isLoginRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
