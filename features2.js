/* =====================================================
   WALKART FEATURES V2 — Extended Features
   ===================================================== */

// ============================================================
// 1. FONT SIZE CONTROL
// ============================================================
const FontSizeCtrl = {
  sizes: [14, 16, 18, 20],
  labels: ['S', 'M', 'L', 'XL'],
  get: () => parseInt(localStorage.getItem('walkart_fontsize') || '16'),
  set: (size) => {
    document.documentElement.style.fontSize = size + 'px';
    localStorage.setItem('walkart_fontsize', size);
  },
  init: () => {
    const s = FontSizeCtrl.get();
    if (s !== 16) document.documentElement.style.fontSize = s + 'px';
  },
  render: () => {
    const cur = FontSizeCtrl.get();
    return `<div class="fontsize-row">${FontSizeCtrl.sizes.map((s,i) => `
      <button class="fontsize-btn ${s===cur?'active':''}" onclick="FontSizeCtrl.set(${s});document.querySelectorAll('.fontsize-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">
        ${FontSizeCtrl.labels[i]}</button>`).join('')}</div>`;
  }
};

// ============================================================
// 2. PORTION SCALING
// ============================================================
const PortionScale = {
  _base: 4,
  renderControl: (servings) => {
    PortionScale._base = servings || 4;
    return `<div class="portion-row">
      <span class="portion-label">🍽️ Portions</span>
      <div class="portion-stepper">
        <button onclick="PortionScale.change(-1)">−</button>
        <span id="portion-val">${servings || 4}</span>
        <button onclick="PortionScale.change(1)">+</button>
      </div></div>`;
  },
  change: (d) => {
    const el = document.getElementById('portion-val');
    if (!el) return;
    const next = Math.max(1, Math.min(20, parseInt(el.textContent) + d));
    el.textContent = next;
    const factor = next / PortionScale._base;
    document.querySelectorAll('[data-qty]').forEach(span => {
      const base = parseFloat(span.dataset.qty);
      if (!isNaN(base)) span.textContent = (base * factor) % 1 === 0 ? (base * factor) : (base * factor).toFixed(1);
    });
  }
};

// ============================================================
// 3. STEP-BY-STEP COOKING MODE
// ============================================================
const CookingMode = {
  steps: [], idx: 0, tick: null, secs: 0,

  start: (instructions) => {
    let steps = (instructions || '').split(/\r?\n+/).map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(s => s.length > 15);
    if (steps.length < 2) steps = (instructions || '').match(/[^.!?]{15,}[.!?]+/g) || [instructions || ''];
    CookingMode.steps = steps; CookingMode.idx = 0; CookingMode._show();
    BadgeSystem.check('first_cook');
  },

  _show: () => {
    document.getElementById('cooking-mode')?.remove();
    const el = document.createElement('div');
    el.id = 'cooking-mode'; el.className = 'cooking-mode-overlay';
    const step = CookingMode.steps[CookingMode.idx];
    const total = CookingMode.steps.length;
    const pct = Math.round((CookingMode.idx + 1) / total * 100);
    const isLast = CookingMode.idx === total - 1;
    const tm = step.match(/(\d+)\s*(heure|hour|minute|min|seconde|second|sec)/i);
    const timerSecs = tm ? (/heure|hour/i.test(tm[2]) ? parseInt(tm[1])*3600 : /sec/i.test(tm[2]) ? parseInt(tm[1]) : parseInt(tm[1])*60) : 0;
    el.innerHTML = `<div class="cm-card">
      <div class="cm-header"><span class="cm-step-num">${CookingMode.idx+1} / ${total}</span>
        <button class="cm-x" onclick="CookingMode.close()">✕</button></div>
      <div class="cm-progress"><div style="width:${pct}%;height:100%;background:var(--primary);border-radius:4px;transition:.3s"></div></div>
      <div class="cm-text">${Safe.html(step)}</div>
      ${timerSecs ? `<button class="btn btn-outline cm-timer-start" onclick="CookingMode.startTimer(${timerSecs},this)">⏱️ ${tm[1]} ${tm[2]}</button>` : ''}
      <div class="cm-timer-disp" id="cm-timer-disp" style="display:none"></div>
      <div class="cm-footer">
        <button class="btn" onclick="CookingMode.prev()" ${CookingMode.idx===0?'disabled':''}>← Retour</button>
        ${isLast ? `<button class="btn btn-primary" onclick="CookingMode.done()">✅ Terminé !</button>`
                 : `<button class="btn btn-primary" onclick="CookingMode.next()">Suivant →</button>`}
      </div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
  },

  next: () => { if (CookingMode.idx < CookingMode.steps.length-1) { CookingMode.idx++; CookingMode.stopTimer(); CookingMode._show(); } },
  prev: () => { if (CookingMode.idx > 0) { CookingMode.idx--; CookingMode.stopTimer(); CookingMode._show(); } },
  close: () => { CookingMode.stopTimer(); document.getElementById('cooking-mode')?.remove(); },
  done: () => {
    CookingMode.close();
    const id = document.querySelector('[data-recipe-id]')?.dataset?.recipeId;
    const name = document.querySelector('.recipe-detail-title')?.textContent || '';
    const img = document.querySelector('.recipe-detail-img')?.src || '';
    if (id) CookingHistory.log(id, name, img);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast('🎉 Bon appétit !');
  },
  startTimer: (secs, btn) => {
    CookingMode.stopTimer(); CookingMode.secs = secs;
    if (btn) btn.style.display = 'none';
    const disp = document.getElementById('cm-timer-disp');
    if (disp) disp.style.display = 'block';
    const update = () => {
      const d = document.getElementById('cm-timer-disp'); if (!d) { CookingMode.stopTimer(); return; }
      const m = Math.floor(CookingMode.secs/60), s = CookingMode.secs%60;
      d.textContent = `⏱️ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (CookingMode.secs <= 0) { d.textContent = '⏰ Temps écoulé !'; d.style.color='var(--primary)'; CookingMode.stopTimer(); }
    };
    update();
    CookingMode.tick = setInterval(() => { CookingMode.secs--; update(); }, 1000);
  },
  stopTimer: () => { if (CookingMode.tick) { clearInterval(CookingMode.tick); CookingMode.tick = null; } }
};

// ============================================================
// 4. TV MODE
// ============================================================
const TVMode = {
  open: (name, ingredientsHtml, instructions) => {
    document.getElementById('tv-mode')?.remove();
    const el = document.createElement('div');
    el.id = 'tv-mode'; el.className = 'tv-mode-overlay';
    el.innerHTML = `
      <button class="tv-close" onclick="TVMode.close()">✕ Quitter</button>
      <h1 class="tv-title">${Safe.html(name)}</h1>
      <div class="tv-body">
        <div class="tv-col"><h2>🧾 Ingrédients</h2><div class="tv-ingredients">${ingredientsHtml || ''}</div></div>
        <div class="tv-col"><h2>👨‍🍳 Instructions</h2><div class="tv-instructions">${Safe.html(instructions||'').replace(/\n/g,'<br>')}</div></div>
      </div>`;
    document.body.appendChild(el);
    document.documentElement.requestFullscreen?.().catch(()=>{});
    requestAnimationFrame(() => el.classList.add('show'));
  },
  close: () => { document.getElementById('tv-mode')?.remove(); if (document.fullscreenElement) document.exitFullscreen?.(); }
};

