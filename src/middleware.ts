import { NextRequest, NextResponse } from 'next/server';
import { authenticatedUser } from './lib/amplifyServerUtils';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  const hasAuthCode = request.nextUrl.searchParams.has('code');
  const isPublicPath = path === '/' || path === '/auth';

  console.log('🔹 Middleware called for:', path);

  // 1. Skip middleware logic during the OAuth callback phase
  if (hasAuthCode) {
    console.log('⚙️ Skipping middleware (OAuth callback in progress)');
    return response;
  }

  // 2. Check authentication
  const session = await authenticatedUser({ request, response });
  const isAuthenticated =
    session?.tokens?.accessToken !== undefined &&
    session?.tokens?.idToken !== undefined;

  console.log('🔐 isAuthenticated:', isAuthenticated);

  // 3. Redirect authenticated users away from auth page
  if (isAuthenticated && path === '/auth') {
    console.log('➡️ Authenticated user trying to access /auth — redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isPublicPath) {
    console.log(' Unauthenticated access to protected route — redirecting to /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 5. Otherwise, allow the request
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
