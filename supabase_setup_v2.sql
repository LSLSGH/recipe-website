-- =====================================================
--  WALKART v2 - New Tables
--  Run this in Supabase SQL Editor
-- =====================================================

-- Contest entries
CREATE TABLE IF NOT EXISTS public.contest_entries (
  id BIGSERIAL PRIMARY KEY,
  week_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, user_id)
);
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ce_select" ON public.contest_entries FOR SELECT USING (true);
CREATE POLICY "ce_insert" ON public.contest_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ce_update" ON public.contest_entries FOR UPDATE USING (auth.uid() = user_id);

-- Contest votes
CREATE TABLE IF NOT EXISTS public.contest_votes (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT REFERENCES public.contest_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);
ALTER TABLE public.contest_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cv_select" ON public.contest_votes FOR SELECT USING (true);
CREATE POLICY "cv_insert" ON public.contest_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cooking groups
CREATE TABLE IF NOT EXISTS public.cooking_groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '👨‍🍳',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cooking_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cg_select" ON public.cooking_groups FOR SELECT USING (true);
CREATE POLICY "cg_insert" ON public.cooking_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "cg_update" ON public.cooking_groups FOR UPDATE USING (auth.uid() = created_by);

-- Group members
CREATE TABLE IF NOT EXISTS public.group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES public.cooking_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gm_select" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "gm_insert" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gm_delete" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Vote function (atomic vote)
CREATE OR REPLACE FUNCTION public.vote_contest_entry(entry_id BIGINT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.contest_votes (entry_id, user_id) VALUES (vote_contest_entry.entry_id, auth.uid());
  UPDATE public.contest_entries SET votes = votes + 1 WHERE id = vote_contest_entry.entry_id;
END;
$$;
