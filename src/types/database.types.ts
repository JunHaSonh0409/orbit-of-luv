export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  github?: string;
  tiktok?: string;
  linkedin?: string;
  email?: string;
  threads?: string;
  kakao?: string;
  facebook?: string;
  spotify?: string;
}

export interface CustomColors {
  bgGradientStart?: string;
  bgGradientEnd?: string;
  buttonBg?: string;
  buttonTextColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme_id: string;
  custom_colors: CustomColors | null;
  social_links: SocialLinks | null;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  order_index: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsPageview {
  id: string;
  profile_id: string;
  referrer: string;
  user_agent: string;
  created_at: string;
}

export interface AnalyticsClick {
  id: string;
  link_id: string;
  profile_id: string;
  referrer: string;
  user_agent: string;
  created_at: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  cardStyle: {
    background: string;
    border: string;
    color: string;
    hoverBackground?: string;
    boxShadow?: string;
  };
  textColor: string;
  subtextColor: string;
  accentColor: string;
  previewGradient: string;
}

export interface DmAutomationRule {
  id: string;
  user_id: string;
  name: string;
  post_type: "all" | "specific";
  post_url_or_id?: string;
  keywords: string[];
  match_type: "contains" | "exact";
  dm_message: string;
  button_text: string;
  button_url: string;
  reply_comment: string;
  is_active: boolean;
  sent_count: number;
  created_at: string;
}

export interface DmLogItem {
  id: string;
  rule_id: string;
  rule_name: string;
  ig_username: string;
  trigger_comment: string;
  matched_keyword: string;
  sent_message: string;
  button_url: string;
  public_reply: string;
  status: "success" | "pending" | "failed";
  sent_at: string;
}