// ============================================================
// 5. STORIES FORMAT
// ============================================================
const RecipeStories = {
  open: (recipe) => {
    const steps = (recipe.strInstructions || '').split(/\r?\n+/).map(s=>s.replace(/^\d+[\.\)]\s*/,'')).filter(s=>s.trim().length>15);
    if (steps.length === 0) return;
    document.getElementById('stories-overlay')?.remove();
    const el = document.createElement('div'); el.id = 'stories-overlay'; el.className = 'stories-overlay';
    let cur = 0;
    const render = () => {
      const step = steps[cur];
      el.innerHTML = `<div class="stories-bg">
        <button class="stories-close" onclick="RecipeStories.close()">✕</button>
        <div class="stories-progress-bar">${steps.map((_,i)=>`<div class="sp-seg ${i<cur?'done':i===cur?'active':''}"></div>`).join('')}</div>
        <div class="stories-header"><span class="stories-recipe-name">${Safe.html(recipe.strMeal)}</span><span>${cur+1}/${steps.length}</span></div>
        <div class="stories-content">
          <div class="stories-step-num">Étape ${cur+1}</div>
          <div class="stories-text">${Safe.html(step)}</div>
        </div>
        <div class="stories-nav">
          <div class="stories-prev" onclick="RecipeStories._prev()"></div>
          <div class="stories-next" onclick="RecipeStories._next()"></div>
        </div></div>`;
    };
    RecipeStories._steps = steps; RecipeStories._cur = 0;
    RecipeStories._el = el;
    render();
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    el._timer = setInterval(() => { RecipeStories._cur++; if (RecipeStories._cur >= steps.length) { RecipeStories.close(); return; } render(); }, 8000);
    RecipeStories._render = render;
  },
  _next: () => {
    const el = RecipeStories._el; if (!el) return; clearInterval(el._timer);
    if (RecipeStories._cur < RecipeStories._steps.length - 1) { RecipeStories._cur++; RecipeStories._render(); }
    else RecipeStories.close();
    el._timer = setInterval(() => { RecipeStories._cur++; if (RecipeStories._cur >= RecipeStories._steps.length) { RecipeStories.close(); return; } RecipeStories._render(); }, 8000);
  },
  _prev: () => {
    const el = RecipeStories._el; if (!el) return; clearInterval(el._timer);
    if (RecipeStories._cur > 0) { RecipeStories._cur--; RecipeStories._render(); }
    el._timer = setInterval(() => { RecipeStories._cur++; if (RecipeStories._cur >= RecipeStories._steps.length) { RecipeStories.close(); return; } RecipeStories._render(); }, 8000);
  },
  close: () => { const el = RecipeStories._el; if (el) { clearInterval(el._timer); el.remove(); } RecipeStories._el = null; }
};

// ============================================================
// 6. SHARE RECIPE
// ============================================================
const ShareRecipe = {
  whatsapp: (name, id) => {
    const url = `https://www.walkart.us/#recipe/${id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(name + ' 🍳 ' + url)}`, '_blank');
    BadgeSystem.check('sharer');
  },
  native: async (name, id) => {
    const url = `https://www.walkart.us/#recipe/${id}`;
    if (navigator.share) { try { await navigator.share({ title: name, url }); } catch(e) {} }
    else { await navigator.clipboard.writeText(url); if (UI.toast) UI.toast('🔗 Lien copié !'); }
    BadgeSystem.check('sharer');
  },
  print: () => window.print()
};

// ============================================================
// 7. RECIPE OF THE DAY
// ============================================================
const RecipeOfDay = {
  _KEY: 'walkart_rotd',
  get: async () => {
    const stored = JSON.parse(localStorage.getItem(RecipeOfDay._KEY) || 'null');
    if (stored?.date === new Date().toDateString()) return stored.recipe;
    try {
      const r = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const d = await r.json(); const recipe = d.meals?.[0];
      if (recipe) localStorage.setItem(RecipeOfDay._KEY, JSON.stringify({ date: new Date().toDateString(), recipe }));
      return recipe;
    } catch { return null; }
  },
  renderCard: async () => {
    const r = await RecipeOfDay.get(); if (!r) return '';
    return `<div class="rotd-card" onclick="App.navigate('recipe',{id:'${Safe.attr(r.idMeal)}'})">
      <img src="${Safe.attr(r.strMealThumb)}" class="rotd-img" alt="${Safe.attr(r.strMeal)}" loading="lazy">
      <div class="rotd-info">
        <div class="rotd-tag">⭐ Recette du jour</div>
        <div class="rotd-name">${Safe.html(r.strMeal)}</div>
        <div class="rotd-area">${Safe.html(r.strArea||'')}${r.strArea&&r.strCategory?' · ':''}${Safe.html(r.strCategory||'')}</div>
      </div></div>`;
  }
};

// ============================================================
// 8. SEASONAL RECIPES
// ============================================================
const SeasonalRecipes = {
  _data: [
    { l:'Hiver', e:'❄️', c:['Beef','Lamb','Pasta'] },
    { l:'Hiver', e:'❄️', c:['Beef','Soup','Pasta'] },
    { l:'Printemps', e:'🌸', c:['Chicken','Vegetarian','Seafood'] },
    { l:'Printemps', e:'🌸', c:['Chicken','Vegetarian','Seafood'] },
    { l:'Printemps', e:'🌸', c:['Seafood','Salad','Vegetarian'] },
    { l:'Été', e:'☀️', c:['Seafood','Salad','Dessert'] },
    { l:'Été', e:'☀️', c:['Seafood','Salad','Dessert'] },
    { l:'Été', e:'☀️', c:['Salad','Seafood','Dessert'] },
    { l:'Automne', e:'🍂', c:['Pasta','Vegetarian','Beef'] },
    { l:'Automne', e:'🍂', c:['Pasta','Beef','Lamb'] },
    { l:'Automne', e:'🍂', c:['Beef','Chicken','Pasta'] },
    { l:'Hiver', e:'❄️', c:['Beef','Lamb','Dessert'] }
  ],
  getCurrent: () => SeasonalRecipes._data[new Date().getMonth()],
  renderBanner: () => {
    const s = SeasonalRecipes.getCurrent();
    return `<div class="seasonal-banner" onclick="App.navigate('search',{category:'${Safe.attr(s.c[0])}'})">
      <span class="seasonal-emoji">${s.e}</span>
      <div class="seasonal-text">
        <div class="seasonal-title">Cuisine de ${s.l}</div>
        <div class="seasonal-chips">${s.c.map(c=>`<span class="seasonal-chip" onclick="event.stopPropagation();App.navigate('search',{category:'${Safe.attr(c)}'})">🍽️ ${c}</span>`).join('')}</div>
      </div></div>`;
  }
};

// ============================================================
// 9. YOUTUBE PANEL
// ============================================================
const YouTubePanel = {
  render: (recipe) => {
    if (recipe.strYoutube) {
      const vid = recipe.strYoutube.split('v=')[1]?.split('&')[0];
      if (vid) return `<div class="feature-section">
        <h3 class="fs-title">▶️ Vidéo</h3>
        <div class="yt-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${Safe.attr(vid)}" frameborder="0" allow="autoplay;encrypted-media" allowfullscreen loading="lazy" class="yt-iframe"></iframe></div></div>`;
    }
    const q = encodeURIComponent((recipe.strMeal||'') + ' recipe');
    return `<div class="feature-section">
      <h3 class="fs-title">▶️ Vidéo</h3>
      <a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener" class="yt-search-btn">🔍 Voir en vidéo sur YouTube</a></div>`;
  }
};

// ============================================================
// 10. INGREDIENT SUBSTITUTIONS
// ============================================================
const IngredientSubs = {
  _db: {
    butter:['coconut oil','olive oil','avocado oil'], beurre:["huile de coco","huile d'olive"],
    cream:['coconut cream','greek yogurt'], crème:['crème de coco','yaourt grec'],
    egg:['flax egg (1 tbsp+3 tbsp water)','1/4 cup applesauce'], oeuf:['oeuf de lin','compote (60ml)'],
    flour:['almond flour','oat flour'], farine:["farine d'amande","farine d'avoine"],
    sugar:['honey','maple syrup','stevia'], sucre:['miel','sirop d\'érable','stévia'],
    milk:['oat milk','almond milk'], lait:["lait d'avoine","lait d'amande"],
    chicken:['tofu','chickpeas','tempeh'], poulet:['tofu','pois chiches'],
    beef:['lentils','mushrooms','jackfruit'], boeuf:['lentilles','champignons'],
    pasta:['zucchini noodles','rice noodles'], pâtes:['courgettes spiralisées','nouilles de riz'],
  },
  render: (ingredientText) => {
    const lower = (ingredientText||'').toLowerCase();
    const matches = [];
    for (const [k,v] of Object.entries(IngredientSubs._db)) {
      if (lower.includes(k)) { matches.push({k,v}); if(matches.length>=4) break; }
    }
    if (!matches.length) return '';
    return `<div class="feature-section">
      <h3 class="fs-title">🔄 Substitutions</h3>
      <div class="subs-list">${matches.map(m=>`
        <div class="sub-item"><span class="sub-orig">${Safe.html(m.k)}</span><span class="sub-arrow">→</span>
        <span class="sub-alts">${m.v.map(s=>`<span class="sub-chip">${Safe.html(s)}</span>`).join('')}</span></div>`).join('')}
      </div></div>`;
  }
};

