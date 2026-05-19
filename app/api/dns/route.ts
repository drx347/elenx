import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { isValidDomain } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json({ error: "valid domain is required." }, { status: 400 });
  }

  const [A, AAAA, MX, TXT, NS] = await Promise.all([
    dns.resolve4(domain).catch(() => []),
    dns.resolve6(domain).catch(() => []),
    dns.resolveMx(domain).catch(() => []),
    dns.resolveTxt(domain).catch(() => []),
    dns.resolveNs(domain).catch(() => []),
  ]);

  return NextResponse.json({ domain, records: { A, AAAA, MX, TXT, NS } });
}
