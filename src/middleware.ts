import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session_id');
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next();
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access for dashboard
  if (pathname.startsWith('/admin')) {
    const role = request.cookies.get('user_role')?.value;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/seed|_next/static|_next/image|favicon.ico).*)'],
};
