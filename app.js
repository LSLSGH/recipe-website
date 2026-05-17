/* =====================================================
   MYKITCH - Main Application Logic (V4 - ULTRA STABLE)
   ===================================================== */

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

const state = {
  currentRoute: 'home',
  recipes: { featured: [], popular: [], quick: [] },
  categories: [],
  favorites: JSON.parse(localStorage.getItem('rw_favs') || '[]'),
  shoppingList: JSON.parse(localStorage.getItem('rw_shopping') || '[]'),
  user: JSON.parse(localStorage.getItem('rw_user') || 'null'),
  currentRecipe: null,
  currentRecipeInstructions: [],
  currentStepIndex: 0,
  currentInstructions: [],
  searchQuery: '',
  portions: 4,
  appName: 'MyKitch'
};

const Translator = {
  cache: JSON.parse(localStorage.getItem('rw_trans_cache') || '{}'),
  translate: async (text, targetLang) => {
    if (!text || targetLang === 'en') return text;
    const cacheKey = `${targetLang}_${text}`;
    if (Translator.cache[cacheKey]) return Translator.cache[cacheKey];
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      const translated = data[0].map(x => x[0]).join('');
      Translator.cache[cacheKey] = translated;
      localStorage.setItem('rw_trans_cache', JSON.stringify(Translator.cache));
      return translated;
    } catch (e) { return text; }
  }
};

const App = {
  init: async () => {
    console.log("MyKitch Initializing...");
    await API.loadInitialData();
    const hash = window.location.hash.replace('#', '') || 'home';
    App.navigate(hash);
    
    document.querySelectorAll('.lang-option, .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => App.navigate(state.currentRoute), 200);
      });
    });
  },

  navigate: (route, params = null) => {
    state.currentRoute = route;
    window.location.hash = route;
    window.scrollTo(0, 0);
    
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = '<div style="text-align:center; padding:100px;"><div class="spinner"></div><p>Chargement MyKitch...</p></div>';

    setTimeout(async () => {
      try {
        let html = '';
        switch (route) {
          case 'home': html = await Render.home(); break;
          case 'search': html = await Render.searchResults(await API.search(state.searchQuery)); break;
          case 'categories': html = await Render.categories(); break;
          case 'category': html = await Render.categoryPage(params?.c, await API.getByCategory(params?.c)); break;
          case 'recipe': 
            const recipe = await API.getRecipe(params?.id);
            state.currentRecipe = recipe;
            html = await Render.recipeDetail(recipe); 
            break;
          default: html = await Render.home();
        }
        root.innerHTML = html;
        if (typeof i18n !== 'undefined' && i18n) i18n.render();
      } catch (e) {
        console.error(e);
        root.innerHTML = '<div class="container" style="padding:50px; text-align:center;"><h2>Oups ! Une erreur est survenue.</h2><button class="btn btn-primary" onclick="App.navigate(\'home\')">Retour à l\'accueil</button></div>';
      }
    }, 50);
  }
};