// ============================================================
// 11. WINE PAIRING
// ============================================================
const WinePairing = {
  _db: {
    beef:{w:'Cabernet Sauvignon',r:'Bordeaux / Napa',e:'🍷'},
    lamb:{w:'Syrah / Shiraz',r:'Rhône / Barossa',e:'🍷'},
    pork:{w:'Pinot Noir',r:'Bourgogne',e:'🍷'},
    chicken:{w:'Chardonnay',r:'Bourgogne / Californie',e:'🥂'},
    seafood:{w:'Sauvignon Blanc',r:'Loire / Marlborough',e:'🥂'},
    fish:{w:'Muscadet',r:'Loire',e:'🥂'},
    pasta:{w:'Chianti',r:'Toscane',e:'🍷'},
    vegetarian:{w:'Rosé de Provence',r:'Provence',e:'🌸'},
    dessert:{w:'Sauternes',r:'Bordeaux',e:'🍯'},
    duck:{w:'Pinot Gris',r:'Alsace',e:'🍷'},
    spicy:{w:'Gewurztraminer',r:'Alsace',e:'🌶️'},
  },
  render: (recipe) => {
    const text = ((recipe.strMeal||'')+' '+(recipe.strCategory||'')+' '+(recipe.strIngredient1||'')).toLowerCase();
    let pair = {w:'Vin de table',r:'France',e:'🍷'};
    for (const [k,v] of Object.entries(WinePairing._db)) if(text.includes(k)) { pair=v; break; }
    return `<div class="feature-section">
      <h3 class="fs-title">${pair.e} Accord mets &amp; vins</h3>
      <div class="wine-card"><div class="wine-name">${Safe.html(pair.w)}</div><div class="wine-region">📍 ${Safe.html(pair.r)}</div></div></div>`;
  }
};

// ============================================================
// 12. COST ESTIMATE
// ============================================================
const CostEstimate = {
  _p:{chicken:.15,beef:.25,pork:.18,lamb:.30,fish:.22,salmon:.35,shrimp:.40,egg:.25,milk:.10,cream:.15,butter:.18,cheese:.25,pasta:.08,rice:.07,flour:.05,tomato:.12,potato:.08,onion:.07,garlic:.10,chocolate:.25,sugar:.05,oil:.10},
  render: (recipe) => {
    let total = 0;
    for (let i=1;i<=20;i++) { const ing=(recipe[`strIngredient${i}`]||'').toLowerCase(); for (const[k,v] of Object.entries(CostEstimate._p)) if(ing.includes(k)){total+=v;break;} }
    const est = Math.max(1.5, Math.min(15, total*2)).toFixed(2);
    return `<span class="cost-badge">💶 ~${est}€/portion</span>`;
  }
};

// ============================================================
// 13. WISHLIST
// ============================================================
const Wishlist = {
  _KEY: 'walkart_wishlist',
  get: () => JSON.parse(localStorage.getItem(Wishlist._KEY)||'[]'),
  has: (id) => Wishlist.get().some(r=>r.id===id),
  toggle: (id, name, img) => {
    const list = Wishlist.get(); const idx = list.findIndex(r=>r.id===id);
    if (idx>=0) { list.splice(idx,1); if(UI.toast) UI.toast('Retiré de la wishlist'); }
    else { list.push({id,name,img,added:Date.now()}); if(UI.toast) UI.toast('✨ Ajouté à essayer !'); }
    localStorage.setItem(Wishlist._KEY, JSON.stringify(list));
    document.querySelectorAll(`[data-wishlist-id="${id}"]`).forEach(b=>b.classList.toggle('active',idx<0));
  },
  renderPage: () => {
    const list = Wishlist.get();
    if (!list.length) return `<div class="container"><div class="empty-state">✨ Aucune recette à essayer pour l'instant !</div></div>`;
    return `<div class="container"><div class="recipe-grid">${list.map(r=>`
      <div class="recipe-card" onclick="App.navigate('recipe',{id:'${Safe.attr(r.id)}'})">
        <img src="${Safe.attr(r.img)}" loading="lazy" alt="${Safe.attr(r.name)}">
        <div class="recipe-card-body">
          <div class="recipe-card-title">${Safe.html(r.name)}</div>
          <button class="icon-btn" style="color:var(--primary)" onclick="event.stopPropagation();Wishlist.toggle('${Safe.attr(r.id)}','${Safe.attr(r.name)}','${Safe.attr(r.img)}');this.closest('.recipe-card').remove()">🗑️</button>
        </div></div>`).join('')}</div></div>`;
  }
};

// ============================================================
// 14. COOKING HISTORY
// ============================================================
const CookingHistory = {
  _KEY: 'walkart_cook_hist',
  log: (id, name, img) => {
    const h = CookingHistory.get(); const ei = h.findIndex(x=>x.id===id);
    const entry = {id,name,img,ts:Date.now(),count:ei>=0?(h[ei].count||0)+1:1};
    if(ei>=0) h.splice(ei,1); h.unshift(entry); if(h.length>50) h.pop();
    localStorage.setItem(CookingHistory._KEY, JSON.stringify(h));
    BadgeSystem.checkCookCount(h.length);
  },
  get: () => JSON.parse(localStorage.getItem(CookingHistory._KEY)||'[]'),
  renderPage: () => {
    const h = CookingHistory.get();
    if (!h.length) return `<div class="container"><div class="empty-state">🍳 Aucune recette cuisinée. Commencez à cuisiner !</div></div>`;
    return `<div class="container"><div class="history-list">${h.map(x=>{
      const d=new Date(x.ts); const ds=d.toLocaleDateString(undefined,{day:'2-digit',month:'short'});
      return `<div class="history-item" onclick="App.navigate('recipe',{id:'${Safe.attr(x.id)}'})">
        <img src="${Safe.attr(x.img)}" class="history-thumb" alt="${Safe.attr(x.name)}">
        <div class="history-info"><div class="history-name">${Safe.html(x.name)}</div>
        <div class="history-meta">${ds} · ${x.count}x cuisinée</div></div></div>`;
    }).join('')}</div></div>`;
  }
};

// ============================================================
// 15. PERSONAL TAGS
// ============================================================
const PersonalTags = {
  _KEY: 'walkart_tags',
  getAll: () => JSON.parse(localStorage.getItem(PersonalTags._KEY)||'{}'),
  getFor: (id) => (PersonalTags.getAll()[id]||[]),
  add: (id, tag) => {
    const all=PersonalTags.getAll(); if(!all[id]) all[id]=[];
    if(!all[id].includes(tag.trim())&&tag.trim()) all[id].push(tag.trim().toLowerCase());
    localStorage.setItem(PersonalTags._KEY, JSON.stringify(all));
  },
  remove: (id, tag) => {
    const all=PersonalTags.getAll(); if(all[id]) all[id]=all[id].filter(t=>t!==tag);
    localStorage.setItem(PersonalTags._KEY, JSON.stringify(all));
  },
  render: (recipeId) => {
    const tags = PersonalTags.getFor(recipeId);
    return `<div class="feature-section">
      <h3 class="fs-title">🏷️ Mes tags</h3>
      <div class="tags-row" id="tags-row-${Safe.attr(recipeId)}">
        ${tags.map(t=>`<span class="tag-chip">${Safe.html(t)}<button onclick="PersonalTags.remove('${Safe.attr(recipeId)}','${Safe.attr(t)}');this.parentElement.remove()">×</button></span>`).join('')}
      </div>
      <div class="tag-input-row">
        <input type="text" id="tag-input-${Safe.attr(recipeId)}" class="tag-input" placeholder="+ Ajouter un tag" maxlength="20"
          onkeydown="if(event.key==='Enter'){PersonalTags.addFromInput('${Safe.attr(recipeId)}');event.preventDefault()}">
        <button class="tag-add-btn" onclick="PersonalTags.addFromInput('${Safe.attr(recipeId)}')">+</button>
      </div></div>`;
  },
  addFromInput: (id) => {
    const inp = document.getElementById(`tag-input-${id}`); if(!inp||!inp.value.trim()) return;
    const tag = inp.value.trim(); PersonalTags.add(id, tag); inp.value='';
    const row = document.getElementById(`tags-row-${id}`);
    if(row) { const sp=document.createElement('span'); sp.className='tag-chip'; sp.innerHTML=`${Safe.html(tag)}<button onclick="PersonalTags.remove('${Safe.attr(id)}','${Safe.attr(tag)}');this.parentElement.remove()">×</button>`; row.appendChild(sp); }
  }
};

