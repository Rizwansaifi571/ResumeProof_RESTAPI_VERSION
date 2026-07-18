import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { updateCandidateByTrackingId, getCandidateByTrackingId } from "@/lib/candidates";
import { VerificationResult } from "@/lib/types";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    // timingSafeEqual requires equal-length buffers — both are 64-char hex so this is safe,
    // but we guard with a length check first to avoid throws on malformed input.
    const expectedBuf = Buffer.from(expected, "hex");
    const signatureBuf = Buffer.from(signature, "hex");
    if (expectedBuf.length !== signatureBuf.length) return false;
    return timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-rp-signature") ?? "";

  let body: { event?: string; data?: Record<string, unknown> };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept setup pings from ResumeProof without signature check
  if (body.event === "test.ping") {
    console.log("[webhook] Received test.ping — acknowledged");
    return NextResponse.json({ received: true, message: "Ping acknowledged" }, { status: 200 });
  }

  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] WEBHOOK_SECRET env var is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // FIX: pass hex-decoded buffers of equal length to timingSafeEqual
  if (!verifySignature(rawBody, signature, secret)) {
    console.error("[webhook] Signature mismatch — header:", signature);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("[webhook] Event received:", body.event);

  if (body.event === "verification.completed") {
    const data = body.data as any;

    // aiAnalysis and rawGithubData arrive as JSON strings from ms1 (Prisma String? columns)
    let aiAnalysis = data.aiAnalysis;
    let rawGithubData = data.rawGithubData;
    if (typeof aiAnalysis === "string") {
      try { aiAnalysis = JSON.parse(aiAnalysis); } catch { aiAnalysis = null; }
    }
    if (typeof rawGithubData === "string") {
      try { rawGithubData = JSON.parse(rawGithubData); } catch { rawGithubData = null; }
    }

    const result: VerificationResult = {
      id: data.id as string,
      transactionId: data.transactionId,
      confidenceScore: data.confidenceScore as number,
      status: data.status as VerificationResult["status"],
      githubUsername: data.githubUsername as string,
      reposFound: data.reposFound as number,
      claimedProjects: data.claimedProjects as number,
      verifiedProjects: data.verifiedProjects as number,
      commitAuthorship: data.commitAuthorship as boolean,
      skillAlignment: data.skillAlignment as number,
      matchedSkills: (data.matchedSkills as string[]) ?? [],
      missingSkills: (data.missingSkills as string[]) ?? [],
      flags: (data.flags as string[]) ?? [],
      aiAnalysis: aiAnalysis as VerificationResult["aiAnalysis"],
      rawGithubData: rawGithubData as Record<string, unknown> | null,
      createdAt: data.createdAt as string,
    };

    // ResumeProof sends transactionId — look up the candidate by that
    const lookupId = data.transactionId as string;
    console.log("[webhook] Looking up candidate by transactionId:", lookupId);

    const candidate = await getCandidateByTrackingId(lookupId);

    if (candidate) {
      await updateCandidateByTrackingId(lookupId, {
        verificationStatus: result.status,
        verificationResult: result,
        verifiedAt: new Date().toISOString(),
      });
      console.log("[webhook] Candidate updated:", candidate.email, "→", result.status);
    } else {
      // This happens if the trackingId saved during apply doesn't match transactionId.
      // Check Vercel logs from the apply route to see what key ResumeProof returned.
      console.warn("[webhook] No candidate found for transactionId:", lookupId);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}