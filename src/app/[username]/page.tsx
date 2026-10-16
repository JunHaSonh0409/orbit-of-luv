import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProfileByUsername, fetchUserLinks, DEMO_PROFILE } from "@/lib/data-service";
import LinktreeView from "@/components/LinktreeView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = (await fetchProfileByUsername(username)) || DEMO_PROFILE;

  return {
    title: `${profile.display_name} (@${profile.username}) | Orbit Hub`,
    description:
      profile.bio ||
      `우주 모든 인연이 만날때까지 - Orbit Hub에서 ${profile.display_name}의 프로필을 확인하세요.`,
    openGraph: {
      title: `${profile.display_name} | Orbit Hub`,
      description: profile.bio || `우주 모든 인연이 만날때까지 - Orbit Hub`,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
  };
}

export default async function UserLinktreePage({ params }: PageProps) {
  const { username } = await params;
  let profile = await fetchProfileByUsername(username);

  if (!profile) {
    if ((username || "").toLowerCase() === "orbithub") {
      profile = DEMO_PROFILE;
    } else {
      notFound();
    }
  }

  const activeProfile = profile || DEMO_PROFILE;
  const links = await fetchUserLinks(activeProfile.id);

  return (
    <main style={{ minHeight: "100vh", width: "100%" }}>
      <LinktreeView profile={activeProfile} links={links} />
    </main>
  );
}
