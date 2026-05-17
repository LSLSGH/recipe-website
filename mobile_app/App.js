import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Image, TouchableOpacity,
  TextInput, FlatList, Modal, SafeAreaView, ActivityIndicator,
  StatusBar, Dimensions, Alert
} from 'react-native';

const { width } = Dimensions.get('window');
const API = 'https://www.themealdb.com/api/json/v1/1';

// ── Couleurs identiques au site ──────────────────────────────
const C = {
  primary:  '#e63946',
  bg:       '#fffcf9',
  card:     '#ffffff',
  text:     '#1d3557',
  muted:    '#888',
  border:   '#eee',
  section:  '#fff3e4',
};

// ── Helpers API ──────────────────────────────────────────────
async function fetchJSON(url) {
  const r = await fetch(url);
  return r.json();
}
async function getRandomMeals(count = 8) {
  const results = await Promise.all(
    Array.from({ length: count }, () =>
      fetchJSON(`${API}/random.php`).catch(() => null)
    )
  );
  return results.filter(r => r?.meals).map(r => r.meals[0]);
}
async function searchMeals(q) {
  const d = await fetchJSON(`${API}/search.php?s=${encodeURIComponent(q)}`);
  return d.meals || [];
}
async function getCategories() {
  const d = await fetchJSON(`${API}/categories.php`);
  return d.categories || [];
}
async function getMealsByCategory(cat) {
  const d = await fetchJSON(`${API}/filter.php?c=${cat}`);
  return d.meals || [];
}
async function getMealById(id) {
  const d = await fetchJSON(`${API}/lookup.php?i=${id}`);
  return d.meals?.[0] || null;
}
function parseIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (name) list.push({ name, measure: measure || '' });
  }
  return list;
}
function parseSteps(instructions) {
  if (!instructions) return [];
  let text = instructions.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/([Ss]tep\s*\d+[:.]?|\d+[.)])/g, '\n$1');
  return text.split('\n').map(s => s.trim()).filter(s => s.length > 8);
}

// ══════════════════════════════════════════════════════════════
//  COMPOSANTS UI PARTAGÉS
// ══════════════════════════════════════════════════════════════

function Spinner() {
  return (
    <View style={styles.spinnerWrap}>
      <ActivityIndicator size="large" color={C.primary} />
      <Text style={styles.spinnerText}>MyKitch chargement…</Text>
    </View>
  );
}

function RecipeCard({ meal, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.cardImg} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{meal.strMeal}</Text>
        {meal.strCategory ? (
          <Text style={styles.cardCuisine}>{meal.strCategory}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN ACCUEIL
// ══════════════════════════════════════════════════════════════

function HomeScreen({ onNavigate }) {
  const [popular, setPopular] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [feat, pop] = await Promise.all([
          fetchJSON(`${API}/random.php`),
          getRandomMeals(8),
        ]);
        setFeatured(feat.meals?.[0] || null);
        setPopular(pop);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      {featured && (
        <TouchableOpacity
          style={styles.hero}
          onPress={() => onNavigate('recipe', { id: featured.idMeal })}
          activeOpacity={0.9}
        >
          <Image source={{ uri: featured.strMealThumb }} style={styles.heroImg} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>🔥 À la une</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{featured.strMeal}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>{featured.strCategory}</Text>
              <Text style={styles.heroMetaText}>•</Text>
              <Text style={styles.heroMetaText}>{featured.strArea}</Text>
            </View>
            <TouchableOpacity
              style={styles.heroBtnRed}
              onPress={() => onNavigate('recipe', { id: featured.idMeal })}
            >
              <Text style={styles.heroBtnText}>👨‍🍳 Voir la recette</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Recettes populaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recettes populaires</Text>
        <FlatList
          horizontal
          data={popular}
          keyExtractor={item => item.idMeal}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: 180, marginRight: 14 }}>
              <RecipeCard
                meal={item}
                onPress={() => onNavigate('recipe', { id: item.idMeal })}
              />
            </View>
          )}
          contentContainerStyle={{ paddingLeft: 2 }}
        />
      </View>

      {/* Bannière catégories */}
      <TouchableOpacity
        style={styles.banner}
        onPress={() => onNavigate('categories')}
        activeOpacity={0.88}
      >
        <Text style={styles.bannerEmoji}>🌍</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Cuisines du monde</Text>
          <Text style={styles.bannerSub}>Explorez toutes les catégories</Text>
        </View>
        <Text style={styles.bannerArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN RECHERCHE
// ══════════════════════════════════════════════════════════════

function SearchScreen({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchMeals(query.trim());
      setResults(res);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchHero}>
        <Text style={styles.searchHeroTitle}>Trouvez une recette</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher une recette..."
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={doSearch}>
            <Text style={styles.searchBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <Spinner />}

      {!loading && searched && results.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyText}>Aucun résultat pour « {query} »</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.idMeal}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.gridPad}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <RecipeCard
              meal={item}
              onPress={() => onNavigate('recipe', { id: item.idMeal })}
            />
          </View>
        )}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN CATÉGORIES
