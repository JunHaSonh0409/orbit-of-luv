-- ==============================================================================
-- LINKTREE ORBIT - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Holds creator profile info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    theme_id TEXT NOT NULL DEFAULT 'aurora-dark',
    custom_colors JSONB DEFAULT '{}'::jsonb,
    social_links JSONB DEFAULT '{"instagram": "", "twitter": "", "youtube": "", "github": "", "tiktok": "", "linkedin": "", "email": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_-]+$')
);

-- Index for fast username lookup on public routes (/[username])
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 3. Links Table (Holds links created by creators)
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'globe',
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user link queries ordered by order_index
CREATE INDEX IF NOT EXISTS idx_links_user_order ON public.links(user_id, order_index ASC);

-- 4. Analytics: Pageviews Table
CREATE TABLE IF NOT EXISTS public.analytics_pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referrer TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_profile ON public.analytics_pageviews(profile_id, created_at DESC);

-- 5. Analytics: Clicks Table
CREATE TABLE IF NOT EXISTS public.analytics_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referrer TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_clicks_link ON public.analytics_clicks(link_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_profile ON public.analytics_clicks(profile_id, created_at DESC);

-- 6. Instagram DM Automations Table
CREATE TABLE IF NOT EXISTS public.dm_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'all',
    post_url_or_id TEXT DEFAULT '',
    keywords TEXT[] NOT NULL DEFAULT '{}',
    match_type TEXT NOT NULL DEFAULT 'contains',
    dm_message TEXT NOT NULL,
    button_text TEXT DEFAULT '',
    button_url TEXT DEFAULT '',
    reply_comment TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_automations_user ON public.dm_automations(user_id, is_active);

-- 7. Instagram DM Logs Table
CREATE TABLE IF NOT EXISTS public.dm_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.dm_automations(id) ON DELETE SET NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ig_username TEXT NOT NULL,
    trigger_comment TEXT NOT NULL,
    matched_keyword TEXT DEFAULT '',
    sent_message TEXT NOT NULL,
    button_url TEXT DEFAULT '',
    public_reply TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'success',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_logs_profile ON public.dm_logs(profile_id, sent_at DESC);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_links_updated_at ON public.links;
CREATE TRIGGER trigger_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- AUTH TRIGGER: Automatically create profile on new user signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_username TEXT;
    base_name TEXT;
BEGIN
    -- Extract initial username from email or metadata
    base_name := split_part(NEW.email, '@', 1);
    -- Clean characters
    base_name := regexp_replace(base_name, '[^a-zA-Z0-9_]', '', 'g');
    IF length(base_name) < 3 THEN
        base_name := 'user_' || substr(NEW.id::text, 1, 6);
    END IF;

    -- Ensure uniqueness by appending short uuid if exists
    initial_username := base_name;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = initial_username) THEN
        initial_username := base_name || '_' || substr(NEW.id::text, 1, 4);
    END IF;

    INSERT INTO public.profiles (id, username, display_name, bio, avatar_url)
    VALUES (
        NEW.id,
        initial_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', initial_username),
        'Welcome to my Linktree Orbit profile!',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    -- Create default initial sample link
    INSERT INTO public.links (user_id, title, url, icon, order_index)
    VALUES 
        (NEW.id, 'My Personal Website', 'https://example.com', 'globe', 0),
        (NEW.id, 'Check out my Portfolio', 'https://github.com', 'github', 1);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- RPC FUNCTION: Atomically record click & increment counter
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.track_link_click(
    p_link_id UUID,
    p_referrer TEXT DEFAULT '',
    p_user_agent TEXT DEFAULT ''
)
RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    SELECT user_id INTO v_profile_id FROM public.links WHERE id = p_link_id;

    IF v_profile_id IS NOT NULL THEN
        -- Increment link click counter
        UPDATE public.links 
        SET click_count = click_count + 1 
        WHERE id = p_link_id;

        -- Record detailed analytics log
        INSERT INTO public.analytics_clicks (link_id, profile_id, referrer, user_agent)
        VALUES (p_link_id, v_profile_id, p_referrer, p_user_agent);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Anyone can view profiles (public read)
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Links Policies
-- Anyone can view active links (public read)
CREATE POLICY "Active links are viewable by everyone" 
    ON public.links FOR SELECT 
    USING (is_active = true OR auth.uid() = user_id);

-- Users can insert links for themselves
CREATE POLICY "Users can create their own links" 
    ON public.links FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update their own links" 
    ON public.links FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete their own links" 
    ON public.links FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Analytics Policies
-- Anyone can record a pageview or click
CREATE POLICY "Anyone can record a pageview"
    ON public.analytics_pageviews FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can record a click"
    ON public.analytics_clicks FOR INSERT
    WITH CHECK (true);

-- Profile owners can view their analytics
CREATE POLICY "Users can view their own pageview analytics"
    ON public.analytics_pageviews FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can view their own click analytics"
    ON public.analytics_clicks FOR SELECT
    USING (auth.uid() = profile_id);

-- 4. DM Automations Policies
CREATE POLICY "Users can manage their own dm automations"
    ON public.dm_automations FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own dm logs"
    ON public.dm_logs FOR SELECT
    USING (auth.uid() = profile_id);
