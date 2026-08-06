import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacy = pathname.match(/^\/(fr|en|ar)(\/|$)/);
  if (legacy) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(fr|en|ar)/, '') || '/';
    return NextResponse.redirect(url);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fr|en|ar)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
