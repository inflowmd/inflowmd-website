import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tasks_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page itself must be accessible unauthenticated
  if (pathname === "/tasks/login") return NextResponse.next();

  const isGated =
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/api/tasks-chat") ||
    pathname.startsWith("/api/tasks-update");

  if (!isGated) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = process.env.TASKS_AUTH_TOKEN;

  if (expected && token && token === expected) {
    return NextResponse.next();
  }

  // For API routes return 401 instead of redirecting to a login page
  if (pathname.startsWith("/api/")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/tasks/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/tasks/:path*", "/api/tasks-chat", "/api/tasks-update"],
};