// ============================================================
// 16. BADGE SYSTEM
// ============================================================
const BadgeSystem = {
  _KEY: 'walkart_badges',
  _defs: [
    {key:'first_recipe',l:'🍳 Premier pas',d:'Première recette consultée'},
    {key:'first_favorite',l:'❤️ Gourmand(e)',d:'Premier favori ajouté'},
    {key:'first_cook',l:'👨‍🍳 Cuisinier',d:'Première recette cuisinée'},
    {key:'cook_5',l:'🥘 Habitué(e)',d:'5 recettes cuisinées'},
    {key:'cook_10',l:'⭐ Expert(e)',d:'10 recettes cuisinées'},
    {key:'cook_25',l:'🏆 Chef',d:'25 recettes cuisinées'},
    {key:'cook_50',l:'👑 Grand Chef',d:'50 recettes cuisinées'},
    {key:'explorer',l:'🌍 Explorateur',d:'5 pays différents explorés'},
    {key:'collector',l:'📚 Collectionneur',d:'20 recettes en favoris'},
    {key:'planner',l:'📅 Organisé(e)',d:'Planning repas créé'},
    {key:'sharer',l:'📤 Partageur',d:'Recette partagée'},
    {key:'challenger',l:'🎯 Challenger',d:'Défi relevé'},
    {key:'custom_chef',l:'✍️ Créateur',d:'Recette personnelle créée'},
  ],
  getEarned: () => JSON.parse(localStorage.getItem(BadgeSystem._KEY)||'[]'),
  check: (key) => {
    const earned = BadgeSystem.getEarned();
    if (!earned.includes(key)) {
      earned.push(key); localStorage.setItem(BadgeSystem._KEY, JSON.stringify(earned));
      const def = BadgeSystem._defs.find(d=>d.key===key);
      if (def && typeof UI !== 'undefined' && UI.toast) UI.toast(`🏅 Badge débloqué : ${def.l}`);
    }
  },
  checkCookCount: (n) => {
    if(n>=1) BadgeSystem.check('first_cook'); if(n>=5) BadgeSystem.check('cook_5');
    if(n>=10) BadgeSystem.check('cook_10'); if(n>=25) BadgeSystem.check('cook_25'); if(n>=50) BadgeSystem.check('cook_50');
  },
  renderPage: () => {
    const earned = BadgeSystem.getEarned();
    return `<div class="container"><div class="badge-grid">${BadgeSystem._defs.map(b=>{
      const got=earned.includes(b.key);
      return `<div class="badge-card ${got?'earned':'locked'}">
        <div class="badge-icon">${b.l.split(' ')[0]}</div>
        <div class="badge-name">${b.l.slice(b.l.indexOf(' ')+1)}</div>
        <div class="badge-desc">${Safe.html(b.d)}</div>
        <div class="badge-status">${got?'✅':'🔒'}</div></div>`;
    }).join('')}</div></div>`;
  }
};

// ============================================================
// 17. DIETARY PROFILE
// ============================================================
const DietaryProfile = {
  _KEY: 'walkart_diet',
  _opts: [
    {key:'vegetarian',l:'🥗 Végétarien'},{key:'vegan',l:'🌱 Vegan'},
    {key:'halal',l:'☪️ Halal'},{key:'kosher',l:'✡️ Casher'},
    {key:'gluten_free',l:'🌾 Sans gluten'},{key:'dairy_free',l:'🥛 Sans lactose'},
    {key:'low_carb',l:'🥩 Low carb'},{key:'keto',l:'🥓 Kéto'},
    {key:'low_sugar',l:'🍬 Peu de sucre'},{key:'high_protein',l:'💪 Riche en protéines'},
  ],
  get: () => JSON.parse(localStorage.getItem(DietaryProfile._KEY)||'{}'),
  toggle: (key) => {
    const p=DietaryProfile.get(); p[key]=!p[key]; localStorage.setItem(DietaryProfile._KEY, JSON.stringify(p));
    document.querySelectorAll(`[data-diet="${key}"]`).forEach(el=>el.classList.toggle('active',!!p[key]));
  },
  renderPage: () => {
    const p = DietaryProfile.get();
    return `<div class="container"><p class="diet-intro">Sélectionnez vos préférences alimentaires pour personnaliser votre expérience.</p>
      <div class="diet-grid">${DietaryProfile._opts.map(o=>`
        <div class="diet-card ${p[o.key]?'active':''}" data-diet="${o.key}" onclick="DietaryProfile.toggle('${o.key}')">
          <span class="diet-emoji">${o.l.split(' ')[0]}</span>
          <span class="diet-label">${o.l.slice(o.l.indexOf(' ')+1)}</span>
          ${p[o.key]?'<span class="diet-check">✓</span>':''}
        </div>`).join('')}</div></div>`;
  }
};

// ============================================================
// 18. WORLD MAP (regions)
// ============================================================
const WorldMapPage = {
  _regions: [
    {n:'🇪🇺 Europe',a:['French','Italian','Spanish','Greek','British','German','Portuguese','Dutch','Croatian','Polish','Russian']},
    {n:'🌏 Asie',a:['Japanese','Chinese','Indian','Thai','Malaysian','Vietnamese','Filipino','Korean']},
    {n:'🌎 Amérique',a:['American','Mexican','Jamaican','Canadian','Brazilian','Peruvian']},
    {n:'🌍 Afrique',a:['Moroccan','Egyptian','Nigerian','Kenyan','Ethiopian','Tunisian']},
    {n:'🕌 Moyen-Orient',a:['Turkish','Lebanese','Syrian','Iranian','Israeli']},
    {n:'🦘 Océanie',a:['Australian','New Zealand']},
  ],
  renderPage: () => `<div class="container"><div class="worldmap-page">${WorldMapPage._regions.map(r=>`
    <div class="region-card">
      <div class="region-header">${Safe.html(r.n)}</div>
      <div class="region-areas">${r.a.map(a=>`<span class="area-chip" onclick="App.navigate('search',{area:'${Safe.attr(a)}'})">🍽️ ${Safe.html(a)}</span>`).join('')}</div>
    </div>`).join('')}</div></div>`
};

