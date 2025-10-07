import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-phone',
  '/complete-profile',
  '/',
];

// Routes that should allow access if user is navigating from the app
// (they'll be protected by client-side ProtectedRoute component)
const protectedRoutes = [
  '/admin',
  '/creator',
  '/dashboard',
  '/courses',
  '/my-courses',
  '/profile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
    return NextResponse.next();
  }

  // Check for Bearer token in Authorization header (for API calls)
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  
  // Check for token in cookies (for browser navigation)
  const cookieToken = request.cookies.get('token')?.value;
  
  // Allow if either Bearer token or cookie token exists
  const token = bearerToken || cookieToken;

  // For protected routes, if no token, redirect to login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Add a delay parameter to prevent immediate redirect loops
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
