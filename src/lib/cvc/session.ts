import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cvc-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("DASHBOARD_SESSION_SECRET must be set to a value of at least 16 characters");
  }
  return secret;
}

function getExpectedPassword(): string {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    throw new Error("DASHBOARD_PASSWORD is not set");
  }
  return password;
}

function signToken(): string {
  return createHmac("sha256", getSecret()).update(getExpectedPassword()).digest("hex");
}

function bufferEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(input: string): boolean {
  try {
    return bufferEquals(input, getExpectedPassword());
  } catch {
    return false;
  }
}

export function getSessionToken(): string {
  return signToken();
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return bufferEquals(token, signToken());
  } catch {
    return false;
  }
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: signToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
