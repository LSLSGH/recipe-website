/**
 * import-spoonacular.js
 * Importe le maximum de recettes Spoonacular dans Supabase.
 *
 * Usage:
 *   node import-spoonacular.js
 *   SUPA_SERVICE_KEY=<votre_clé_service> node import-spoonacular.js
 *
 * La clé service role se trouve dans :
 *   Supabase Dashboard → Project Settings → API → service_role key
 *
 * Si vous n'avez pas la clé service, coller le fichier setup-recipes-rls.sql
 * dans Supabase Dashboard → SQL Editor, puis relancer le script.
 *
 * Requiert: Node.js 18+
 * Relançable plusieurs fois — reprend là où il s'est arrêté.
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SPOON_KEY = process.env.SPOON_KEY || '2fa467ffb8794b7d9c21b76327acc1e1';
const SUPA_URL  = 'https://hvyngskpnyimsnqnlbcf.supabase.co';
const SUPA_KEY  = process.env.SUPA_SERVICE_KEY;
const IS_SERVICE = true;
const PROGRESS_FILE = 'import-progress.json';

// Plan Cook $9/mois = 1500 pts/jour
// /random + addRecipeNutrition = ~2 pts/recette → 700 recettes/jour (marge de sécurité)
const MAX_PER_RUN  = 700;
const BATCH_SIZE   = 100;  // max par appel Spoonacular
const INSERT_BATCH =  50;  // taille des lots pour Supabase

// Cuisines pour diversifier les appels /random
const CUISINES = [
  'African','Asian','American','British','Caribbean','Chinese',
  'European','French','German','Greek','Indian','Italian',
  'Japanese','Korean','Latin American','Mediterranean','Mexican',
  'Middle Eastern','Spanish','Thai','Vietnamese'
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
function loadProgress() {
  if (!existsSync(PROGRESS_FILE)) return { imported: [], totalInserted: 0 };
  try { return JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { return { imported: [], totalInserted: 0 }; }
}

function saveProgress(p) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2), 'utf8');
}

function supaHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Prefer': 'return=minimal'
  };
}

function normalize(r) {
  const get = (name) => r.nutrition?.nutrients?.find(n => n.name === name)?.amount ?? null;
  return {
    id:               'spoon_' + r.id,
    source:           'spoonacular',
    title:            r.title,
    image:            r.image || '',
    category:         r.dishTypes?.[0] || '',
    area:             r.cuisines?.[0] || '',
    instructions:     r.analyzedInstructions?.length
      ? r.analyzedInstructions.flatMap(s => s.steps.map(st => st.step)).join('\n\n')
      : (r.instructions || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    ingredients: (r.extendedIngredients || []).map(i => ({
      name: i.name || '', amount: i.amount || 0,
      unit: i.unit || '', original: i.original || ''
    })),
    diet_tags:        r.diets || [],
    meal_types:       r.dishTypes || [],
    calories:         r.nutrition ? (Math.round(get('Calories') || 0) || null) : null,
    protein_g:        r.nutrition ? get('Protein') : null,
    fat_g:            r.nutrition ? get('Fat') : null,
    carbs_g:          r.nutrition ? get('Carbohydrates') : null,
    fiber_g:          r.nutrition ? get('Fiber') : null,
    ready_in_minutes: r.readyInMinutes || null,
    servings:         r.servings || 4,
    raw_data: {
      spoon_id:  r.id,
      sourceUrl: r.sourceUrl || '',
      summary:   (r.summary || '').replace(/<[^>]+>/g, '').slice(0, 400)
    }
  };
}

async function fetchSpoonBatch(number, cuisine) {
  const p = `?apiKey=${SPOON_KEY}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true&cuisine=${encodeURIComponent(cuisine)}`;
  const res = await fetch(`https://api.spoonacular.com/recipes/random${p}`);
  if (res.status === 402) throw new Error('QUOTA_EXCEEDED');
  if (!res.ok) throw new Error(`Spoonacular ${res.status}`);
  const data = await res.json();
  return data.recipes || [];
}

async function getExistingSpoonIds() {
  const ids = new Set();
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPA_URL}/rest/v1/recipes?select=raw_data&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: supaHeaders() });
    if (!res.ok) break;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) break;
    rows.forEach(r => { if (r.raw_data?.spoon_id) ids.add(r.raw_data.spoon_id); });
    if (rows.length < limit) break;
    offset += limit;
  }
  return ids;
}

async function insertBatch(rows) {
  const res = await fetch(`${SUPA_URL}/rest/v1/recipes`, {
    method: 'POST',
    headers: { ...supaHeaders(), 'Prefer': 'return=minimal,resolution=merge-duplicates' },
    body: JSON.stringify(rows)
  });
  if (res.status === 401 || res.status === 403) {
    const body = await res.text();
    const isRLS = body.includes('row-level security') || body.includes('42501');
    if (isRLS) throw new Error('RLS_BLOCKED');
    throw new Error(`AUTH_ERROR: ${body.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function printRLSHelp() {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  ⛔  BLOQUÉ PAR ROW-LEVEL SECURITY (RLS) SUPABASE           │
│                                                             │
│  Option 1 — Clé service role (recommandé) :                │
│    1. Allez sur https://supabase.com/dashboard              │
│    2. Votre projet → Settings → API                         │
│    3. Copiez la "service_role" key                          │
│    4. Relancez :                                            │
│       SUPA_SERVICE_KEY=<votre_clé> node import-spoonacular.js│
│                                                             │
│  Option 2 — Politique RLS temporaire :                      │
│    1. Supabase Dashboard → SQL Editor                       │
│    2. Collez le contenu de setup-recipes-rls.sql            │
│    3. Cliquez Run, puis relancez le script                  │
└─────────────────────────────────────────────────────────────┘
`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Walkart — Import Spoonacular → Supabase');
  console.log(`   Clé : ${IS_SERVICE ? 'service_role ✅' : 'anon (peut être bloquée par RLS)'}\n`);

  const progress = loadProgress();
  const localIds = new Set(progress.imported);

  console.log('📋 Lecture des recettes déjà en base...');
  const dbIds = await getExistingSpoonIds();
  console.log(`   ${dbIds.size} recettes Spoonacular déjà dans Supabase`);

  // Fusionner les deux sources
  dbIds.forEach(id => localIds.add(id));

  let totalFetched  = 0;
  let totalInserted = 0;
  let totalSkipped  = 0;
  let cuisineIdx    = Math.floor(Math.random() * CUISINES.length);

  console.log(`\n🎯 Objectif : ${MAX_PER_RUN} nouvelles recettes cette session\n`);

  while (totalInserted < MAX_PER_RUN) {
    const remaining = MAX_PER_RUN - totalInserted;
    const batchN    = Math.min(BATCH_SIZE, remaining + 20); // surplus pour compenser les doublons
    const cuisine   = CUISINES[cuisineIdx % CUISINES.length];
    cuisineIdx++;

    process.stdout.write(`🌐 [${String(totalInserted).padStart(3)}/${MAX_PER_RUN}] ${cuisine.padEnd(20)} `);

    let raw;
    try {
      raw = await fetchSpoonBatch(batchN, cuisine);
    } catch (e) {
      if (e.message === 'QUOTA_EXCEEDED') {
        console.log('\n⚠️  Quota Spoonacular journalier atteint (402).');
        break;
      }
      console.log(`⚠️  ${e.message} — retry dans 3s`);
      await sleep(3000);
      continue;
    }

    totalFetched += raw.length;
    const newOnes = raw.filter(r => !localIds.has(r.id));
    totalSkipped += raw.length - newOnes.length;

    if (!newOnes.length) {
      console.log(`${raw.length} reçues | 0 nouvelles`);
      await sleep(300);
      continue;
    }

    console.log(`${raw.length} reçues | ${newOnes.length} nouvelles`);

    // Insertion par sous-lots
    for (let i = 0; i < newOnes.length && totalInserted < MAX_PER_RUN; i += INSERT_BATCH) {
      const chunk = newOnes.slice(i, i + INSERT_BATCH);
      try {
        await insertBatch(chunk.map(normalize));
        chunk.forEach(r => localIds.add(r.id));
        progress.imported     = [...localIds];
        progress.totalInserted = (progress.totalInserted || 0) + chunk.length;
        saveProgress(progress);
        totalInserted += chunk.length;
        console.log(`   ✅ +${chunk.length} insérées (total session: ${totalInserted})`);
      } catch (e) {
        if (e.message === 'RLS_BLOCKED') { printRLSHelp(); return; }
        console.error(`   ❌ ${e.message}`);
      }
    }

    await sleep(800);
  }

  // ─── RÉSUMÉ ──────────────────────────────────────────────────────────────
  const grandTotal = progress.totalInserted || totalInserted;
  console.log('\n══════════════════════════════════════════');
  console.log('  Résumé de la session');
  console.log('══════════════════════════════════════════');
  console.log(`  Récupérées de Spoonacular : ${totalFetched}`);
  console.log(`  Déjà existantes (ignorées) : ${totalSkipped}`);
  console.log(`  Nouvelles insérées         : ${totalInserted}`);
  console.log(`  Total cumulé toutes runs   : ${grandTotal}`);
  console.log('══════════════════════════════════════════');

  if (totalInserted >= MAX_PER_RUN) {
    console.log('\n💡 Quota journalier atteint (plan Cook $9 → ~700 recettes/jour).');
    console.log('   Relancez demain — le script reprend automatiquement sans doublons.');
  }
  console.log('\n📄 Progression : import-progress.json\n');
}

main().catch(e => {
  console.error('\n💥 Erreur fatale:', e.message);
  process.exit(1);
});
