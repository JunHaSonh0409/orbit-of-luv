"use client";

import React, { useState } from "react";
import LinktreeView from "@/components/LinktreeView";
import { DEMO_PROFILE, DEMO_LINKS } from "@/lib/data-service";
import { THEMES } from "@/lib/themes";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart,
  Palette,
  ExternalLink,
  CheckCircle2,
  Database,
  Cloud,
  ChevronRight,
  Smartphone,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const [selectedThemeId, setSelectedThemeId] = useState("aurora-dark");
  const activeThemeProfile = {
    ...DEMO_PROFILE,
    theme_id: selectedThemeId,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07090e",
        color: "#f8fafc",
        overflowX: "hidden",
      }}
    >
      {/* Dynamic Background Glows */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.1) 40%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(7, 9, 14, 0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(99, 102, 241, 0.5)",
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <span>
            Orbit <span style={{ color: "#818cf8" }}>Hub</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a
            href="#features"
            style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}
          >
            Features
          </a>
          <a
            href="#themes"
            style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}
          >
            Themes
          </a>
          <a
            href="#architecture"
            style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}
          >
            Supabase & Vercel
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a
            href="/login"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#cbd5e1",
              padding: "8px 16px",
            }}
          >
            Sign In
          </a>
          <a
            href="/admin"
            className="btn-primary"
            style={{ padding: "10px 22px", fontSize: 14 }}
          >
            <span>Launch Studio</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "90px 24px 60px",
          maxWidth: 1240,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Pill Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "8px 18px",
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            color: "#a5b4fc",
            marginBottom: 28,
          }}
        >
          <Sparkles size={15} />
          <span>Powered by Next.js + Supabase + Vercel</span>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 900,
            margin: "0 auto 24px",
          }}
        >
          One link to share{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #f472b6 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            everything you create.
          </span>
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.6,
            color: "#94a3b8",
            maxWidth: 680,
            margin: "0 auto 40px",
          }}
        >
          Build your personalized, ultra-fast link bio in seconds with rich aesthetics, real-time analytics, and total data ownership backed by Supabase & Vercel.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 70,
          }}
        >
          <a
            href="/admin"
            className="btn-primary"
            style={{ padding: "16px 36px", fontSize: 16 }}
          >
            <span>Start Building for Free</span>
            <ArrowRight size={18} />
          </a>
          <a
            href="/orbithub"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: "16px 28px", fontSize: 16 }}
          >
            <span>View Demo Linktree (@orbithub)</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Interactive Hero Visual Showcase */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            margin: "0 auto",
            maxWidth: 1000,
          }}
        >
          {/* Floating Pill Left: Real-time Stats */}
          <div
            className="glass-panel-glow animate-float"
            style={{
              position: "absolute",
              left: 40,
              top: "25%",
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              zIndex: 10,
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart size={22} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                Live Click Tracking
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
                3,527 Clicks
              </div>
            </div>
          </div>

          {/* Floating Pill Right: Supabase RLS */}
          <div
            className="glass-panel-glow animate-float"
            style={{
              position: "absolute",
              right: 40,
              bottom: "25%",
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              zIndex: 10,
              textAlign: "left",
              animationDelay: "1.5s",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={22} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                Postgres RLS Security
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                Self-Hosted Supabase
              </div>
            </div>
          </div>

          {/* Centerpiece Phone Frame */}
          <div
            style={{
              width: 340,
              height: 680,
              borderRadius: 48,
              border: "12px solid #1a1e2d",
              boxShadow:
                "0 30px 80px -20px rgba(0, 0, 0, 0.9), 0 0 60px rgba(99, 102, 241, 0.3)",
              overflow: "hidden",
              position: "relative",
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
                width: 96,
                height: 22,
                backgroundColor: "#000",
                borderRadius: 20,
                zIndex: 30,
              }}
            />

            <div
              style={{
                height: "100%",
                overflowY: "auto",
              }}
            >
              <LinktreeView
                profile={activeThemeProfile}
                links={DEMO_LINKS}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Theme Selector Strip */}
      <section
        id="themes"
        style={{
          padding: "80px 24px",
          backgroundColor: "rgba(255, 255, 255, 0.01)",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Switchable Aesthetic Themes
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 36 }}>
            Click a preset below to see the showcase phone above adapt in real-time.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThemeId(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  borderRadius: 9999,
                  backgroundColor:
                    selectedThemeId === t.id
                      ? "rgba(99, 102, 241, 0.25)"
                      : "rgba(255, 255, 255, 0.05)",
                  border:
                    selectedThemeId === t.id
                      ? "1px solid #6366f1"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedThemeId === t.id ? "#fff" : "#94a3b8",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: t.previewGradient,
                  }}
                />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section
        id="features"
        style={{
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>
            Engineered for Creators & Developers
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
            Everything you expect from Linktree, plus unmatched performance and enterprise-grade backend infrastructure.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
          }}
        >
          {/* Feature 1 */}
          <div className="glass-panel" style={{ padding: 36 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Smartphone size={24} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Live Studio & Preview
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: 15 }}>
              Reorder links, toggle visibility, customize avatars, and test icons with instant live smartphone synchronization.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel" style={{ padding: 36 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "rgba(236, 72, 153, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Database size={24} color="#f472b6" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Supabase PostgreSQL & RLS
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: 15 }}>
              Bulletproof Row Level Security ensures users can only edit their own data. Public routes are served lightning-fast.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel" style={{ padding: 36 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Cloud size={24} color="#34d399" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Vercel Global Edge Ready
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: 15 }}>
              Deploy in seconds to Vercel with zero server maintenance, automated SSL, and global CDN delivery for under 50ms loads.
            </p>
          </div>
        </div>
      </section>

      {/* Supabase & Vercel Architecture Section */}
      <section
        id="architecture"
        style={{
          padding: "80px 24px 120px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div
          className="glass-panel-glow"
          style={{
            padding: "48px 40px",
            textAlign: "center",
            borderRadius: 28,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              padding: "6px 14px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={14} /> Production Foundation Ready
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            Ready to deploy on Vercel & Supabase
          </h2>

          <p
            style={{
              color: "#94a3b8",
              fontSize: 16,
              maxWidth: 620,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            All SQL migration scripts (`supabase/schema.sql`), Vercel configuration (`vercel.json`), and environment variables (`.env.example`) have been completely generated and tested.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/admin"
              className="btn-primary"
              style={{ padding: "14px 32px" }}
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={16} />
            </a>
            <a
              href="/orbithub"
              className="btn-secondary"
              style={{ padding: "14px 28px" }}
            >
              <span>Open Orbit Hub Profile</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "36px 32px",
          textAlign: "center",
          color: "#64748b",
          fontSize: 13,
        }}
      >
        <div style={{ marginBottom: 10, fontWeight: 600, color: "#94a3b8" }}>
          Orbit Hub &bull; Powered by Next.js, Supabase & Vercel
        </div>
        <div>
          Designed for high performance, open customization, and complete creator control.
        </div>
      </footer>
    </div>
  );
}
