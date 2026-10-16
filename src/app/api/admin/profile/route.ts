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

    // If Supabase is connected, upsert into DB
    if (isSupabaseConfigured() && updatedProfile) {
      try {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .upsert(
            {
              id:
                updatedProfile.id && updatedProfile.id.includes("-")
                  ? updatedProfile.id
                  : "00000000-0000-0000-0000-000000000001",
              username: updatedProfile.username || "orbithub",
              display_name: updatedProfile.display_name || "Orbit Hub",
              bio: updatedProfile.bio || "",
              avatar_url: updatedProfile.avatar_url || "/orbit-hub-default-logo.png",
              theme_id: updatedProfile.theme_id || "aurora-dark",
              social_links: updatedProfile.social_links || {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: "username" }
          );
      } catch (dbErr) {
        console.error("Supabase upsert error in API:", dbErr);
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
