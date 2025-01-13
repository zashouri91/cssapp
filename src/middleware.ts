import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-in/[[...index]]',
    '/sign-up',
    '/api/webhooks/clerk',
    '/api/webhooks/test',
  ],
  
  // Custom function to handle authentication
  async afterAuth(auth, req) {
    // Handle user authentication
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // For API routes, return appropriate status
    if (req.url.includes('/api/') && !auth.userId && !auth.isPublicRoute) {
      return new Response('Unauthorized', { status: 401 });
    }

    // If the user is signed in and on the landing page or sign-in page,
    // redirect them to the dashboard
    if (auth.userId && (req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/sign-in'))) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Allow users to access the page
    return NextResponse.next();
  },
  debug: true,
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};