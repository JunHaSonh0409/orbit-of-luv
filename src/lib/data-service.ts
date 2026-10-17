import { Profile, LinkItem } from "@/types/database.types";

// Demo fallback mock data for seamless preview when Supabase is not configured yet
export const DEMO_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "orbithub",
  display_name: "Orbit Hub",
  bio: "우주 모든 인연이 만날때까지\n인스타 최초 무료 소개팅 & Love Magazine 🪐",
  avatar_url: "/orbit-hub-default-logo.png",
  theme_id: "aurora-dark",
  custom_colors: null,
  social_links: {
    instagram: "https://instagram.com/orbit.of.luv",
    email: "orbit.of.luv@gmail.com",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_LINKS: LinkItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000011",
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "🪐 인스타 최초 무료 소개팅 매칭 신청하기",
    url: "https://instagram.com/orbit.of.luv",
    icon: "sparkles",
    is_active: true,
    order_index: 0,
    click_count: 2480,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "📖 Orbit Love Magazine | 우주의 모든 연애 이야기",
    url: "https://instagram.com/orbit.of.luv",
    icon: "heart",
    is_active: true,
    order_index: 1,
    click_count: 1720,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "💌 익명 연애 고민 & 인연 사연 제보하기",
    url: "https://instagram.com/orbit.of.luv",
    icon: "mail",
    is_active: true,
    order_index: 2,
    click_count: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "✨ Orbit Hub 공식 인스타그램 (@orbit.of.luv)",
    url: "https://instagram.com/orbit.of.luv",
    icon: "instagram",
    is_active: true,
    order_index: 3,
    click_count: 3150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function isSupabaseConfigured(): boolean {
  return false;
}

// In-memory local state
const localState = {
  profile: { ...DEMO_PROFILE },
  links: [...DEMO_LINKS],
};

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  return localState.profile;
}

export async function fetchUserLinks(userId: string): Promise<LinkItem[]> {
  return localState.links.sort((a, b) => a.order_index - b.order_index);
}

export async function updateLocalProfile(updated: Partial<Profile>): Promise<Profile> {
  localState.profile = { ...localState.profile, ...updated };
  return localState.profile;
}

export async function updateLocalLinks(updated: LinkItem[]): Promise<LinkItem[]> {
  localState.links = updated;
  return localState.links;
}

export async function recordClick(linkId: string, referrer = ""): Promise<void> {
  const link = localState.links.find((l) => l.id === linkId);
  if (link) link.click_count += 1;
}

// -----------------------------------------------------------------------------
// INSTAGRAM AUTOMATIC DM SERVICE & SIMULATOR
// -----------------------------------------------------------------------------
import { DmAutomationRule, DmLogItem } from "@/types/database.types";

export const DEMO_DM_RULES: DmAutomationRule[] = [
  {
    id: "rule-1",
    user_id: "demo-user-id",
    name: "릴스 무료 소개팅 신청자 자동 DM",
    post_type: "all",
    keywords: ["신청", "소개팅", "1", "링크", "참여"],
    match_type: "contains",
    dm_message: "안녕하세요! 우주 모든 인연이 만날 때까지, Orbit Hub 인스타 최초 무료 소개팅에 관심 가져주셔서 감사합니다 🪐\n\n아래 버튼을 눌러 간단한 매칭 프로필을 작성해 주시면 이번 주 매칭 리스트에 즉시 등록해 드려요! ✨",
    button_text: "🪐 무료 소개팅 매칭 신청서 작성",
    button_url: "https://orbithub.vercel.app/orbithub",
    reply_comment: "💌 DM으로 소개팅 신청 링크를 발송해드렸습니다! 메시지 보관함을 확인해 주세요 :)",
    is_active: true,
    sent_count: 412,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "rule-2",
    user_id: "demo-user-id",
    name: "Orbit Love Magazine 최신호 자동 발송",
    post_type: "all",
    keywords: ["매거진", "사연", "인터뷰", "2"],
    match_type: "contains",
    dm_message: "우주의 모든 연애 이야기, Orbit Love Magazine 최신호가 도착했습니다 📖💖\n\n익명 사연 제보 및 연애 고민 상담도 받고 있으니 편하게 들려주세요!",
    button_text: "📖 러브 매거진 최신호 읽기",
    button_url: "https://orbithub.vercel.app/orbithub",
    reply_comment: "✨ 이번 주 러브 매거진 링크를 DM으로 전송해드렸어요! 즐거운 시간 되세요 🪐",
    is_active: true,
    sent_count: 198,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const DEMO_DM_LOGS: DmLogItem[] = [
  {
    id: "log-1",
    rule_id: "rule-1",
    rule_name: "릴스 무료 소개팅 신청자 자동 DM",
    ig_username: "minji_star",
    trigger_comment: "소개팅 신청합니다!! 🪐",
    matched_keyword: "신청",
    sent_message: "안녕하세요! 우주 모든 인연이 만날 때까지...",
    button_url: "https://orbithub.vercel.app/orbithub",
    public_reply: "💌 DM으로 소개팅 신청 링크를 발송해드렸습니다!",
    status: "success",
    sent_at: "방금 전",
  },
  {
    id: "log-2",
    rule_id: "rule-1",
    rule_name: "릴스 무료 소개팅 신청자 자동 DM",
    ig_username: "junho_space",
    trigger_comment: "1번 신청 링크 부탁드려요",
    matched_keyword: "신청",
    sent_message: "안녕하세요! 우주 모든 인연이 만날 때까지...",
    button_url: "https://orbithub.vercel.app/orbithub",
    public_reply: "💌 DM으로 소개팅 신청 링크를 발송해드렸습니다!",
    status: "success",
    sent_at: "12분 전",
  },
  {
    id: "log-3",
    rule_id: "rule-2",
    rule_name: "Orbit Love Magazine 최신호 자동 발송",
    ig_username: "soyeon_luv",
    trigger_comment: "매거진 보고싶어요!",
    matched_keyword: "매거진",
    sent_message: "우주의 모든 연애 이야기, Orbit Love Magazine...",
    button_url: "https://orbithub.vercel.app/orbithub",
    public_reply: "✨ 이번 주 러브 매거진 링크를 DM으로 전송해드렸어요!",
    status: "success",
    sent_at: "34분 전",
  },
];

export function getStoredDmRules(): DmAutomationRule[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("orbit_dm_rules");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return DEMO_DM_RULES;
}

export function saveStoredDmRules(rules: DmAutomationRule[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("orbit_dm_rules", JSON.stringify(rules));
  }
}

export function getStoredDmLogs(): DmLogItem[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("orbit_dm_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return DEMO_DM_LOGS;
}

export function saveStoredDmLogs(logs: DmLogItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("orbit_dm_logs", JSON.stringify(logs));
  }
}
