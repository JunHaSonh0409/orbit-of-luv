import { NextRequest, NextResponse } from "next/server";
import { recordPageview } from "@/lib/data-service";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    // Body is sent via navigator.sendBeacon as plain text JSON: { profileId, referrer }
    let body: { profileId?: unknown; referrer?: unknown } = {};
    try {
      body = JSON.parse((await request.text()) || "{}");
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    if (!UUID_PATTERN.test(profileId)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2048) : "";
    const userAgent = (request.headers.get("user-agent") || "").slice(0, 512);

    await recordPageview(profileId, referrer, userAgent);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API pageview error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
