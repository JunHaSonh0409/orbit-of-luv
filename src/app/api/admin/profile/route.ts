import { NextRequest, NextResponse } from "next/server";
import { checkServerAdminSession } from "@/lib/auth-guard";
import { DEMO_PROFILE, DEMO_LINKS, isSupabaseConfigured } from "@/lib/data-service";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

// Global in-memory cache for demo environment
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
    }
    if (updatedLinks && Array.isArray(updatedLinks)) {
      serverCachedLinks = updatedLinks;
    }

    // If Supabase is connected, update DB
    if (isSupabaseConfigured() && updatedProfile) {
      try {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({
            display_name: updatedProfile.display_name,
            username: updatedProfile.username,
            bio: updatedProfile.bio,
            avatar_url: updatedProfile.avatar_url,
            theme_id: updatedProfile.theme_id,
            social_links: updatedProfile.social_links,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedProfile.id);
      } catch (dbErr) {
        console.error("Supabase update error in API:", dbErr);
      }
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
