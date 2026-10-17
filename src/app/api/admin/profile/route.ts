import { NextRequest, NextResponse } from "next/server";
import { checkServerAdminSession } from "@/lib/auth-guard";
import { DEMO_PROFILE, DEMO_LINKS, updateLocalProfile, updateLocalLinks } from "@/lib/data-service";

export const dynamic = "force-dynamic";

// Global cache
let serverCachedProfile = { ...DEMO_PROFILE };
let serverCachedLinks = [...DEMO_LINKS];

export async function GET() {
  return NextResponse.json({
    profile: serverCachedProfile,
    links: serverCachedLinks,
  });
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkServerAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profile: updatedProfile, links: updatedLinks } = body;

    if (updatedProfile) {
      serverCachedProfile = { ...serverCachedProfile, ...updatedProfile };
      await updateLocalProfile(updatedProfile);
    }
    if (updatedLinks && Array.isArray(updatedLinks)) {
      serverCachedLinks = updatedLinks;
      await updateLocalLinks(updatedLinks);
    }

    return NextResponse.json({
      success: true,
      profile: serverCachedProfile,
      links: serverCachedLinks,
    });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
