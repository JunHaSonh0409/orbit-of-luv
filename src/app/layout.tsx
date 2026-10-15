import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Orbit Hub | 우주의 모든 인연과 링크를 잇는 공간",
  description:
    "인스타 최초 무료 소개팅 & Love Magazine Orbit Hub 공식 바이오 링크 플랫폼입니다.",
  keywords: ["orbithub", "orbit of luv", "오르빗허브", "소개팅", "바이오링크", "link bio"],
  authors: [{ name: "Orbit Hub Team" }],
  openGraph: {
    title: "Orbit Hub | All your links in one celestial space",
    description: "우주 모든 인연이 만날때까지 - 인스타 최초 무료 소개팅 & Love Magazine",
    url: "https://orbithub.vercel.app",
    siteName: "Orbit Hub",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
