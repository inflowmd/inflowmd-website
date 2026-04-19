import { google } from "googleapis";
import type { JWTInput } from "google-auth-library";

export class MissingCredentialsError extends Error {
  constructor(missing: string[]) {
    super(
      `Google service account credentials missing: ${missing.join(", ")}. ` +
        `Set these environment variables before the CVC dashboard can fetch live data.`,
    );
    this.name = "MissingCredentialsError";
  }
}

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  // Strip a surrounding pair of double or single quotes if the value was pasted with them.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // Vercel/CI panels often store newlines as the literal two characters \ + n.
  key = key.replace(/\\n/g, "\n");
  // Some panels mangle to \r\n; normalize.
  key = key.replace(/\r\n/g, "\n");
  return key;
}

function readCredentials(): JWTInput {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const base64Key = process.env.GOOGLE_PRIVATE_KEY_BASE64;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID;

  const missing: string[] = [];
  if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!base64Key && !rawKey) missing.push("GOOGLE_PRIVATE_KEY");
  if (!projectId) missing.push("GOOGLE_PROJECT_ID");
  if (missing.length) throw new MissingCredentialsError(missing);

  const privateKey = base64Key
    ? Buffer.from(base64Key, "base64").toString("utf8").trim()
    : normalizePrivateKey(rawKey!);

  return {
    client_email: email,
    private_key: privateKey,
    project_id: projectId,
  };
}

export function getGoogleAuth(scopes: string[]) {
  return new google.auth.GoogleAuth({
    credentials: readCredentials(),
    projectId: process.env.GOOGLE_PROJECT_ID,
    scopes,
  });
}

export async function getAccessToken(scopes: string[]): Promise<string> {
  const auth = getGoogleAuth(scopes);
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) {
    throw new Error("Failed to obtain Google access token");
  }
  return token.token;
}

export function getServiceAccountCredentials() {
  const creds = readCredentials();
  return {
    client_email: creds.client_email as string,
    private_key: creds.private_key as string,
  };
}
