"use client";

import React, { useState, useEffect } from "react";
import {
  Profile,
  LinkItem,
  ThemeConfig,
  SocialLinks,
} from "@/types/database.types";
import {
  DEMO_PROFILE,
  DEMO_LINKS,
  isSupabaseConfigured,
} from "@/lib/data-service";
import { THEMES } from "@/lib/themes";
import LinktreeView from "@/components/LinktreeView";
import { createClient } from "@/lib/supabase/client";
import {
  IconYoutube,
  IconTwitter,
  IconInstagram,
  IconGithub,
  IconLinkedin,
} from "@/components/SocialIcons";
import {
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Bot,
  LogOut,
  Smartphone,
  BarChart3,
  Palette,
  Link as LinkIcon,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Share2,
  Globe,
  Mail,
  ArrowRight,
  TrendingUp,
  MousePointerClick,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(DEMO_LINKS);
  const [activeTab, setActiveTab] = useState<"links" | "appearance" | "analytics">("links");
  const [copied, setCopied] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const isConnectedToSupabase = isSupabaseConfigured();

  // Load from local storage for quick persist during demo
  useEffect(() => {
    const savedProfile = localStorage.getItem("orbit_profile");
    const savedLinks = localStorage.getItem("orbit_links");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.username === "alex_orbit") {
          setProfile(DEMO_PROFILE);
          setLinks(DEMO_LINKS);
          localStorage.setItem("orbit_profile", JSON.stringify(DEMO_PROFILE));
          localStorage.setItem("orbit_links", JSON.stringify(DEMO_LINKS));
          return;
        }
        if (parsed.avatar_url === "/orbit-hub-profile.jpg") {
          parsed.avatar_url = "/orbit-hub-default-logo.png";
          localStorage.setItem("orbit_profile", JSON.stringify(parsed));
        }
        setProfile(parsed);
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

    // Also fetch live data from Supabase if connected
    if (isConnectedToSupabase) {
      (async () => {
        try {
          const supabase = createClient();
          const { data: linksData } = await supabase
            .from("links")
            .select("*")
            .order("order_index", { ascending: true });

          if (linksData && linksData.length > 0) {
            setLinks(linksData as LinkItem[]);
            localStorage.setItem("orbit_links", JSON.stringify(linksData));
          }

          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .ilike("username", "orbithub")
            .maybeSingle();

          if (profileData) {
            setProfile(profileData as Profile);
            localStorage.setItem("orbit_profile", JSON.stringify(profileData));
          }
        } catch (e) {
          console.warn("Live data fetch notice:", e);
        }
      })();
    }
  }, [isConnectedToSupabase]);

  const saveToLocal = async (newProfile: Profile, newLinks: LinkItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orbit_profile", JSON.stringify(newProfile));
      localStorage.setItem("orbit_links", JSON.stringify(newLinks));
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }

    try {
      await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: newProfile, links: newLinks }),
      });
    } catch (apiErr) {
      console.warn("API save notice:", apiErr);
    }

    if (isConnectedToSupabase) {
      try {
        const supabase = createClient();
        for (const link of newLinks) {
          await supabase.from("links").upsert({
            id: link.id.includes("-") ? link.id : "00000000-0000-0000-0000-" + Date.now().toString(16).padStart(12, "0"),
            user_id: newProfile.id || "00000000-0000-0000-0000-000000000001",
            title: link.title,
            url: link.url,
            icon: link.icon || "globe",
            is_active: link.is_active,
            order_index: link.order_index,
            click_count: link.click_count || 0,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Supabase links save notice:", err);
      }
    }
  };

  const handleAddLink = () => {
    const randomHex = Math.random().toString(16).substring(2, 14).padEnd(12, "0");
    const newLink: LinkItem = {
      id: `00000000-0000-4000-a000-${randomHex}`,
      user_id: profile.id || "00000000-0000-0000-0000-000000000001",
      title: "새 링크 제목",
      url: "https://",
      icon: "globe",
      is_active: true,
      order_index: links.length,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newLink, ...links].map((item, idx) => ({
      ...item,
      order_index: idx,
    }));
    setLinks(updated);
    saveToLocal(profile, updated);
  };

  const handleUpdateLink = (id: string, updates: Partial<LinkItem>) => {
    const updated = links.map((l) => (l.id === id ? { ...l, ...updates } : l));
    setLinks(updated);
    saveToLocal(profile, updated);
  };

  const handleDeleteLink = async (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveToLocal(profile, updated);
    if (isConnectedToSupabase) {
      try {
        const supabase = createClient();
        await supabase.from("links").delete().eq("id", id);
      } catch (err) {
        console.warn("Delete link error:", err);
      }
    }
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIdx];
    newLinks[targetIdx] = temp;

    // reindex
    const reindexed = newLinks.map((item, idx) => ({
      ...item,
      order_index: idx,
    }));
    setLinks(reindexed);
    saveToLocal(profile, reindexed);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProfileUpdate = (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveToLocal(updated, links);
  };

  const handleSocialUpdate = (network: keyof SocialLinks, value: string) => {
    const updatedSocial = {
      ...(profile.social_links || {}),
      [network]: value,
    };
    handleProfileUpdate({ social_links: updatedSocial });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/orbithub";
  };

  const totalClicks = links.reduce((sum, l) => sum + l.click_count, 0);
  const mockPageviews = Math.round(totalClicks * 1.8) + 420;
  const ctrRate = totalClicks > 0 ? ((totalClicks / mockPageviews) * 100).toFixed(1) : "0.0";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#080a0f",
        color: "#f8fafc",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: 68,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(11, 15, 25, 0.8)",
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
            href="/"
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

          {/* Quick share pill */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isSavedNotice && (
            <span
              style={{
                fontSize: 13,
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={14} /> Auto-saved
            </span>
          )}

          {!isConnectedToSupabase && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(234, 179, 8, 0.12)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                color: "#facc15",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
              }}
              title="Configure NEXT_PUBLIC_SUPABASE_URL in .env.local to activate live DB sync"
            >
              <HelpCircle size={14} />
              <span>Demo Mode</span>
            </div>
          )}

          <a
            href="/admin/profile"
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: 13, gap: 6 }}
          >
            <Edit3 size={15} />
            <span>프로필 수정하기</span>
          </a>

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

      {/* Main Studio Layout: Left Controls + Right Live Phone */}
      <div
        style={{
          display: "flex",
          flex: 1,
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Left Side: Navigation & Editor Panels */}
        <div
          style={{
            flex: "1 1 65%",
            padding: "36px 36px 80px",
            maxWidth: 780,
            width: "100%",
          }}
        >
          {/* Sub Navigation Tabs */}
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
            <button
              onClick={() => setActiveTab("links")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === "links" ? "#ffffff" : "#94a3b8",
                backgroundColor:
                  activeTab === "links" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                border:
                  activeTab === "links"
                    ? "1px solid rgba(99, 102, 241, 0.4)"
                    : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <LinkIcon size={16} />
              <span>Links</span>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 9999,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                {links.length}
              </span>
            </button>

            <a
              href="/admin/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#94a3b8",
                backgroundColor: "transparent",
                border: "1px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Palette size={16} />
              <span>프로필 & 정보 수정</span>
            </a>

            <a
              href="/admin/automations"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#f472b6",
                backgroundColor: "rgba(236, 72, 153, 0.12)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(236, 72, 153, 0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(236, 72, 153, 0.12)";
              }}
            >
              <Bot size={16} color="#f472b6" />
              <span>🤖 인스타 자동 DM</span>
            </a>

            <button
              onClick={() => setActiveTab("appearance")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === "appearance" ? "#ffffff" : "#94a3b8",
                backgroundColor:
                  activeTab === "appearance" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                border:
                  activeTab === "appearance"
                    ? "1px solid rgba(99, 102, 241, 0.4)"
                    : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <Palette size={16} />
              <span>테마 프리셋</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === "analytics" ? "#ffffff" : "#94a3b8",
                backgroundColor:
                  activeTab === "analytics" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                border:
                  activeTab === "analytics"
                    ? "1px solid rgba(99, 102, 241, 0.4)"
                    : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
          </div>

          {/* TAB 1: LINKS MANAGEMENT */}
          {activeTab === "links" && (
            <div>
              {/* Add Link CTA */}
              <button
                onClick={handleAddLink}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 16,
                  marginBottom: 24,
                  fontSize: 16,
                }}
              >
                <Plus size={20} />
                <span>Add New Link</span>
              </button>

              {/* Links List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {links.map((link, idx) => (
                  <div
                    key={link.id}
                    className="glass-panel"
                    style={{
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "border-color 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      {/* Order Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => handleMoveLink(idx, "up")}
                          disabled={idx === 0}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: idx === 0 ? "#475569" : "#cbd5e1",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                          }}
                          title="Move up"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveLink(idx, "down")}
                          disabled={idx === links.length - 1}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: idx === links.length - 1 ? "#475569" : "#cbd5e1",
                            cursor: idx === links.length - 1 ? "not-allowed" : "pointer",
                          }}
                          title="Move down"
                        >
                          <MoveDown size={14} />
                        </button>
                      </div>

                      {/* Title & Icon Input */}
                      <div style={{ flex: 1, display: "flex", gap: 10 }}>
                        <select
                          value={link.icon}
                          onChange={(e) =>
                            handleUpdateLink(link.id, { icon: e.target.value })
                          }
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 13,
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="globe">🌐 Web</option>
                          <option value="sparkles">✨ Star</option>
                          <option value="github">🐙 Github</option>
                          <option value="twitter">🐦 Twitter</option>
                          <option value="instagram">📷 Instagram</option>
                          <option value="youtube">📺 YouTube</option>
                          <option value="headphones">🎧 Audio</option>
                          <option value="coffee">☕ Coffee</option>
                          <option value="calendar">📅 Calendar</option>
                        </select>

                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) =>
                            handleUpdateLink(link.id, { title: e.target.value })
                          }
                          placeholder="Link Title"
                          className="input-field"
                          style={{ fontWeight: 600, fontSize: 15 }}
                        />
                      </div>

                      {/* Toggle Active Switch */}
                      <button
                        onClick={() =>
                          handleUpdateLink(link.id, { is_active: !link.is_active })
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: link.is_active
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: link.is_active ? "#10b981" : "#ef4444",
                          border: link.is_active
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {link.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{link.is_active ? "Active" : "Hidden"}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        style={{
                          padding: 8,
                          color: "#94a3b8",
                          borderRadius: 8,
                          transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        title="Delete link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* URL Input */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          handleUpdateLink(link.id, { url: e.target.value })
                        }
                        placeholder="https://yourlink.com"
                        className="input-field"
                        style={{ fontSize: 13, color: "#94a3b8" }}
                      />

                      {/* Click counter badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#818cf8",
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                          padding: "8px 14px",
                          borderRadius: 8,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <MousePointerClick size={14} />
                        <span>{link.click_count} clicks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & THEMES */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Profile Meta Section */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20 }}>Profile Header</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={profile.avatar_url || ""}
                      onChange={(e) =>
                        handleProfileUpdate({ avatar_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>

                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 6,
                        }}
                      >
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.display_name}
                        onChange={(e) =>
                          handleProfileUpdate({ display_name: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 6,
                        }}
                      >
                        Username Handle
                      </label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) =>
                          handleProfileUpdate({ username: e.target.value.toLowerCase() })
                        }
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      Bio Description
                    </label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
                      rows={3}
                      className="input-field"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20 }}>Social Links</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      <IconInstagram size={16} /> Instagram
                    </label>
                    <input
                      type="url"
                      value={profile.social_links?.instagram || ""}
                      onChange={(e) => handleSocialUpdate("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      <IconTwitter size={14} /> X / Twitter
                    </label>
                    <input
                      type="url"
                      value={profile.social_links?.twitter || ""}
                      onChange={(e) => handleSocialUpdate("twitter", e.target.value)}
                      placeholder="https://x.com/yourhandle"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      <IconYoutube size={16} /> YouTube
                    </label>
                    <input
                      type="url"
                      value={profile.social_links?.youtube || ""}
                      onChange={(e) => handleSocialUpdate("youtube", e.target.value)}
                      placeholder="https://youtube.com/@channel"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      <IconGithub size={16} /> GitHub
                    </label>
                    <input
                      type="url"
                      value={profile.social_links?.github || ""}
                      onChange={(e) => handleSocialUpdate("github", e.target.value)}
                      placeholder="https://github.com/username"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Themes Gallery */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>Choose Theme Preset</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                  Select an aesthetic celestial theme. Your live preview updates instantly.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  {THEMES.map((theme) => {
                    const isSelected = profile.theme_id === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleProfileUpdate({ theme_id: theme.id })}
                        style={{
                          borderRadius: 14,
                          padding: 14,
                          cursor: "pointer",
                          border: isSelected
                            ? "2px solid #6366f1"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          backgroundColor: isSelected
                            ? "rgba(99, 102, 241, 0.1)"
                            : "rgba(255, 255, 255, 0.02)",
                          boxShadow: isSelected
                            ? "0 0 20px rgba(99, 102, 241, 0.3)"
                            : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Theme Preview Swatch */}
                        <div
                          style={{
                            height: 70,
                            borderRadius: 10,
                            background: theme.bgClass,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              width: "60%",
                              height: 18,
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
                          <span style={{ fontWeight: 600, fontSize: 14 }}>
                            {theme.name}
                          </span>
                          {isSelected && <Check size={16} color="#6366f1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                <div className="glass-panel" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#94a3b8",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Total Pageviews</span>
                    <Users size={18} color="#6366f1" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{mockPageviews}</div>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 6 }}>
                    +18% from last week
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#94a3b8",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Total Link Clicks</span>
                    <MousePointerClick size={18} color="#ec4899" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{totalClicks}</div>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 6 }}>
                    +24% from last week
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#94a3b8",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Conversion Rate (CTR)</span>
                    <TrendingUp size={18} color="#10b981" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{ctrRate}%</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                    Industry average: 38%
                  </div>
                </div>
              </div>

              {/* Per-link Breakdown */}
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20 }}>Top Performing Links</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[...links]
                    .sort((a, b) => b.click_count - a.click_count)
                    .map((link, idx) => (
                      <div
                        key={link.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 18px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          borderRadius: 12,
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              backgroundColor:
                                idx === 0
                                  ? "rgba(234, 179, 8, 0.2)"
                                  : "rgba(255, 255, 255, 0.05)",
                              color: idx === 0 ? "#eab308" : "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>
                            {link.title}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#818cf8",
                          }}
                        >
                          {link.click_count} clicks
                        </div>
                      </div>
                    ))}
                </div>
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
            {/* Dynamic Island / Notch */}
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