// ============================================================
// 19. TRENDING RECIPES
// ============================================================
const TrendingRecipes = {
  renderPage: async () => {
    try {
      const { data } = await supa.from('recipe_views').select('recipe_id,recipe_name,recipe_img,count').order('count',{ascending:false}).limit(12);
      if (data?.length) return `<div class="container"><div class="recipe-grid">${data.map(r=>`
        <div class="recipe-card" onclick="App.navigate('recipe',{id:'${Safe.attr(r.recipe_id)}'})">
          <img src="${Safe.attr(r.recipe_img)}" loading="lazy" alt="${Safe.attr(r.recipe_name)}">
          <div class="recipe-card-body"><div class="recipe-card-title">${Safe.html(r.recipe_name)}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">👁️ ${r.count} vues</div></div></div>`).join('')}</div></div>`;
    } catch {}
    const ps = Array.from({length:8},()=>fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r=>r.json()));
    const results = await Promise.all(ps); const meals = results.map(d=>d.meals?.[0]).filter(Boolean);
    return `<div class="container"><div class="recipe-grid">${meals.map(m=>`
      <div class="recipe-card" onclick="App.navigate('recipe',{id:'${Safe.attr(m.idMeal)}'})">
        <img src="${Safe.attr(m.strMealThumb)}" loading="lazy" alt="${Safe.attr(m.strMeal)}">
        <div class="recipe-card-body"><div class="recipe-card-title">${Safe.html(m.strMeal)}</div></div></div>`).join('')}</div></div>`;
  }
};

// ============================================================
// 20. RECIPE CONTESTS
// ============================================================
const RecipeContests = {
  _themes: ['Cuisine italienne','Recettes végétariennes','Desserts du monde','Plats épicés','Cuisine de saison','Recettes rapides (< 30min)','Cuisine asiatique','Recettes de grand-mère'],
  renderPage: async () => {
    const week = Math.floor(Date.now()/(7*24*3600*1000));
    const theme = RecipeContests._themes[week % RecipeContests._themes.length];
    let entries = [];
    try { const {data}=await supa.from('contest_entries').select('*,profiles(full_name)').eq('week_id',week).order('votes',{ascending:false}).limit(10); entries=data||[]; } catch {}
    return `<div class="container"><div class="contest-hero">
      <div class="contest-theme-badge">🏆 Thème de la semaine</div>
      <h2 class="contest-title">${Safe.html(theme)}</h2>
      <p class="contest-desc">Partagez votre meilleure recette sur ce thème. La communauté vote !</p>
      ${currentUser?`<button class="btn btn-primary" onclick="RecipeContests.showSubmit(${week})">+ Soumettre ma recette</button>`:
        `<p style="color:var(--text-muted)">Connectez-vous pour participer</p>`}
    </div>
    ${entries.length?`<h3 style="margin:20px 0 12px">🏆 Classement</h3>
    <div class="contest-entries">${entries.map((e,i)=>`
      <div class="contest-entry">
        <span class="contest-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span>
        <span class="contest-name">${Safe.html(e.recipe_name)}</span>
        <span class="contest-author">par ${Safe.html(e.profiles?.full_name||'Anonyme')}</span>
        <span class="contest-votes">${e.votes||0} ❤️</span>
        <button class="vote-btn" onclick="RecipeContests.vote(${e.id})">👍</button>
      </div>`).join('')}</div>`:`<div class="empty-state">Aucune soumission. Soyez le premier !</div>`}</div>`;
  },
  showSubmit: (weekId) => {
    const favs = Actions.getFavorites?.() || [];
    if (!favs.length) { UI.toast?.('Ajoutez des recettes en favoris pour participer'); return; }
    const m=document.createElement('div'); m.className='modal-backdrop';
    m.innerHTML=`<div class="modal-card"><h3>Soumettre une recette</h3>
      <select id="contest-sel" class="input-field">${favs.map(f=>`<option value="${Safe.attr(f.id)}|${Safe.attr(f.name||f.title||'')}">${Safe.html(f.name||f.title||'')}</option>`).join('')}</select>
      <div class="modal-actions"><button class="btn" onclick="this.closest('.modal-backdrop').remove()">Annuler</button>
      <button class="btn btn-primary" onclick="RecipeContests.submit(${weekId})">Envoyer</button></div></div>`;
    document.body.appendChild(m);
  },
  submit: async (weekId) => {
    if(!currentUser) return; const sel=document.getElementById('contest-sel'); if(!sel) return;
    const [id,name]=sel.value.split('|');
    try { await supa.from('contest_entries').upsert({week_id:weekId,user_id:currentUser.id,recipe_id:id,recipe_name:name,votes:0},{onConflict:'week_id,user_id'}); document.querySelector('.modal-backdrop')?.remove(); UI.toast?.('✅ Recette soumise !'); App.navigate('contests'); } catch(e){ UI.toast?.('Erreur : '+e.message); }
  },
  vote: async (entryId) => {
    if(!currentUser){UI.toast?.('Connectez-vous pour voter');return;}
    try { await supa.rpc('vote_contest_entry',{entry_id:entryId}); UI.toast?.('❤️ Merci !'); App.navigate('contests'); } catch { UI.toast?.('Déjà voté ou erreur'); }
  }
};

// ============================================================
// 21. COOKING GROUPS
// ============================================================
const CookingGroups = {
  renderPage: async () => {
    if(!currentUser) return `<div class="container"><div class="empty-state">Connectez-vous pour créer ou rejoindre des groupes de cuisine.</div></div>`;
    let groups=[]; try { const {data}=await supa.from('cooking_groups').select('*,group_members!inner(user_id)').eq('group_members.user_id',currentUser.id); groups=data||[]; } catch {}
    return `<div class="container">
      <div class="groups-actions">
        <button class="btn btn-primary" onclick="CookingGroups.showCreate()">+ Créer un groupe</button>
        <button class="btn btn-outline" onclick="CookingGroups.showJoin()">🔗 Rejoindre</button>
      </div>
      ${groups.length?`<div class="group-list">${groups.map(g=>`
        <div class="group-card">
          <div class="group-icon">${Safe.html(g.emoji||'👨‍🍳')}</div>
          <div class="group-info"><div class="group-name">${Safe.html(g.name)}</div>
          <div class="group-meta">Code : <b>${Safe.html(g.invite_code||'')}</b></div></div>
        </div>`).join('')}</div>`:`<div class="empty-state">Rejoignez un groupe pour partager vos recettes et plannings !</div>`}</div>`;
  },
  showCreate: () => {
    const em=['👨‍🍳','👩‍🍳','🍕','🍜','🥘','🍣','🥗','🍔','🌮','🍝'];
    const m=document.createElement('div'); m.className='modal-backdrop';
    m.innerHTML=`<div class="modal-card"><h3>Créer un groupe</h3>
      <div class="emoji-picker">${em.map(e=>`<span class="emoji-opt" onclick="document.getElementById('grp-emoji').value='${e}';document.querySelectorAll('.emoji-opt').forEach(x=>x.classList.remove('sel'));this.classList.add('sel')">${e}</span>`).join('')}</div>
      <input type="hidden" id="grp-emoji" value="👨‍🍳">
      <input type="text" id="grp-name" class="input-field" placeholder="Nom du groupe" maxlength="50" style="margin-top:12px">
      <div class="modal-actions"><button class="btn" onclick="this.closest('.modal-backdrop').remove()">Annuler</button>
      <button class="btn btn-primary" onclick="CookingGroups.create()">Créer</button></div></div>`;
    document.body.appendChild(m);
  },
  create: async () => {
    if(!currentUser) return; const name=document.getElementById('grp-name')?.value?.trim(); const emoji=document.getElementById('grp-emoji')?.value||'👨‍🍳';
    if(!name){UI.toast?.('Entrez un nom');return;}
    try { const {data,error}=await supa.from('cooking_groups').insert({name,emoji,created_by:currentUser.id}).select().single(); if(error) throw error; await supa.from('group_members').insert({group_id:data.id,user_id:currentUser.id,role:'admin'}); document.querySelector('.modal-backdrop')?.remove(); UI.toast?.('✅ Groupe créé !'); App.navigate('cooking-groups'); } catch(e){UI.toast?.('Erreur : '+e.message);}
  },
  showJoin: () => {
    const m=document.createElement('div'); m.className='modal-backdrop';
    m.innerHTML=`<div class="modal-card"><h3>Rejoindre un groupe</h3>
      <input type="text" id="join-code" class="input-field" placeholder="Code d'invitation">
      <div class="modal-actions"><button class="btn" onclick="this.closest('.modal-backdrop').remove()">Annuler</button>
      <button class="btn btn-primary" onclick="CookingGroups.join()">Rejoindre</button></div></div>`;
    document.body.appendChild(m);
  },
  join: async () => {
    if(!currentUser) return; const code=document.getElementById('join-code')?.value?.trim(); if(!code) return;
    try { const {data:g}=await supa.from('cooking_groups').select('*').eq('invite_code',code).single(); if(!g){UI.toast?.('Code invalide');return;} await supa.from('group_members').insert({group_id:g.id,user_id:currentUser.id,role:'member'}); document.querySelector('.modal-backdrop')?.remove(); UI.toast?.('✅ Groupe rejoint !'); App.navigate('cooking-groups'); } catch(e){UI.toast?.('Erreur : '+e.message);}
  }
};

