/**
 * Minimal OAuth 2.1 helpers for the InflowMD MCP server.
 *
 * Single-user system, so we use signed JWTs for everything (auth codes,
 * access tokens, refresh tokens, dynamic-client-registration receipts).
 * No database required — everything verifies via JWT signature + claims.
 */

import { SignJWT, jwtVerify } from "jose";

export const ISSUER = "https://www.inflowmd.com";
export const RESOURCE = "https://www.inflowmd.com/api/mcp";

function secret(): Uint8Array {
  const s = process.env.OAUTH_JWT_SECRET;
  if (!s) throw new Error("OAUTH_JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

const ACCESS_TOKEN_TTL = 60 * 60; // 1h
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30d
const AUTH_CODE_TTL = 60 * 5; // 5min

export interface AccessTokenClaims {
  sub: string; // user id (always "clayton")
  aud: string; // resource
  iss: string;
  typ: "access";
  scope: string;
  cid: string; // client_id
}

export interface RefreshTokenClaims {
  sub: string;
  typ: "refresh";
  cid: string;
  scope: string;
}

export interface AuthCodeClaims {
  sub: string;
  cid: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: "S256";
  scope: string;
  typ: "code";
}

export interface ClientRegistrationClaims {
  cid: string;
  redirect_uris: string[];
  client_name?: string;
  typ: "client";
}

async function sign(payload: Record<string, unknown>, ttl: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
    .sign(secret());
}

async function verify<T = Record<string, unknown>>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
  return payload as T;
}

export async function issueAccessToken(args: {
  sub: string;
  cid: string;
  scope: string;
}): Promise<{ token: string; expiresIn: number }> {
  const token = await sign(
    { sub: args.sub, aud: RESOURCE, typ: "access", scope: args.scope, cid: args.cid },
    ACCESS_TOKEN_TTL
  );
  return { token, expiresIn: ACCESS_TOKEN_TTL };
}

export async function issueRefreshToken(args: {
  sub: string;
  cid: string;
  scope: string;
}): Promise<string> {
  return sign({ sub: args.sub, cid: args.cid, scope: args.scope, typ: "refresh" }, REFRESH_TOKEN_TTL);
}

export async function issueAuthCode(args: AuthCodeClaims): Promise<string> {
  return sign({ ...args }, AUTH_CODE_TTL);
}

export async function issueClientRegistration(args: {
  cid: string;
  redirect_uris: string[];
  client_name?: string;
}): Promise<string> {
  // Client registration "token" doubles as the client_id itself
  return sign(
    { cid: args.cid, redirect_uris: args.redirect_uris, client_name: args.client_name, typ: "client" },
    REFRESH_TOKEN_TTL * 12 // ~1yr
  );
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const c = await verify<AccessTokenClaims & { aud: string }>(token);
  if (c.typ !== "access") throw new Error("Wrong token type");
  if (c.aud !== RESOURCE) throw new Error("Wrong audience");
  return c;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
  const c = await verify<RefreshTokenClaims>(token);
  if (c.typ !== "refresh") throw new Error("Wrong token type");
  return c;
}

export async function verifyAuthCode(token: string): Promise<AuthCodeClaims> {
  const c = await verify<AuthCodeClaims>(token);
  if (c.typ !== "code") throw new Error("Wrong token type");
  return c;
}

export async function verifyClientRegistration(token: string): Promise<ClientRegistrationClaims> {
  const c = await verify<ClientRegistrationClaims>(token);
  if (c.typ !== "client") throw new Error("Wrong token type");
  return c;
}

/** PKCE S256 verify: SHA256(verifier) base64url == challenge */
export async function verifyPkceS256(verifier: string, challenge: string): Promise<boolean> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const b64 = Buffer.from(new Uint8Array(digest))
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return b64 === challenge;
}
