-- À coller dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- Cette politique permet au script d'import d'insérer des recettes Spoonacular

-- 1. Autoriser la lecture publique (déjà probablement en place)
CREATE POLICY IF NOT EXISTS "recipes_public_read"
  ON recipes FOR SELECT
  USING (true);

-- 2. Autoriser l'insertion via la clé anon (pour le script d'import)
--    À SUPPRIMER après l'import si vous voulez restreindre
CREATE POLICY IF NOT EXISTS "recipes_anon_insert"
  ON recipes FOR INSERT
  WITH CHECK (true);

-- Alternative plus sécurisée : activer uniquement avec le service role
-- (dans ce cas, utilisez SUPA_SERVICE_KEY= dans le script)
