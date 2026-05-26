import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { issueAuthCode, verifyClientRegistration } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "tasks_auth";

interface AuthorizePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function approveAction(formData: FormData) {
  "use server";
  const client_id = String(formData.get("client_id") ?? "");
  const redirect_uri = String(formData.get("redirect_uri") ?? "");
  const state = String(formData.get("state") ?? "");
  const code_challenge = String(formData.get("code_challenge") ?? "");
  const code_challenge_method = String(formData.get("code_challenge_method") ?? "");
  const scope = String(formData.get("scope") ?? "tasks");

  if (code_challenge_method !== "S256") {
    throw new Error("Unsupported code_challenge_method");
  }

  // Verify the client_id is one we issued and the redirect_uri matches.
  const reg = await verifyClientRegistration(client_id);
  if (!reg.redirect_uris.includes(redirect_uri)) {
    throw new Error("redirect_uri not registered for this client");
  }

  const code = await issueAuthCode({
    sub: "clayton",
    cid: reg.cid,
    redirect_uri,
    code_challenge,
    code_challenge_method: "S256",
    scope,
    typ: "code",
  });

  const url = new URL(redirect_uri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  redirect(url.toString());
}

export default async function AuthorizePage({ searchParams }: AuthorizePageProps) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;

  const client_id = get("client_id");
  const redirect_uri = get("redirect_uri");
  const response_type = get("response_type");
  const state = get("state");
  const code_challenge = get("code_challenge");
  const code_challenge_method = get("code_challenge_method");
  const scope = get("scope") ?? "tasks";

  // Must be logged in (same cookie as /tasks)
  const c = await cookies();
  const authCookie = c.get(COOKIE_NAME)?.value;
  if (!authCookie || authCookie !== process.env.TASKS_AUTH_TOKEN) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string") params.set(k, v);
    }
    const next = `/oauth/authorize?${params.toString()}`;
    redirect(`/tasks/login?next=${encodeURIComponent(next)}`);
  }

  // Basic param validation
  const missing: string[] = [];
  if (!client_id) missing.push("client_id");
  if (!redirect_uri) missing.push("redirect_uri");
  if (!response_type) missing.push("response_type");
  if (!code_challenge) missing.push("code_challenge");
  if (!code_challenge_method) missing.push("code_challenge_method");
  if (missing.length) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invalid request</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Missing parameter(s): {missing.join(", ")}
          </p>
        </div>
      </main>
    );
  }

  if (response_type !== "code") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unsupported response_type</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Only &apos;code&apos; is supported.</p>
        </div>
      </main>
    );
  }

  // Try to render a friendly client name
  let clientName = "An MCP client";
  try {
    const reg = await verifyClientRegistration(client_id!);
    if (reg.client_name) clientName = reg.client_name;
  } catch {
    clientName = "(unknown client — verify the URL)";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Authorize access
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          <strong>{clientName}</strong> wants to connect to your InflowMD task board.
        </p>
        <ul className="mt-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>· Read your tasks and memory notes</li>
          <li>· Add, edit, complete, and remove tasks</li>
          <li>· Reorder and adjust priorities</li>
          <li>· Save and update memory notes</li>
        </ul>
        <p className="text-xs text-gray-500 mt-5">
          Redirects to: <span className="font-mono break-all">{redirect_uri}</span>
        </p>
        <form action={approveAction} className="mt-6 flex gap-2">
          <input type="hidden" name="client_id" value={client_id!} />
          <input type="hidden" name="redirect_uri" value={redirect_uri!} />
          <input type="hidden" name="state" value={state ?? ""} />
          <input type="hidden" name="code_challenge" value={code_challenge!} />
          <input type="hidden" name="code_challenge_method" value={code_challenge_method!} />
          <input type="hidden" name="scope" value={scope} />
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
          >
            Authorize
          </button>
        </form>
      </div>
    </main>
  );
}
