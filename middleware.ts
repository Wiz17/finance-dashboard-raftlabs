import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup'];
// Path to redirect to when authentication is required
const LOGIN_PATH = '/login';
// Path to redirect to when user is already authenticated
const HOME_PATH = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('token')?.value;

  console.debug('Middleware:', { path: pathname, hasSession: !!sessionToken });

  // Handle authenticated user trying to access public paths
  if (sessionToken && PUBLIC_PATHS.includes(pathname)) {
    console.debug('Redirecting authenticated user from public path to home');
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // Handle unauthenticated user trying to access protected paths
  if (!sessionToken && !PUBLIC_PATHS.includes(pathname) && !pathname.startsWith('/_next')) {
    console.debug('Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // Allow request to proceed for valid cases
  return NextResponse.next();
}

// Middleware configuration - add '/savings' to the matcher
export const config = {
  matcher: ['/', '/login', '/signup', '/savings'],
};