import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
// Recruiter dashboard (/recruiter) is protected, but login/register sub-routes are NOT
// They must remain accessible to authenticated users who need to register a company
const publicOnlyRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // /recruiter/login and /recruiter/register are accessible to everyone (auth or not)
  const isRecruiterOnboarding = path === '/recruiter/login' || path === '/recruiter/register';

  // /recruiter (exact or sub-pages like /recruiter/xxx but NOT login/register) needs auth
  const isRecruiterDashboard = path.startsWith('/recruiter') && !isRecruiterOnboarding;

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route)) || isRecruiterDashboard;
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) => path.startsWith(route));

  // Skip middleware for routes that are neither protected nor public-only
  if (!isProtectedRoute && !isPublicOnlyRoute && !isRecruiterOnboarding) {
    return NextResponse.next();
  }

  // Recruiter onboarding pages are always accessible — let them through
  if (isRecruiterOnboarding) {
    return NextResponse.next();
  }

  // Only check cookie EXISTENCE — never call backend from middleware
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasTokens = !!(accessToken || refreshToken);

  // Protected route + no cookies → redirect to login
  if (isProtectedRoute && !hasTokens) {
    // Redirect recruiter routes to recruiter login, others to main login
    if (isRecruiterDashboard) {
      return NextResponse.redirect(new URL('/recruiter/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Public-only route (main login/register) + has cookies → redirect to dashboard
  // The actual token validity is checked client-side by AuthContext
  if (isPublicOnlyRoute && hasTokens) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
