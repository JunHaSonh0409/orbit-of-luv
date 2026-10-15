import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-guard";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Strict Barrier: Protect all /admin routes from any unauthorized visitor
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get(ADMIN_COOKIE_NAME);
    const isAuthenticated = Boolean(
      adminSession?.value && adminSession.value.startsWith("admin_auth_")
    );

    if (!isAuthenticated) {
      // Unauthorized: Immediately redirect to admin secure login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      loginUrl.searchParams.set("restricted", "true");
      return NextResponse.redirect(loginUrl);
    }
  }

  return await updateSession(request);
}

// Keep export for middleware backwards compatibility
export async function middleware(request: NextRequest) {
  return await proxy(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
