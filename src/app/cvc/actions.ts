"use server";

import { redirect } from "next/navigation";
import { setSessionCookie, clearSessionCookie, verifyPassword } from "@/lib/cvc/session";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Password is required" };
  if (!verifyPassword(password)) {
    return { error: "Incorrect password" };
  }
  await setSessionCookie();
  redirect("/cvc");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/cvc");
}
