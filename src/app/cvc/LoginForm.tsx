"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Comprehensive Vein Care</h1>
        <p className="text-sm text-gray-500 mt-1">SEO Dashboard — protected</p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#006284] focus:outline-none focus:ring-1 focus:ring-[#006284]"
            />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[#006284] px-4 py-2 text-sm font-medium text-white hover:bg-[#004f6a] disabled:opacity-60"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
