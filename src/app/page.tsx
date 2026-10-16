import { Metadata } from "next";
import { fetchProfileByUsername, fetchUserLinks, DEMO_PROFILE } from "@/lib/data-service";
import LinktreeView from "@/components/LinktreeView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orbit Hub (@orbit.of.luv) | 우주의 모든 인연과 링크를 잇는 공간",
  description:
    "우주 모든 인연이 만날때까지 - 인스타 최초 무료 소개팅 & Love Magazine 🪐",
  openGraph: {
    title: "Orbit Hub (@orbit.of.luv)",
    description:
      "우주 모든 인연이 만날때까지 - 인스타 최초 무료 소개팅 & Love Magazine 🪐",
    images: [{ url: "/orbit-hub-default-logo.png" }],
  },
};

export default async function HomePage() {
  const profile = (await fetchProfileByUsername("orbithub")) || DEMO_PROFILE;
  const links = await fetchUserLinks(profile.id);

  return (
    <main style={{ minHeight: "100vh", width: "100%" }}>
      <LinktreeView profile={profile} links={links} />
    </main>
  );
}
