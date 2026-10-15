"use client";

import React, { useState } from "react";
import { Profile, LinkItem } from "@/types/database.types";
import { getThemeById } from "@/lib/themes";
import {
  IconYoutube,
  IconTwitter,
  IconInstagram,
  IconGithub,
  IconLinkedin,
  IconKakao,
  IconThreads,
} from "./SocialIcons";
import {
  Globe,
  Mail,
  ExternalLink,
  Sparkles,
  Share2,
  Check,
  Headphones,
  Coffee,
  Calendar,
  Layers,
  Heart,
  Edit3,
} from "lucide-react";

interface LinktreeViewProps {
  profile: Profile;
  links: LinkItem[];
  isPreview?: boolean;
  onLinkClick?: (linkId: string, url: string) => void;
}

export default function LinktreeView({
  profile,
  links,
  isPreview = false,
  onLinkClick,
}: LinktreeViewProps) {
  const theme = getThemeById(profile.theme_id);
  const [copied, setCopied] = useState(false);

  const activeLinks = links.filter((l) => isPreview || l.is_active);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderIcon = (iconName: string) => {
    const props = { size: 18, color: theme.accentColor };
    switch (iconName.toLowerCase()) {
      case "github":
        return <IconGithub {...props} />;
      case "twitter":
        return <IconTwitter {...props} />;
      case "instagram":
        return <IconInstagram {...props} />;
      case "youtube":
        return <IconYoutube {...props} />;
      case "linkedin":
        return <IconLinkedin {...props} />;
      case "mail":
        return <Mail size={18} />;
      case "sparkles":
        return <Sparkles size={18} />;
      case "headphones":
        return <Headphones size={18} />;
      case "coffee":
        return <Coffee size={18} />;
      case "calendar":
        return <Calendar size={18} />;
      case "layers":
        return <Layers size={18} />;
      case "heart":
        return <Heart size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  return (
    <div
      style={{
        background: theme.bgClass,
        minHeight: isPreview ? "100%" : "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isPreview ? "32px 18px 40px" : "64px 20px 60px",
        color: theme.textColor,
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        transition: "all 0.4s ease",
      }}
    >
      {/* Top Share Button */}
      {!isPreview && (
        <button
          onClick={handleShare}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "8px 14px",
            borderRadius: 9999,
            color: theme.textColor,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
            zIndex: 40,
          }}
          title="Share profile"
        >
          {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
      )}

      {/* Profile Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
          marginBottom: 28,
        }}
      >
        {/* Avatar / Logo Header */}
        <div
          style={{
            position: "relative",
            width: isPreview ? 92 : 110,
            height: isPreview ? 92 : 110,
            borderRadius: "50%",
            padding: 3,
            background: `linear-gradient(135deg, ${theme.accentColor}, #ec4899)`,
            boxShadow: `0 8px 30px ${theme.accentColor}50`,
            marginBottom: 16,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              profile.avatar_url ||
              "/orbit-hub-default-logo.png"
            }
            alt={profile.display_name}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              backgroundColor: "#000",
            }}
          />
        </div>

        {/* Display Name */}
        <h1
          style={{
            fontSize: isPreview ? 22 : 26,
            fontWeight: 800,
            color: theme.textColor,
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          {profile.display_name || `@${profile.username}`}
        </h1>

        {/* Handle */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: theme.accentColor,
            marginBottom: 12,
            letterSpacing: "0.02em",
          }}
        >
          @{profile.username}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: theme.subtextColor,
              maxWidth: 420,
              whiteSpace: "pre-line",
              wordBreak: "keep-all",
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Social Icons Bar */}
        {profile.social_links && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            {profile.social_links.instagram && (
              <a
                href={profile.social_links.instagram}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
              >
                <IconInstagram size={20} />
              </a>
            )}
            {profile.social_links.twitter && (
              <a
                href={profile.social_links.twitter}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
              >
                <IconTwitter size={18} />
              </a>
            )}
            {profile.social_links.youtube && (
              <a
                href={profile.social_links.youtube}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
              >
                <IconYoutube size={20} />
              </a>
            )}
            {profile.social_links.github && (
              <a
                href={profile.social_links.github}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
              >
                <IconGithub size={20} />
              </a>
            )}
            {profile.social_links.linkedin && (
              <a
                href={profile.social_links.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
              >
                <IconLinkedin size={20} />
              </a>
            )}
            {profile.social_links.kakao && (
              <a
                href={profile.social_links.kakao}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
                title="카카오톡 오픈채팅"
              >
                <IconKakao size={20} />
              </a>
            )}
            {profile.social_links.threads && (
              <a
                href={profile.social_links.threads}
                target="_blank"
                rel="noreferrer"
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
                title="Threads"
              >
                <IconThreads size={20} />
              </a>
            )}
            {profile.social_links.email && (
              <a
                href={`mailto:${profile.social_links.email}`}
                style={{ color: theme.subtextColor, transition: "color 0.2s" }}
                title="Email"
              >
                <Mail size={20} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links Stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 480,
          flex: 1,
        }}
      >
        {activeLinks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "36px 20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 16,
              color: theme.subtextColor,
              fontSize: 14,
            }}
          >
            No links active yet
          </div>
        ) : (
          activeLinks.map((link) => (
            <a
              key={link.id}
              href={isPreview ? "#" : link.url}
              target={isPreview ? "_self" : "_blank"}
              rel="noreferrer"
              onClick={(e) => {
                if (isPreview) e.preventDefault();
                if (onLinkClick) onLinkClick(link.id, link.url);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: theme.cardStyle.background,
                border: theme.cardStyle.border,
                borderRadius: 16,
                color: theme.cardStyle.color,
                boxShadow: theme.cardStyle.boxShadow,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                textDecoration: "none",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (theme.cardStyle.hoverBackground) {
                  e.currentTarget.style.background =
                    theme.cardStyle.hoverBackground;
                }
                e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.cardStyle.background;
                e.currentTarget.style.transform = "translateY(0px) scale(1)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.accentColor,
                  }}
                >
                  {renderIcon(link.icon)}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {link.title}
                </span>
              </div>
              <ExternalLink size={16} opacity={0.6} />
            </a>
          ))
        )}
      </div>

      {/* Footer Branding */}
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 12,
          color: theme.subtextColor,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>Powered by</span>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontWeight: 700,
            color: theme.textColor,
            letterSpacing: "-0.02em",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: theme.accentColor,
              display: "inline-block",
            }}
          />
          Orbit Hub
        </a>
      </div>
    </div>
  );
}
