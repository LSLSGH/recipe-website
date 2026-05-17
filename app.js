/* =====================================================
   WALKART - V23 - Supabase Auth + Personalized Menus
   ===================================================== */

// ---- SUPABASE CLIENT ----
const SUPA_URL = 'https://hvyngskpnyimsnqnlbcf.supabase.co';
const SUPA_KEY = 'sb_publishable_nUoUhdHUw_Al5fjjswltOQ_mE5phw-u';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

// ---- SPOONACULAR ----
const SPOON_KEY = '2fa467ffb8794b7d9c21b76327acc1e1';
const SPOON_BASE = 'https://api.spoonacular.com/recipes';

// ---- AUTH STATE ----
let currentUser = null;
let currentProfile = null;

const Auth = {
  init: async () => {
    const { data: { session } } = await supa.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
      await Auth.loadProfile();
    }
    supa.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      if (currentUser) await Auth.loadProfile();
      else currentProfile = null;
      Auth.updateHeader();
    });
    Auth.updateHeader();
  },

  loadProfile: async () => {
    if (!currentUser) return;
    const { data } = await supa.from('profiles').select('*').eq('id', currentUser.id).single();
    currentProfile = data;
  },

  updateHeader: () => {
    const btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (currentUser) {
      const name = currentProfile?.full_name || currentUser.email?.split('@')[0] || T('nav_profile');
      btn.textContent = '👤 ' + name;
      btn.onclick = () => App.navigate('profile');
    } else {
      btn.textContent = '🔐 ' + T('connexion');
      btn.onclick = () => App.navigate('login');
    }
  },

  register: async (email, password, fullName) => {
    const { error } = await supa.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    return error;
  },

  login: async (email, password) => {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    return error;
  },

  logout: async () => {
    await supa.auth.signOut();
    currentUser = null;
    currentProfile = null;
    App.navigate('home');
  },

  saveProfile: async (data) => {
    if (!currentUser) return { error: 'Non connecté' };
    const calories = Nutrition.calcCalories(data);
    const protein  = Nutrition.calcProtein(data);
    const { error } = await supa.from('profiles').upsert({
      id: currentUser.id,
      ...data,
      daily_calories: calories,
      daily_protein: protein,
      updated_at: new Date().toISOString()
    });
    if (!error) {
      currentProfile = { ...currentProfile, ...data, daily_calories: calories, daily_protein: protein };
    }
    return { error, calories, protein };
  }
};

// ---- NUTRITION CALCULATOR ----
const Nutrition = {
  calcCalories: ({ weight_kg, height_cm, age, gender, activity_level, goal }) => {
    if (!weight_kg || !height_cm || !age || !gender) return null;
    // Mifflin-St Jeor BMR
    let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
    const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
    let tdee = bmr * (multipliers[activity_level] || 1.55);
    const adjustments = { lose_weight:-500, maintain:0, gain_weight:+500, gain_muscle:+250 };
    return Math.round(tdee + (adjustments[goal] || 0));
  },

  calcProtein: ({ weight_kg, goal }) => {
    if (!weight_kg) return null;
    const ratio = { lose_weight:1.8, maintain:1.2, gain_weight:1.4, gain_muscle:2.2 };
    return Math.round(weight_kg * (ratio[goal] || 1.4));
  },

  goalLabel: (goal) => ({
    lose_weight: '🔥 ' + T('goal_lose_label'),
    maintain: '⚖️ ' + T('goal_maintain_label'),
    gain_weight: '📈 ' + T('goal_gain_label'),
    gain_muscle: '💪 ' + T('goal_muscle_label')
  }[goal] || goal),

  activityLabel: (a) => ({
    sedentary: T('act_sedentary'),
    light: T('act_light'),
    moderate: T('act_moderate'),
    active: T('act_active'),
    very_active: T('act_very_active')
  }[a] || a)
};

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// ---- SAFE ENCODING (XSS prevention) ----
const Safe = {
  html: s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'),
  attr: s => String(s ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
};

// ---- RECIPE STORE ----
const RecipeStore = new Map();

// ---- ISO CODES → real flag images via flagcdn.com ----
const AREA_CODES = {
  'Afghan':'af','Albanian':'al','Algerian':'dz','American':'us',
  'Andorran':'ad','Angolan':'ao','Antiguan, Barbudan':'ag',
  'Argentine':'ar','Argentinian':'ar','Armenian':'am','Aruban':'aw',
  'Australian':'au','Austrian':'at','Azerbaijani':'az',
  'Bahamian':'bs','Bahraini':'bh','Bangladeshi':'bd',
  'Barbadian':'bb','Belarusian':'by','Belgian':'be',
  'Belizean':'bz','Beninese':'bj','Bhutanese':'bt',
  'Bolivian':'bo','Bosnian':'ba','Brazilian':'br',
  'British':'gb','Bruneian':'bn','Bulgarian':'bg',
  'Burkinabe':'bf','Burundian':'bi','Cambodian':'kh',
  'Cameroonian':'cm','Canadian':'ca','Caymanian':'ky',
  'Central African':'cf','Chadian':'td','Chilean':'cl',
  'Chinese':'cn','Colombian':'co','Congolese':'cd',
  'Costa Rican':'cr','Croatian':'hr','Cuban':'cu',
  'Cypriot':'cy','Czech':'cz','Danish':'dk',
  'Djiboutian':'dj','Dominican':'do','Dutch':'nl',
  'Ecuadorian':'ec','Egyptian':'eg','Emirati':'ae',
  'Estonian':'ee','Ethiopian':'et','Finnish':'fi',
  'French':'fr','Georgian':'ge','German':'de',
  'Ghanaian':'gh','Greek':'gr','Guatemalan':'gt',
  'Guinean':'gn','Haitian':'ht','Honduran':'hn',
  'Hungarian':'hu','Icelandic':'is','Indian':'in',
  'Indonesian':'id','Iranian':'ir','Iraqi':'iq',
  'Irish':'ie','Israeli':'il','Italian':'it',
  'Ivorian':'ci','Jamaican':'jm','Japanese':'jp',
  'Jordanian':'jo','Kazakh':'kz','Kenyan':'ke',
  'Korean':'kr','Kuwaiti':'kw','Kyrgyz':'kg',
  'Laotian':'la','Latvian':'lv','Lebanese':'lb',
  'Libyan':'ly','Lithuanian':'lt','Luxembourgish':'lu',
  'Malagasy':'mg','Malaysian':'my','Malian':'ml',
  'Maltese':'mt','Mauritanian':'mr','Mexican':'mx',
  'Moldovan':'md','Mongolian':'mn','Moroccan':'ma',
  'Mozambican':'mz','Namibian':'na','Nepalese':'np',
  'New Zealand':'nz','Nigerian':'ng','Norwegian':'no',
  'Omani':'om','Pakistani':'pk','Palestinian':'ps',
  'Panamanian':'pa','Paraguayan':'py','Peruvian':'pe',
  'Philippine':'ph','Filipino':'ph','Polish':'pl',
  'Portuguese':'pt','Qatari':'qa','Romanian':'ro',
  'Russian':'ru','Saudi':'sa','Senegalese':'sn',
  'Serbian':'rs','Singaporean':'sg','Slovak':'sk',
  'Slovenian':'si','Somali':'so','South African':'za',
  'Spanish':'es','Sri Lankan':'lk','Sudanese':'sd',
  'Swedish':'se','Swiss':'ch','Syrian':'sy',
  'Taiwanese':'tw','Tanzanian':'tz','Thai':'th',
  'Tunisian':'tn','Turkish':'tr','Ugandan':'ug',
  'Ukrainian':'ua','Uruguayan':'uy','Uzbek':'uz',
  'Venezuelan':'ve','Vietnamese':'vn','Yemeni':'ye',
  'Zambian':'zm','Zimbabwean':'zw',
  // Extended list (from API)
  'Bermudian':'bm','Bosnian, Herzegovinian':'ba','Burmese':'mm',
  'Cape Verdian':'cv','Channel Islander':'gg','Djibouti':'dj',
  'Ecuadorean':'ec','Equatorial Guinean':'gq','Eritrean':'er',
  'Faroese':'fo','Fijian':'fj','Gabonese':'ga','Gambian':'gm',
  'Gibraltar':'gi','Greenlandic':'gl','Grenadian':'gd',
  'Guadeloupian':'gp','Guamanian':'gu','Guinea-Bissauan':'gw',
  'Guyanese':'gy','Hong Konger':'hk','Icelander':'is',
  'Kazakhstani':'kz','Kirghiz':'kg','Kosovar':'xk',
  'Liberian':'lr','Liechtensteiner':'li','Luxembourger':'lu',
  'Macedonian':'mk','Malawian':'mw','Maldivan':'mv',
  'Mauritian':'mu','Montenegrin':'me','Mosotho':'ls',
  'Motswana':'bw','New Zealander':'nz','Ni-Vanuatu':'vu',
  'Nicaraguan':'ni','Nigerien':'ne','North Korean':'kp',
  'Papua New Guinean':'pg','Puerto Rican':'pr','Rwandan':'rw',
  'Saint Lucian':'lc','Salvadoran':'sv','Sammarinese':'sm',
  'Samoan':'ws','Saudi Arabian':'sa','Seychellois':'sc',
  'Sierra Leonean':'sl','Slovene':'si','Solomon Islander':'sb',
  'South Korean':'kr','South Sudanese':'ss','Surinamer':'sr',
  'Tadzhik':'tj','Togolese':'tg','Tongan':'to',
  'Trinidadian':'tt','Turkmen':'tm','Tuvaluan':'tv',
  'Uzbekistani':'uz'
};

// Returns a real <img> flag — works on ALL platforms (no emoji)
const getFlag = (area, cls = 'flag-img') => {
  const code = AREA_CODES[area];
  if (!code) return `<span class="flag-fallback">🌍</span>`;
  return `<img src="https://flagcdn.com/w40/${code}.png" class="${cls}" loading="lazy" alt="${Safe.attr(area)}" onerror="this.outerHTML='<span class=flag-fallback>🌍</span>'">`;
};

// ---- WORLD AREA FLAGS (kept for text fallback only) ----
const AREA_FLAGS = {
  'Afghan':'🇦🇫','Albanian':'🇦🇱','Algerian':'🇩🇿','American':'🇺🇸',
  'Andorran':'🇦🇩','Angolan':'🇦🇴','Antiguan, Barbudan':'🇦🇬',
  'Argentine':'🇦🇷','Argentinian':'🇦🇷','Armenian':'🇦🇲',
  'Australian':'🇦🇺','Austrian':'🇦🇹','Azerbaijani':'🇦🇿',
  'Bahamian':'🇧🇸','Bahraini':'🇧🇭','Bangladeshi':'🇧🇩',
  'Barbadian':'🇧🇧','Belarusian':'🇧🇾','Belgian':'🇧🇪',
  'Belizean':'🇧🇿','Beninese':'🇧🇯','Bhutanese':'🇧🇹',
  'Bolivian':'🇧🇴','Bosnian':'🇧🇦','Brazilian':'🇧🇷',
  'British':'🇬🇧','Bruneian':'🇧🇳','Bulgarian':'🇧🇬',
  'Burkinabe':'🇧🇫','Burundian':'🇧🇮','Cambodian':'🇰🇭',
  'Cameroonian':'🇨🇲','Canadian':'🇨🇦','Chilean':'🇨🇱',
  'Chinese':'🇨🇳','Colombian':'🇨🇴','Congolese':'🇨🇩',
  'Costa Rican':'🇨🇷','Croatian':'🇭🇷','Cuban':'🇨🇺',
  'Cypriot':'🇨🇾','Czech':'🇨🇿','Danish':'🇩🇰',
  'Djiboutian':'🇩🇯','Dominican':'🇩🇴','Dutch':'🇳🇱',
  'Ecuadorian':'🇪🇨','Egyptian':'🇪🇬','Emirati':'🇦🇪',
  'Estonian':'🇪🇪','Ethiopian':'🇪🇹','Finnish':'🇫🇮',
  'French':'🇫🇷','Georgian':'🇬🇪','German':'🇩🇪',
  'Ghanaian':'🇬🇭','Greek':'🇬🇷','Guatemalan':'🇬🇹',
  'Guinean':'🇬🇳','Haitian':'🇭🇹','Honduran':'🇭🇳',
  'Hungarian':'🇭🇺','Icelandic':'🇮🇸','Indian':'🇮🇳',
  'Indonesian':'🇮🇩','Iranian':'🇮🇷','Iraqi':'🇮🇶',
  'Irish':'🇮🇪','Israeli':'🇮🇱','Italian':'🇮🇹',
  'Ivorian':'🇨🇮','Jamaican':'🇯🇲','Japanese':'🇯🇵',
  'Jordanian':'🇯🇴','Kazakh':'🇰🇿','Kenyan':'🇰🇪',
  'Korean':'🇰🇷','Kuwaiti':'🇰🇼','Kyrgyz':'🇰🇬',
  'Laotian':'🇱🇦','Latvian':'🇱🇻','Lebanese':'🇱🇧',
  'Libyan':'🇱🇾','Lithuanian':'🇱🇹','Luxembourgish':'🇱🇺',
  'Malagasy':'🇲🇬','Malaysian':'🇲🇾','Malian':'🇲🇱',
  'Maltese':'🇲🇹','Mauritanian':'🇲🇷','Mexican':'🇲🇽',
  'Moldovan':'🇲🇩','Mongolian':'🇲🇳','Moroccan':'🇲🇦',
  'Mozambican':'🇲🇿','Namibian':'🇳🇦','Nepalese':'🇳🇵',
  'New Zealand':'🇳🇿','Nigerian':'🇳🇬','Norwegian':'🇳🇴',
  'Omani':'🇴🇲','Pakistani':'🇵🇰','Palestinian':'🇵🇸',
  'Panamanian':'🇵🇦','Paraguayan':'🇵🇾','Peruvian':'🇵🇪',
  'Philippine':'🇵🇭','Filipino':'🇵🇭','Polish':'🇵🇱',
  'Portuguese':'🇵🇹','Qatari':'🇶🇦','Romanian':'🇷🇴',
  'Russian':'🇷🇺','Saudi':'🇸🇦','Senegalese':'🇸🇳',
  'Serbian':'🇷🇸','Singaporean':'🇸🇬','Slovak':'🇸🇰',
  'Slovenian':'🇸🇮','Somali':'🇸🇴','South African':'🇿🇦',
  'Spanish':'🇪🇸','Sri Lankan':'🇱🇰','Sudanese':'🇸🇩',
  'Swedish':'🇸🇪','Swiss':'🇨🇭','Syrian':'🇸🇾',
  'Taiwanese':'🇹🇼','Tanzanian':'🇹🇿','Thai':'🇹🇭',
  'Tunisian':'🇹🇳','Turkish':'🇹🇷','Ugandan':'🇺🇬',
  'Ukrainian':'🇺🇦','Uruguayan':'🇺🇾','Uzbek':'🇺🇿',
  'Venezuelan':'🇻🇪','Vietnamese':'🇻🇳','Yemeni':'🇾🇪',
  'Zambian':'🇿🇲','Zimbabwean':'🇿🇼','Unknown':'🌍'
};

// Rotation: only areas with rich recipe coverage in TheMealDB
const FEATURED_AREAS_POOL = [
  'American','British','Italian','Indian','Mexican','Chinese',
  'French','Thai','Japanese','Malaysian','Moroccan','Spanish',
  'Greek','Turkish','Vietnamese','Canadian','Russian','Irish',
  'Polish','Tunisian','Portuguese','Egyptian','Jamaican',
  'Croatian','Dutch','Filipino','Kenyan','Philippine'
];

// ---- DAILY FEED (date-based caching) ----
const DailyFeed = {
  _key: () => `walkart_daily_${new Date().toISOString().split('T')[0]}`,
  get: () => {
    try { return JSON.parse(localStorage.getItem(DailyFeed._key()) || 'null'); } catch { return null; }
  },
  set: (data) => {
    // Purge old daily keys (keep storage clean)
    const today = DailyFeed._key();
    Object.keys(localStorage)
      .filter(k => k.startsWith('walkart_daily_') && k !== today)
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(today, JSON.stringify(data));
  }
};

// ---- INSTRUCTION PARSER ----
const Instructions = {
  parse: (raw) => {
    if (!raw) return [];
    const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const stripped = text
      .replace(/^(step|étape|paso|schritt)\s*\d+[.:)]*\s*$/gim, '')
      .replace(/^\d+\.\s*$/gm, '');
    let steps = stripped.split(/\n{2,}/).map(s => s.replace(/\n/g, ' ').trim()).filter(s => s.length > 20);
    if (steps.length >= 2) return steps;
    const numbered = text.split(/\n?\s*\d+[.)]\s+/).filter(s => s.trim().length > 20);
    if (numbered.length >= 2) return numbered.map(s => s.replace(/\n/g, ' ').trim());
    steps = stripped.split('\n').map(s => s.trim()).filter(s => s.length > 20);
    if (steps.length >= 2) return steps;
    return text.split(/\.(?=\s+[A-Z])/).map(s => s.trim()).filter(s => s.length > 20)
               .map((s, i, a) => i < a.length - 1 ? s + '.' : s);
  }
};

