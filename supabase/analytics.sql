-- ==============================================================================
-- LINKTREE ORBIT - ANALYTICS MIGRATION (pageviews, clicks, track_link_click RPC)
-- ==============================================================================
-- Extracted from schema.sql for projects where profiles/links already exist.
-- Safe to run more than once (Dashboard > SQL Editor > New query).

-- 1. Analytics: Pageviews Table
CREATE TABLE IF NOT EXISTS public.analytics_pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referrer TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_profile ON public.analytics_pageviews(profile_id, created_at DESC);

-- 2. Analytics: Clicks Table
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

-- 3. RPC Function: Atomically record click & increment counter
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Public link pages call this anonymously through /api/click/[id]
GRANT EXECUTE ON FUNCTION public.track_link_click(UUID, TEXT, TEXT) TO anon, authenticated;

-- 4. Row Level Security
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can record a pageview or click
DROP POLICY IF EXISTS "Anyone can record a pageview" ON public.analytics_pageviews;
CREATE POLICY "Anyone can record a pageview"
    ON public.analytics_pageviews FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can record a click" ON public.analytics_clicks;
CREATE POLICY "Anyone can record a click"
    ON public.analytics_clicks FOR INSERT
    WITH CHECK (true);

-- Profile owners can view their analytics
DROP POLICY IF EXISTS "Users can view their own pageview analytics" ON public.analytics_pageviews;
CREATE POLICY "Users can view their own pageview analytics"
    ON public.analytics_pageviews FOR SELECT
    USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view their own click analytics" ON public.analytics_clicks;
CREATE POLICY "Users can view their own click analytics"
    ON public.analytics_clicks FOR SELECT
    USING (auth.uid() = profile_id);

-- 5. Make the new tables and function visible to the REST API immediately
NOTIFY pgrst, 'reload schema';
