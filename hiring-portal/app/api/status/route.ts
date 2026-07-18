import { NextRequest, NextResponse } from "next/server";
import { getCandidateByTrackingId } from "@/lib/candidates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("trackingId");

  if (!trackingId) {
    return NextResponse.json({ error: "trackingId required" }, { status: 400 });
  }

  const candidate = await getCandidateByTrackingId(trackingId);
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}
