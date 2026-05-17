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
