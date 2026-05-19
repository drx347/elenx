import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { isValidIPv4 } from "@/lib/validators";

export const runtime = "nodejs";

const DNSBL_ZONES = ["zen.spamhaus.org", "bl.spamcop.net"];

function reverseIp(ip: string) {
  return ip.split(".").reverse().join(".");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip || !isValidIPv4(ip)) {
    return NextResponse.json({ error: "valid IPv4 ip query is required." }, { status: 400 });
  }

  const listed = await Promise.all(
    DNSBL_ZONES.map(async (zone) => {
      const query = `${reverseIp(ip)}.${zone}`;
      const records = await dns.resolve4(query).catch(() => []);
      return { zone, listed: records.length > 0, records };
    }),
  );

  return NextResponse.json({
    ip,
    listed: listed.some((item) => item.listed),
    sources: listed,
  });
}
