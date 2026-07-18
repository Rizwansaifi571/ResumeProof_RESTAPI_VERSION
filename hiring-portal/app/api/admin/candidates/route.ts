import { NextRequest, NextResponse } from "next/server";
import { readCandidates } from "@/lib/candidates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || key !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = await readCandidates();
  return NextResponse.json(candidates);
}