// ---- LOCAL DATA MODULES ----

const RecentlyViewed = {
  get: () => JSON.parse(localStorage.getItem('walkart_recent') || '[]'),
  add: (r) => {
    if (!r?.idMeal) return;
    const list = RecentlyViewed.get().filter(x => x.idMeal !== r.idMeal);
    list.unshift({ idMeal: r.idMeal, strMeal: r.strMeal, strMealThumb: r.strMealThumb, strCategory: r.strCategory || '', strArea: r.strArea || '' });
    localStorage.setItem('walkart_recent', JSON.stringify(list.slice(0, 12)));
  }
};

const SearchHistory = {
  get: () => JSON.parse(localStorage.getItem('walkart_search_hist') || '[]'),
  add: (q) => {
    if (!q?.trim()) return;
    const hist = SearchHistory.get().filter(x => x !== q.trim());
    hist.unshift(q.trim());
    localStorage.setItem('walkart_search_hist', JSON.stringify(hist.slice(0, 6)));
  },
  remove: (q) => {
    localStorage.setItem('walkart_search_hist', JSON.stringify(SearchHistory.get().filter(x => x !== q)));
  },
  clear: () => localStorage.removeItem('walkart_search_hist')
};

const Ratings = {
  get: (id) => (JSON.parse(localStorage.getItem('walkart_ratings') || '{}'))[id] || 0,
  set: (id, stars) => {
    const all = JSON.parse(localStorage.getItem('walkart_ratings') || '{}');
    all[id] = stars;
    localStorage.setItem('walkart_ratings', JSON.stringify(all));
  }
};

const Planner = {
  get: () => JSON.parse(localStorage.getItem('walkart_planner') || '{}'),
  setMeal: (date, slot, recipe) => {
    const p = Planner.get();
    if (!p[date]) p[date] = {};
    p[date][slot] = { idMeal: recipe.idMeal, strMeal: recipe.strMeal, strMealThumb: recipe.strMealThumb };
    localStorage.setItem('walkart_planner', JSON.stringify(p));
  },
  removeMeal: (date, slot) => {
    const p = Planner.get();
    if (p[date]) { delete p[date][slot]; if (!Object.keys(p[date]).length) delete p[date]; }
    localStorage.setItem('walkart_planner', JSON.stringify(p));
  },
  getWeekDates: (offset = 0) => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }
};

// ---- STATE ----
const state = {
  currentRoute: 'home',
  prevRoute: 'home',
  collections: { billboard: null, popular: [] },
  categories: [],
  shoppingList: JSON.parse(localStorage.getItem('walkart_shopping') || '[]'),
  favorites: JSON.parse(localStorage.getItem('walkart_favorites') || '[]'),
  lang: localStorage.getItem('walkart_lang') || 'fr',
  langName: localStorage.getItem('walkart_lang_name') || 'FR',
  darkMode: localStorage.getItem('walkart_dark') === 'true',
  currentRecipe: null,
  currentRecipeName: '',
  currentRecipeThumb: '',
  currentRecipeInstructions: [],
  currentStepIndex: 0,
  servings: 4,
  cookingTimerInterval: null,
  cookingTimerSeconds: 300,
  cookingTimerRunning: false,
  searchResults: [],
  searchQuery: null,
  searchFilter: '',
  plannerPick: null,
  plannerWeekOffset: 0,
  _wakeLock: null,
  areas: [],
  dailyFeed: null
};

// ---- i18n shorthand (synchronous, no API calls) ----
const T = k => i18n.t(k);

// ---- TOAST (with undo) ----
const Toast = {
  _timeout: null,
  _undoFn: null,
  show: (msg, duration = 3000, undoFn = null, undoLabel = '↩ Undo') => {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    clearTimeout(Toast._timeout);
    Toast._undoFn = undoFn || null;
    if (undoFn) {
      el.innerHTML = `<span>${Safe.html(msg)}</span><button class="toast-undo" onclick="Toast.undo()">${Safe.html(undoLabel)}</button>`;
    } else {
      el.textContent = msg;
    }
    el.classList.add('show');
    Toast._timeout = setTimeout(() => { el.classList.remove('show'); Toast._undoFn = null; }, duration);
  },
  undo: () => {
    if (Toast._undoFn) { Toast._undoFn(); Toast._undoFn = null; }
    document.getElementById('toast')?.classList.remove('show');
    clearTimeout(Toast._timeout);
  }
};

// ---- INGREDIENT SCALING ----
const Scale = {
  parseFraction: (s) => {
    const parts = s.split('/');
    return parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : parseFloat(s);
  },
  scale: (measure, factor) => {
    if (!measure || !measure.trim()) return '';
    const m = measure.trim().match(/^(\d+\/\d+|\d+\.?\d*)\s*(.*)/);
    if (!m) return measure;
    const num = Scale.parseFraction(m[1]) * factor;
    const rounded = Math.round(num * 8) / 8;
    const unit = m[2] || '';
    const fractions = [[0.125,'⅛'],[0.25,'¼'],[0.333,'⅓'],[0.5,'½'],[0.667,'⅔'],[0.75,'¾'],[0.875,'⅞']];
    const intPart = Math.floor(rounded);
    const decPart = rounded - intPart;
    const frac = fractions.find(([v]) => Math.abs(v - decPart) < 0.06);
    let display = intPart > 0 ? `${intPart}` : '';
    if (frac) display += (display ? ' ' : '') + frac[1];
    else if (decPart > 0.06) display = `${Math.round(rounded * 10) / 10}`;
    return `${display || Math.round(rounded)} ${unit}`.trim();
  },
  scaleNum: (num, factor) => {
    if (!num) return '';
    const scaled = num * factor;
    const rounded = Math.round(scaled * 100) / 100;
    return rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
  }
};

// ---- TRANSLATOR (with cache eviction) ----
const TRANS_CACHE_MAX = 300;
const Translator = {
  cache: JSON.parse(localStorage.getItem('walkart_trans_cache') || '{}'),
  translate: async (text, targetLang) => {
    if (!text || !text.trim()) return text || '';
    if (targetLang === 'en') return text;
    const cacheKey = `${targetLang}_${text}`;
    if (Translator.cache[cacheKey]) return Translator.cache[cacheKey];
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      const translated = data[0].map(x => x[0]).join('');
      Translator.cache[cacheKey] = translated;
      const keys = Object.keys(Translator.cache);
      if (keys.length > TRANS_CACHE_MAX) keys.slice(0, 50).forEach(k => delete Translator.cache[k]);
      localStorage.setItem('walkart_trans_cache', JSON.stringify(Translator.cache));
      return translated;
    } catch { return text; }
  },
  t: (text) => Translator.translate(text, state.lang),
  all: async (...texts) => Promise.all(texts.map(t => Translator.translate(t, state.lang))),
  translateUI: async () => {
    const lang = state.lang;
    for (const el of document.querySelectorAll('[data-t]')) {
      if (el.tagName === 'INPUT') {
        const orig = el.getAttribute('data-t-orig') || el.placeholder;
        if (!el.getAttribute('data-t-orig')) el.setAttribute('data-t-orig', orig);
        el.placeholder = await Translator.translate(orig, lang);
      } else {
        const orig = el.getAttribute('data-t-orig') || el.textContent.trim();
        if (!el.getAttribute('data-t-orig')) el.setAttribute('data-t-orig', orig);
        if (!orig) continue;
        const translated = await Translator.translate(orig, lang);
        if (el.children.length === 0) {
          el.textContent = translated;
        } else {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              node.textContent = translated; break;
            }
          }
        }
      }
    }
  }
};

// ---- FETCH WITH RETRY ----
const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, 400 * (i + 1)));
    }
  }
};

// ---- PWA INSTALL PROMPT ----
let _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _pwaPrompt = e;
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'flex';
});

// ---- FAVORITES BADGE ----
const updateFavBadge = () => {
  const badge = document.getElementById('fav-tab-badge');
  if (!badge) return;
  const count = state.favorites.length;
  badge.textContent = count || '';
  badge.style.display = count ? 'flex' : 'none';
};

// ---- APP ----
const App = {
  init: async () => {
    // Auto dark mode: detect system preference only if never manually set
    if (localStorage.getItem('walkart_dark') === null) {
      state.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    const darkBtn = document.getElementById('dark-mode-btn');
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
      if (darkBtn) darkBtn.textContent = '☀️';
    }
    // React to system theme changes (only if user hasn't locked a preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('walkart_dark') !== null) return;
      state.darkMode = e.matches;
      document.body.classList.toggle('dark-mode', e.matches);
      const btn = document.getElementById('dark-mode-btn');
      if (btn) btn.textContent = e.matches ? '☀️' : '🌙';
    });

    // Offline/online detection
    window.addEventListener('offline', () => Toast.show('📶 Connexion perdue', 4000));
    window.addEventListener('online', () => Toast.show('✅ Connexion rétablie', 3000));

    i18n.set(state.lang || 'fr');
    i18n.render();
    document.getElementById('current-lang-text').textContent = state.langName;
    document.documentElement.setAttribute('lang', state.lang);
    if (state.lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');

    // First-time: show language picker before loading anything
    if (!localStorage.getItem('walkart_lang')) {
      await new Promise(resolve => { UI._welcomeResolve = resolve; UI.showWelcome(); });
      document.getElementById('current-lang-text').textContent = state.langName;
      document.documentElement.setAttribute('lang', state.lang);
      if (state.lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    }

    updateFavBadge();
    await Auth.init();
    await API.loadInitialData();

    // Parse hash — supports #recipe/ID, #area/NAME, or plain #route
    const rawHash = window.location.hash.replace('#', '') || 'home';
    const [seg, ...rest] = rawHash.split('/');
    const param = rest.join('/'); // handles names with slashes
    if (seg === 'recipe' && param) {
      App.navigate('recipe', { id: param });
    } else if (seg === 'area' && param) {
      App.navigate('area', { a: decodeURIComponent(param) });
    } else if (seg === 'category' && param) {
      App.navigate('category', { c: decodeURIComponent(param) });
    } else {
      App.navigate(seg || 'home');
    }
    document.getElementById('header-search-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) SearchHistory.add(q);
        App.navigate('search', { query: q });
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'Escape') {
        const cooking = document.getElementById('cooking-mode-overlay');
        if (cooking?.classList.contains('active')) { Actions.closeCookingMode(); return; }
        const plannerModal = document.getElementById('planner-pick-modal');
        if (plannerModal?.classList.contains('active')) { Actions.closePlannerPick(); return; }
        const langModal = document.getElementById('lang-modal');
        if (langModal?.classList.contains('show')) { UI.toggleLangModal(); return; }
        const addPlannerModal = document.getElementById('add-to-planner-modal');
        if (addPlannerModal?.classList.contains('active')) { Actions.closeAddToPlanner(); return; }
      }
      if (!inInput) {
        const cooking = document.getElementById('cooking-mode-overlay');
        if (cooking?.classList.contains('active')) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            if (state.currentStepIndex < state.currentRecipeInstructions.length - 1) {
              state.currentStepIndex++; Render.updateCookingMode();
            }
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            if (state.currentStepIndex > 0) {
              state.currentStepIndex--; Render.updateCookingMode();
            }
          } else if (e.key === ' ') {
            e.preventDefault(); Actions.timerToggle();
          }
        }
      }
    });
  },

  goBack: () => App.navigate(state.prevRoute || 'home'),

  navigate: (route, params = null) => {
    state.prevRoute = state.currentRoute;
    state.currentRoute = route;
    // Encode deep routes so URLs are shareable
    if (route === 'recipe' && params?.id) {
      window.location.hash = `recipe/${params.id}`;
    } else if (route === 'area' && params?.a) {
      window.location.hash = `area/${encodeURIComponent(params.a)}`;
    } else if (route === 'category' && params?.c) {
      window.location.hash = `category/${encodeURIComponent(params.c)}`;
    } else {
      window.location.hash = route;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('onclick')?.includes(`'${route}'`));
    });

    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `
      <div class="container">
        <div class="skeleton" style="height:220px; margin-bottom:20px;"></div>
        <div class="skeleton" style="height:48px; margin-bottom:12px;"></div>
        <div class="recipe-grid">
          ${Array(4).fill('<div class="skeleton" style="height:320px;"></div>').join('')}
        </div>
      </div>`;

    (async () => {
      try {
        let html = '';
        if (route === 'home') {
          html = await Render.home();
        } else if (route === 'search') {
          const query = params?.query ?? '';
          if (query && query !== state.searchQuery) {
            state.searchResults = await API.search(query);
            state.searchQuery = query;
            state.searchFilter = '';
          }
          if (!query) state.searchQuery = '';
          html = await Render.searchResults(state.searchResults, query);
        } else if (route === 'categories') {
          html = await Render.categories();
        } else if (route === 'shopping') {
          html = await Render.shopping();
        } else if (route === 'favorites') {
          html = await Render.favorites();
        } else if (route === 'planner') {
          html = await Render.planner();
        } else if (route === 'category') {
          html = await Render.categoryPage(params?.c, await API.getByCategory(params?.c));
        } else if (route === 'area') {
          html = await Render.areaPage(params?.a, await API.getByArea(params?.a));
        } else if (route === 'recipe') {
          const recipe = await API.getRecipe(params?.id);
          state.currentRecipe = recipe;
          state.currentRecipeName = recipe.strMeal || '';
          state.currentRecipeThumb = recipe.strMealThumb || '';
          state.servings = 4;
          state.currentRecipeInstructions = Instructions.parse(recipe.strInstructions);
          RecipeStore.set(recipe.idMeal, recipe);
          RecentlyViewed.add(recipe);
          html = await Render.recipeDetail(recipe);
        } else if (route === 'login') {
          html = Render.login();
        } else if (route === 'register') {
          html = Render.register();
        } else if (route === 'profile') {
          html = await Render.profile();
        } else if (route === 'profile-setup') {
          html = Render.profileSetup();
        } else if (route === 'my-menu') {
          html = await Render.myMenu();
        } else if (route === 'privacy') {
          html = Render.privacy();
        } else if (route === 'about') {
          html = Render.about();
        } else {
          html = await Render.home();
        }

        root.innerHTML = html;
        if (route === 'recipe') await Render.updateIngredientsList();
      } catch (e) {
        console.error('Navigation error:', e);
        root.innerHTML = `
          <div class="container error-state">
            <div class="error-icon">😕</div>
            <h2>${Safe.html(T('toast_error'))}</h2>
            <p>Vérifiez votre connexion et réessayez.</p>
            <button class="btn btn-primary" onclick="App.navigate('${route}')">${Safe.html(T('back'))}</button>
          </div>`;
      }
    })();
  },

  changeLang: async (code, name) => {
    state.lang = code;
    state.langName = name;
    localStorage.setItem('walkart_lang', code);
    localStorage.setItem('walkart_lang_name', name);
    i18n.set(code);
    document.getElementById('current-lang-text').textContent = name;
    document.documentElement.setAttribute('lang', code);
    if (code === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.removeAttribute('dir');
    UI.toggleLangModal();
    App.navigate(state.currentRoute);
  },

  toggleDarkMode: () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    localStorage.setItem('walkart_dark', String(state.darkMode));
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = state.darkMode ? '☀️' : '🌙';
  }
};

