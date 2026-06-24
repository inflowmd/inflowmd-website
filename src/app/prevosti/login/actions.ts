"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "prevosti_auth";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const arr = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < arr.length; i++) hex += arr[i].toString(16).padStart(2, "0");
  return hex;
}

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const expected = process.env.PREVOSTI_ACCESS_PASSWORD;

  if (!expected) {
    redirect("/prevosti/login?error=config");
  }
  if (pw !== expected) {
    redirect("/prevosti/login?error=1");
  }

  const token = await sha256Hex(expected);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/prevosti",
    maxAge: THIRTY_DAYS,
  });

  redirect("/prevosti");
}
