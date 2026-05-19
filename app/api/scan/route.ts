import { NextResponse } from "next/server";
import { scanTarget } from "@/lib/scanner";
import { isNonEmptyString } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const target = body?.target;

  if (!isNonEmptyString(target)) {
    return NextResponse.json({ error: "Target URL or domain is required." }, { status: 400 });
  }

  try {
    const result = await scanTarget(target);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to scan target.",
      },
      { status: 422 },
    );
  }
}
