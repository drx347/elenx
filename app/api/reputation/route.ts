import { NextResponse } from "next/server";
import { lookupAbuseIPDB } from "@/services/abuseIPDB";
import { lookupGoogleSafeBrowsing } from "@/services/googleSafeBrowsing";
import { lookupVirusTotal } from "@/services/virusTotal";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "target query is required." }, { status: 400 });
  }

  const [virusTotal, googleSafeBrowsing, abuseIPDB] = await Promise.all([
    lookupVirusTotal(target),
    lookupGoogleSafeBrowsing(target),
    lookupAbuseIPDB(target),
  ]);

  return NextResponse.json({ target, providers: { virusTotal, googleSafeBrowsing, abuseIPDB } });
}