const API = {
  loadInitialData: async () => {
    try {
      const catRes = await fetch(API_BASE + '/categories.php');
      const catData = await catRes.json();
      state.categories = catData.categories || [];
      const featData = await (await fetch(API_BASE + '/random.php')).json();
      state.recipes.featured = [featData.meals[0]];
      state.recipes.popular = await API.getRandomMeals(8);
    } catch (e) { console.error("API Load Error", e); }
  },
  getRandomMeals: async (count) => {
    const promises = [];
    for(let i=0; i<count; i++) promises.push(fetch(API_BASE + '/random.php').then(r => r.json()).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter(r => r?.meals).map(r => r.meals[0]);
  },
  search: async (q) => {
    const en = await Translator.translate(q, 'en');
    const data = await (await fetch(API_BASE + '/search.php?s=' + en)).json();
    return data.meals || [];
  },
  getByCategory: async (c) => {
    const data = await (await fetch(API_BASE + '/filter.php?c=' + c)).json();
    return data.meals || [];
  },
  getRecipe: async (id) => {
    const data = await (await fetch(API_BASE + '/lookup.php?i=' + id)).json();
    return data.meals?.[0];
  }
};

const Actions = {
  toggleStep: (el) => {
    el.classList.toggle('completed');
    const text = el.querySelector('.step-text');
    if (text) {
      text.style.textDecoration = el.classList.contains('completed') ? 'line-through' : 'none';
      text.style.opacity = el.classList.contains('completed') ? '0.5' : '1';
    }
  },
  changePortions: (change) => {
    state.portions = Math.max(1, Math.min(20, state.portions + change));
    const el = document.getElementById('portion-count');
    if (el) el.textContent = state.portions;
    Render.updateIngredientsList();
  },
  startCookingFromState: () => {
    state.currentInstructions = state.currentRecipeInstructions;
    state.currentStepIndex = 0;
    document.body.style.overflow = 'hidden';
    const overlay = document.createElement('div');
    overlay.id = 'cooking-mode-overlay';
    document.body.appendChild(overlay);
    Render.updateCookingMode();
  },
  closeCookingMode: () => {
    const el = document.getElementById('cooking-mode-overlay');
    if (el) el.remove();
    document.body.style.overflow = '';
  },
  nextStep: () => {
    if (state.currentStepIndex < state.currentInstructions.length - 1) {
      state.currentStepIndex++;
      Render.updateCookingMode();
    } else { Actions.closeCookingMode(); }
  },
  prevStep: () => {
    if (state.currentStepIndex > 0) {
      state.currentStepIndex--;
      Render.updateCookingMode();
    }
  }
};

const Render = {
  recipeCard: async (r) => {
    const lang = i18n.current;
    const title = await Translator.translate(r.strMeal, lang);
    return `
      <div class="recipe-card" onclick="App.navigate('recipe', {id: '${r.idMeal}'})">
        <img src="${r.strMealThumb}" class="card-img" alt="${title}">
        <div class="card-body"><h3 class="card-title">${title}</h3></div>
      </div>
    `;
  },
  home: async () => {
    const lang = i18n.current;
    const popular = await Promise.all(state.recipes.popular.map(r => Render.recipeCard(r)));
    return `<div class="container section"><h1>Recettes Populaires</h1><div class="grid grid-4">${popular.join('')}</div></div>`;
  },
  categories: async () => {
    const lang = i18n.current;
    const cats = await Promise.all(state.categories.map(async c => {
      const t = await Translator.translate(c.strCategory, lang);
      return `<div class="category-card" onclick="App.navigate('category', {c:'${c.strCategory}'})" style="padding:20px; background:white; border-radius:12px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.05); cursor:pointer;">
        <img src="${c.strCategoryThumb}" style="width:80px;">
        <h3>${t}</h3>
      </div>`;
    }));
    return `<div class="container section"><h1>Catégories</h1><div class="grid grid-4">${cats.join('')}</div></div>`;
  },
  categoryPage: async (cat, res) => {
    const cards = await Promise.all(res.map(r => Render.recipeCard(r)));
    return `<div class="container section"><h1>${cat}</h1><div class="grid grid-4">${cards.join('')}</div></div>`;
  },
  recipeDetail: async (r) => {
    const lang = i18n.current;
    const title = await Translator.translate(r.strMeal, lang);
    let text = r.strInstructions.replace(/([Ss]tep\s*\d+[:.]?|[الخطوة]+\s*\d+|\d+[\.)])/g, '\n$1');
    text = text.replace(/\. ([A-Z\u0600-\u06FF])/g, '.\n$1');
    const stepsRaw = text.split('\n').map(s => s.trim()).filter(s => s.length > 5);
    const steps = await Promise.all(stepsRaw.map(s => Translator.translate(s, lang)));
    state.currentRecipeInstructions = steps;

    return `
      <div class="container section page-enter">
        <div class="adsense-placeholder" style="background:#f0f0f0; padding:15px; text-align:center; margin-bottom:20px; border-radius:8px;">PUB GOOGLE ADSENSE</div>
        <button class="btn btn-secondary" onclick="window.history.back()">← Retour</button>
        <div class="grid grid-2" style="gap:40px; margin-top:20px;">
          <img src="${r.strMealThumb}" style="width:100%; border-radius:12px;">
          <div>
            <h1 style="font-size:2.5rem;">${title}</h1>
            <button class="btn btn-primary" style="width:100%; padding:20px; margin:20px 0;" onclick="Actions.startCookingFromState()">👨‍🍳 DÉMARRER LA PRÉPARATION</button>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; display:flex; justify-content:space-between;">
              <b>Portions:</b>
              <div>
                <button onclick="Actions.changePortions(-1)">-</button>
                <b id="portion-count" style="margin:0 10px;">${state.portions}</b>
                <button onclick="Actions.changePortions(1)">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-layout" style="display:grid; grid-template-columns: 1fr 300px; gap:40px; margin-top:40px;">
          <div>
            <h2>Ingrédients</h2>
            <ul id="dynamic-ingredients" class="ingredients-list"></ul>
            <h2 style="margin-top:40px;">Préparation (Cliquez pour cocher)</h2>
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
              ${steps.map((s, i) => `
                <div class="step-card" onclick="Actions.toggleStep(this)" style="display:flex; gap:15px; padding:15px; background:white; border-radius:10px; border:1px solid #eee; cursor:pointer;">
                  <b style="color:var(--primary);">${i+1}.</b>
                  <div class="step-text">${s}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="adsense-placeholder" style="background:#f9f9f9; height:600px; text-align:center; padding:20px; border-radius:10px;">PUB SIDEBAR</div>
        </div>
      </div>
    `;
  },
  updateIngredientsList: async () => {
    const r = state.currentRecipe; if (!r) return;
    const lang = i18n.current;
    let html = '';
    for(let i=1; i<=20; i++) {
      const name = r[`strIngredient${i}`];
      const meas = r[`strMeasure${i}`];
      if (name?.trim()) {
        const tName = await Translator.translate(name, lang);
        const tMeas = await Translator.translate(meas, lang);
        html += `<li style="padding:10px 0; border-bottom:1px solid #eee;"><b>${tName}</b>: ${tMeas}</li>`;
      }
    }
    const el = document.getElementById('dynamic-ingredients');
    if (el) el.innerHTML = html;
  },
  updateCookingMode: () => {
    const el = document.getElementById('cooking-mode-overlay');
    if (!el) return;
    const step = state.currentInstructions[state.currentStepIndex];
    el.innerHTML = `
      <div style="position:fixed; inset:0; background:white; z-index:10000; padding:40px; display:flex; flex-direction:column; text-align:center;">
        <div style="display:flex; justify-content:space-between;"><b>MYKITCH - ÉTAPE ${state.currentStepIndex+1}</b><button onclick="Actions.closeCookingMode()">✕</button></div>
        <div style="flex:1; display:flex; align-items:center; justify-content:center;"><p style="font-size:2rem; line-height:1.4;">${step}</p></div>
        <div style="display:flex; justify-content:space-between;">
          <button class="btn btn-secondary" onclick="Actions.prevStep()" ${state.currentStepIndex===0?'disabled':''}>Précédent</button>
          <button class="btn btn-primary" onclick="Actions.nextStep()">${state.currentStepIndex===state.currentInstructions.length-1?'Terminer':'Suivant'}</button>
        </div>
      </div>
    `;
  },
  searchResults: async (res) => {
    const cards = await Promise.all(res.map(r => Render.recipeCard(r)));
    return `<div class="container section"><h1>Résultats</h1><div class="grid grid-4">${cards.join('')}</div></div>`;
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
  const obs = new MutationObserver(() => {
    if (document.getElementById('dynamic-ingredients') && document.getElementById('dynamic-ingredients').innerHTML==='') Render.updateIngredientsList();
  });
  obs.observe(document.body, { childList: true, subtree: true });
});
