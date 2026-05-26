import { NextResponse } from "next/server";
import { ISSUER, RESOURCE } from "@/lib/oauth";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    resource: RESOURCE,
    authorization_servers: [ISSUER],
    bearer_methods_supported: ["header"],
    scopes_supported: ["tasks"],
  });
}