// ============================================================
// 22. KITCHEN STOCK
// ============================================================
const KitchenStock = {
  _KEY: 'walkart_stock',
  get: () => JSON.parse(localStorage.getItem(KitchenStock._KEY)||'[]'),
  add: (item,qty,unit) => { const s=KitchenStock.get(); const ei=s.findIndex(x=>x.item.toLowerCase()===item.toLowerCase()); if(ei>=0){s[ei]={...s[ei],qty,unit};}else{s.push({item,qty,unit,added:Date.now()});} localStorage.setItem(KitchenStock._KEY,JSON.stringify(s)); },
  remove: (item) => { localStorage.setItem(KitchenStock._KEY,JSON.stringify(KitchenStock.get().filter(s=>s.item!==item))); },
  _list: (s) => s.length?s.map(x=>`<div class="stock-item"><span class="stock-name">${Safe.html(x.item)}</span><span class="stock-qty">${Safe.html(x.qty||'')} ${Safe.html(x.unit||'')}</span><button class="icon-btn" onclick="KitchenStock.remove('${Safe.attr(x.item)}');this.closest('.stock-item').remove()">🗑️</button></div>`).join(''):`<div class="empty-state">📦 Stock vide. Ajoutez vos ingrédients !</div>`,
  renderPage: () => `<div class="container"><div class="stock-add-row">
    <input type="text" id="stock-item" class="input-field" placeholder="Ingrédient" style="flex:2">
    <input type="text" id="stock-qty" class="input-field" placeholder="Qté" style="flex:1">
    <input type="text" id="stock-unit" class="input-field" placeholder="Unité" style="flex:1">
    <button class="btn btn-primary" onclick="KitchenStock.addFromForm()">+</button></div>
    <div class="stock-list" id="stock-list">${KitchenStock._list(KitchenStock.get())}</div></div>`,
  addFromForm: () => {
    const item=document.getElementById('stock-item')?.value?.trim(); const qty=document.getElementById('stock-qty')?.value?.trim()||''; const unit=document.getElementById('stock-unit')?.value?.trim()||'';
    if(!item) return; KitchenStock.add(item,qty,unit);
    ['stock-item','stock-qty','stock-unit'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const l=document.getElementById('stock-list'); if(l) l.innerHTML=KitchenStock._list(KitchenStock.get());
  }
};

// ============================================================
// 23. MEAL BUDGET
// ============================================================
const MealBudget = {
  _KEY: 'walkart_budget', _LIMIT: 'walkart_budget_limit',
  get: () => JSON.parse(localStorage.getItem(MealBudget._KEY)||'[]'),
  add: (label,amount,date) => { const e=MealBudget.get(); e.push({label,amount:parseFloat(amount),date:date||new Date().toISOString().split('T')[0],id:Date.now()}); localStorage.setItem(MealBudget._KEY,JSON.stringify(e)); },
  remove: (id) => { localStorage.setItem(MealBudget._KEY,JSON.stringify(MealBudget.get().filter(e=>e.id!==id))); },
  monthTotal: () => { const m=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`; return MealBudget.get().filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+e.amount,0); },
  renderPage: () => {
    const entries=MealBudget.get().sort((a,b)=>b.date.localeCompare(a.date));
    const total=MealBudget.monthTotal(); const limit=parseFloat(localStorage.getItem(MealBudget._LIMIT)||'300');
    const pct=Math.min(100,Math.round(total/limit*100));
    return `<div class="container"><div class="budget-summary">
      <div class="budget-total">${total.toFixed(2)} €</div>
      <div class="budget-label">ce mois / ${limit} €</div>
      <div class="budget-bar"><div class="budget-fill ${pct>90?'danger':pct>70?'warn':''}" style="width:${pct}%"></div></div>
    </div>
    <div class="budget-settings-row">
      <label>Budget mensuel :</label>
      <input type="number" id="budget-limit" class="input-field" value="${limit}" style="width:100px" onchange="localStorage.setItem('${MealBudget._LIMIT}',this.value);App.navigate('meal-budget')">
    </div>
    <div class="budget-add-row">
      <input type="text" id="budget-label" class="input-field" placeholder="Description" style="flex:2">
      <input type="number" id="budget-amount" class="input-field" placeholder="€" style="flex:1" step="0.01">
      <input type="date" id="budget-date" class="input-field" value="${new Date().toISOString().split('T')[0]}" style="flex:1.5">
      <button class="btn btn-primary" onclick="MealBudget.addFromForm()">+</button></div>
    <div class="budget-entries" id="budget-entries">${MealBudget._renderEntries(entries)}</div></div>`;
  },
  _renderEntries: (entries) => entries.length?entries.map(e=>`<div class="budget-entry"><div class="budget-entry-info"><span class="budget-entry-label">${Safe.html(e.label)}</span><span class="budget-entry-date">${Safe.html(e.date)}</span></div><span class="budget-entry-amount">${e.amount.toFixed(2)} €</span><button class="icon-btn" onclick="MealBudget.remove(${e.id});this.closest('.budget-entry').remove()">×</button></div>`).join(''):`<div class="empty-state">Aucune dépense enregistrée</div>`,
  addFromForm: () => {
    const label=document.getElementById('budget-label')?.value?.trim(); const amount=document.getElementById('budget-amount')?.value; const date=document.getElementById('budget-date')?.value;
    if(!label||!amount) return; MealBudget.add(label,amount,date); App.navigate('meal-budget');
  }
};

// ============================================================
// 24. GOOGLE CALENDAR EXPORT
// ============================================================
const CalendarExport = {
  exportPlan: (plan) => {
    const days=['mon','tue','wed','thu','fri','sat','sun']; const now=new Date();
    const monday=new Date(now); monday.setDate(now.getDate()-now.getDay()+1);
    let ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Walkart//Meal Planner//FR\r\n';
    days.forEach((day,i)=>{
      (plan[day]||[]).forEach(meal=>{
        const d=new Date(monday); d.setDate(monday.getDate()+i); const ds=d.toISOString().replace(/-/g,'').replace(/T.*/,'');
        ics+=`BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${ds}\r\nDTEND;VALUE=DATE:${ds}\r\nSUMMARY:${meal.name||'Repas'}\r\nDESCRIPTION:Recette Walkart\r\nEND:VEVENT\r\n`;
      });
    });
    ics+='END:VCALENDAR';
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); a.download='walkart-meal-plan.ics'; a.click(); URL.revokeObjectURL(a.href);
    UI.toast?.('📅 Planning exporté !');
  }
};

// ============================================================
// 25. WEATHER SUGGESTION
// ============================================================
const WeatherSuggestion = {
  _cache: null, _ts: 0,
  getWeather: () => new Promise(res => {
    if(WeatherSuggestion._cache&&Date.now()-WeatherSuggestion._ts<3600000){res(WeatherSuggestion._cache);return;}
    if(!navigator.geolocation){res(null);return;}
    navigator.geolocation.getCurrentPosition(async pos=>{
      try { const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`); const d=await r.json(); WeatherSuggestion._cache=d.current_weather; WeatherSuggestion._ts=Date.now(); res(d.current_weather); } catch{res(null);}
    },()=>res(null),{timeout:5000});
  }),
  getSuggestion: (w) => {
    if(!w) return null; const t=w.temperature; const rain=[51,53,55,61,63,65,80,81,82].includes(w.weathercode);
    if(t<5) return {l:'❄️ Il fait froid → Plat chaud',c:'Beef',e:'🍲'};
    if(rain) return {l:'🌧️ Jour de pluie → Soupe',c:'Chicken',e:'🍵'};
    if(t>28) return {l:'☀️ Grosse chaleur → Plat léger',c:'Salad',e:'🥗'};
    if(t>20) return {l:'🌤️ Belle journée → Barbecue ?',c:'Pork',e:'🥩'};
    return {l:'🌡️ Température douce → Pasta !',c:'Pasta',e:'🍝'};
  },
  renderCard: async () => {
    try { const w=await WeatherSuggestion.getWeather(); const s=WeatherSuggestion.getSuggestion(w); if(!s) return '';
      return `<div class="weather-card" onclick="App.navigate('search',{category:'${Safe.attr(s.c)}'})">
        <span class="weather-emoji">${s.e}</span>
        <div class="weather-info"><div class="weather-temp">${w?Math.round(w.temperature)+'°C':''}</div><div class="weather-suggestion">${Safe.html(s.l)}</div></div>
        <span class="weather-arrow">›</span></div>`;
    } catch { return ''; }
  }
};