// ---- API ----
const API = {
  loadInitialData: async () => {
    try {
      // Phase 1 — fast parallel: categories + billboard + world areas
      const [cats, feat, areasData] = await Promise.all([
        fetchWithRetry(API_BASE + '/categories.php').then(r => r.json()),
        fetchWithRetry(API_BASE + '/random.php').then(r => r.json()),
        fetchWithRetry(API_BASE + '/list.php?a=list').then(r => r.json())
      ]);
      state.categories = cats.categories || [];
      state.areas = (areasData.meals || []).map(m => m.strArea).filter(a => a && a !== 'Unknown');
      state.collections.billboard = feat.meals?.[0] || null;
      if (state.collections.billboard) RecipeStore.set(state.collections.billboard.idMeal, state.collections.billboard);

      // Phase 2 — daily feed (use cache or fetch fresh)
      const cached = DailyFeed.get();
      if (cached?.todayPicks?.length) {
        // Restore from cache
        state.dailyFeed = cached;
        cached.todayPicks.forEach(m => m && RecipeStore.set(m.idMeal, m));
        cached.areaSections?.forEach(s => s.meals?.forEach(m => m && RecipeStore.set(m.idMeal, m)));
        state.collections.popular = cached.todayPicks.slice(0, 6);
      } else {
        // Compute today's 3 featured areas based on day index
        const dayIndex = Math.floor(Date.now() / 86400000);
        const todayAreas = [0, 1, 2].map(i => FEATURED_AREAS_POOL[(dayIndex + i) % FEATURED_AREAS_POOL.length]);

        // Fetch picks + 3 area batches in parallel
        const [todayPicks, ...areaSections] = await Promise.all([
          API.getBatch(12),
          ...todayAreas.map(a =>
            fetchWithRetry(`${API_BASE}/filter.php?a=${encodeURIComponent(a)}`)
              .then(r => r.json())
              .then(d => ({ area: a, meals: (d.meals || []).slice(0, 10) }))
              .catch(() => ({ area: a, meals: [] }))
          )
        ]);

        areaSections.forEach(s => s.meals?.forEach(m => m && RecipeStore.set(m.idMeal, m)));
        state.collections.popular = todayPicks.slice(0, 6);
        state.dailyFeed = { todayPicks, areaSections };
        DailyFeed.set(state.dailyFeed);
      }
    } catch (e) { console.error('Initial data error:', e); }
  },
  getBatch: async (count) => {
    const promises = Array.from({ length: count }, () =>
      fetchWithRetry(API_BASE + '/random.php').then(r => r.json()).catch(() => null)
    );
    const res = await Promise.all(promises);
    const meals = res.filter(r => r?.meals).map(r => r.meals[0]);
    meals.forEach(m => RecipeStore.set(m.idMeal, m));
    return meals;
  },
  search: async (q) => {
    if (!q) return API.getBatch(10);
    const en = await Translator.translate(q, 'en');
    const [byName, byIng, spoonResults] = await Promise.all([
      fetchWithRetry(`${API_BASE}/search.php?s=${encodeURIComponent(en)}`).then(r => r.json()).catch(() => ({ meals: null })),
      fetchWithRetry(`${API_BASE}/filter.php?i=${encodeURIComponent(en)}`).then(r => r.json()).catch(() => ({ meals: null })),
      SpoonRecipes.search(q)
    ]);
    const mealResults = [...(byName.meals || []), ...(byIng.meals || [])];
    const unique = Array.from(new Map(mealResults.map(m => [m.idMeal, m])).values());
    unique.forEach(m => RecipeStore.set(m.idMeal, m));
    return [...unique, ...spoonResults];
  },
  getByCategory: async (c) => {
    const data = await fetchWithRetry(`${API_BASE}/filter.php?c=${encodeURIComponent(c)}`).then(r => r.json());
    const meals = data.meals || [];
    meals.forEach(m => RecipeStore.set(m.idMeal, m));
    return meals;
  },
  getByArea: async (a) => {
    const data = await fetchWithRetry(`${API_BASE}/filter.php?a=${encodeURIComponent(a)}`).then(r => r.json());
    const meals = data.meals || [];
    meals.forEach(m => RecipeStore.set(m.idMeal, m));
    return meals;
  },
  getRecipe: async (id) => {
    if (id.startsWith('spoon_')) return SpoonRecipes.getById(id.replace('spoon_', ''));
    const data = await fetchWithRetry(`${API_BASE}/lookup.php?i=${id}`).then(r => r.json());
    const meal = data.meals?.[0];
    if (meal) RecipeStore.set(meal.idMeal, meal);
    return meal;
  }
};

// ---- SPOONACULAR INTEGRATION ----
const SpoonRecipes = {
  _normalize: (r) => ({
    idMeal: 'spoon_' + r.id,
    strMeal: r.title,
    strMealThumb: r.image || '',
    strCategory: r.dishTypes?.[0] || '',
    strArea: r.cuisines?.[0] || '',
    strInstructions: r.analyzedInstructions?.length
      ? r.analyzedInstructions.flatMap(s => s.steps.map(st => st.step)).join('\n\n')
      : (r.instructions || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    strTags: r.diets?.join(',') || '',
    strSource: r.sourceUrl || '',
    strYoutube: '',
    _spoon: true,
    _calories: Math.round(r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0) || null,
    _protein: r.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || null,
    _fat: r.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || null,
    _carbs: r.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || null,
    _readyIn: r.readyInMinutes || null,
    _servings: r.servings || 4,
    _spoonIngredients: (r.extendedIngredients || []).map(i => ({
      name: i.name, amount: i.amount, unit: i.unit, original: i.original
    }))
  }),

  feed: async (number = 6) => {
    const cacheKey = 'walkart_spoon_feed';
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const recipes = JSON.parse(cached);
        recipes.forEach(r => RecipeStore.set(r.idMeal, r));
        return recipes;
      }
    } catch {}
    try {
      const res = await fetch(`${SPOON_BASE}/random?apiKey=${SPOON_KEY}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true`);
      if (!res.ok) return [];
      const data = await res.json();
      const recipes = (data.recipes || []).map(SpoonRecipes._normalize);
      recipes.forEach(r => RecipeStore.set(r.idMeal, r));
      try { sessionStorage.setItem(cacheKey, JSON.stringify(recipes)); } catch {}
      return recipes;
    } catch (e) { console.warn('Spoonacular feed:', e); return []; }
  },

  search: async (query, number = 8) => {
    const cacheKey = 'walkart_spoon_s_' + query.toLowerCase().trim();
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const recipes = JSON.parse(cached);
        recipes.forEach(r => RecipeStore.set(r.idMeal, r));
        return recipes;
      }
    } catch {}
    try {
      const res = await fetch(`${SPOON_BASE}/complexSearch?apiKey=${SPOON_KEY}&query=${encodeURIComponent(query)}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true`);
      if (!res.ok) return [];
      const data = await res.json();
      const recipes = (data.results || []).map(SpoonRecipes._normalize);
      recipes.forEach(r => RecipeStore.set(r.idMeal, r));
      try { sessionStorage.setItem(cacheKey, JSON.stringify(recipes)); } catch {}
      return recipes;
    } catch (e) { console.warn('Spoonacular search:', e); return []; }
  },

  getById: async (spoonId) => {
    const mealId = 'spoon_' + spoonId;
    const cached = RecipeStore.get(mealId);
    if (cached?._spoonIngredients) return cached;
    try {
      const res = await fetch(`${SPOON_BASE}/${spoonId}/information?apiKey=${SPOON_KEY}&includeNutrition=true`);
      if (!res.ok) return null;
      const data = await res.json();
      const recipe = SpoonRecipes._normalize(data);
      RecipeStore.set(recipe.idMeal, recipe);
      return recipe;
    } catch (e) { console.warn('Spoonacular getById:', e); return null; }
  }
};

