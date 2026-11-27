import { NextResponse } from 'next/server';
import { auth } from './auth';
import { can } from './lib/permissions';

export default auth((req) => {
  const { pathname, search, origin } = req.nextUrl;

  if (!req.auth) {
    const url = new URL('/login', origin);
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && !can(req.auth.user?.role, 'post:moderate')) {
    return NextResponse.redirect(new URL('/forbidden', origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/my-posts/:path*', '/admin/:path*'],
};
