import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicOnlyRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) => path.startsWith(route));

  // Skip middleware for routes that are neither protected nor public-only
  if (!isProtectedRoute && !isPublicOnlyRoute) {
    return NextResponse.next();
  }

  // Only check cookie EXISTENCE — never call backend from middleware
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasTokens = !!(accessToken || refreshToken);

  // Protected route + no cookies → redirect to login
  if (isProtectedRoute && !hasTokens) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Public-only route (login/register) + has cookies → redirect to dashboard
  // The actual token validity is checked client-side by AuthContext
  if (isPublicOnlyRoute && hasTokens) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