// ══════════════════════════════════════════════════════════════

function CategoriesScreen({ onNavigate }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(c => { setCats(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <FlatList
      data={cats}
      keyExtractor={item => item.idCategory}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={styles.gridPad}
      ListHeaderComponent={
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Catégories</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.catCard, { flex: 1 }]}
          onPress={() => onNavigate('categoryPage', { cat: item.strCategory })}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.strCategoryThumb }} style={styles.catImg} />
          <Text style={styles.catName}>{item.strCategory}</Text>
          <Text style={styles.catDesc} numberOfLines={2}>{item.strCategoryDescription}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN LISTE D'UNE CATÉGORIE
// ══════════════════════════════════════════════════════════════

function CategoryPageScreen({ params, onNavigate, onBack }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMealsByCategory(params.cat)
      .then(m => { setMeals(m); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.cat]);

  return (
    <View style={styles.screen}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>{params.cat}</Text>
      </View>
      {loading ? <Spinner /> : (
        <FlatList
          data={meals}
          keyExtractor={item => item.idMeal}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.gridPad}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <RecipeCard
                meal={item}
                onPress={() => onNavigate('recipe', { id: item.idMeal })}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN DÉTAIL RECETTE
// ══════════════════════════════════════════════════════════════

function RecipeScreen({ params, onBack, favorites, setFavorites }) {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portions, setPortions] = useState(4);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [cookingMode, setCookingMode] = useState(false);
  const [cookingStep, setCookingStep] = useState(0);

  useEffect(() => {
    getMealById(params.id)
      .then(m => { setMeal(m); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const isFav = meal && favorites.some(f => f.idMeal === meal.idMeal);

  const toggleFav = () => {
    if (!meal) return;
    setFavorites(prev =>
      isFav ? prev.filter(f => f.idMeal !== meal.idMeal) : [...prev, meal]
    );
  };

  if (loading) return <Spinner />;
  if (!meal) return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>Recette introuvable.</Text>
      <TouchableOpacity onPress={onBack}><Text style={{ color: C.primary }}>← Retour</Text></TouchableOpacity>
    </View>
  );

  const ingredients = parseIngredients(meal);
  const steps = parseSteps(meal.strInstructions);

  const toggleStep = (i) => {
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }));
  };

  // ── Mode cuisine ─────────────────────────────────────────
  if (cookingMode) {
    const step = steps[cookingStep];
    const isLast = cookingStep === steps.length - 1;
    return (
      <SafeAreaView style={styles.cookingMode}>
        <StatusBar barStyle="light-content" backgroundColor="#1a0a00" />
        <View style={styles.cookingHeader}>
          <Text style={styles.cookingHeaderTitle}>
            MYKITCH — ÉTAPE {cookingStep + 1} / {steps.length}
          </Text>
          <TouchableOpacity onPress={() => setCookingMode(false)}>
            <Text style={styles.cookingClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cookingProgressBar}>
          <View style={[styles.cookingProgressFill, { width: `${((cookingStep + 1) / steps.length) * 100}%` }]} />
        </View>
        <View style={styles.cookingBody}>
          <Text style={styles.cookingStepNum}>Étape {cookingStep + 1}</Text>
          <Text style={styles.cookingStepText}>{step}</Text>
        </View>
        <View style={styles.cookingNav}>
          <TouchableOpacity
            style={[styles.cookingNavBtn, styles.cookingNavPrev]}
            onPress={() => cookingStep > 0 && setCookingStep(s => s - 1)}
            disabled={cookingStep === 0}
          >
            <Text style={[styles.cookingNavBtnText, cookingStep === 0 && { opacity: 0.3 }]}>← Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cookingNavBtn, styles.cookingNavNext]}
            onPress={() => isLast ? setCookingMode(false) : setCookingStep(s => s + 1)}
          >
            <Text style={styles.cookingNavNextText}>{isLast ? 'Terminer ✓' : 'Suivant →'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Détail normal ────────────────────────────────────────
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Header image */}
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.detailHero} />
        <TouchableOpacity style={styles.detailBack} onPress={onBack}>
          <Text style={styles.detailBackText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailFav} onPress={toggleFav}>
          <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailContent}>
        {/* Titre */}
        <Text style={styles.detailTitle}>{meal.strMeal}</Text>
        <View style={styles.detailTags}>
          {meal.strCategory ? <Text style={styles.detailTag}>{meal.strCategory}</Text> : null}
          {meal.strArea ? <Text style={styles.detailTag}>{meal.strArea}</Text> : null}
        </View>

        {/* Bouton mode cuisine */}
        <TouchableOpacity
          style={styles.cookingStartBtn}
          onPress={() => { setCookingStep(0); setCookingMode(true); }}
        >
          <Text style={styles.cookingStartText}>👨‍🍳 DÉMARRER LA PRÉPARATION</Text>
        </TouchableOpacity>

        {/* Portions */}
        <View style={styles.portionRow}>
          <Text style={styles.portionLabel}>Portions :</Text>
          <TouchableOpacity style={styles.portionBtn} onPress={() => setPortions(p => Math.max(1, p - 1))}>
            <Text style={styles.portionBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.portionCount}>{portions}</Text>
          <TouchableOpacity style={styles.portionBtn} onPress={() => setPortions(p => Math.min(20, p + 1))}>
            <Text style={styles.portionBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Ingrédients */}
        <Text style={styles.sectionTitle}>Ingrédients</Text>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{ing.name}</Text>
            <Text style={styles.ingredientMeasure}>{ing.measure}</Text>
          </View>
        ))}

        {/* Étapes */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Préparation (appuyez pour cocher)
        </Text>
        {steps.map((step, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.stepCard, checkedSteps[i] && styles.stepCardDone]}
            onPress={() => toggleStep(i)}
            activeOpacity={0.8}
          >
            <View style={[styles.stepNum, checkedSteps[i] && styles.stepNumDone]}>
              <Text style={styles.stepNumText}>{checkedSteps[i] ? '✓' : i + 1}</Text>
            </View>
            <Text style={[styles.stepText, checkedSteps[i] && styles.stepTextDone]}>
              {step}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN FAVORIS
// ══════════════════════════════════════════════════════════════

function FavoritesScreen({ favorites, onNavigate }) {
  if (favorites.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyEmoji}>🤍</Text>
        <Text style={styles.emptyText}>Aucun favori pour l'instant.</Text>
        <Text style={styles.emptySubText}>Appuyez sur 🤍 dans une recette pour l'ajouter.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={favorites}
      keyExtractor={item => item.idMeal}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={styles.gridPad}
      ListHeaderComponent={
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Mes favoris ❤️</Text>
      }
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <RecipeCard
            meal={item}
            onPress={() => onNavigate('recipe', { id: item.idMeal })}
          />
        </View>
      )}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  APP PRINCIPALE — NAVIGATION
// ══════════════════════════════════════════════════════════════

export default function App() {
  const [route, setRoute] = useState('home');
  const [params, setParams] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('home');
  const [favorites, setFavorites] = useState([]);

  const navigate = useCallback((nextRoute, nextParams = null) => {
    setHistory(h => [...h, { route, params }]);
    setRoute(nextRoute);
    setParams(nextParams);
    if (['home', 'search', 'categories', 'favorites'].includes(nextRoute)) {
      setTab(nextRoute);
    }
  }, [route, params]);

  const goBack = useCallback(() => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setRoute(prev.route);
      setParams(prev.params);
      if (['home', 'search', 'categories', 'favorites'].includes(prev.route)) {
        setTab(prev.route);
      }
    }
  }, [history]);

  const switchTab = (t) => {
    setHistory([]);
    setRoute(t);
    setParams(null);
    setTab(t);
  };

  const renderScreen = () => {
    switch (route) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'search':
        return <SearchScreen onNavigate={navigate} />;
      case 'categories':
        return <CategoriesScreen onNavigate={navigate} />;
      case 'categoryPage':
        return <CategoryPageScreen params={params} onNavigate={navigate} onBack={goBack} />;
      case 'recipe':
        return (
          <RecipeScreen
            params={params}
            onBack={goBack}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
      case 'favorites':
        return <FavoritesScreen favorites={favorites} onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  const showTabBar = !['recipe', 'categoryPage'].includes(route);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>
          🍳 My<Text style={{ color: C.primary }}>Kitch</Text>
        </Text>
      </View>

      {/* Contenu */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Barre de navigation */}
      {showTabBar && (
        <View style={styles.tabBar}>
          {[
            { id: 'home',       icon: '🏠', label: 'Accueil'    },
            { id: 'search',     icon: '🔍', label: 'Recherche'  },
            { id: 'categories', icon: '🍽️', label: 'Catégories' },
            { id: 'favorites',  icon: '❤️', label: 'Favoris'    },
          ].map(t => (
            <TouchableOpacity
              key={t.id}
              style={styles.tabItem}
              onPress={() => switchTab(t.id)}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>
                {t.label}
              </Text>
              {tab === t.id && <View style={styles.tabActiveBar} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  screen:     { flex: 1, backgroundColor: C.bg },

  // Navbar
  navbar: {
    height: 60, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  logo: { fontSize: 22, fontWeight: '900', color: C.text },

  // Spinner
  spinnerWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 60 },
  spinnerText:  { marginTop: 12, color: C.muted, fontSize: 14 },

  // Cards
  card: {
    backgroundColor: C.card, borderRadius: 12,
    overflow: 'hidden', marginBottom: 2,
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardImg:      { width: '100%', height: 130, backgroundColor: C.section },
  cardBody:     { padding: 12 },
  cardTitle:    { fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 18 },
  cardCuisine:  { fontSize: 11, color: C.primary, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },

  // Section
  section:      { paddingHorizontal: 16, paddingVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 12 },

  // Grid
  gridPad: { padding: 16 },

  // Hero
  hero: { width: '100%', height: 400, position: 'relative' },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24,
    backgroundColor: 'rgba(29,53,87,0.72)',
  },
  heroTag:      { color: '#ffd166', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  heroTitle:    { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 8 },
  heroMeta:     { flexDirection: 'row', gap: 8, marginBottom: 16 },
  heroMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroBtnRed: {
    backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  heroBtnText:  { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Banner
  banner: {
    margin: 16, backgroundColor: C.primary,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: C.primary, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  bannerEmoji:  { fontSize: 36 },
  bannerTitle:  { color: '#fff', fontSize: 17, fontWeight: '800' },
  bannerSub:    { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  bannerArrow:  { color: '#fff', fontSize: 28, fontWeight: '300' },

  // Search
  searchHero: {
    backgroundColor: C.primary, padding: 24, paddingTop: 32,
  },
  searchHeroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 50, paddingLeft: 16, paddingRight: 4,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 8, elevation: 4,
  },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, height: 48, color: C.text, fontSize: 15 },
  searchBtn: {
    backgroundColor: C.primary, borderRadius: 50,
    paddingHorizontal: 20, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '800' },

  // Empty
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji:   { fontSize: 48, marginBottom: 16 },
  emptyText:    { fontSize: 16, color: C.text, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 8 },

  // Categories
  catCard: {
    backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', marginBottom: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  catImg:   { width: '100%', height: 110, backgroundColor: C.section },
  catName:  { fontSize: 14, fontWeight: '800', color: C.text, padding: 10, paddingBottom: 4 },
  catDesc:  { fontSize: 11, color: C.muted, paddingHorizontal: 10, paddingBottom: 12, lineHeight: 15 },

  // Sub header
  subHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.section, alignItems: 'center', justifyContent: 'center',
  },
  backArrow:       { fontSize: 18, color: C.text },
  subHeaderTitle:  { fontSize: 18, fontWeight: '800', color: C.text },

  // Recipe detail
  detailHero:  { width: '100%', height: 280, backgroundColor: C.section },
  detailBack: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  detailBackText: { color: '#fff', fontSize: 20 },
  detailFav: {
    position: 'absolute', top: 16, right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  detailContent: { padding: 20 },
  detailTitle:   { fontSize: 26, fontWeight: '900', color: C.text, lineHeight: 32, marginBottom: 10 },
  detailTags:    { flexDirection: 'row', gap: 8, marginBottom: 20 },
  detailTag: {
    backgroundColor: 'rgba(230,57,70,0.1)', color: C.primary,
    fontSize: 12, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 50, textTransform: 'uppercase',
  },

  // Cooking start
  cookingStartBtn: {
    backgroundColor: C.primary, borderRadius: 10,
    paddingVertical: 18, alignItems: 'center', marginBottom: 20,
    shadowColor: C.primary, shadowOpacity: 0.4,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  cookingStartText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  // Portions
  portionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.section, padding: 14, borderRadius: 10, marginBottom: 24,
  },
  portionLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  portionBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  portionBtnText: { fontSize: 18, color: C.primary, fontWeight: '700' },
  portionCount:   { fontSize: 20, fontWeight: '900', color: C.primary, minWidth: 30, textAlign: 'center' },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  ingredientName:    { fontSize: 14, color: C.text, fontWeight: '500', flex: 1 },
  ingredientMeasure: { fontSize: 14, color: C.primary, fontWeight: '700' },

  // Steps
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 16, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.border, marginBottom: 12,
  },
  stepCardDone:    { backgroundColor: '#f0fff4', borderColor: '#b7e4c7' },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumDone:    { backgroundColor: '#2d6a4f' },
  stepNumText:    { color: '#fff', fontWeight: '800', fontSize: 13 },
  stepText:       { flex: 1, fontSize: 14, color: C.text, lineHeight: 22 },
  stepTextDone:   { textDecorationLine: 'line-through', opacity: 0.5 },

  // Cooking mode
  cookingMode:     { flex: 1, backgroundColor: '#1a0a00' },
  cookingHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 16,
  },
  cookingHeaderTitle: { color: '#ffd166', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  cookingClose:       { color: '#fff', fontSize: 22, fontWeight: '300', padding: 4 },
  cookingProgressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 20, borderRadius: 2 },
  cookingProgressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
  cookingBody: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  cookingStepNum: { color: '#ffd166', fontSize: 14, fontWeight: '700', marginBottom: 20, letterSpacing: 1 },
  cookingStepText: {
    color: 'rgba(255,255,255,0.92)', fontSize: 22, lineHeight: 34,
    textAlign: 'center', fontWeight: '400',
  },
  cookingNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 24, gap: 16,
  },
  cookingNavBtn:      { flex: 1, paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  cookingNavPrev:     { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cookingNavNext:     { backgroundColor: C.primary },
  cookingNavBtnText:  { color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 15 },
  cookingNavNextText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, position: 'relative',
  },
  tabIcon:        { fontSize: 20, marginBottom: 3 },
  tabLabel:       { fontSize: 11, color: C.muted, fontWeight: '600' },
  tabLabelActive: { color: C.primary },
  tabActiveBar: {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 2, backgroundColor: C.primary, borderRadius: 2,
  },
});
