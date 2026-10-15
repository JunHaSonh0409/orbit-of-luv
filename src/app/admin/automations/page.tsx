"use client";

import React, { useState, useEffect } from "react";
import { DmAutomationRule, DmLogItem } from "@/types/database.types";
import {
  getStoredDmRules,
  saveStoredDmRules,
  getStoredDmLogs,
  saveStoredDmLogs,
  DEMO_PROFILE,
} from "@/lib/data-service";
import {
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Smartphone,
  Eye,
  EyeOff,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Heart,
  Smile,
  ShieldCheck,
  Copy,
  Info,
  Radio,
  Share2,
  LogOut,
} from "lucide-react";

export default function AutomationsPage() {
  const [rules, setRules] = useState<DmAutomationRule[]>([]);
  const [logs, setLogs] = useState<DmLogItem[]>([]);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "simulator" | "logs" | "setup">("rules");

  // Simulator State
  const [simComment, setSimComment] = useState("");
  const [simUsername, setSimUsername] = useState("my_insta_user");
  const [simCommentsList, setSimCommentsList] = useState<
    Array<{ username: string; text: string; time: string; reply?: string }>
  >([
    {
      username: "yuna_orbit",
      text: "소개팅 신청합니다 🪐",
      time: "2분 전",
      reply: "💌 DM으로 소개팅 신청 링크를 발송해드렸습니다! 확인해 주세요 :)",
    },
    {
      username: "seoul_lover",
      text: "매거진 읽어보고 싶어요!",
      time: "5분 전",
      reply: "✨ 이번 주 러브 매거진 링크를 DM으로 전송해드렸어요!",
    },
  ]);
  const [incomingDm, setIncomingDm] = useState<{
    showNotification: boolean;
    ruleName?: string;
    message?: string;
    buttonText?: string;
    buttonUrl?: string;
  }>({ showNotification: false });

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState("");
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [newKeywords, setNewKeywords] = useState<string[]>(["신청"]);
  const [newDmMessage, setNewDmMessage] = useState(
    "안녕하세요! 우주 모든 인연이 만날 때까지, Orbit Hub 인스타 무료 소개팅입니다 🪐\n\n아래 버튼을 눌러 매칭 프로필을 작성해 주세요!"
  );
  const [newButtonText, setNewButtonText] = useState("🪐 소개팅 신청하기");
  const [newButtonUrl, setNewButtonUrl] = useState("https://orbithub.vercel.app/orbithub");
  const [newReplyComment, setNewReplyComment] = useState("💌 DM으로 링크를 보내드렸어요! 보관함을 확인해 주세요 :)");

  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    setRules(getStoredDmRules());
    setLogs(getStoredDmLogs());
  }, []);

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r));
    setRules(updated);
    saveStoredDmRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveStoredDmRules(updated);
  };

  const handleAddKeyword = () => {
    const kw = newKeywordInput.trim();
    if (kw && !newKeywords.includes(kw)) {
      setNewKeywords([...newKeywords, kw]);
      setNewKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setNewKeywords(newKeywords.filter((k) => k !== kwToRemove));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || newKeywords.length === 0 || !newDmMessage.trim()) return;

    const newRule: DmAutomationRule = {
      id: `rule-${Date.now()}`,
      user_id: "demo-user-id",
      name: newRuleName,
      post_type: "all",
      keywords: newKeywords,
      match_type: "contains",
      dm_message: newDmMessage,
      button_text: newButtonText,
      button_url: newButtonUrl,
      reply_comment: newReplyComment,
      is_active: true,
      sent_count: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newRule, ...rules];
    setRules(updated);
    saveStoredDmRules(updated);
    setShowNewRuleModal(false);

    // Reset Form
    setNewRuleName("");
    setNewKeywords(["신청"]);
  };

  // Run Simulator Interaction
  const handleSimulateComment = () => {
    if (!simComment.trim()) return;

    const trimmed = simComment.trim();
    const activeRules = rules.filter((r) => r.is_active);

    // Find match
    const matched = activeRules.find((r) =>
      r.keywords.some((kw) => trimmed.toLowerCase().includes(kw.toLowerCase()))
    );

    const userCommentItem = {
      username: simUsername,
      text: trimmed,
      time: "방금 전",
      reply: matched?.reply_comment,
    };

    setSimCommentsList([userCommentItem, ...simCommentsList]);
    setSimComment("");

    if (matched) {
      // Trigger DM notification after 800ms
      setTimeout(() => {
        setIncomingDm({
          showNotification: true,
          ruleName: matched.name,
          message: matched.dm_message,
          buttonText: matched.button_text,
          buttonUrl: matched.button_url,
        });

        // Add log
        const newLog: DmLogItem = {
          id: `log-${Date.now()}`,
          rule_id: matched.id,
          rule_name: matched.name,
          ig_username: simUsername,
          trigger_comment: trimmed,
          matched_keyword: matched.keywords.find((k) => trimmed.includes(k)) || matched.keywords[0],
          sent_message: matched.dm_message,
          button_url: matched.button_url,
          public_reply: matched.reply_comment,
          status: "success",
          sent_at: "방금 전",
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        saveStoredDmLogs(updatedLogs);

        // Increment count
        const updatedRules = rules.map((r) =>
          r.id === matched.id ? { ...r, sent_count: r.sent_count + 1 } : r
        );
        setRules(updatedRules);
        saveStoredDmRules(updatedRules);
      }, 800);
    }
  };

  const totalSent = rules.reduce((acc, r) => acc + r.sent_count, 0);

  const copyWebhookUrl = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/api/webhook/instagram`;
      navigator.clipboard.writeText(url);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
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
      {/* Top Header */}
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

          {/* Service Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(236, 72, 153, 0.12)",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              padding: "6px 14px",
              borderRadius: 9999,
              fontSize: 13,
              color: "#f472b6",
              fontWeight: 600,
            }}
          >
            <Bot size={15} />
            <span>Instagram 자동 DM 스튜디오</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="/orbithub"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            <span>내 프로필 보기</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={() => setShowNewRuleModal(true)}
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            <Plus size={15} />
            <span>새 자동 DM 규칙 추가</span>
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

      {/* Main Container */}
      <div
        style={{
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: 16,
          }}
        >
          <a
            href="/admin"
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            링크 관리
          </a>
          <a
            href="/admin/profile"
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            프로필 수정
          </a>
          <button
            onClick={() => setActiveTab("rules")}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: "rgba(99, 102, 241, 0.25)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              cursor: "pointer",
            }}
          >
            🤖 자동 DM 규칙 ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === "simulator" ? "#ffffff" : "#94a3b8",
              backgroundColor:
                activeTab === "simulator" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              cursor: "pointer",
            }}
          >
            🎮 실시간 댓글 DM 시뮬레이터
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === "logs" ? "#ffffff" : "#94a3b8",
              backgroundColor:
                activeTab === "logs" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              cursor: "pointer",
            }}
          >
            📋 발송 히스토리 ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === "setup" ? "#ffffff" : "#94a3b8",
              backgroundColor:
                activeTab === "setup" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              cursor: "pointer",
            }}
          >
            ⚙️ Meta API 연동 안내
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
            marginBottom: 36,
          }}
        >
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
              누적 자동 발송 DM
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#818cf8" }}>
              {totalSent}건
            </div>
            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
              +38% from this week
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
              DM 링크 클릭률 (CTR)
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#f472b6" }}>
              68.4%
            </div>
            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
              평균 대비 2.1배 높은 전환
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
              평균 응답 속도
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#34d399" }}>
              0.8초
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              댓글 즉시 실시간 발송
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
              가동 중인 규칙
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#facc15" }}>
              {rules.filter((r) => r.is_active).length} / {rules.length}개
            </div>
            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
              실시간 자동 응답 중
            </div>
          </div>
        </div>

        {/* TAB 1: RULES MANAGEMENT */}
        {activeTab === "rules" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>활성 자동 DM 규칙</h2>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  인스타그램 게시물이나 릴스에 댓글이 달리면 지정된 키워드를 감지하여 즉시 DM과 답글을 보냅니다.
                </p>
              </div>

              <button
                onClick={() => setShowNewRuleModal(true)}
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: 14 }}
              >
                <Plus size={16} />
                <span>새 규칙 만들기</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="glass-panel"
                  style={{
                    padding: 24,
                    border: rule.is_active
                      ? "1px solid rgba(99, 102, 241, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: rule.is_active
                            ? "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)"
                            : "rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Bot size={20} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{rule.name}</h3>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          누적 발송 {rule.sent_count}건
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          borderRadius: 9999,
                          fontSize: 13,
                          fontWeight: 600,
                          backgroundColor: rule.is_active
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: rule.is_active ? "#10b981" : "#ef4444",
                          border: rule.is_active
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : "1px solid rgba(239, 68, 68, 0.3)",
                          cursor: "pointer",
                        }}
                      >
                        {rule.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{rule.is_active ? "가동 중 (Active)" : "일시 정지"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{
                          padding: 8,
                          color: "#94a3b8",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        title="규칙 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Keywords Chips */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                      감지 키워드:
                    </span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {rule.keywords.map((kw, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            backgroundColor: "rgba(99, 102, 241, 0.15)",
                            color: "#a5b4fc",
                            fontSize: 13,
                            fontWeight: 600,
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                          }}
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Message & Button Preview Box */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      backgroundColor: "rgba(0, 0, 0, 0.25)",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                        💌 발송될 DM 메시지:
                      </span>
                      <p style={{ fontSize: 13, color: "#cbd5e1", whiteSpace: "pre-line", lineHeight: 1.5 }}>
                        {rule.dm_message}
                      </p>
                      {rule.button_text && (
                        <div
                          style={{
                            marginTop: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            borderRadius: 8,
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            color: "#818cf8",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <span>{rule.button_text}</span>
                          <ExternalLink size={12} />
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                        💬 공개 자동 답댓글:
                      </span>
                      <p style={{ fontSize: 13, color: "#facc15", lineHeight: 1.5 }}>
                        {rule.reply_comment || "설정된 답댓글 없음"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SIMULATOR */}
        {activeTab === "simulator" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
            }}
          >
            {/* Left: Instagram Post / Reel Comments Mockup */}
            <div className="glass-panel" style={{ padding: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #ec4899",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/orbit-hub-default-logo.png"
                      alt="Orbit Hub"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>orbit.of.luv</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>인스타그램 릴스 미리보기</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    padding: "4px 10px",
                    borderRadius: 9999,
                  }}
                >
                  ● 웹훅 감지 대기 중
                </span>
              </div>

              {/* Reel Preview Card */}
              <div
                style={{
                  height: 180,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #18112d 0%, #0d1222 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      backgroundColor: "rgba(236, 72, 153, 0.25)",
                      color: "#f472b6",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    REELS
                  </span>
                  <h4 style={{ fontSize: 17, marginTop: 8 }}>
                    🪐 우주 모든 인연이 만날 때까지, 이번 주 무료 소개팅 매칭 시작!
                  </h4>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    댓글에 &apos;신청&apos; 또는 &apos;소개팅&apos;을 남겨주시면 DM으로 신청서 링크를 즉시 발송해 드려요!
                  </p>
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                  ❤️ 좋아요 1,420개 &bull; 💬 댓글 612개
                </div>
              </div>

              {/* Comments Feed */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: 220,
                  overflowY: "auto",
                  marginBottom: 18,
                  paddingRight: 6,
                }}
              >
                {simCommentsList.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc" }}>
                        @{c.username}
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#cbd5e1" }}>{c.text}</div>
                    {c.reply && (
                      <div
                        style={{
                          marginTop: 6,
                          paddingLeft: 12,
                          borderLeft: "2px solid #818cf8",
                          fontSize: 12,
                          color: "#facc15",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#818cf8" }}>@orbit.of.luv (답글): </span>
                        {c.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Simulator Input Box */}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSimulateComment()}
                  placeholder="댓글 테스트: '신청' 또는 '매거진' 입력 후 엔터"
                  className="input-field"
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={handleSimulateComment}
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: 13 }}
                >
                  <Send size={15} />
                  <span>댓글 작성</span>
                </button>
              </div>

              {/* Quick Prompt Pills */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>빠른 테스트:</span>
                {["신청합니다!", "소개팅 링크 주세요", "매거진 읽고싶어요"].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => {
                      setSimComment(txt);
                    }}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 6,
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#a5b4fc",
                      cursor: "pointer",
                    }}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Instagram Direct Message (DM) Live Phone Screen */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Phone Frame */}
              <div
                style={{
                  width: 320,
                  height: 580,
                  borderRadius: 44,
                  border: "12px solid #1e2230",
                  backgroundColor: "#000",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.25)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Dynamic Notification Popup */}
                {incomingDm.showNotification && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 12,
                      right: 12,
                      backgroundColor: "rgba(28, 32, 48, 0.95)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(236, 72, 153, 0.4)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                      borderRadius: 14,
                      padding: "10px 14px",
                      zIndex: 100,
                      animation: "float 0.3s ease-out",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#ec4899",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Bell size={10} color="#fff" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f472b6" }}>
                        Instagram &bull; 방금 전
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      orbit.of.luv님이 회원님에게 메시지를 보냈습니다
                    </div>
                  </div>
                )}

                {/* DM Chat Header */}
                <div
                  style={{
                    padding: "36px 16px 12px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "rgba(20, 24, 36, 0.9)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/orbit-hub-default-logo.png"
                      alt="Orbit Hub"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>orbit.of.luv</div>
                    <div style={{ fontSize: 10, color: "#10b981" }}>● 활성 중 (자동응답 봇)</div>
                  </div>
                </div>

                {/* Chat Messages Body */}
                <div
                  style={{
                    flex: 1,
                    padding: 16,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    justifyContent: "flex-end",
                  }}
                >
                  {incomingDm.message ? (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#262b3d",
                          padding: "12px 14px",
                          borderRadius: "16px 16px 16px 4px",
                          fontSize: 13,
                          color: "#f8fafc",
                          lineHeight: 1.5,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {incomingDm.message}
                      </div>

                      {incomingDm.buttonText && (
                        <a
                          href={incomingDm.buttonUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            textDecoration: "none",
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                          }}
                        >
                          <span>{incomingDm.buttonText}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "#64748b", fontSize: 12, margin: "auto 0" }}>
                      왼쪽에서 댓글을 작성하면 여기에 실시간으로 도착하는 자동 DM이 표시됩니다! 🪐
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGS */}
        {activeTab === "logs" && (
          <div className="glass-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>실시간 자동 DM 발송 기록</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
              인스타그램에서 트리거된 댓글과 발송된 DM 성공 기록입니다.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      전송 성공
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        @{log.ig_username} &bull;{" "}
                        <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                          댓글: &ldquo;{log.trigger_comment}&rdquo;
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#818cf8", marginTop: 2 }}>
                        규칙: {log.rule_name} (키워드: #{log.matched_keyword})
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: "#64748b" }}>{log.sent_at}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETUP GUIDE */}
        {activeTab === "setup" && (
          <div className="glass-panel" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Meta Graph API 공식 연동 매뉴얼</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>
              실제 인스타그램 비즈니스/크리에이터 계정에 연결하여 자동 DM을 상시 가동하는 3단계 가이드입니다.
            </p>

            {/* Webhook Endpoint Info Box */}
            <div
              style={{
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: 14,
                padding: 20,
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", marginBottom: 6 }}>
                Orbit Hub 웹훅 콜백 주소 (Webhook URL)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/api/webhook/instagram` : "/api/webhook/instagram"}
                  className="input-field"
                  style={{ color: "#cbd5e1", fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="btn-primary"
                  style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {copiedWebhook ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedWebhook ? "복사됨!" : "주소 복사"}</span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  1
                </span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>인스타그램 계정 프로페셔널 전환</h4>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    인스타 앱 &gt; 설정 &gt; &apos;계정 유형 전환&apos;에서 **비즈니스 또는 크리에이터**로 변경 (무료, 1분 소요).
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#ec4899",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  2
                </span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>Meta for Developers 앱 생성</h4>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    developers.facebook.com에서 새 앱을 만들고 `Instagram Graph API` 제품을 추가합니다.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  3
                </span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>웹훅 필드 구독 (Webhook Subscription)</h4>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    웹훅에 위 콜백 주소를 붙여넣고 `comments` 및 `messages` 필드를 체크하면 모든 릴스/게시물 댓글이 자동으로 감지됩니다!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NEW RULE MODAL */}
      {showNewRuleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: 580,
              width: "100%",
              padding: 32,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>새 인스타 자동 DM 규칙 추가</h3>
              <button
                type="button"
                onClick={() => setShowNewRuleModal(false)}
                style={{ color: "#94a3b8", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                  규칙 이름
                </label>
                <input
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="예: 릴스 댓글 '신청' 자동 DM"
                  className="input-field"
                />
              </div>

              {/* Keywords Input */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                  감지할 키워드 (댓글에 이 단어가 포함되면 자동 발송)
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="키워드 입력 후 추가 버튼 클릭"
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    추가
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {newKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                        color: "#a5b4fc",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      #{kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        style={{ color: "#f87171", cursor: "pointer", fontSize: 11 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* DM Message */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                  발송할 DM 메시지 텍스트
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDmMessage}
                  onChange={(e) => setNewDmMessage(e.target.value)}
                  placeholder="댓글 작성자에게 개인 DM으로 보낼 안내 문구를 작성하세요."
                  className="input-field"
                  style={{ lineHeight: 1.5, resize: "vertical" }}
                />
              </div>

              {/* Button text & URL */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    버튼 텍스트
                  </label>
                  <input
                    type="text"
                    value={newButtonText}
                    onChange={(e) => setNewButtonText(e.target.value)}
                    placeholder="예: 🪐 소개팅 신청하기"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    버튼 이동 URL
                  </label>
                  <input
                    type="url"
                    value={newButtonUrl}
                    onChange={(e) => setNewButtonUrl(e.target.value)}
                    placeholder="https://orbithub.vercel.app/orbithub"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Public reply */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                  공개 자동 답댓글 (게시물 댓글에 달릴 답글)
                </label>
                <input
                  type="text"
                  value={newReplyComment}
                  onChange={(e) => setNewReplyComment(e.target.value)}
                  placeholder="예: 💌 DM으로 신청 링크를 보내드렸어요!"
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="btn-secondary"
                  style={{ padding: "10px 18px", fontSize: 13 }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "10px 22px", fontSize: 13 }}
                >
                  규칙 저장 및 활성화
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
