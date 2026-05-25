import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tasks_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page itself must be accessible unauthenticated
  if (pathname === "/tasks/login") return NextResponse.next();

  // Only gate /tasks/*
  if (!pathname.startsWith("/tasks")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = process.env.TASKS_AUTH_TOKEN;

  if (expected && token && token === expected) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/tasks/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/tasks/:path*"],
};
