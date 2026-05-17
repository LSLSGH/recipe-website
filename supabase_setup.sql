-- =====================================================
--  WALKART - Supabase Schema
-- =====================================================

-- 1. PROFILES (infos utilisateur)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER CHECK (age BETWEEN 10 AND 120),
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight_kg DECIMAL(5,1) CHECK (weight_kg BETWEEN 20 AND 300),
  height_cm DECIMAL(5,1) CHECK (height_cm BETWEEN 50 AND 250),
  activity_level TEXT DEFAULT 'moderate' CHECK (activity_level IN (
    'sedentary', 'light', 'moderate', 'active', 'very_active'
  )),
  goal TEXT DEFAULT 'maintain' CHECK (goal IN (
    'lose_weight', 'maintain', 'gain_weight', 'gain_muscle'
  )),
  daily_calories INTEGER,
  daily_protein INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RECIPES (recettes sauvegardées depuis Spoonacular/TheMealDB)
CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  source TEXT DEFAULT 'themealdb' CHECK (source IN ('themealdb', 'spoonacular')),
  title TEXT NOT NULL,
  image TEXT,
  calories INTEGER,
  protein_g DECIMAL(6,1),
  carbs_g DECIMAL(6,1),
  fat_g DECIMAL(6,1),
  fiber_g DECIMAL(6,1),
  servings INTEGER DEFAULT 4,
  ready_in_minutes INTEGER,
  diet_tags TEXT[] DEFAULT '{}',
  meal_types TEXT[] DEFAULT '{}',
  instructions TEXT,
  ingredients JSONB DEFAULT '[]',
  area TEXT,
  category TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEAL PLANS (menus personnalisés)
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}',
  total_calories INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- 4. FAVORITES (favoris liés au compte)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_title TEXT,
  recipe_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- =====================================================
--  ROW LEVEL SECURITY (chaque user voit ses données)
-- =====================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes     ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture/écriture uniquement pour soi
CREATE POLICY "profiles_self" ON public.profiles
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Meal plans : lecture/écriture uniquement pour soi
CREATE POLICY "mealplans_self" ON public.meal_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Favorites : lecture/écriture uniquement pour soi
CREATE POLICY "favorites_self" ON public.favorites
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recipes : lecture publique, écriture uniquement service_role
CREATE POLICY "recipes_read" ON public.recipes FOR SELECT USING (true);

-- =====================================================
--  TRIGGER : créer profil automatiquement à l'inscription
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
--  TRIGGER : mettre à jour updated_at automatiquement
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
--  FEATURES v2 - New Tables
-- =====================================================

-- 5. COMMENTS (public read, user write)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  text TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS comments_recipe_id_idx ON public.comments (recipe_id);

-- 6. COOKING PHOTOS (public read, user write)
CREATE TABLE IF NOT EXISTS public.cooking_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cooking_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_read" ON public.cooking_photos FOR SELECT USING (true);
CREATE POLICY "photos_insert" ON public.cooking_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_delete" ON public.cooking_photos FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS photos_recipe_id_idx ON public.cooking_photos (recipe_id);

-- 7. CUSTOM RECIPES (private per user)
CREATE TABLE IF NOT EXISTS public.custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  ingredients JSONB DEFAULT '[]',
  instructions TEXT DEFAULT '',
  calories INTEGER,
  protein_g DECIMAL(6,1),
  prep_time INTEGER,
  servings INTEGER DEFAULT 4,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_recipes_self" ON public.custom_recipes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER custom_recipes_updated_at BEFORE UPDATE ON public.custom_recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. NUTRITION LOG (private per user)
CREATE TABLE IF NOT EXISTS public.nutrition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  calories INTEGER DEFAULT 0,
  protein_g DECIMAL(6,1) DEFAULT 0,
  carbs_g DECIMAL(6,1) DEFAULT 0,
  fat_g DECIMAL(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);
ALTER TABLE public.nutrition_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_log_self" ON public.nutrition_log
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS nutrition_log_user_date_idx ON public.nutrition_log (user_id, log_date);

-- 9. FOLLOWS (social)
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Make profiles partially public (name only)
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);

-- 10. SHARED COLLECTIONS (public share via token)
CREATE TABLE IF NOT EXISTS public.shared_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  recipes JSONB DEFAULT '[]',
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.shared_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared_col_read" ON public.shared_collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "shared_col_insert" ON public.shared_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shared_col_delete" ON public.shared_collections FOR DELETE USING (auth.uid() = user_id);

-- 11. RECIPE VIEWS (leaderboard)
CREATE TABLE IF NOT EXISTS public.recipe_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT UNIQUE NOT NULL,
  recipe_title TEXT,
  recipe_thumb TEXT,
  total_views INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.recipe_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_views_read" ON public.recipe_views FOR SELECT USING (true);
CREATE POLICY "recipe_views_insert" ON public.recipe_views FOR INSERT WITH CHECK (true);
CREATE POLICY "recipe_views_update" ON public.recipe_views FOR UPDATE USING (true);

-- =====================================================
--  SUPABASE STORAGE - cooking-photos bucket
--  Run this in the Supabase Storage dashboard or SQL:
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cooking-photos', 'cooking-photos', true);
-- CREATE POLICY "anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cooking-photos');
-- CREATE POLICY "photos are public" ON storage.objects FOR SELECT USING (bucket_id = 'cooking-photos');