// ---- RENDER ----
const Render = {
  recipeCard: async (r) => {
    RecipeStore.set(r.idMeal, r);
    const [tName, tArea, tCat] = await Translator.all(r.strMeal, r.strArea || '', r.strCategory || '');
    const isFav = state.favorites.some(f => f.idMeal === r.idMeal);
    return `
      <div class="recipe-card page-enter" onclick="App.navigate('recipe', {id: '${r.idMeal}'})">
        <div class="card-img-wrapper">
          <img src="${Safe.attr(r.strMealThumb)}" class="card-img" loading="lazy" decoding="async" alt="${Safe.attr(tName)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍽️%3C/text%3E%3C/svg%3E'">
          <div class="card-overlay">
            ${tArea ? `<div class="badge">🌍 ${Safe.html(tArea)}</div>` : ''}
            ${r._calories ? `<div class="badge badge-cal">🔥 ${r._calories} kcal</div>` : ''}
          </div>
          <button class="fav-btn ${isFav ? 'active' : ''}"
            onclick="event.stopPropagation(); Actions.toggleFavorite('${r.idMeal}')">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="card-body">
          <h3 class="card-title">${Safe.html(tName)}</h3>
          <div class="card-meta">
            ${tCat ? `<span>🥗 ${Safe.html(tCat)}</span>` : ''}
          </div>
        </div>
      </div>`;
  },

  home: async () => {
    const b = state.collections.billboard;
    if (!b) return '<div class="container"><div class="spinner"></div></div>';

    const bt = await Translator.t(b.strMeal);
    const t_featured = T('featured'), t_cook = T('cook_now'), t_surprise = T('surprise_me'),
      t_recent = T('recently_viewed'), t_today = T('todays_picks'), t_popular = T('you_may_like'),
      t_world = T('section_world'), t_seeAll = T('see_all'), t_categories = T('section_categories');
    const isFav = state.favorites.some(f => f.idMeal === b.idMeal);

    // ---- Category chips (all categories) ----
    const catChips = (await Promise.all(
      state.categories.map(async c => {
        const tLabel = await Translator.t(c.strCategory);
        return `<button class="chip" onclick="App.navigate('category', {c:'${Safe.attr(c.strCategory)}'})">
          ${Safe.html(tLabel)}
        </button>`;
      })
    )).join('');

    // ---- Recently viewed ----
    const recent = RecentlyViewed.get();
    const recentSection = recent.length ? `
      <div class="recent-section">
        <h3 class="recent-title">🕐 ${Safe.html(t_recent)}</h3>
        <div class="recent-row">
          ${recent.slice(0, 10).map(r => `
            <div class="recent-card" onclick="App.navigate('recipe', {id: '${r.idMeal}'})">
              <img src="${Safe.attr(r.strMealThumb)}" loading="lazy" decoding="async" alt="${Safe.attr(r.strMeal)}"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3C/svg%3E'">
              <span>${Safe.html(r.strMeal)}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    // ---- World Cuisines ----
    const worldSection = await Render.worldCuisines(t_world, t_seeAll);

    // ---- Today's picks (from daily feed, changes each day) ----
    const todayMeals = state.dailyFeed?.todayPicks?.slice(0, 6) || state.collections.popular;
    const todayCards = await Promise.all(todayMeals.map(r => Render.recipeCard(r)));

    // ---- 3 featured cuisine sections (rotate daily) ----
    let areaHTML = '';
    if (state.dailyFeed?.areaSections?.length) {
      const sections = await Promise.all(
        state.dailyFeed.areaSections.map(s => Render.areaRow(s.area, s.meals, t_seeAll))
      );
      areaHTML = sections.join('');
    }

    // ---- Second grid — more picks ----
    const moreMeals = state.dailyFeed?.todayPicks?.slice(6, 12) || state.collections.popular;
    const moreCards = await Promise.all(moreMeals.map(r => Render.recipeCard(r)));

    // ---- Spoonacular trending (cached per session) ----
    const spoonMeals = await SpoonRecipes.feed(6);
    const spoonCards = await Promise.all(spoonMeals.map(r => Render.recipeCard(r)));
    const t_trending = T('spoon_trending') || 'Trending · With Nutrition';
    const spoonSection = spoonCards.length ? `
      <h2 class="section-title">⚡ ${Safe.html(t_trending)}</h2>
      <div class="recipe-grid">${spoonCards.join('')}</div>` : '';

    return `
      <div class="billboard" style="background-image: url('${Safe.attr(b.strMealThumb)}')">
        <div class="billboard-overlay"></div>
        <div class="billboard-text">
          <span class="billboard-tag">⭐ ${Safe.html(t_featured)}</span>
          <h1>${Safe.html(bt)}</h1>
          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="App.navigate('recipe', {id:'${b.idMeal}'})">
              👨‍🍳 ${Safe.html(t_cook)}
            </button>
            <button class="btn btn-glass" onclick="Actions.toggleFavorite('${b.idMeal}')">
              ${isFav ? '❤️' : '🤍'}
            </button>
            <button class="btn btn-glass" onclick="Actions.surpriseMe()" title="${Safe.attr(t_surprise)}">🎲</button>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="section-label">🗂️ ${Safe.html(t_categories)}</div>
        <div class="chips-row">${catChips}</div>
        ${recentSection}
        ${worldSection}
        <h2 class="section-title">🔥 ${Safe.html(t_today)}</h2>
        <div class="recipe-grid">${todayCards.join('')}</div>
        ${areaHTML}
        <h2 class="section-title">✨ ${Safe.html(t_popular)}</h2>
        <div class="recipe-grid">${moreCards.join('')}</div>
        ${spoonSection}
        <div style="text-align:center; margin:32px 0;">
          <button class="btn btn-primary" onclick="Actions.loadMore()" id="load-more-btn" style="padding:14px 40px; font-size:1rem;">
            🔄 ${T('load_more')}
          </button>
        </div>
        <div id="load-more-grid" class="recipe-grid" style="margin-bottom:16px;"></div>
      </div>
      <footer style="background:var(--surface,#1a1a2e); color:var(--text-muted,#aaa); text-align:center; padding:32px 20px; margin-top:40px; border-top:1px solid var(--border,#333); font-size:0.85rem;">
        <p style="margin-bottom:12px; font-weight:700; color:var(--text,#fff);">🍳 Walkart</p>
        <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
          <a onclick="App.navigate('about')" style="color:var(--primary,#FF4D6D); cursor:pointer; text-decoration:none;">${T('footer_about')}</a>
          <a onclick="App.navigate('privacy')" style="color:var(--primary,#FF4D6D); cursor:pointer; text-decoration:none;">${T('footer_privacy_link')}</a>
          <a href="mailto:contact@walkart.us" style="color:var(--primary,#FF4D6D); text-decoration:none;">${T('footer_contact')}</a>
        </div>
        <p>${T('footer_copyright')}</p>
      </footer>`;
  },

  worldCuisines: async (t_world, t_seeAll) => {
    const areas = state.areas.length ? state.areas : Object.keys(AREA_CODES);
    const translatedNames = await Promise.all(areas.map(a => Translator.t(a)));
    const items = areas.map((a, i) => {
      return `<div class="cuisine-item" onclick="App.navigate('area', {a:'${Safe.attr(a)}'})">
        ${getFlag(a, 'flag-img flag-cuisine')}
        <span class="cuisine-name">${Safe.html(translatedNames[i])}</span>
      </div>`;
    }).join('');
    return `
      <div class="world-section">
        <div class="area-section-header">
          <h2 class="section-title" style="margin:0;">🌍 ${Safe.html(t_world || 'World Cuisines')}</h2>
        </div>
        <div class="cuisine-chips-row">${items}</div>
      </div>`;
  },

  areaRow: async (area, meals, t_seeAll) => {
    if (!meals?.length) return '';
    const tArea = await Translator.t(area);
    const see = t_seeAll || 'See all';
    const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3C/svg%3E";
    const miniCards = meals.slice(0, 10).map(m => {
      RecipeStore.set(m.idMeal, m);
      return `<div class="mini-card" onclick="App.navigate('recipe', {id:'${m.idMeal}'})">
        <img src="${Safe.attr(m.strMealThumb)}" loading="lazy" decoding="async" alt="${Safe.attr(m.strMeal)}"
          onerror="this.src='${IMG_FALLBACK}'">
        <span class="mini-card-title">${Safe.html(m.strMeal)}</span>
      </div>`;
    }).join('');
    return `
      <div class="area-section">
        <div class="area-section-header">
          <h3 class="area-section-title">${getFlag(area, 'flag-img flag-section')} ${Safe.html(tArea)}</h3>
          <button class="btn btn-ghost see-all-btn" onclick="App.navigate('area', {a:'${Safe.attr(area)}'})">
            ${Safe.html(see)} →
          </button>
        </div>
        <div class="mini-cards-row">${miniCards}</div>
      </div>`;
  },

  searchResults: async (results, query) => {
    // Empty query: show history + popular
    if (!query) {
      const hist = SearchHistory.get();
      const t_hist = T('recent_searches'), t_clear = T('clear_all'), t_popular = T('section_popular');

      const histSection = hist.length ? `
        <div class="search-history-section">
          <div class="search-history-header">
            <span class="search-history-title">🕐 ${Safe.html(t_hist)}</span>
            <button class="btn btn-ghost" style="font-size:0.8rem; padding:4px 12px;" onclick="Actions.clearSearchHistory()">${Safe.html(t_clear)}</button>
          </div>
          <div class="chips-row">
            ${hist.map(q => `
              <button class="chip chip-hist" onclick="App.navigate('search', {query:'${Safe.attr(q)}'})">
                ${Safe.html(q)}
                <span class="hist-remove" onclick="event.stopPropagation(); Actions.removeSearchHistory('${Safe.attr(q)}')">✕</span>
              </button>`).join('')}
          </div>
        </div>` : '';

      const popular = state.collections.popular.length ? state.collections.popular : await API.getBatch(6);
      const cards = await Promise.all(popular.map(r => Render.recipeCard(r)));
      return `
        <div class="container">
          ${histSection}
          <h2 class="section-title">🔥 ${Safe.html(t_popular)}</h2>
          <div class="recipe-grid">${cards.join('')}</div>
        </div>`;
    }

    const filtered = state.searchFilter
      ? results.filter(r => r.strCategory === state.searchFilter)
      : results;

    const t_results = T('search_results'), t_empty = T('no_results'),
      t_explore = T('explore_categories'), t_all = T('filter_all');

    const categories = [...new Set(results.map(r => r.strCategory).filter(Boolean))];
    const filterBar = categories.length > 1 ? `
      <div class="chips-row search-filter-bar">
        <button class="chip ${!state.searchFilter ? 'chip-active' : ''}" onclick="Actions.setSearchFilter('')">${Safe.html(t_all)}</button>
        ${categories.map(c => `<button class="chip ${state.searchFilter === c ? 'chip-active' : ''}" onclick="Actions.setSearchFilter('${Safe.attr(c)}')">${Safe.html(c)}</button>`).join('')}
      </div>` : '';

    if (!filtered.length) {
      return `
        <div class="container">
          <h2 class="section-title">🔍 "${Safe.html(query)}"</h2>
          ${filterBar}
          <div class="error-state">
            <div class="error-icon">🔍</div>
            <h2>${Safe.html(t_empty)}</h2>
            <p style="color:var(--text-muted);">"${Safe.html(query)}"</p>
            <button class="btn btn-primary" onclick="App.navigate('categories')">${Safe.html(t_explore)}</button>
          </div>
        </div>`;
    }

    const cards = await Promise.all(filtered.map(r => Render.recipeCard(r)));
    return `
      <div class="container">
        <h2 class="section-title">🔍 ${filtered.length} ${Safe.html(t_results)} — "${Safe.html(query)}"</h2>
        ${filterBar}
        <div class="recipe-grid">${cards.join('')}</div>
      </div>`;
  },

  recipeDetail: async (r) => {
    const stepsRaw = Instructions.parse(r.strInstructions);
    const [tName, tCategory, tArea] = await Translator.all(r.strMeal, r.strCategory || '', r.strArea || '');
    const t_ing = T('ingredients'), t_prep = T('preparation'), t_start = T('start_cooking'),
      t_share = T('share'), t_servings = T('servings'), t_source = T('source'),
      t_print = T('print'), t_rating = T('your_rating'), t_addAll = T('add_all'),
      t_addPlan = T('add_to_plan');

    const steps = await Promise.all(stepsRaw.map(s => Translator.t(s)));
    const isFav = state.favorites.some(f => f.idMeal === r.idMeal);
    const rating = Ratings.get(r.idMeal);

    const tagBadges = r.strTags
      ? (await Promise.all(r.strTags.split(',').slice(0, 2).map(tag => Translator.t(tag.trim()))))
          .map(t => `<span class="detail-badge">#${Safe.html(t)}</span>`).join('')
      : '';

    const stars = Array.from({ length: 5 }, (_, i) =>
      `<button class="star-btn ${i < rating ? 'active' : ''}" onclick="Actions.rateRecipe('${r.idMeal}', ${i + 1})">★</button>`
    ).join('');

    const youtubeBtn = r.strYoutube
      ? `<a href="${Safe.attr(r.strYoutube)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex:1; justify-content:center;">▶️ YouTube</a>`
      : '';
    const sourceBtn = r.strSource
      ? `<a href="${Safe.attr(r.strSource)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex:1; justify-content:center;">🔗 ${Safe.html(t_source)}</a>`
      : '';

    return `
      <div class="page-enter">
        <div class="recipe-hero">
          <img src="${Safe.attr(r.strMealThumb)}" class="hero-img" alt="${Safe.attr(tName)}" loading="eager" decoding="async" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2280%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍽️%3C/text%3E%3C/svg%3E'">
          <div class="hero-overlay"></div>
          <button class="hero-fav-btn ${isFav ? 'active' : ''}" onclick="Actions.toggleFavorite('${r.idMeal}')">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="detail-content">
          <div class="detail-card">
            <div class="detail-header">
              <h1>${Safe.html(tName)}</h1>
              <div class="detail-badges">
                ${tCategory ? `<span class="detail-badge">🥗 ${Safe.html(tCategory)}</span>` : ''}
                ${tArea     ? `<span class="detail-badge">📍 ${Safe.html(tArea)}</span>`     : ''}
                ${r._readyIn ? `<span class="detail-badge">⏱️ ${r._readyIn} min</span>` : ''}
                ${tagBadges}
              </div>
              ${r._calories ? `
              <div class="nutrition-strip">
                <div class="nutr-item"><span class="nutr-val">${r._calories}</span><span class="nutr-lbl">kcal</span></div>
                ${r._protein != null ? `<div class="nutr-item"><span class="nutr-val">${Math.round(r._protein)}g</span><span class="nutr-lbl">${T('protein') || 'Protein'}</span></div>` : ''}
                ${r._carbs  != null ? `<div class="nutr-item"><span class="nutr-val">${Math.round(r._carbs)}g</span><span class="nutr-lbl">${T('carbs') || 'Carbs'}</span></div>` : ''}
                ${r._fat    != null ? `<div class="nutr-item"><span class="nutr-val">${Math.round(r._fat)}g</span><span class="nutr-lbl">${T('fat') || 'Fat'}</span></div>` : ''}
              </div>` : ''}
              <div class="star-rating" title="${Safe.attr(t_rating)}">${stars}</div>
              <div class="serving-control">
                <span class="serving-label">${Safe.html(t_servings)}</span>
                <div class="serving-counter">
                  <button class="serving-btn" onclick="Actions.changeServings(-1)">−</button>
                  <span id="serving-count">${state.servings}</span>
                  <button class="serving-btn" onclick="Actions.changeServings(1)">+</button>
                </div>
              </div>
              <div class="recipe-actions-wrap">
                <button class="btn btn-cook-main" onclick="Actions.startCookingFromState()">
                  🚀 ${Safe.html(t_start)}
                </button>
                <button class="btn btn-more-toggle" onclick="Actions.toggleActionsDrawer()" aria-label="More options">
                  <span class="more-dots">•••</span>
                </button>
              </div>
              <div class="actions-drawer" id="recipe-actions-drawer">
                <div class="actions-drawer-grid">
                  <button class="drawer-action-btn" onclick="Actions.shareRecipe('${r.idMeal}')">
                    <span class="drawer-icon">📤</span>
                    <span>${Safe.html(t_share)}</span>
                  </button>
                  <button class="drawer-action-btn no-print" onclick="window.print()">
                    <span class="drawer-icon">🖨️</span>
                    <span>${Safe.html(t_print)}</span>
                  </button>
                  <button class="drawer-action-btn" onclick="Actions.openAddToPlanner('${r.idMeal}')">
                    <span class="drawer-icon">📅</span>
                    <span>${Safe.html(t_addPlan)}</span>
                  </button>
                  ${r.strYoutube ? `<a href="${Safe.attr(r.strYoutube)}" target="_blank" rel="noopener noreferrer" class="drawer-action-btn">
                    <span class="drawer-icon">▶️</span>
                    <span>YouTube</span>
                  </a>` : `<span></span>`}
                </div>
              </div>
            </div>

            <div class="ing-section-header">
              <h2 class="section-title" style="margin:0;">🛒 ${Safe.html(t_ing)}</h2>
              <button class="btn btn-ghost add-all-btn" onclick="Actions.addAllIngToShopping('${r.idMeal}')">
                🛒 ${Safe.html(t_addAll)}
              </button>
            </div>
            <div id="dynamic-ingredients"></div>

            <h2 class="section-title">👨‍🍳 ${Safe.html(t_prep)}</h2>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${steps.map((s, i) => `
                <div class="step-card">
                  <span class="step-num">${i + 1}</span>
                  <p>${Safe.html(s)}</p>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  },

  login: () => `
    <div class="auth-page">
      <div class="auth-card">
        <img src="logo.svg" class="auth-logo" alt="Walkart">
        <h2 class="auth-title">${T('connexion')}</h2>
        <p class="auth-sub">${T('login_access')}</p>
        <div id="auth-error" class="auth-error" style="display:none;"></div>
        <div class="form-group">
          <label class="form-label">${T('email')}</label>
          <input type="email" id="auth-email" class="form-input" placeholder="${T('email_placeholder')}" autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label">${T('password')}</label>
          <input type="password" id="auth-password" class="form-input" placeholder="••••••••" autocomplete="current-password">
        </div>
        <button class="btn btn-primary btn-full" id="login-btn" onclick="Actions.doLogin()">🔐 ${T('btn_login')}</button>
        <div class="auth-divider">${T('or')}</div>
        <button class="btn btn-secondary btn-full" onclick="App.navigate('register')">✉️ ${T('create_account')}</button>
      </div>
    </div>`,

  register: () => `
    <div class="auth-page">
      <div class="auth-card">
        <img src="logo.svg" class="auth-logo" alt="Walkart">
        <h2 class="auth-title">${T('create_account')}</h2>
        <p class="auth-sub">${T('register_access')}</p>
        <div id="auth-error" class="auth-error" style="display:none;"></div>
        <div id="auth-success" class="auth-success" style="display:none;"></div>
        <div class="form-group">
          <label class="form-label">${T('full_name')}</label>
          <input type="text" id="auth-name" class="form-input" placeholder="${T('full_name_placeholder')}" autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label">${T('email')}</label>
          <input type="email" id="auth-email" class="form-input" placeholder="${T('email_placeholder')}" autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label">${T('password')}</label>
          <input type="password" id="auth-password" class="form-input" placeholder="••••••••" autocomplete="new-password">
        </div>
        <button class="btn btn-primary btn-full" onclick="Actions.doRegister()">🚀 ${T('btn_register')}</button>
        <div class="auth-divider">${T('or')}</div>
        <button class="btn btn-secondary btn-full" onclick="App.navigate('login')">🔐 ${T('already_account')}</button>
      </div>
    </div>`,

  profileSetup: () => {
    const p = currentProfile || {};
    return `
    <div class="auth-page">
      <div class="auth-card" style="max-width:520px;">
        <h2 class="auth-title">🎯 ${T('my_goal')}</h2>
        <p class="auth-sub">${T('profile_hint')}</p>
        <div id="profile-error" class="auth-error" style="display:none;"></div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${T('age')}</label>
            <input type="number" id="p-age" class="form-input" placeholder="25" min="10" max="100" value="${p.age||''}">
          </div>
          <div class="form-group">
            <label class="form-label">${T('gender_label')}</label>
            <select id="p-gender" class="form-input">
              <option value="">--</option>
              <option value="male" ${p.gender==='male'?'selected':''}>${T('male')}</option>
              <option value="female" ${p.gender==='female'?'selected':''}>${T('female')}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${T('weight')}</label>
            <input type="number" id="p-weight" class="form-input" placeholder="70" min="20" max="300" step="0.1" value="${p.weight_kg||''}">
          </div>
          <div class="form-group">
            <label class="form-label">${T('height')}</label>
            <input type="number" id="p-height" class="form-input" placeholder="175" min="50" max="250" value="${p.height_cm||''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${T('activity_label')}</label>
          <select id="p-activity" class="form-input">
            <option value="sedentary"   ${p.activity_level==='sedentary'  ?'selected':''}>${T('act_sedentary')}</option>
            <option value="light"       ${p.activity_level==='light'      ?'selected':''}>${T('act_light')}</option>
            <option value="moderate"    ${p.activity_level==='moderate'   ?'selected':''}>${T('act_moderate')}</option>
            <option value="active"      ${p.activity_level==='active'     ?'selected':''}>${T('act_active')}</option>
            <option value="very_active" ${p.activity_level==='very_active'?'selected':''}>${T('act_very_active')}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">${T('goal_label')}</label>
          <div class="goal-grid">
            ${[
              ['lose_weight',  '🔥', T('goal_lose_label'),    T('goal_lose_sub')],
              ['maintain',     '⚖️', T('goal_maintain_label'), T('goal_maintain_sub')],
              ['gain_weight',  '📈', T('goal_gain_label'),    T('goal_gain_sub')],
              ['gain_muscle',  '💪', T('goal_muscle_label'),  T('goal_muscle_sub')]
            ].map(([val, icon, label, sub]) => `
              <div class="goal-card ${p.goal===val?'active':''}" onclick="Actions.selectGoal('${val}')">
                <span class="goal-icon">${icon}</span>
                <span class="goal-label">${label}</span>
                <span class="goal-sub">${sub}</span>
              </div>`).join('')}
          </div>
          <input type="hidden" id="p-goal" value="${p.goal||'maintain'}">
        </div>

        <button class="btn btn-primary btn-full" onclick="Actions.saveProfile()" style="margin-top:8px;">
          💾 ${T('save_and_menu')}
        </button>
      </div>
    </div>`;
  },

  profile: async () => {
    if (!currentUser) return Render.login();
    const p = currentProfile;
    const name = p?.full_name || currentUser.email?.split('@')[0] || 'Utilisateur';
    return `
    <div class="container" style="padding:32px 20px; max-width:600px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:32px;">
        <div style="width:80px; height:80px; border-radius:50%; background:var(--primary); color:#fff; font-size:2rem; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
          ${name.charAt(0).toUpperCase()}
        </div>
        <h2 style="font-size:1.6rem;">${Safe.html(name)}</h2>
        <p style="color:var(--text-muted);">${Safe.html(currentUser.email)}</p>
      </div>

      ${p?.daily_calories ? `
      <div class="profile-stats-grid">
        <div class="profile-stat-card">
          <span class="profile-stat-icon">🔥</span>
          <span class="profile-stat-val">${p.daily_calories}</span>
          <span class="profile-stat-lbl">${T('kcal_per_day')}</span>
        </div>
        <div class="profile-stat-card">
          <span class="profile-stat-icon">🥩</span>
          <span class="profile-stat-val">${p.daily_protein}g</span>
          <span class="profile-stat-lbl">${T('protein_per_day')}</span>
        </div>
        <div class="profile-stat-card">
          <span class="profile-stat-icon">⚖️</span>
          <span class="profile-stat-val">${p.weight_kg}kg</span>
          <span class="profile-stat-lbl">${T('current_weight')}</span>
        </div>
        <div class="profile-stat-card">
          <span class="profile-stat-icon">🎯</span>
          <span class="profile-stat-val" style="font-size:0.9rem;">${Nutrition.goalLabel(p.goal)}</span>
          <span class="profile-stat-lbl">${T('objective')}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-full" onclick="App.navigate('my-menu')" style="margin:20px 0 8px;">
        📅 ${T('view_my_menu')}
      </button>` : `
      <div style="text-align:center; padding:24px; background:var(--surface); border-radius:16px; margin-bottom:20px;">
        <p style="font-size:1.1rem; margin-bottom:16px;">${T('complete_profile')}</p>
        <button class="btn btn-primary" onclick="App.navigate('profile-setup')">🎯 ${T('set_goal')}</button>
      </div>`}

      <button class="btn btn-secondary btn-full" onclick="App.navigate('profile-setup')">✏️ ${T('edit_profile')}</button>
      <button class="btn btn-ghost btn-full" onclick="Actions.doLogout()" style="margin-top:8px; color:#e53935;">🚪 ${T('logout_btn')}</button>
    </div>`;
  },

  myMenu: async () => {
    if (!currentUser) return Render.login();
    if (!currentProfile?.goal) return Render.profileSetup();
    const p = currentProfile;
    const meals = await API.getBatch(21);
    const targetCal = p.daily_calories || 2000;
    const mealCal = Math.round(targetCal / 3);
    const days = [T('day_0'),T('day_1'),T('day_2'),T('day_3'),T('day_4'),T('day_5'),T('day_6')];
    const slots = [T('meal_breakfast'),T('meal_lunch'),T('meal_dinner')];
    let html = `
      <div class="container" style="padding:24px 16px;">
        <div style="text-align:center; margin-bottom:24px;">
          <h2 style="font-size:1.6rem;">📅 ${T('my_menu_title')}</h2>
          <p style="color:var(--text-muted);">${Nutrition.goalLabel(p.goal)} · ${targetCal} kcal/jour · ${p.daily_protein}g protéines</p>
        </div>`;
    days.forEach((day, di) => {
      html += `<div class="menu-day-card"><div class="menu-day-header">${day}</div><div class="menu-slots">`;
      slots.forEach((slot, si) => {
        const meal = meals[di * 3 + si];
        if (meal) {
          html += `
            <div class="menu-slot" onclick="App.navigate('recipe',{id:'${meal.idMeal}'})">
              <img src="${Safe.attr(meal.strMealThumb)}" class="menu-slot-img" loading="lazy">
              <div class="menu-slot-info">
                <span class="menu-slot-label">${slot}</span>
                <span class="menu-slot-title">${Safe.html(meal.strMeal)}</span>
                <span class="menu-slot-cal">~${mealCal} kcal</span>
              </div>
            </div>`;
        }
      });
      html += `</div></div>`;
    });
    html += `
        <button class="btn btn-primary btn-full" onclick="Render.myMenu().then(h=>{document.getElementById('app-root').innerHTML=h})" style="margin-top:24px;">
          🔄 ${T('new_menu')}
        </button>
      </div>`;
    return html;
  },

  privacy: () => `
    <div class="container" style="padding:40px 20px; max-width:800px; margin:0 auto;">
      <button class="btn btn-ghost" onclick="App.goBack()" style="margin-bottom:24px;">${T('btn_back')}</button>
      <h1 style="font-size:1.8rem; margin-bottom:8px;">🔒 ${T('privacy_title')}</h1>
      <p style="color:var(--text-muted); margin-bottom:32px;">${T('privacy_updated')} : ${new Date().toLocaleDateString(state.lang === 'ar' ? 'ar-SA' : state.lang === 'ja' ? 'ja-JP' : state.lang === 'fr' ? 'fr-FR' : 'en-US', {year:'numeric',month:'long',day:'numeric'})}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s1_title')}</h2>
      <p>${T('privacy_s1_body')}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s2_title')}</h2>
      <p>${T('privacy_s2_body')} <a href="https://www.google.com/settings/ads" target="_blank" style="color:var(--primary);">Google Ads Settings</a>.</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s3_title')}</h2>
      <p>${T('privacy_s3_body')}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s4_title')}</h2>
      <p>${T('privacy_s4_body')}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s5_title')}</h2>
      <p>${T('privacy_s5_body')}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('privacy_s6_title')}</h2>
      <p>${T('privacy_s6_body')} <a href="mailto:contact@walkart.us" style="color:var(--primary);">contact@walkart.us</a></p>
    </div>`,

  about: () => `
    <div class="container" style="padding:40px 20px; max-width:800px; margin:0 auto;">
      <button class="btn btn-ghost" onclick="App.goBack()" style="margin-bottom:24px;">${T('btn_back')}</button>
      <div style="text-align:center; margin-bottom:40px;">
        <img src="logo.svg" alt="Walkart" style="width:80px; border-radius:20px; margin-bottom:16px;">
        <h1 style="font-size:2rem;">Walkart</h1>
        <p style="color:var(--text-muted); font-size:1.1rem;">${T('about_tagline')}</p>
      </div>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('about_mission_title')}</h2>
      <p>${T('about_mission_body')}</p>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('about_features_title')}</h2>
      <ul style="line-height:2; padding-left:20px;">
        <li>${T('about_feature_1')}</li>
        <li>${T('about_feature_2')}</li>
        <li>${T('about_feature_3')}</li>
        <li>${T('about_feature_4')}</li>
        <li>${T('about_feature_5')}</li>
        <li>${T('about_feature_6')}</li>
      </ul>

      <h2 style="font-size:1.2rem; margin:24px 0 8px;">${T('about_contact_title')}</h2>
      <p>${T('about_contact_body')}</p>
      <a href="mailto:contact@walkart.us" style="display:inline-block; margin-top:8px; padding:12px 24px; background:var(--primary); color:#fff; border-radius:8px; font-weight:700; text-decoration:none;">✉️ contact@walkart.us</a>

      <div style="margin-top:48px; padding:20px; background:var(--surface); border-radius:12px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
        <p>${T('footer_copyright')} · <a onclick="App.navigate('privacy')" style="color:var(--primary); cursor:pointer;">${T('privacy_title')}</a></p>
      </div>
    </div>`,

  updateIngredientsList: async () => {
    const r = state.currentRecipe;
    if (!r) return;
    const factor = state.servings / (r._servings || 4);
    let html = '';

    if (r._spoon && r._spoonIngredients?.length) {
      for (const ing of r._spoonIngredients) {
        const tn = await Translator.t(ing.name);
        const scaledAmt = ing.amount ? Scale.scaleNum(ing.amount, factor) : '';
        const measure = scaledAmt ? `${scaledAmt} ${ing.unit || ''}`.trim() : (ing.original || '');
        const img = `https://spoonacular.com/cdn/ingredients_100x100/${encodeURIComponent(ing.name.toLowerCase().replace(/\s+/g,'-'))}.jpg`;
        html += `
          <div class="ingredient-row">
            <div style="display:flex; align-items:center; gap:15px;">
              <div class="ing-img-wrap">
                <img src="${Safe.attr(img)}" style="width:40px; height:40px; object-fit:contain;" loading="lazy" decoding="async" alt="${Safe.attr(tn)}" onerror="this.style.display='none'">
              </div>
              <div>
                <p style="font-weight:700; margin:0; font-size:1rem;">${Safe.html(tn)}</p>
                <p style="color:var(--text-muted); margin:0; font-size:0.85rem;">${Safe.html(measure || '–')}</p>
              </div>
            </div>
            <button class="btn add-ing-btn"
              data-name="${Safe.attr(tn)}"
              data-measure="${Safe.attr(measure)}"
              onclick="Actions.addIngToShopping(this)">+</button>
          </div>`;
      }
    } else {
      for (let i = 1; i <= 20; i++) {
        const n = r[`strIngredient${i}`], m = r[`strMeasure${i}`];
        if (n?.trim()) {
          const tn = await Translator.t(n);
          const scaledM = Scale.scale(m, factor);
          const tm = scaledM ? await Translator.t(scaledM) : '';
          const img = `https://www.themealdb.com/images/ingredients/${encodeURIComponent(n)}-small.png`;
          html += `
            <div class="ingredient-row">
              <div style="display:flex; align-items:center; gap:15px;">
                <div class="ing-img-wrap">
                  <img src="${Safe.attr(img)}" style="width:40px; height:40px; object-fit:contain;" loading="lazy" decoding="async" alt="${Safe.attr(tn)}">
                </div>
                <div>
                  <p style="font-weight:700; margin:0; font-size:1rem;">${Safe.html(tn)}</p>
                  <p style="color:var(--text-muted); margin:0; font-size:0.85rem;">${Safe.html(tm || '–')}</p>
                </div>
              </div>
              <button class="btn add-ing-btn"
                data-name="${Safe.attr(tn)}"
                data-measure="${Safe.attr(tm)}"
                onclick="Actions.addIngToShopping(this)">+</button>
            </div>`;
        }
      }
    }
    const el = document.getElementById('dynamic-ingredients');
    if (el) el.innerHTML = html;
  },

  shopping: async () => {
    const t_title = T('shopping_title'), t_empty = T('no_items'), t_clear = T('clear_all'),
      t_add_hint = T('shopping_hint'), t_discover = T('discover_recipes'), t_done = T('done'),
      t_add_item = T('add_item_placeholder'), t_qty = T('qty'),
      t_share_list = T('share_list'), t_clear_done = T('clear_done');

    const addForm = `
      <div class="shopping-add-form">
        <input type="text" id="shop-add-name" class="shop-add-input search-input" placeholder="${Safe.attr(t_add_item)}"
          onkeydown="if(event.key==='Enter') Actions.addManualItem()">
        <input type="text" id="shop-add-qty" class="shop-add-qty search-input" placeholder="${Safe.attr(t_qty)}"
          onkeydown="if(event.key==='Enter') Actions.addManualItem()">
        <button onclick="Actions.addManualItem()" class="btn btn-primary shop-add-btn">+</button>
      </div>`;

    if (!state.shoppingList.length) {
      return `
        <div class="container">
          ${addForm}
          <div class="error-state">
            <div class="error-icon">🛒</div>
            <h2>${Safe.html(t_empty)}</h2>
            <p>${Safe.html(t_add_hint)}</p>
            <button class="btn btn-primary" onclick="App.navigate('home')">${Safe.html(t_discover)}</button>
          </div>
        </div>`;
    }

    const done = state.shoppingList.filter(i => i.done).length;
    const pct = Math.round((done / state.shoppingList.length) * 100);
    const items = state.shoppingList.map(i => `
      <div class="ingredient-row shopping-item ${i.done ? 'done' : ''}" onclick="Actions.toggleShoppingDone(${i.id})">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="check-circle ${i.done ? 'checked' : ''}">✓</div>
          <span><b>${Safe.html(i.name)}</b>${i.measure ? ` <small style="color:var(--text-muted)">(${Safe.html(i.measure)})</small>` : ''}</span>
        </div>
        <button class="btn" style="background:rgba(239,68,68,0.1); color:#ef4444; padding:8px 12px; min-width:auto;"
          onclick="event.stopPropagation(); Actions.removeShopping(${i.id})">✕</button>
      </div>`).join('');

    return `
      <div class="container">
        <div class="shopping-header">
          <h1>${Safe.html(t_title)}</h1>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-ghost" onclick="Actions.shareShoppingList()" style="font-size:0.85rem;">📤</button>
            ${done > 0 ? `<button class="btn btn-ghost" onclick="Actions.clearDoneItems()" style="font-size:0.85rem;">✓ ${Safe.html(t_clear_done)}</button>` : ''}
            <button class="btn btn-ghost" onclick="Actions.clearShopping()">${Safe.html(t_clear)}</button>
          </div>
        </div>
        ${addForm}
        <div class="shopping-progress">
          <div class="shopping-progress-bar" style="width:${pct}%"></div>
        </div>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">${done}/${state.shoppingList.length} ${Safe.html(t_done)}</p>
        ${items}
      </div>`;
  },

  categories: async () => {
    const t_cat = T('section_categories');
    const cats = await Promise.all(state.categories.map(async c => {
      const t = await Translator.t(c.strCategory);
      return `
        <div class="recipe-card" onclick="App.navigate('category', {c:'${Safe.attr(c.strCategory)}'})">
          <img src="${Safe.attr(c.strCategoryThumb)}" style="width:100%; border-radius:20px; aspect-ratio:1/1; object-fit:contain; background:var(--bg);" loading="lazy" decoding="async" alt="${Safe.attr(t)}">
          <h3 style="text-align:center; margin-top:10px; font-size:1.1rem; padding:0 15px 15px;">${Safe.html(t)}</h3>
        </div>`;
    }));
    return `<div class="container"><h2 class="section-title">${Safe.html(t_cat)}</h2><div class="recipe-grid">${cats.join('')}</div></div>`;
  },

  categoryPage: async (category, meals) => {
    const t_cat = await Translator.t(category), t_back = T('back');
    // Show ALL recipes for this category
    const augmented = meals.map(m => ({ ...m, strCategory: category }));
    augmented.forEach(m => RecipeStore.set(m.idMeal, m));
    const cards = await Promise.all(augmented.map(r => Render.recipeCard(r)));
    return `
      <div class="container page-enter">
        <button class="btn btn-ghost" onclick="App.navigate('categories')" style="margin-bottom:16px;">${Safe.html(t_back)}</button>
        <h2 class="section-title">🥗 ${Safe.html(t_cat)}
          <span style="color:var(--text-muted); font-size:1rem; font-weight:500; margin-left:8px;">(${meals.length})</span>
        </h2>
        <div class="recipe-grid">${cards.join('')}</div>
      </div>`;
  },

  areaPage: async (area, meals) => {
    const tArea = await Translator.t(area);
    const t_back = T('back'), t_cuisine = T('cuisine'),
      t_empty = T('no_cuisine_recipes'), t_explore = T('explore_cuisines');

    if (!meals?.length) {
      return `
        <div class="container page-enter">
          <button class="btn btn-ghost" onclick="history.back()" style="margin-bottom:16px;">${Safe.html(t_back)}</button>
          <h2 class="section-title">${getFlag(area, 'flag-img flag-section')} ${Safe.html(tArea)} ${Safe.html(t_cuisine)}</h2>
          <div class="error-state">
            <div class="error-icon">${getFlag(area, 'flag-img flag-lg')}</div>
            <p style="color:var(--text-muted); text-align:center;">${Safe.html(t_empty)}</p>
            <button class="btn btn-primary" onclick="App.navigate('home')">${Safe.html(t_explore)}</button>
          </div>
        </div>`;
    }

    // Show ALL available recipes for this cuisine (no limit)
    const augmented = meals.map(m => ({ ...m, strArea: area }));
    augmented.forEach(m => RecipeStore.set(m.idMeal, m));
    const cards = await Promise.all(augmented.map(r => Render.recipeCard(r)));
    return `
      <div class="container page-enter">
        <button class="btn btn-ghost" onclick="history.back()" style="margin-bottom:16px;">${Safe.html(t_back)}</button>
        <h2 class="section-title" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          ${getFlag(area, 'flag-img flag-section')} ${Safe.html(tArea)} ${Safe.html(t_cuisine)}
          <span style="color:var(--text-muted); font-size:1rem; font-weight:500;">(${meals.length})</span>
        </h2>
        <div class="recipe-grid">${cards.join('')}</div>
      </div>`;
  },

  favorites: async () => {
    const [t_title, t_empty, t_hint, t_explore] = await Translator.all(
      'My Favorites', 'No favorites yet', 'Tap ❤️ on a recipe to save it.', 'Explore'
    );
    if (!state.favorites.length) {
      return `
        <div class="container error-state">
          <div class="error-icon">❤️</div>
          <h2>${Safe.html(t_empty)}</h2>
          <p>${Safe.html(t_hint)}</p>
          <button class="btn btn-primary" onclick="App.navigate('home')">${Safe.html(t_explore)}</button>
        </div>`;
    }
    const cards = await Promise.all(state.favorites.map(r => Render.recipeCard(r)));
    return `
      <div class="container">
        <h2 class="section-title">❤️ ${Safe.html(t_title)} <span style="color:var(--text-muted); font-size:1.2rem;">(${state.favorites.length})</span></h2>
        <div class="recipe-grid">${cards.join('')}</div>
      </div>`;
  },

  planner: async () => {
    const weekDates = Planner.getWeekDates(state.plannerWeekOffset);
    const plannerData = Planner.get();
    const today = new Date().toISOString().split('T')[0];
    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [t_plan, t_today, t_br, t_lu, t_di, t_tip, t_thisWeek, t_prev, t_next, ...translatedDays] = await Translator.all(
      'Meal Plan', 'Today', 'Breakfast', 'Lunch', 'Dinner',
      'Click + to add a meal for each slot',
      'This week', '← Prev', 'Next →',
      ...dayKeys
    );

    const slotLabels = { breakfast: t_br, lunch: t_lu, dinner: t_di };
    const slotIcons  = { breakfast: '🌅', lunch: '🌞', dinner: '🌙' };

    const dayCols = weekDates.map((date, i) => {
      const isToday = date === today;
      const dayData = plannerData[date] || {};
      const dateObj = new Date(date + 'T12:00:00');
      const dayNum = dateObj.getDate();
      const monthShort = dateObj.toLocaleDateString('fr-FR', { month: 'short' });

      const slots = ['breakfast', 'lunch', 'dinner'].map(slot => {
        const meal = dayData[slot];
        return meal
          ? `<div class="planner-slot filled" onclick="Actions.removePlannerMeal('${date}', '${slot}')">
               <img src="${Safe.attr(meal.strMealThumb)}" loading="lazy" decoding="async" alt="${Safe.attr(meal.strMeal)}">
               <span class="planner-meal-name">${Safe.html(meal.strMeal)}</span>
               <span class="planner-remove">✕</span>
             </div>`
          : `<div class="planner-slot empty" onclick="Actions.openPlannerPick('${date}', '${slot}')">
               <span class="planner-slot-icon">${slotIcons[slot]}</span>
               <span class="planner-slot-label">${Safe.html(slotLabels[slot])}</span>
               <span class="planner-add">+</span>
             </div>`;
      }).join('');

      return `
        <div class="planner-day ${isToday ? 'today' : ''}">
          <div class="planner-day-header">
            <span class="planner-day-name">${Safe.html(translatedDays[i])}</span>
            <span class="planner-day-date">${dayNum} ${monthShort}</span>
            ${isToday ? `<span class="planner-today-badge">${Safe.html(t_today)}</span>` : ''}
          </div>
          ${slots}
        </div>`;
    }).join('');

    const weekLabel = (() => {
      const start = new Date(weekDates[0] + 'T12:00:00');
      const end = new Date(weekDates[6] + 'T12:00:00');
      const fmt = d => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      return `${fmt(start)} – ${fmt(end)}`;
    })();

    return `
      <div class="container">
        <h2 class="section-title">📅 ${Safe.html(t_plan)}</h2>
        <div class="planner-week-nav">
          <button class="btn btn-ghost planner-nav-btn" onclick="Actions.plannerPrevWeek()">‹</button>
          <div class="planner-week-label">
            <span>${weekLabel}</span>
            ${state.plannerWeekOffset !== 0 ? `<button class="btn btn-ghost" style="font-size:0.75rem; padding:4px 10px;" onclick="Actions.plannerGoToday()">${Safe.html(t_thisWeek)}</button>` : ''}
          </div>
          <button class="btn btn-ghost planner-nav-btn" onclick="Actions.plannerNextWeek()">›</button>
        </div>
        <p style="color:var(--text-muted); font-size:0.85rem; margin:0 0 20px;">${Safe.html(t_tip)}</p>
        <div class="planner-scroll"><div class="planner-grid">${dayCols}</div></div>
      </div>`;
  },

  plannerPickModal: async (searchQuery = '') => {
    const modal = document.getElementById('planner-pick-modal');
    if (!modal) return;
    const recipes = searchQuery.trim()
      ? await API.search(searchQuery)
      : (RecentlyViewed.get().length ? RecentlyViewed.get() : state.collections.popular);

    const [t_pick, t_search] = await Translator.all('Choose a recipe', 'Search a recipe...');

    const grid = recipes.slice(0, 9).map(r => {
      RecipeStore.set(r.idMeal, r);
      return `
        <div class="planner-pick-item" onclick="Actions.plannerPickRecipe('${r.idMeal}')">
          <img src="${Safe.attr(r.strMealThumb)}" loading="lazy" decoding="async" alt="${Safe.attr(r.strMeal)}">
          <span>${Safe.html(r.strMeal)}</span>
        </div>`;
    }).join('');

    modal.innerHTML = `
      <div class="planner-modal-overlay" onclick="if(event.target===this)Actions.closePlannerPick()">
        <div class="planner-modal-content">
          <div class="planner-modal-header">
            <h3>${Safe.html(t_pick)}</h3>
            <button class="btn btn-ghost" onclick="Actions.closePlannerPick()">✕</button>
          </div>
          <input type="text" class="search-input" placeholder="${Safe.attr(t_search)}"
            value="${Safe.attr(searchQuery)}"
            oninput="Actions.plannerSearch(this.value)"
            style="width:100%; margin-bottom:16px;">
          <div class="planner-pick-grid" id="planner-pick-grid">${grid}</div>
        </div>
      </div>`;
    modal.classList.add('active');
    setTimeout(() => modal.querySelector('input')?.focus(), 100);
  },

  updatePlannerPickGrid: (recipes) => {
    const grid = document.getElementById('planner-pick-grid');
    if (!grid) return;
    grid.innerHTML = recipes.slice(0, 9).map(r => {
      RecipeStore.set(r.idMeal, r);
      return `
        <div class="planner-pick-item" onclick="Actions.plannerPickRecipe('${r.idMeal}')">
          <img src="${Safe.attr(r.strMealThumb)}" loading="lazy" decoding="async" alt="${Safe.attr(r.strMeal)}">
          <span>${Safe.html(r.strMeal)}</span>
        </div>`;
    }).join('') || '<p style="text-align:center; color:var(--text-muted); padding:20px;">No results</p>';
  },

  updateCookingMode: async () => {
    const o = document.getElementById('cooking-mode-overlay');
    if (!o) return;
    const s = state.currentRecipeInstructions[state.currentStepIndex];
    const [translatedStep, t_back, t_next, t_finish, t_step, t_timer, recipeName] = await Translator.all(
      s, 'Back', 'Next', 'Finish', 'Step', 'Timer', state.currentRecipeName
    );
    const timerMin = Math.floor(state.cookingTimerSeconds / 60);
    const timerSec = String(state.cookingTimerSeconds % 60).padStart(2, '0');
    const isLast = state.currentStepIndex >= state.currentRecipeInstructions.length - 1;
    const pct = Math.round(((state.currentStepIndex + 1) / state.currentRecipeInstructions.length) * 100);
    const presetBtns = [3, 5, 10, 15, 30].map(m =>
      `<button class="timer-preset-btn ${state.cookingTimerSeconds === m * 60 ? 'active' : ''}" onclick="Actions.timerSetPreset(${m * 60})">${m}m</button>`
    ).join('');

    o.innerHTML = `
      <div class="cooking-container">
        <div class="cooking-header">
          <button class="btn btn-ghost cooking-close-btn" onclick="Actions.closeCookingMode()">✕</button>
          <div class="cooking-recipe-info">
            ${state.currentRecipeThumb ? `<img src="${Safe.attr(state.currentRecipeThumb)}" class="cooking-recipe-thumb" alt="">` : ''}
            <span class="cooking-recipe-name">${Safe.html(recipeName)}</span>
          </div>
          <span class="cooking-step-count">${state.currentStepIndex + 1}/${state.currentRecipeInstructions.length}</span>
        </div>
        <div class="cooking-progress-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="cooking-pct">${pct}%</span>
        </div>
        <div class="cooking-content">
          <span class="step-badge">${Safe.html(t_step)} ${state.currentStepIndex + 1}</span>
          <h1>${Safe.html(translatedStep)}</h1>
          <p class="swipe-hint">← swipe →</p>
        </div>
        <div class="cooking-timer-section">
          <div class="cooking-timer-label">⏱ ${Safe.html(t_timer)}</div>
          <div class="cooking-timer-display ${state.cookingTimerSeconds === 0 ? 'done' : ''}" id="cooking-timer-display">
            ${timerMin}:${timerSec}
          </div>
          <div class="timer-presets">${presetBtns}</div>
          <div class="cooking-timer-controls">
            <button class="timer-ctrl-btn" onclick="Actions.timerAdjust(-60)">−1m</button>
            <button class="timer-ctrl-btn timer-play" onclick="Actions.timerToggle()">${state.cookingTimerRunning ? '⏸' : '▶'}</button>
            <button class="timer-ctrl-btn" onclick="Actions.timerAdjust(60)">+1m</button>
            <button class="timer-ctrl-btn" onclick="Actions.timerReset()">↺</button>
          </div>
        </div>
        <div class="cooking-footer">
          <button class="btn btn-secondary"
            onclick="if(state.currentStepIndex>0){state.currentStepIndex--;Render.updateCookingMode()}"
            ${state.currentStepIndex === 0 ? 'disabled' : ''}>${Safe.html(t_back)}</button>
          <button class="btn btn-primary"
            onclick="${isLast ? 'Actions.closeCookingMode()' : 'state.currentStepIndex++;Render.updateCookingMode()'}">
            ${isLast ? `${Safe.html(t_finish)} 🎉` : `${Safe.html(t_next)} →`}
          </button>
        </div>
      </div>`;
  }
};

