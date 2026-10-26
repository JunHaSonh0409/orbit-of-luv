"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Lock, ArrowRight, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";
  const isRestricted = searchParams.get("restricted") === "true";

  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "보안 인증에 실패했습니다.");
        setLoading(false);
        return;
      }

      // Success: Redirect to target admin route
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg("인증 서버 통신 중 오류가 발생했습니다.");
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
        background: "radial-gradient(ellipse at 50% 20%, #15102a 0%, #080a0f 70%)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: 440,
          width: "100%",
          padding: "44px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.2)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)",
            }}
          >
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Orbit Hub 관리자 보안 게이트
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            프로필 수정 및 링크 관리 스튜디오는 오직 권한을 가진 관리자 본인만 접근할 수 있습니다.
          </p>
        </div>

        {isRestricted && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              backgroundColor: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              color: "#facc15",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>비인가 접근이 감지되었습니다. 관리자 인증을 완료해 주세요.</span>
          </div>
        )}

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

        <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: 8,
              }}
            >
              관리자 마스터 패스코드 (Admin Passcode)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="마스터 패스코드를 입력하세요"
                className="input-field"
                style={{ paddingLeft: 42, fontSize: 15 }}
              />
              <KeyRound
                size={18}
                color="#818cf8"
                style={{ position: "absolute", left: 14, top: 13 }}
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
              fontSize: 15,
            }}
          >
            <span>{loading ? "보안 인증 중..." : "관리자 스튜디오 잠금 해제"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
          일반 방문자이신가요?{" "}
          <a
            href="/orbithub"
            style={{ color: "#818cf8", fontWeight: 600 }}
          >
            Orbit Hub 링크 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: "#fff", padding: 40, textAlign: "center" }}>보안 시스템 확인 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
