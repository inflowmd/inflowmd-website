import { NextRequest, NextResponse } from "next/server";

const TASKS_COOKIE = "tasks_auth";
const PREVOSTI_COOKIE = "prevosti_auth";

/* Web-Crypto SHA-256 — works in the Edge runtime where Next.js
   middleware/proxy runs by default. Used to derive a stable cookie
   token from the configured password without storing the password
   itself in the cookie. */
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const arr = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < arr.length; i++) hex += arr[i].toString(16).padStart(2, "0");
  return hex;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ---------------- /prevosti gate ---------------- */
  // Login page itself must be reachable.
  if (pathname === "/prevosti/login") return NextResponse.next();

  if (pathname === "/prevosti" || pathname.startsWith("/prevosti/")) {
    const pw = process.env.PREVOSTI_ACCESS_PASSWORD;
    const cookie = req.cookies.get(PREVOSTI_COOKIE)?.value;
    if (pw && cookie) {
      const expected = await sha256Hex(pw);
      if (cookie === expected) return NextResponse.next();
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/prevosti/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  /* ---------------- /tasks gate (existing) ---------------- */
  if (pathname === "/tasks/login") return NextResponse.next();

  const isTasksGated =
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/api/tasks-chat") ||
    pathname.startsWith("/api/tasks-update");

  if (!isTasksGated) return NextResponse.next();

  const token = req.cookies.get(TASKS_COOKIE)?.value;
  const expected = process.env.TASKS_AUTH_TOKEN;

  if (expected && token && token === expected) {
    return NextResponse.next();
  }

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
  matcher: [
    "/tasks/:path*",
    "/api/tasks-chat",
    "/api/tasks-update",
    "/prevosti",
    "/prevosti/:path*",
  ],
};
