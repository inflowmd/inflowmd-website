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

function readCredentials(): JWTInput {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID;

  const missing: string[] = [];
  if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!rawKey) missing.push("GOOGLE_PRIVATE_KEY");
  if (!projectId) missing.push("GOOGLE_PROJECT_ID");
  if (missing.length) throw new MissingCredentialsError(missing);

  return {
    client_email: email,
    private_key: rawKey!.replace(/\\n/g, "\n"),
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
