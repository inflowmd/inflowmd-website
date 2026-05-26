import { NextRequest, NextResponse } from "next/server";
import {
  issueAccessToken,
  issueRefreshToken,
  verifyAuthCode,
  verifyClientRegistration,
  verifyPkceS256,
  verifyRefreshToken,
} from "@/lib/oauth";

export const runtime = "nodejs";

function err(error: string, description?: string, status = 400) {
  return NextResponse.json(
    description ? { error, error_description: description } : { error },
    {
      status,
      headers: { "cache-control": "no-store", pragma: "no-cache" },
    }
  );
}

export async function POST(req: NextRequest) {
  let params: URLSearchParams;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    params = new URLSearchParams(text);
  } else if (ct.includes("application/json")) {
    const body = (await req.json()) as Record<string, string>;
    params = new URLSearchParams(body);
  } else {
    return err("invalid_request", "Unsupported content-type");
  }

  const grantType = params.get("grant_type");

  if (grantType === "authorization_code") {
    const code = params.get("code");
    const redirectUri = params.get("redirect_uri");
    const clientId = params.get("client_id");
    const codeVerifier = params.get("code_verifier");
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      return err("invalid_request", "Missing parameter(s)");
    }

    let claims;
    try {
      claims = await verifyAuthCode(code);
    } catch {
      return err("invalid_grant", "Invalid or expired authorization code");
    }
    if (claims.redirect_uri !== redirectUri) {
      return err("invalid_grant", "redirect_uri mismatch");
    }
    let reg;
    try {
      reg = await verifyClientRegistration(clientId);
    } catch {
      return err("invalid_client", "Unknown client");
    }
    if (reg.cid !== claims.cid) {
      return err("invalid_grant", "client_id mismatch");
    }
    const ok = await verifyPkceS256(codeVerifier, claims.code_challenge);
    if (!ok) return err("invalid_grant", "PKCE verification failed");

    const { token: access, expiresIn } = await issueAccessToken({
      sub: claims.sub,
      cid: claims.cid,
      scope: claims.scope,
    });
    const refresh = await issueRefreshToken({
      sub: claims.sub,
      cid: claims.cid,
      scope: claims.scope,
    });
    return NextResponse.json(
      {
        access_token: access,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: refresh,
        scope: claims.scope,
      },
      { headers: { "cache-control": "no-store", pragma: "no-cache" } }
    );
  }

  if (grantType === "refresh_token") {
    const refresh = params.get("refresh_token");
    const clientId = params.get("client_id");
    if (!refresh || !clientId) return err("invalid_request", "Missing parameter(s)");
    let claims;
    try {
      claims = await verifyRefreshToken(refresh);
    } catch {
      return err("invalid_grant", "Invalid or expired refresh token");
    }
    let reg;
    try {
      reg = await verifyClientRegistration(clientId);
    } catch {
      return err("invalid_client", "Unknown client");
    }
    if (reg.cid !== claims.cid) return err("invalid_grant", "client_id mismatch");
    const { token: access, expiresIn } = await issueAccessToken({
      sub: claims.sub,
      cid: claims.cid,
      scope: claims.scope,
    });
    return NextResponse.json(
      {
        access_token: access,
        token_type: "Bearer",
        expires_in: expiresIn,
        scope: claims.scope,
      },
      { headers: { "cache-control": "no-store", pragma: "no-cache" } }
    );
  }

  return err("unsupported_grant_type");
}