// ---- ACTIONS ----
const Actions = {
  addToShopping: async (n, m) => {
    state.shoppingList.push({ id: Date.now(), name: n, measure: m, done: false });
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    const msg = await Translator.t('added to shopping');
    Toast.show(`✅ ${n} ${msg}`);
  },

  addIngToShopping: async (btn) => {
    await Actions.addToShopping(btn.dataset.name, btn.dataset.measure);
  },

  addManualItem: async () => {
    const nameEl = document.getElementById('shop-add-name');
    const qtyEl = document.getElementById('shop-add-qty');
    const name = nameEl?.value.trim();
    const qty = qtyEl?.value.trim();
    if (!name) { nameEl?.focus(); return; }
    state.shoppingList.push({ id: Date.now(), name, measure: qty, done: false });
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    if (nameEl) nameEl.value = '';
    if (qtyEl) qtyEl.value = '';
    const msg = await Translator.t('added to shopping');
    Toast.show(`✅ ${name} ${msg}`);
    App.navigate('shopping');
  },

  removeShopping: async (id) => {
    const item = state.shoppingList.find(x => x.id === id);
    state.shoppingList = state.shoppingList.filter(x => x.id !== id);
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    App.navigate('shopping');
    if (item) {
      const [del_msg, undo_msg] = await Translator.all('removed', 'Undo');
      Toast.show(`🗑️ ${item.name} ${del_msg}`, 5000, () => {
        state.shoppingList.push(item);
        state.shoppingList.sort((a, b) => a.id - b.id);
        localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
        App.navigate('shopping');
      }, `↩ ${undo_msg}`);
    }
  },

  toggleShoppingDone: (id) => {
    const item = state.shoppingList.find(x => x.id === id);
    if (item) item.done = !item.done;
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    App.navigate('shopping');
  },

  clearShopping: async () => {
    if (!state.shoppingList.length) return;
    const backup = [...state.shoppingList];
    state.shoppingList = [];
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    const [msg, undo_msg] = await Translator.all('List cleared', 'Undo');
    Toast.show(`🗑️ ${msg}`, 5000, () => {
      state.shoppingList = backup;
      localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
      App.navigate('shopping');
    }, `↩ ${undo_msg}`);
    App.navigate('shopping');
  },

  shareShoppingList: async () => {
    const lines = state.shoppingList.map(i => `${i.done ? '✓' : '○'} ${i.name}${i.measure ? ` (${i.measure})` : ''}`);
    const text = lines.join('\n');
    const [t_list, t_copied] = await Translator.all('Shopping List', 'List copied!');
    if (navigator.share) {
      try { await navigator.share({ title: t_list, text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      Toast.show(`🔗 ${t_copied}`);
    } catch { Toast.show(text.slice(0, 100)); }
  },

  toggleFavorite: async (id) => {
    const recipe = RecipeStore.get(id) || state.favorites.find(f => f.idMeal === id);
    if (!recipe) return;
    const idx = state.favorites.findIndex(f => f.idMeal === id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      const msg = await Translator.t('Removed from favorites');
      Toast.show(`💔 ${msg}`);
    } else {
      state.favorites.push({ idMeal: recipe.idMeal, strMeal: recipe.strMeal, strMealThumb: recipe.strMealThumb, strCategory: recipe.strCategory || '', strArea: recipe.strArea || '' });
      const msg = await Translator.t('Added to favorites!');
      Toast.show(`❤️ ${msg}`);
    }
    localStorage.setItem('walkart_favorites', JSON.stringify(state.favorites));
    updateFavBadge();
    document.querySelectorAll('.fav-btn, .hero-fav-btn').forEach(btn => {
      if ((btn.getAttribute('onclick') || '').includes(`'${id}'`)) {
        const isNowFav = state.favorites.some(f => f.idMeal === id);
        btn.textContent = isNowFav ? '❤️' : '🤍';
        btn.classList.toggle('active', isNowFav);
      }
    });
  },

  shareRecipe: async (id) => {
    const recipe = RecipeStore.get(id);
    const name = recipe?.strMeal || id;
    // Always link back to OUR site, never to TheMealDB
    const origin = window.location.origin + window.location.pathname.replace(/\/$/, '');
    const url = `${origin}#recipe/${id}`;
    const [t_try, t_copied] = await Translator.all('Try this recipe:', 'Link copied!');
    if (navigator.share) {
      try { await navigator.share({ title: name, text: `${t_try} ${name}`, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      Toast.show(`🔗 ${t_copied}`);
    } catch { Toast.show(url); }
  },

  surpriseMe: async () => {
    const batch = await API.getBatch(1);
    if (batch.length) App.navigate('recipe', { id: batch[0].idMeal });
  },

  rateRecipe: (id, stars) => {
    Ratings.set(id, stars);
    document.querySelectorAll('.star-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i < stars);
    });
    Toast.show(`⭐ ${stars}/5`);
  },

  setSearchFilter: async (cat) => {
    state.searchFilter = cat;
    const root = document.getElementById('app-root');
    if (!root) return;
    const html = await Render.searchResults(state.searchResults, state.searchQuery || '');
    root.innerHTML = html;
    await Translator.translateUI();
  },

  clearSearchHistory: () => {
    SearchHistory.clear();
    App.navigate('search');
  },

  removeSearchHistory: (q) => {
    SearchHistory.remove(q);
    App.navigate('search');
  },

  openPlannerPick: async (date, slot) => {
    state.plannerPick = { date, slot };
    let modal = document.getElementById('planner-pick-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'planner-pick-modal';
      document.body.appendChild(modal);
    }
    await Render.plannerPickModal();
  },

  closePlannerPick: () => {
    state.plannerPick = null;
    const modal = document.getElementById('planner-pick-modal');
    if (modal) modal.classList.remove('active');
  },

  plannerPickRecipe: (id) => {
    const recipe = RecipeStore.get(id);
    if (!recipe || !state.plannerPick) return;
    const { date, slot } = state.plannerPick;
    Planner.setMeal(date, slot, recipe);
    Actions.closePlannerPick();
    App.navigate('planner');
  },

  plannerSearch: (() => {
    let timer = null;
    return (query) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const results = query.trim()
          ? await API.search(query)
          : (RecentlyViewed.get().length ? RecentlyViewed.get() : state.collections.popular);
        Render.updatePlannerPickGrid(results);
      }, query ? 500 : 0);
    };
  })(),

  removePlannerMeal: async (date, slot) => {
    const backup = Planner.get()?.[date]?.[slot];
    Planner.removeMeal(date, slot);
    App.navigate('planner');
    if (backup) {
      const [msg, undo_msg] = await Translator.all('Removed', 'Undo');
      Toast.show(`🗑️ ${backup.strMeal} ${msg}`, 4000, () => {
        Planner.setMeal(date, slot, backup);
        App.navigate('planner');
      }, `↩ ${undo_msg}`);
    }
  },

  installPWA: async () => {
    if (!_pwaPrompt) return;
    _pwaPrompt.prompt();
    const { outcome } = await _pwaPrompt.userChoice;
    if (outcome === 'accepted') _pwaPrompt = null;
    document.getElementById('pwa-install-btn')?.remove();
  },

  changeServings: (delta) => {
    state.servings = Math.max(1, Math.min(12, state.servings + delta));
    const el = document.getElementById('serving-count');
    if (el) el.textContent = state.servings;
    Render.updateIngredientsList();
  },

  toggleActionsDrawer: () => {
    const drawer = document.getElementById('recipe-actions-drawer');
    if (!drawer) return;
    drawer.classList.toggle('open');
    const btn = document.querySelector('.btn-more-toggle');
    if (btn) btn.classList.toggle('active');
  },

  startCookingFromState: async () => {
    if (!state.currentRecipeInstructions?.length) {
      const msg = await Translator.t('Instructions not available');
      Toast.show(msg); return;
    }
    state.currentStepIndex = 0;
    state.cookingTimerSeconds = 300;
    state.cookingTimerRunning = false;
    clearInterval(state.cookingTimerInterval);
    state.cookingTimerInterval = null;
    let o = document.getElementById('cooking-mode-overlay');
    if (!o) { o = document.createElement('div'); o.id = 'cooking-mode-overlay'; document.body.appendChild(o); }
    o.classList.add('active');
    await Render.updateCookingMode();

    // Wake Lock — keep screen on during cooking
    if ('wakeLock' in navigator) {
      try {
        state._wakeLock = await navigator.wakeLock.request('screen');
        state._wakeLock.addEventListener('release', () => { state._wakeLock = null; });
      } catch {}
    }

    // Swipe gesture (set up once per overlay)
    if (!o._swipeSetup) {
      o._swipeSetup = true;
      let tx = 0, ty = 0;
      o.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      o.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
        if (dx < 0 && state.currentStepIndex < state.currentRecipeInstructions.length - 1) {
          state.currentStepIndex++; Render.updateCookingMode();
        } else if (dx > 0 && state.currentStepIndex > 0) {
          state.currentStepIndex--; Render.updateCookingMode();
        }
      }, { passive: true });
    }
  },

  closeCookingMode: () => {
    clearInterval(state.cookingTimerInterval);
    state.cookingTimerInterval = null;
    state.cookingTimerRunning = false;
    document.getElementById('cooking-mode-overlay')?.classList.remove('active');
    // Release Wake Lock
    if (state._wakeLock) { state._wakeLock.release().catch(() => {}); state._wakeLock = null; }
  },

  timerToggle: () => {
    if (state.cookingTimerRunning) {
      clearInterval(state.cookingTimerInterval);
      state.cookingTimerInterval = null;
      state.cookingTimerRunning = false;
      const btn = document.querySelector('.timer-play');
      if (btn) btn.textContent = '▶';
    } else {
      if (state.cookingTimerSeconds === 0) state.cookingTimerSeconds = 300;
      state.cookingTimerRunning = true;
      const btn = document.querySelector('.timer-play');
      if (btn) btn.textContent = '⏸';
      state.cookingTimerInterval = setInterval(() => {
        if (state.cookingTimerSeconds > 0) {
          state.cookingTimerSeconds--;
          const display = document.getElementById('cooking-timer-display');
          if (display) {
            const min = Math.floor(state.cookingTimerSeconds / 60);
            const sec = String(state.cookingTimerSeconds % 60).padStart(2, '0');
            display.textContent = `${min}:${sec}`;
          }
        } else {
          clearInterval(state.cookingTimerInterval);
          state.cookingTimerInterval = null;
          state.cookingTimerRunning = false;
          if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
          Translator.t('⏰ Timer done!').then(msg => Toast.show(msg, 5000));
          document.getElementById('cooking-timer-display')?.classList.add('done');
          const btn = document.querySelector('.timer-play');
          if (btn) btn.textContent = '▶';
        }
      }, 1000);
    }
  },

  timerAdjust: (seconds) => {
    state.cookingTimerSeconds = Math.max(0, Math.min(3600, state.cookingTimerSeconds + seconds));
    const display = document.getElementById('cooking-timer-display');
    if (display) {
      const min = Math.floor(state.cookingTimerSeconds / 60);
      const sec = String(state.cookingTimerSeconds % 60).padStart(2, '0');
      display.textContent = `${min}:${sec}`;
      display.classList.remove('done');
    }
  },

  timerReset: () => {
    clearInterval(state.cookingTimerInterval);
    state.cookingTimerInterval = null;
    state.cookingTimerRunning = false;
    state.cookingTimerSeconds = 300;
    Render.updateCookingMode();
  },

  timerSetPreset: (seconds) => {
    clearInterval(state.cookingTimerInterval);
    state.cookingTimerInterval = null;
    state.cookingTimerRunning = false;
    state.cookingTimerSeconds = seconds;
    Render.updateCookingMode();
  },

  // ---- ADD ALL INGREDIENTS TO SHOPPING ----
  addAllIngToShopping: async (recipeId) => {
    const r = RecipeStore.get(recipeId) || state.currentRecipe;
    if (!r) return;
    const factor = state.servings / (r._servings || 4);
    let count = 0;
    if (r._spoon && r._spoonIngredients?.length) {
      r._spoonIngredients.forEach((ing, i) => {
        if (ing.name) {
          const scaledAmt = ing.amount ? Scale.scaleNum(ing.amount, factor) : '';
          const measure = scaledAmt ? `${scaledAmt} ${ing.unit || ''}`.trim() : (ing.original || '');
          state.shoppingList.push({ id: Date.now() + i, name: ing.name, measure, done: false });
          count++;
        }
      });
    } else {
      for (let i = 1; i <= 20; i++) {
        const n = r[`strIngredient${i}`], m = r[`strMeasure${i}`];
        if (n?.trim()) {
          const scaledM = Scale.scale(m, factor);
          state.shoppingList.push({ id: Date.now() + i, name: n.trim(), measure: scaledM, done: false });
          count++;
        }
      }
    }
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    const msg = await Translator.t('ingredients added to shopping list');
    Toast.show(`🛒 ${count} ${msg}`);
  },

  // ---- CLEAR DONE SHOPPING ITEMS ----
  clearDoneItems: async () => {
    const removed = state.shoppingList.filter(i => i.done);
    const backup = [...state.shoppingList];
    state.shoppingList = state.shoppingList.filter(i => !i.done);
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    App.navigate('shopping');
    const [msg, undo_msg] = await Translator.all(`${removed.length} items removed`, 'Undo');
    Toast.show(`✓ ${msg}`, 5000, () => {
      state.shoppingList = backup;
      localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
      App.navigate('shopping');
    }, `↩ ${undo_msg}`);
  },

  // ---- PLANNER WEEK NAVIGATION ----
  plannerPrevWeek: () => { state.plannerWeekOffset--; App.navigate('planner'); },
  plannerNextWeek: () => { state.plannerWeekOffset++; App.navigate('planner'); },
  plannerGoToday: () => { state.plannerWeekOffset = 0; App.navigate('planner'); },

  // ---- ADD TO PLANNER FROM RECIPE DETAIL ----
  openAddToPlanner: async (recipeId) => {
    const recipe = RecipeStore.get(recipeId) || state.currentRecipe;
    if (!recipe) return;
    state.plannerPick = { fromRecipe: recipeId };

    let modal = document.getElementById('add-to-planner-modal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'add-to-planner-modal'; document.body.appendChild(modal); }

    const weekDates = Planner.getWeekDates(state.plannerWeekOffset);
    const plannerData = Planner.get();
    const today = new Date().toISOString().split('T')[0];
    const slotKeys = ['breakfast', 'lunch', 'dinner'];
    const slotIcons = { breakfast: '🌅', lunch: '🌞', dinner: '🌙' };
    const [t_pick, t_cancel, t_br, t_lu, t_di] = await Translator.all(
      'Add to meal plan', 'Cancel', 'Breakfast', 'Lunch', 'Dinner'
    );
    const slotLabels = { breakfast: t_br, lunch: t_lu, dinner: t_di };
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const translatedDays = await Promise.all(dayNames.map(d => Translator.t(d)));

    const rows = weekDates.map((date, i) => {
      const isToday = date === today;
      const dateObj = new Date(date + 'T12:00:00');
      const dayNum = dateObj.getDate();
      const monthShort = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
      const dayLabel = `${translatedDays[i]} ${dayNum} ${monthShort}${isToday ? ' 📍' : ''}`;
      const slots = slotKeys.map(slot => {
        const occupied = plannerData[date]?.[slot];
        const icon = slotIcons[slot];
        const label = slotLabels[slot];
        if (occupied) {
          return `<button class="atp-slot occupied" title="${Safe.attr(occupied.strMeal)}" disabled>${icon} ${Safe.html(label)} ✓</button>`;
        }
        return `<button class="atp-slot" onclick="Actions.confirmAddToPlanner('${date}', '${slot}', '${recipeId}')">${icon} ${Safe.html(label)}</button>`;
      }).join('');
      return `<div class="atp-day"><span class="atp-day-label">${Safe.html(dayLabel)}</span><div class="atp-slots">${slots}</div></div>`;
    }).join('');

    modal.innerHTML = `
      <div class="planner-modal-overlay" onclick="if(event.target===this)Actions.closeAddToPlanner()">
        <div class="planner-modal-content">
          <div class="planner-modal-header">
            <h3>📅 ${Safe.html(t_pick)}</h3>
            <button class="btn btn-ghost" onclick="Actions.closeAddToPlanner()">✕</button>
          </div>
          <div style="font-weight:600; margin-bottom:12px; color:var(--primary);">🍴 ${Safe.html(recipe.strMeal)}</div>
          <div class="atp-list">${rows}</div>
        </div>
      </div>`;
    modal.classList.add('active');
  },

  closeAddToPlanner: () => {
    const modal = document.getElementById('add-to-planner-modal');
    if (modal) modal.classList.remove('active');
    state.plannerPick = null;
  },

  clearRecentlyViewed: async () => {
    localStorage.removeItem('walkart_recent');
    UI.closeSettings();
    const msg = await Translator.t('Recently viewed cleared');
    Toast.show(`🕐 ${msg}`);
  },
  clearTransCache: async () => {
    Translator.cache = {};
    localStorage.removeItem('walkart_trans_cache');
    UI.closeSettings();
    const msg = await Translator.t('Translation cache cleared');
    Toast.show(`🗜️ ${msg}`);
  },
  clearSearchHistorySettings: () => {
    SearchHistory.clear();
    UI.closeSettings();
    Toast.show('🔍 Search history cleared');
  },
  resetApp: async () => {
    const msg = await Translator.t('Reset ALL app data? This cannot be undone.');
    if (!confirm(msg)) return;
    Object.keys(localStorage).filter(k => k.startsWith('walkart_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  },

  doLogin: async () => {
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('auth-email')?.value?.trim();
    const password = document.getElementById('auth-password')?.value;
    const errEl = document.getElementById('auth-error');
    if (!email || !password) { errEl.textContent = 'Remplissez tous les champs.'; errEl.style.display='block'; return; }
    if (btn) { btn.textContent = '⏳ Connexion...'; btn.disabled = true; }
    const error = await Auth.login(email, password);
    if (error) {
      errEl.textContent = error.message.includes('Invalid') ? 'Email ou mot de passe incorrect.' : error.message;
      errEl.style.display = 'block';
      if (btn) { btn.textContent = '🔐 Se connecter'; btn.disabled = false; }
    } else {
      await Auth.loadProfile();
      if (!currentProfile?.goal) App.navigate('profile-setup');
      else App.navigate('my-menu');
    }
  },

  doRegister: async () => {
    const name = document.getElementById('auth-name')?.value?.trim();
    const email = document.getElementById('auth-email')?.value?.trim();
    const password = document.getElementById('auth-password')?.value;
    const errEl = document.getElementById('auth-error');
    const okEl = document.getElementById('auth-success');
    if (!name || !email || !password) { errEl.textContent = 'Remplissez tous les champs.'; errEl.style.display='block'; return; }
    if (password.length < 8) { errEl.textContent = 'Mot de passe : 8 caractères minimum.'; errEl.style.display='block'; return; }
    const error = await Auth.register(email, password, name);
    if (error) {
      errEl.textContent = error.message.includes('already') ? 'Cet email est déjà utilisé.' : error.message;
      errEl.style.display = 'block';
    } else {
      errEl.style.display = 'none';
      okEl.innerHTML = '✅ Compte créé ! Vérifiez votre email pour confirmer, puis connectez-vous.';
      okEl.style.display = 'block';
    }
  },

  doLogout: async () => {
    await Auth.logout();
    Toast.show('👋 Déconnecté');
  },

  selectGoal: (val) => {
    document.getElementById('p-goal').value = val;
    document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
  },

  saveProfile: async () => {
    const data = {
      full_name: currentProfile?.full_name || currentUser?.email?.split('@')[0],
      age: parseInt(document.getElementById('p-age')?.value),
      gender: document.getElementById('p-gender')?.value,
      weight_kg: parseFloat(document.getElementById('p-weight')?.value),
      height_cm: parseFloat(document.getElementById('p-height')?.value),
      activity_level: document.getElementById('p-activity')?.value,
      goal: document.getElementById('p-goal')?.value || 'maintain'
    };
    const errEl = document.getElementById('profile-error');
    if (!data.age || !data.gender || !data.weight_kg || !data.height_cm) {
      if (errEl) { errEl.textContent = 'Remplissez tous les champs.'; errEl.style.display = 'block'; }
      return;
    }
    const { error } = await Auth.saveProfile(data);
    if (error) {
      if (errEl) { errEl.textContent = 'Erreur: ' + error.message; errEl.style.display = 'block'; }
    } else {
      Toast.show('✅ Profil sauvegardé !');
      App.navigate('my-menu');
    }
  },

  loadMore: async () => {
    const btn = document.getElementById('load-more-btn');
    const grid = document.getElementById('load-more-grid');
    if (!btn || !grid) return;
    btn.innerHTML = '⏳ ' + T('load_more') + '...';
    btn.disabled = true;
    try {
      const meals = await API.getBatch(12);
      const cards = await Promise.all(meals.map(r => Render.recipeCard(r)));
      grid.innerHTML += cards.join('');
      btn.innerHTML = '🔄 ' + T('load_more');
      btn.disabled = false;
      // Move button below the newly loaded cards
      grid.after(btn.parentElement);
    } catch (e) {
      btn.innerHTML = '🔄 ' + T('load_more');
      btn.disabled = false;
    }
  },

  confirmAddToPlanner: async (date, slot, recipeId) => {
    const recipe = RecipeStore.get(recipeId) || state.currentRecipe;
    if (!recipe) return;
    Planner.setMeal(date, slot, recipe);
    Actions.closeAddToPlanner();
    const [msg, view] = await Translator.all('Added to plan!', 'View planner');
    Toast.show(`📅 ${msg}`, 4000, () => App.navigate('planner'), view);
  }
};

// ---- UI ----
const UI = {
  _welcomeResolve: null,

  toggleLangModal: () => document.getElementById('lang-modal').classList.toggle('show'),

  // ---- WELCOME SCREEN (first-time language picker) ----
  showWelcome: () => {
    const el = document.createElement('div');
    el.id = 'welcome-modal';
    el.className = 'welcome-modal';
    el.innerHTML = `
      <div class="welcome-content">
        <img src="logo.svg" class="welcome-logo" alt="Walkart">
        <h1 class="welcome-title">Walkart</h1>
        <p class="welcome-sub">Choose your language / Choisissez votre langue</p>
        <div class="lang-grid">
          <div class="lang-item" onclick="UI.welcomePickLang('fr','FR')">
            <img src="https://flagcdn.com/w40/fr.png" class="flag-img" style="width:36px;border-radius:4px;" alt="FR">
            <span>Français</span>
          </div>
          <div class="lang-item" onclick="UI.welcomePickLang('en','EN')">
            <img src="https://flagcdn.com/w40/us.png" class="flag-img" style="width:36px;border-radius:4px;" alt="EN">
            <span>English</span>
          </div>
          <div class="lang-item" onclick="UI.welcomePickLang('ar','AR')">
            <img src="https://flagcdn.com/w40/sa.png" class="flag-img" style="width:36px;border-radius:4px;" alt="AR">
            <span>العربية</span>
          </div>
          <div class="lang-item" onclick="UI.welcomePickLang('es','ES')">
            <img src="https://flagcdn.com/w40/es.png" class="flag-img" style="width:36px;border-radius:4px;" alt="ES">
            <span>Español</span>
          </div>
          <div class="lang-item" onclick="UI.welcomePickLang('it','IT')">
            <img src="https://flagcdn.com/w40/it.png" class="flag-img" style="width:36px;border-radius:4px;" alt="IT">
            <span>Italiano</span>
          </div>
          <div class="lang-item" onclick="UI.welcomePickLang('ja','JA')">
            <img src="https://flagcdn.com/w40/jp.png" class="flag-img" style="width:36px;border-radius:4px;" alt="JA">
            <span>日本語</span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('welcome-show'));
  },

  welcomePickLang: (code, name) => {
    state.lang = code;
    state.langName = name;
    localStorage.setItem('walkart_lang', code);
    localStorage.setItem('walkart_lang_name', name);
    const modal = document.getElementById('welcome-modal');
    if (modal) { modal.classList.add('welcome-exit'); setTimeout(() => modal.remove(), 400); }
    if (UI._welcomeResolve) { UI._welcomeResolve(); UI._welcomeResolve = null; }
  },

  // ---- SETTINGS PANEL ----
  toggleSettings: async () => {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    if (panel.classList.contains('open')) { UI.closeSettings(); return; }

    const [t_dark, t_lang, t_storage, t_ch, t_cr, t_cc, t_reset, t_ver] = await Translator.all(
      'Dark Mode', 'Language', 'Storage',
      'Clear search history', 'Clear recently viewed',
      'Clear translation cache', 'Reset app', 'Version'
    );

    document.getElementById('settings-content').innerHTML = `
      <div class="settings-section">
        <div class="settings-item" onclick="App.toggleDarkMode(); this.querySelector('.s-toggle').classList.toggle('on')">
          <div class="settings-item-left"><span class="s-icon">${state.darkMode ? '☀️' : '🌙'}</span><span>${Safe.html(t_dark)}</span></div>
          <div class="s-toggle ${state.darkMode ? 'on' : ''}"><div class="s-thumb"></div></div>
        </div>
        <div class="settings-item" onclick="UI.closeSettings(); setTimeout(UI.toggleLangModal, 200)">
          <div class="settings-item-left"><span class="s-icon">🌐</span><span>${Safe.html(t_lang)}</span></div>
          <span class="s-value">${state.langName} ›</span>
        </div>
      </div>
      <div class="settings-section">
        <p class="settings-section-title">${Safe.html(t_storage)}</p>
        <div class="settings-item" onclick="Actions.clearSearchHistorySettings()">
          <div class="settings-item-left"><span class="s-icon">🔍</span><span>${Safe.html(t_ch)}</span></div><span class="s-chevron">›</span>
        </div>
        <div class="settings-item" onclick="Actions.clearRecentlyViewed()">
          <div class="settings-item-left"><span class="s-icon">🕐</span><span>${Safe.html(t_cr)}</span></div><span class="s-chevron">›</span>
        </div>
        <div class="settings-item" onclick="Actions.clearTransCache()">
          <div class="settings-item-left"><span class="s-icon">🗜️</span><span>${Safe.html(t_cc)}</span></div><span class="s-chevron">›</span>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-item danger" onclick="Actions.resetApp()">
          <div class="settings-item-left"><span class="s-icon">🗑️</span><span style="color:#ef4444;">${Safe.html(t_reset)}</span></div>
          <span class="s-chevron" style="color:#ef4444;">›</span>
        </div>
      </div>
      <p class="settings-version">Walkart · ${Safe.html(t_ver)} 21</p>`;
    panel.classList.add('open');
  },

  closeSettings: () => document.getElementById('settings-panel')?.classList.remove('open')
};

window.addEventListener('DOMContentLoaded', () => { App.init(); });
