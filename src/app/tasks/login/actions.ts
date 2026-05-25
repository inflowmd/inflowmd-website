"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "tasks_auth";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (password !== process.env.TASKS_PASSWORD) {
    redirect("/tasks/login?error=1");
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

  redirect("/tasks");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/tasks/login");
}
