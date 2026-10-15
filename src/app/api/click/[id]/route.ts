import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/data-service";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const referrer = request.headers.get("referer") || "";
    await recordClick(id, referrer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API click error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
