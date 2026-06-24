import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Sign in — Prevosti Audit | InflowMD",
  robots: { index: false, follow: false },
};

// Don't cache the login form either.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function PrevostiLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMsg =
    error === "1"
      ? "Incorrect password."
      : error === "config"
      ? "Server not configured. PREVOSTI_ACCESS_PASSWORD is missing."
      : null;

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[420px] h-[420px] rounded-full bg-[#1a2a6c]/50 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] rounded-full bg-[#2D6CDF]/20 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-[#0b1633]/80 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <p className="text-accent font-semibold text-[10px] sm:text-xs tracking-[0.22em] uppercase mb-2">
            Private audit
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            Prevosti Vein Center
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Enter the access password to view this report.
          </p>
          <form action={login} className="space-y-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-white/15 bg-black/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            {errorMsg && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Prepared by InflowMD · Not indexed
        </p>
      </div>
    </main>
  );
}
