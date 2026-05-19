import { NextResponse } from "next/server";
import { lookupVirusTotal } from "@/services/virusTotal";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "target query is required." }, { status: 400 });
  }

  const virusTotal = await lookupVirusTotal(target);

  return NextResponse.json({ target, providers: { virusTotal } });
}
