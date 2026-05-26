import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { issueClientRegistration } from "@/lib/oauth";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  redirect_uris: z.array(z.string().url()).min(1).max(5),
  client_name: z.string().max(200).optional(),
  // Other fields per RFC 7591 — accept but ignore
}).passthrough();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_client_metadata", error_description: parsed.error.message },
      { status: 400 }
    );
  }

  const cid = randomBytes(12).toString("hex");
  const client_id = await issueClientRegistration({
    cid,
    redirect_uris: parsed.data.redirect_uris,
    client_name: parsed.data.client_name,
  });

  return NextResponse.json(
    {
      client_id,
      redirect_uris: parsed.data.redirect_uris,
      client_name: parsed.data.client_name,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
    { status: 201 }
  );
}