// ============================================================
// 26. CULINARY CHATBOT
// ============================================================
const CulinaryChat = {
  _kb: [
    {q:['caraméliser','oignon'],a:'🧅 Caraméliser des oignons : lamelles fines, feu doux, beurre + huile. Cuisez 30-40 min en remuant. Une pincée de sel accélère le processus.'},
    {q:['steak','cuisson','boeuf','température'],a:'🥩 Températures : Bleu 45-50°C · Saignant 50-55°C · À point 60-65°C · Bien cuit 70°C+. Utilisez un thermomètre à viande !'},
    {q:['pâte','lever','pain','levure'],a:'🍞 Pour réussir la levée : bol fariné, linge humide, four éteint + bol d\'eau chaude à 30°C. Durée : 1h minimum.'},
    {q:['sauce','ratée','réparer'],a:'🫙 Sauce qui tranche : ajoutez quelques gouttes d\'eau froide et fouettez. Béchamel grumeleuse : mixez avec un plongeant.'},
    {q:['trop épicé','piment','adoucir'],a:'🌶️ Plat trop épicé : ajoutez crème fraîche, lait de coco ou sucre. Évitez l\'eau qui diffuse la capsaïcine !'},
    {q:['friture','frite','huile','température'],a:'🍟 Friture idéale : 170-180°C. Testez avec un manche en bois : petites bulles = prêt.'},
    {q:['oeuf','poché'],a:'🥚 Oeufs pochés : eau frémissante + 1cs vinaigre blanc. Tourbillon, oeuf dans une tasse. 3 min de cuisson.'},
    {q:['risotto','riz','crémeux'],a:'🍚 Risotto : bouillon chaud ajouté louche par louche en remuant. Terminez hors feu avec beurre froid et parmesan.'},
    {q:['conservation','frigo','congeler'],a:'❄️ Durées frigo : Viande crue 2-3j · Poisson 1-2j · Restes 3-4j · Oeufs 3-4 semaines.'},
    {q:['substitut','remplacer','ingrédient'],a:'🔄 Substitutions : Beurre → huile d\'olive · Crème → yaourt grec · Oeuf → 1cs lin + 3cs eau.'},
    {q:['trop salé','sel','dessaler'],a:'🧂 Plat trop salé : ajoutez une pomme de terre crue 15 min puis retirez. Ou ajoutez du sucre / citron.'},
    {q:['couteau','aiguiser','affûter'],a:'🔪 Affûtage : pierre à aiguiser (grain 1000 puis 3000) à 20° d\'angle. L\'acier entretient mais n\'affûte pas vraiment.'},
    {q:['marinade','mariner'],a:'🫙 Marinade = acide + huile + aromates. Citrus : 30min-2h max. Boeuf : 24h au frigo.'},
    {q:['pâtes','al dente'],a:'🍝 Pâtes al dente : grande casserole, eau très salée, remuez les 2 premières minutes. Ôtez 1-2min avant le temps indiqué.'},
  ],
  getResponse: (msg) => {
    const lower = msg.toLowerCase();
    let best=null, bestScore=0;
    for(const entry of CulinaryChat._kb){ const score=entry.q.filter(k=>lower.includes(k)).length; if(score>bestScore){bestScore=score;best=entry;} }
    if(bestScore>0) return best.a;
    return '🤔 Je ne sais pas répondre à ça précisément. Essayez des questions sur : cuisson de la viande, sauces, pâtes, oeufs, marinades, conservation...';
  },
  renderPage: () => `<div class="container chat-page">
    <div class="chat-intro"><div class="chat-avatar">👨‍🍳</div>
    <div>Bonjour ! Je suis votre assistant culinaire. Posez-moi des questions sur les techniques de cuisine.</div></div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-suggestions">${['Comment caraméliser des oignons ?','Comment pocher un oeuf ?','Mon plat est trop salé !','Risotto crémeux ?'].map(s=>`<button class="chat-suggest-btn" onclick="CulinaryChat._suggest(this,'${Safe.attr(s)}')">${Safe.html(s)}</button>`).join('')}</div>
    </div>
    <div class="chat-input-row">
      <input type="text" id="chat-input" class="input-field" placeholder="Posez votre question..." onkeydown="if(event.key==='Enter')CulinaryChat.send()">
      <button class="btn btn-primary" onclick="CulinaryChat.send()">→</button></div></div>`,
  _suggest: (btn, text) => { btn.closest('.chat-suggestions')?.remove(); CulinaryChat._append('user',text); setTimeout(()=>CulinaryChat._append('bot',CulinaryChat.getResponse(text)),400); },
  send: () => { const inp=document.getElementById('chat-input'); if(!inp||!inp.value.trim()) return; const msg=inp.value.trim(); inp.value=''; CulinaryChat._append('user',msg); setTimeout(()=>CulinaryChat._append('bot',CulinaryChat.getResponse(msg)),400); },
  _append: (role,text) => { const c=document.getElementById('chat-messages'); if(!c) return; const d=document.createElement('div'); d.className=`chat-msg ${role}`; d.innerHTML=`<div class="chat-bubble">${Safe.html(text)}</div>`; c.appendChild(d); c.scrollTop=c.scrollHeight; }
};

