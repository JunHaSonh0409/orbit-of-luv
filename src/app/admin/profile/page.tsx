"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Profile, LinkItem, SocialLinks } from "@/types/database.types";
import { DEMO_PROFILE, DEMO_LINKS, isSupabaseConfigured } from "@/lib/data-service";
import { THEMES } from "@/lib/themes";
import LinktreeView from "@/components/LinktreeView";
import { createClient } from "@/lib/supabase/client";
import {
  IconYoutube,
  IconTwitter,
  IconInstagram,
  IconGithub,
  IconLinkedin,
  IconKakao,
  IconThreads,
} from "@/components/SocialIcons";
import {
  Sparkles,
  Camera,
  Upload,
  Link as LinkIcon,
  Palette,
  BarChart3,
  Check,
  Bot,
  LogOut,
  Copy,
  ExternalLink,
  ArrowLeft,
  Save,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Mail,
  User,
  AtSign,
  FileText,
  Smartphone,
  Globe,
  Smile,
} from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(DEMO_LINKS);
  const [copied, setCopied] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<"general" | "social" | "theme">("general");
  const isConnectedToSupabase = isSupabaseConfigured();

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("orbit_profile");
    const savedLinks = localStorage.getItem("orbit_links");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.username === "alex_orbit") {
          setProfile(DEMO_PROFILE);
          localStorage.setItem("orbit_profile", JSON.stringify(DEMO_PROFILE));
        } else {
          if (parsed.avatar_url === "/orbit-hub-profile.jpg") {
            parsed.avatar_url = "/orbit-hub-default-logo.png";
            localStorage.setItem("orbit_profile", JSON.stringify(parsed));
          }
          setProfile(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveProfileData = async (newProfile: Profile) => {
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("orbit_profile", JSON.stringify(newProfile));
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2500);
    }

    if (isConnectedToSupabase) {
      try {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({
            display_name: newProfile.display_name,
            username: newProfile.username,
            bio: newProfile.bio,
            avatar_url: newProfile.avatar_url,
            theme_id: newProfile.theme_id,
            social_links: newProfile.social_links,
            updated_at: new Date().toISOString(),
          })
          .eq("id", newProfile.id);
      } catch (err) {
        console.error("Supabase profile save error:", err);
      }
    }
  };

  const handleUpdate = (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    saveProfileData(updated);
  };

  const handleSocialUpdate = (network: keyof SocialLinks, value: string) => {
    let formattedValue = value.trim();
    if (network === "instagram" && formattedValue && !formattedValue.startsWith("http")) {
      const cleanHandle = formattedValue.replace(/^@/, "");
      formattedValue = `https://instagram.com/${cleanHandle}`;
    }

    const updatedSocial = {
      ...(profile.social_links || {}),
      [network]: formattedValue,
    };
    handleUpdate({ social_links: updatedSocial });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          handleUpdate({ avatar_url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefaultLogo = () => {
    handleUpdate({ avatar_url: "/orbit-hub-default-logo.png" });
  };

  const addEmojiToBio = (emoji: string) => {
    const currentBio = profile.bio || "";
    handleUpdate({ bio: `${currentBio} ${emoji}` });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/orbithub";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#07090e",
        color: "#f8fafc",
      }}
    >
      {/* Top Studio Header */}
      <header
        style={{
          height: 68,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(11, 15, 25, 0.85)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(99, 102, 241, 0.5)",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <span>Orbit <span style={{ color: "#818cf8" }}>Hub</span></span>
          </a>

          {/* Breadcrumb Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 14px",
              borderRadius: 9999,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#94a3b8" }}>My link:</span>
            <span style={{ fontWeight: 600, color: "#cbd5e1" }}>
              /{profile.username}
            </span>
            <button
              onClick={handleCopyLink}
              style={{
                display: "flex",
                alignItems: "center",
                color: copied ? "#10b981" : "#818cf8",
                marginLeft: 4,
              }}
              title="Copy URL"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isSavedNotice && (
            <div
              style={{
                fontSize: 13,
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                padding: "6px 12px",
                borderRadius: 9999,
                fontWeight: 600,
              }}
            >
              <Check size={14} />
              <span>변경사항 저장됨</span>
            </div>
          )}

          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            <span>내 프로필 보기</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={() => saveProfileData(profile)}
            className="btn-primary"
            style={{ padding: "8px 20px", fontSize: 13 }}
          >
            <Save size={15} />
            <span>저장하기</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="관리자 세션 종료"
          >
            <LogOut size={14} />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: Editor Left + Real-time Phone Right */}
      <div
        style={{
          display: "flex",
          flex: 1,
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Left Side: Navigation & Full Profile Editor Form */}
        <div
          style={{
            flex: "1 1 65%",
            padding: "36px 36px 100px",
            maxWidth: 780,
            width: "100%",
          }}
        >
          {/* Main Top Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              padding: 6,
              borderRadius: 14,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: 32,
              width: "fit-content",
            }}
          >
            <a
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#94a3b8",
              }}
            >
              <LinkIcon size={16} />
              <span>링크 관리</span>
            </a>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: "rgba(99, 102, 241, 0.25)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
              }}
            >
              <User size={16} />
              <span>프로필 정보 수정</span>
            </div>

            <a
              href="/admin/automations"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#f472b6",
                backgroundColor: "rgba(236, 72, 153, 0.12)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <Bot size={16} color="#f472b6" />
              <span>🤖 인스타 자동 DM</span>
            </a>
          </div>

          {/* Sub Navigation: Section Switcher */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 28,
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: 14,
            }}
          >
            <button
              onClick={() => setActiveSubSection("general")}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 8,
                color: activeSubSection === "general" ? "#818cf8" : "#94a3b8",
                backgroundColor: activeSubSection === "general" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              }}
            >
              1. 기본 정보 & 사진
            </button>
            <button
              onClick={() => setActiveSubSection("social")}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 8,
                color: activeSubSection === "social" ? "#818cf8" : "#94a3b8",
                backgroundColor: activeSubSection === "social" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              }}
            >
              2. SNS & 소셜 링크
            </button>
            <button
              onClick={() => setActiveSubSection("theme")}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 8,
                color: activeSubSection === "theme" ? "#818cf8" : "#94a3b8",
                backgroundColor: activeSubSection === "theme" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              }}
            >
              3. 우주 테마 & 스타일
            </button>
          </div>

          {/* SECTION 1: GENERAL INFO & AVATAR */}
          {activeSubSection === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Avatar Upload Card */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>프로필 사진 / 로고</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                  컴퓨터에서 사진을 직접 올리거나 이미지 URL을 입력하세요. 우측 스마트폰에 즉각 반영됩니다.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                  {/* Avatar Preview Swatch */}
                  <div
                    style={{
                      position: "relative",
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      padding: 3,
                      background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                      boxShadow: "0 0 24px rgba(99, 102, 241, 0.4)",
                      overflow: "hidden",
                      backgroundColor: "#000",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatar_url || "/orbit-hub-default-logo.png"}
                      alt={profile.display_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                        style={{ padding: "10px 18px", fontSize: 13 }}
                      >
                        <Upload size={15} />
                        <span>내 PC에서 사진 올리기</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefaultLogo}
                        className="btn-secondary"
                        style={{ padding: "10px 16px", fontSize: 13 }}
                      >
                        <RotateCcw size={14} />
                        <span>기본 로고로 복원</span>
                      </button>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                        또는 이미지 웹 URL 직접 입력:
                      </label>
                      <input
                        type="url"
                        value={profile.avatar_url || ""}
                        onChange={(e) => handleUpdate({ avatar_url: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                        className="input-field"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Name & Username Handle Card */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20 }}>이름 및 주소</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#cbd5e1",
                        marginBottom: 6,
                      }}
                    >
                      표시 이름 (Brand / Creator Name)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={profile.display_name}
                        onChange={(e) => handleUpdate({ display_name: e.target.value })}
                        placeholder="예: Orbit Hub"
                        className="input-field"
                        style={{ paddingLeft: 38, fontWeight: 600 }}
                      />
                      <User
                        size={16}
                        color="#64748b"
                        style={{ position: "absolute", left: 14, top: 14 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#cbd5e1",
                        marginBottom: 6,
                      }}
                    >
                      고유 링크 핸들 (Username ID)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) =>
                          handleUpdate({
                            username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                          })
                        }
                        placeholder="orbithub"
                        className="input-field"
                        style={{ paddingLeft: 38, fontWeight: 600, color: "#818cf8" }}
                      />
                      <AtSign
                        size={16}
                        color="#818cf8"
                        style={{ position: "absolute", left: 14, top: 14 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                      내 주소: orbit.link/{profile.username || "username"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Description Card */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18 }}>소개글 (Bio Description)</h3>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {(profile.bio || "").length} / 200자
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                  줄바꿈(엔터)이 그대로 반영됩니다. 방문자들에게 전하고 싶은 매력적인 소개를 작성해 보세요.
                </p>

                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => handleUpdate({ bio: e.target.value })}
                  rows={4}
                  placeholder="우주 모든 인연이 만날때까지&#10;인스타 최초 무료 소개팅 & Love Magazine 🪐"
                  className="input-field"
                  style={{
                    lineHeight: 1.6,
                    fontSize: 14,
                    resize: "vertical",
                    marginBottom: 12,
                  }}
                />

                {/* Quick Emoji Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                    <Smile size={13} /> 추천 이모지:
                  </span>
                  {["🪐", "💖", "✨", "💌", "📖", "🚀", "☕", "🌟"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmojiToBio(emoji)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                      title={`${emoji} 추가`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SOCIAL LINKS */}
          {activeSubSection === "social" && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>SNS & 연락처 링크 연동</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
                프로필 상단 아이콘 바에 표시될 소셜 미디어 링크를 입력하세요. 빈칸으로 두면 아이콘이 표시되지 않습니다.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Instagram */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <IconInstagram size={18} color="#ec4899" />
                    <span>Instagram (인스타그램)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.social_links?.instagram || ""}
                    onChange={(e) => handleSocialUpdate("instagram", e.target.value)}
                    placeholder="https://instagram.com/orbit.of.luv 또는 @orbit.of.luv"
                    className="input-field"
                  />
                </div>

                {/* KakaoTalk Open Chat */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <IconKakao size={18} color="#facc15" />
                    <span>KakaoTalk (카카오톡 오픈채팅 / 채널)</span>
                  </label>
                  <input
                    type="url"
                    value={profile.social_links?.kakao || ""}
                    onChange={(e) => handleSocialUpdate("kakao", e.target.value)}
                    placeholder="https://open.kakao.com/o/..."
                    className="input-field"
                  />
                </div>

                {/* Threads */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <IconThreads size={18} color="#ffffff" />
                    <span>Threads (스레드)</span>
                  </label>
                  <input
                    type="url"
                    value={profile.social_links?.threads || ""}
                    onChange={(e) => handleSocialUpdate("threads", e.target.value)}
                    placeholder="https://threads.net/@orbit.of.luv"
                    className="input-field"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <IconYoutube size={18} color="#ef4444" />
                    <span>YouTube (유튜브 채널)</span>
                  </label>
                  <input
                    type="url"
                    value={profile.social_links?.youtube || ""}
                    onChange={(e) => handleSocialUpdate("youtube", e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="input-field"
                  />
                </div>

                {/* X / Twitter */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <IconTwitter size={16} color="#38bdf8" />
                    <span>X / Twitter</span>
                  </label>
                  <input
                    type="url"
                    value={profile.social_links?.twitter || ""}
                    onChange={(e) => handleSocialUpdate("twitter", e.target.value)}
                    placeholder="https://x.com/username"
                    className="input-field"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: 6,
                    }}
                  >
                    <Mail size={18} color="#10b981" />
                    <span>문의/협업 이메일 (Contact Email)</span>
                  </label>
                  <input
                    type="email"
                    value={profile.social_links?.email || ""}
                    onChange={(e) => handleSocialUpdate("email", e.target.value)}
                    placeholder="orbit.of.luv@gmail.com"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: THEMES & VISUAL STYLE */}
          {activeSubSection === "theme" && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>우주 테마 프리셋 선택</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
                원하는 테마 카드를 클릭하면 우측 스마트폰 화면에 즉시 적용됩니다.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                  gap: 16,
                }}
              >
                {THEMES.map((theme) => {
                  const isSelected = profile.theme_id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleUpdate({ theme_id: theme.id })}
                      style={{
                        borderRadius: 14,
                        padding: 16,
                        cursor: "pointer",
                        border: isSelected
                          ? "2px solid #6366f1"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        backgroundColor: isSelected
                          ? "rgba(99, 102, 241, 0.12)"
                          : "rgba(255, 255, 255, 0.02)",
                        boxShadow: isSelected
                          ? "0 0 20px rgba(99, 102, 241, 0.35)"
                          : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Swatch */}
                      <div
                        style={{
                          height: 72,
                          borderRadius: 10,
                          background: theme.bgClass,
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: "60%",
                            height: 20,
                            borderRadius: 6,
                            background: theme.cardStyle.background,
                            border: theme.cardStyle.border,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {theme.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                            {theme.id === "aurora-dark" ? "추천 우주 테마" : theme.id}
                          </div>
                        </div>
                        {isSelected && <Check size={18} color="#6366f1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Real-time Smartphone Mockup */}
        <div
          style={{
            flex: "1 1 35%",
            position: "sticky",
            top: 68,
            height: "calc(100vh - 68px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 30px",
          }}
        >
          {/* Phone Frame */}
          <div
            style={{
              width: 320,
              height: 640,
              borderRadius: 48,
              border: "12px solid #1e2230",
              boxShadow:
                "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2)",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#000",
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 90,
                height: 20,
                backgroundColor: "#000",
                borderRadius: 20,
                zIndex: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#111",
                }}
              />
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#051329",
                }}
              />
            </div>

            {/* Phone Screen with Scrollable Linktree View */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                position: "relative",
              }}
            >
              <LinktreeView profile={profile} links={links} isPreview={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
