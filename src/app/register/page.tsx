"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/data-service";
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const isSupabaseReady = isSupabaseConfigured();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!isSupabaseReady) {
      setTimeout(() => {
        router.push("/admin");
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        if (data.session) {
          router.push("/admin");
        } else {
          setSuccessMsg(
            "Account created! Please check your email to confirm your account."
          );
          setLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(ellipse at 50% 20%, #171130 0%, #080a0f 70%)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: 440,
          width: "100%",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            Claim your Orbit link
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Join creators sharing everything with one celestial link
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              Choose your link handle
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="yourname"
                className="input-field"
                style={{ paddingLeft: 40 }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: 13,
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                @
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
              Your link: orbit.link/{username || "username"}
            </span>
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
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                style={{ paddingLeft: 40 }}
              />
              <Mail
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
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field"
                style={{ paddingLeft: 40 }}
              />
              <Lock
                size={16}
                color="#64748b"
                style={{ position: "absolute", left: 14, top: 14 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
            }}
          >
            <span>{loading ? "Creating account..." : "Claim My Orbit Link"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#818cf8", fontWeight: 600 }}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
