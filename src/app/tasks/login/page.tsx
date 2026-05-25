import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Sign in | InflowMD",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMsg =
    error === "1"
      ? "Incorrect password."
      : error === "config"
      ? "Server not configured. Set TASKS_AUTH_TOKEN."
      : null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            InflowMD · Internal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter the password to view the task board.
          </p>
          <form action={login} className="space-y-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errorMsg && (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Not indexed · Internal use only
        </p>
      </div>
    </main>
  );
}
