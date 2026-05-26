"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "tasks_auth";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

// Accept only same-origin redirect targets to avoid open-redirect.
function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/tasks";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/tasks";
  return raw;
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (password !== process.env.TASKS_PASSWORD) {
    redirect(`/tasks/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = process.env.TASKS_AUTH_TOKEN;
  if (!token) {
    redirect("/tasks/login?error=config");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });

  redirect(next);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/tasks/login");
}