// ============================================================
// 27. SCHOOL PLANNING
// ============================================================
const SchoolPlanning = {
  _KEY: 'walkart_school',
  get: () => JSON.parse(localStorage.getItem(SchoolPlanning._KEY)||'{}'),
  renderPage: async () => {
    const plan=SchoolPlanning.get(); const days=[{k:'lun',l:'Lundi'},{k:'mar',l:'Mardi'},{k:'mer',l:'Mercredi'},{k:'jeu',l:'Jeudi'},{k:'ven',l:'Vendredi'}];
    return `<div class="container"><div class="school-header"><span class="school-icon">🎒</span><div><h2 style="margin:0">Planning scolaire</h2><p style="margin:0;color:var(--text-muted);font-size:.85rem">Organisez les repas de la semaine</p></div></div>
    <div class="school-grid">${days.map(d=>{
      const lunchbox=plan[d.k]?.[0]; const soir=plan[d.k]?.[1];
      return `<div class="school-day-card"><div class="school-day-label">${d.l}</div>
        <div class="school-meal-slot ${lunchbox?'filled':''}" onclick="SchoolPlanning.pick('${d.k}',0)">${lunchbox?`<img src="${Safe.attr(lunchbox.img)}" class="school-meal-img" alt=""><span class="school-meal-name">${Safe.html(lunchbox.name)}</span>`:`<span class="school-meal-type">🍱 Lunchbox</span><span class="school-add-icon">+</span>`}</div>
        <div class="school-meal-slot ${soir?'filled':''}" onclick="SchoolPlanning.pick('${d.k}',1)">${soir?`<img src="${Safe.attr(soir.img)}" class="school-meal-img" alt=""><span class="school-meal-name">${Safe.html(soir.name)}</span>`:`<span class="school-meal-type">🏠 Repas soir</span><span class="school-add-icon">+</span>`}</div>
      </div>`;
    }).join('')}</div>
    <div class="school-actions">
      <button class="btn btn-outline" onclick="CalendarExport.exportPlan(SchoolPlanning.get())">📅 Exporter</button>
      <button class="btn btn-outline" style="color:var(--danger)" onclick="localStorage.removeItem('${SchoolPlanning._KEY}');App.navigate('school-planning')">🗑️ Effacer</button>
    </div></div>`;
  },
  pick: (day, slot) => {
    const favs=Actions.getFavorites?.()|| [];
    const m=document.createElement('div'); m.className='modal-backdrop';
    m.innerHTML=`<div class="modal-card"><h3>Choisir un repas</h3>
      ${favs.length?`<div class="school-pick-grid">${favs.slice(0,12).map(f=>`<div class="school-pick-item" onclick="SchoolPlanning.set('${Safe.attr(day)}',${slot},'${Safe.attr(f.id)}','${Safe.attr(f.name||f.title||'')}','${Safe.attr(f.img||f.image||'')}')"><img src="${Safe.attr(f.img||f.image||'')}" alt=""><span>${Safe.html(f.name||f.title||'')}</span></div>`).join('')}</div>`:'<p>Ajoutez des recettes en favoris pour les utiliser ici.</p>'}
      <button class="btn" onclick="this.closest('.modal-backdrop').remove()" style="margin-top:12px">Annuler</button></div>`;
    document.body.appendChild(m);
  },
  set: (day, slot, id, name, img) => {
    const p=SchoolPlanning.get(); if(!p[day]) p[day]={}; p[day][slot]={id,name,img}; localStorage.setItem(SchoolPlanning._KEY,JSON.stringify(p));
    document.querySelector('.modal-backdrop')?.remove(); App.navigate('school-planning');
  }
};

// ============================================================
// RECIPE DETAIL INJECTION — fires after _recipeRendered
// ============================================================
document.addEventListener('_recipeRendered', async (e) => {
  const recipeId = e.detail?.id;
  const recipe = e.detail?.recipe;
  if (!recipeId || !recipe) return;

  // Build ingredients text for substitutions
  const ingLines = [];
  for (let i=1;i<=20;i++) { const v=recipe[`strIngredient${i}`]; if(v&&v.trim()) ingLines.push(v); }
  const ingText = ingLines.join('\n');

  // Build ingredients HTML with data-qty for portion scaling
  const buildIngHtml = () => {
    const rows = [];
    for (let i=1;i<=20;i++) {
      const ing=recipe[`strIngredient${i}`]?.trim(); const mea=recipe[`strMeasure${i}`]?.trim();
      if(!ing) continue;
      const num = mea ? parseFloat(mea.replace(/[^0-9.\/]/g,'')) : NaN;
      const numStr = isNaN(num) ? '' : `<span data-qty="${num}">${num}</span>`;
      const unit = mea ? mea.replace(/^[\d.\/\s]+/,'').trim() : '';
      rows.push(`<li>${numStr}${numStr&&unit?' ':''}${Safe.html(unit)} ${Safe.html(ing)}</li>`);
    }
    return rows.join('');
  };

  // Servings
  const servings = recipe.strServings ? parseInt(recipe.strServings) : 4;

  // Extra action buttons
  const extraActions = `
    <div class="recipe-extra-actions" data-recipe-id="${Safe.attr(recipeId)}">
      <button class="recipe-action-btn" onclick="CookingMode.start(${JSON.stringify(recipe.strInstructions||'').replace(/"/g,'&quot;')})">👨‍🍳 Mode Cuisine</button>
      <button class="recipe-action-btn" onclick="RecipeStories.open(${JSON.stringify({strMeal:recipe.strMeal,strInstructions:recipe.strInstructions}).replace(/"/g,'&quot;')})">📖 Stories</button>
      <button class="recipe-action-btn" onclick="TVMode.open('${Safe.attr(recipe.strMeal)}','${buildIngHtml().replace(/'/g,'\\\'').replace(/\n/g,'')}','${(recipe.strInstructions||'').replace(/'/g,'\\\'').replace(/\n/g,' ')}')">📺 TV</button>
      <button class="recipe-action-btn" onclick="ShareRecipe.native('${Safe.attr(recipe.strMeal)}','${Safe.attr(recipeId)}')">📤 Partager</button>
      <button class="recipe-action-btn" onclick="ShareRecipe.whatsapp('${Safe.attr(recipe.strMeal)}','${Safe.attr(recipeId)}')">💬 WhatsApp</button>
      <button class="recipe-action-btn" onclick="ShareRecipe.print()">🖨️ Imprimer</button>
      <button class="recipe-action-btn wishlist-btn ${Wishlist.has(recipeId)?'active':''}" data-wishlist-id="${Safe.attr(recipeId)}" onclick="Wishlist.toggle('${Safe.attr(recipeId)}','${Safe.attr(recipe.strMeal||'')}','${Safe.attr(recipe.strMealThumb||'')}');this.classList.toggle('active')">✨ À essayer</button>
      <button class="recipe-action-btn" onclick="CookingHistory.log('${Safe.attr(recipeId)}','${Safe.attr(recipe.strMeal||'')}','${Safe.attr(recipe.strMealThumb||'')}');UI.toast?.('✅ Marqué comme cuisiné !')">✅ J'ai cuisiné</button>
    </div>
    ${PortionScale.renderControl(servings)}
    ${CostEstimate.render(recipe)}`;

  const extraSections = YouTubePanel.render(recipe) + WinePairing.render(recipe) + IngredientSubs.render(ingText) + PersonalTags.render(recipeId);

  const container = document.getElementById('recipe-feature-sections');
  if (container) {
    // Prepend extra actions before the existing sections (comments/photos)
    container.insertAdjacentHTML('beforebegin', extraActions);
    container.insertAdjacentHTML('beforeend', extraSections);
  }
});

// ============================================================
// ROUTE INTEGRATION — extend App.navigate
// ============================================================
(function() {
  const _prev2 = App.navigate.bind(App);
  App.navigate = async (route, params={}) => {
    const routes2 = {
      'wishlist': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">✨ À essayer</h2></div>` + Wishlist.renderPage();
      },
      'cooking-history': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🍳 Historique</h2></div>` + CookingHistory.renderPage();
      },
      'badges': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🏅 Mes badges</h2></div>` + BadgeSystem.renderPage();
      },
      'dietary-profile': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🥗 Profil alimentaire</h2></div>` + DietaryProfile.renderPage();
      },
      'world-map': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🌍 Carte du monde</h2></div>` + WorldMapPage.renderPage();
      },
      'trending': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🔥 Tendances</h2></div>`;
        document.getElementById('app-root').innerHTML += await TrendingRecipes.renderPage();
      },
      'contests': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🏆 Concours</h2></div>`;
        document.getElementById('app-root').innerHTML += await RecipeContests.renderPage();
      },
      'cooking-groups': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">👨‍🍳 Groupes de cuisine</h2></div>`;
        document.getElementById('app-root').innerHTML += await CookingGroups.renderPage();
      },
      'kitchen-stock': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">📦 Stock cuisine</h2></div>` + KitchenStock.renderPage();
      },
      'meal-budget': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">💶 Budget repas</h2></div>` + MealBudget.renderPage();
      },
      'culinary-chat': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">👨‍🍳 Assistant culinaire</h2></div>` + CulinaryChat.renderPage();
      },
      'school-planning': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🎒 Planning scolaire</h2></div>`;
        document.getElementById('app-root').innerHTML += await SchoolPlanning.renderPage();
      },
      'world-trends': async () => {
        document.getElementById('app-root').innerHTML = `<div class="container"><h2 class="page-title">🔥 Tendances</h2></div>`;
        document.getElementById('app-root').innerHTML += await TrendingRecipes.renderPage();
      },
    };
    if (routes2[route]) { routes2[route](); return; }
    _prev2(route, params);
  };
})();

// ============================================================
// INIT
// ============================================================
FontSizeCtrl.init();
