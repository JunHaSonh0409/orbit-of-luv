import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/data-service";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Body is sent via navigator.sendBeacon as plain text JSON: { referrer }
    let referrer = "";
    try {
      const body = JSON.parse((await request.text()) || "{}");
      if (typeof body.referrer === "string") referrer = body.referrer.slice(0, 2048);
    } catch {
      // Ignore malformed body and fall back to the header
    }
    referrer = referrer || request.headers.get("referer") || "";
    const userAgent = (request.headers.get("user-agent") || "").slice(0, 512);

    await recordClick(id, referrer, userAgent);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API click error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
