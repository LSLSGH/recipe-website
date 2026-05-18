/* =====================================================
   WALKART FEATURES v1.0
   Commentaires · Photos · Recettes perso · Défis
   Suivi macros · Scanner · Allergènes · Auto-plan
   Vider le frigo · Partage plan · Amis · Classements
   ===================================================== */

// ---- COMMENTS ----
const Comments = {
  load: async (recipeId) => {
    try {
      const { data } = await supa.from('comments')
        .select('*').eq('recipe_id', recipeId)
        .order('created_at', { ascending: false }).limit(50);
      return data || [];
    } catch { return []; }
  },
  post: async (recipeId, text) => {
    if (!currentUser) return { error: { message: 'Connectez-vous pour commenter' } };
    const userName = currentProfile?.full_name || currentUser.email?.split('@')[0] || 'User';
    const { error } = await supa.from('comments').insert({
      recipe_id: recipeId, user_id: currentUser.id, user_name: userName, text: text.trim()
    });
    return { error };
  },
  delete: async (id) => {
    if (!currentUser) return;
    await supa.from('comments').delete().eq('id', id).eq('user_id', currentUser.id);
  }
};

// ---- COOKING PHOTOS ----
const CookingPhotos = {
  upload: async (recipeId, file, caption = '') => {
    if (!currentUser) return { error: { message: 'Connectez-vous' } };
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${currentUser.id}/${recipeId}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supa.storage.from('cooking-photos').upload(path, file);
    if (uploadError) return { error: uploadError };
    const { data: urlData } = supa.storage.from('cooking-photos').getPublicUrl(path);
    const { error } = await supa.from('cooking_photos').insert({
      user_id: currentUser.id, recipe_id: recipeId,
      photo_url: urlData.publicUrl, caption: caption.trim()
    });
    return { error, url: urlData.publicUrl };
  },
  load: async (recipeId) => {
    try {
      const { data } = await supa.from('cooking_photos')
        .select('*').eq('recipe_id', recipeId)
        .order('created_at', { ascending: false }).limit(20);
      return data || [];
    } catch { return []; }
  }
};

// ---- CUSTOM RECIPES ----
const CustomRecipes = {
  getAll: async () => {
    if (!currentUser) return [];
    try {
      const { data } = await supa.from('custom_recipes')
        .select('*').eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      return data || [];
    } catch { return []; }
  },
  getById: async (id) => {
    try {
      const { data } = await supa.from('custom_recipes').select('*').eq('id', id).single();
      return data;
    } catch { return null; }
  },
  save: async (recipe) => {
    if (!currentUser) return { error: { message: 'Connectez-vous' } };
    const payload = {
      user_id: currentUser.id,
      title: recipe.title?.trim(),
      image_url: recipe.image_url?.trim() || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions?.trim() || '',
      calories: parseInt(recipe.calories) || null,
      protein_g: parseFloat(recipe.protein_g) || null,
      prep_time: parseInt(recipe.prep_time) || null,
      servings: parseInt(recipe.servings) || 4,
      tags: recipe.tags || []
    };
    if (recipe.id) {
      const { error } = await supa.from('custom_recipes').update(payload).eq('id', recipe.id).eq('user_id', currentUser.id);
      return { error };
    } else {
      const { data, error } = await supa.from('custom_recipes').insert(payload).select().single();
      return { error, data };
    }
  },
  delete: async (id) => {
    if (!currentUser) return;
    await supa.from('custom_recipes').delete().eq('id', id).eq('user_id', currentUser.id);
  },
  toMealFormat: (r) => ({
    idMeal: 'custom_' + r.id,
    strMeal: r.title,
    strMealThumb: r.image_url || '',
    strInstructions: r.instructions || '',
    strCategory: 'Ma recette',
    strArea: '',
    strTags: (r.tags || []).join(','),
    strSource: '', strYoutube: '',
    _calories: r.calories, _protein: r.protein_g,
    _readyIn: r.prep_time, _servings: r.servings,
    _spoonIngredients: r.ingredients || [],
    _isCustom: true, _customId: r.id
  })
};

// ---- WEEKLY CHALLENGES ----
const Challenges = {
  _list: [
    { id: 'italian_week', emoji: '🍝', title: 'Semaine italienne', desc: 'Cuisinez 3 recettes italiennes', target: 3 },
    { id: 'veg_challenge', emoji: '🥗', title: 'Défi végétarien', desc: 'Préparez 5 plats sans viande', target: 5 },
    { id: 'world_tour', emoji: '🌍', title: 'Tour du monde', desc: 'Essayez 4 cuisines différentes', target: 4 },
    { id: 'quick_meals', emoji: '⚡', title: 'Repas express', desc: 'Cuisinez 6 recettes rapides', target: 6 },
    { id: 'breakfast_hero', emoji: '🥞', title: 'Roi du petit-déj', desc: 'Préparez 5 petits-déjeuners', target: 5 },
  ],
  getCurrent: () => {
    const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return Challenges._list[week % Challenges._list.length];
  },
  getProgress: () => {
    try { return JSON.parse(localStorage.getItem('walkart_challenges') || '{}'); } catch { return {}; }
  },
  addProgress: (recipeId) => {
    if (!recipeId) return;
    const challenge = Challenges.getCurrent();
    const data = Challenges.getProgress();
    if (!data[challenge.id]) data[challenge.id] = { count: 0, recipes: [], completedAt: null };
    if (!data[challenge.id].recipes.includes(recipeId)) {
      data[challenge.id].count++;
      data[challenge.id].recipes.push(recipeId);
      if (data[challenge.id].count >= challenge.target && !data[challenge.id].completedAt) {
        data[challenge.id].completedAt = new Date().toISOString();
        Toast.show('🏆 Défi complété ! Bravo !', 5000);
      }
    }
    localStorage.setItem('walkart_challenges', JSON.stringify(data));
    return data[challenge.id];
  }
};

// ---- NUTRITION TRACKER ----
const NutritionTracker = {
  log: async (calories, protein_g = 0, carbs_g = 0, fat_g = 0) => {
    const today = new Date().toISOString().split('T')[0];
    if (!currentUser) {
      const local = JSON.parse(localStorage.getItem('walkart_nutlog') || '{}');
      if (!local[today]) local[today] = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
      local[today].calories += calories;
      local[today].protein_g += protein_g;
      local[today].carbs_g += carbs_g;
      local[today].fat_g += fat_g;
      localStorage.setItem('walkart_nutlog', JSON.stringify(local));
      return;
    }
    try {
      const { data: existing } = await supa.from('nutrition_log')
        .select('*').eq('user_id', currentUser.id).eq('log_date', today).single();
      if (existing) {
        await supa.from('nutrition_log').update({
          calories: (existing.calories || 0) + calories,
          protein_g: (existing.protein_g || 0) + protein_g,
          carbs_g: (existing.carbs_g || 0) + carbs_g,
          fat_g: (existing.fat_g || 0) + fat_g
        }).eq('id', existing.id);
      } else {
        await supa.from('nutrition_log').insert({
          user_id: currentUser.id, log_date: today, calories, protein_g, carbs_g, fat_g
        });
      }
    } catch (e) { console.warn('NutritionTracker.log:', e); }
  },
  getLast30Days: async () => {
    const build = (local) => {
      const today = new Date();
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today); d.setDate(today.getDate() - (29 - i));
        const key = d.toISOString().split('T')[0];
        return { log_date: key, ...(local[key] || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }) };
      });
    };
    if (!currentUser) {
      const local = JSON.parse(localStorage.getItem('walkart_nutlog') || '{}');
      return build(local);
    }
    try {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data } = await supa.from('nutrition_log').select('*')
        .eq('user_id', currentUser.id).gte('log_date', since.toISOString().split('T')[0])
        .order('log_date', { ascending: true });
      return data || [];
    } catch { return []; }
  }
};

// ---- BARCODE SCANNER ----
const BarcodeScanner = {
  _stream: null,
  isSupported: () => 'BarcodeDetector' in window,
  start: async (videoEl, onDetect) => {
    try {
      BarcodeScanner._stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoEl.srcObject = BarcodeScanner._stream;
      await videoEl.play();
      if (!BarcodeScanner.isSupported()) return false;
      const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
      const scan = async () => {
        if (!BarcodeScanner._stream) return;
        try {
          const barcodes = await detector.detect(videoEl);
          if (barcodes.length > 0) { onDetect(barcodes[0].rawValue); return; }
        } catch {}
        requestAnimationFrame(scan);
      };
      scan(); return true;
    } catch { return false; }
  },
  stop: () => {
    if (BarcodeScanner._stream) {
      BarcodeScanner._stream.getTracks().forEach(t => t.stop());
      BarcodeScanner._stream = null;
    }
  },
  lookupProduct: async (barcode) => {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const p = data.product;
        return {
          name: p.product_name || p.product_name_en || 'Produit inconnu',
          brand: p.brands || '',
          calories: Math.round(p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0),
          protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
          image: p.image_url || '',
          quantity: p.quantity || ''
        };
      }
      return null;
    } catch { return null; }
  }
};

// ---- ALLERGEN FILTER ----
const AllergenFilter = {
  ALLERGENS: [
    { id: 'gluten', label: 'Gluten', keywords: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oat', 'semolina'] },
    { id: 'dairy', label: 'Lactose', keywords: ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'lactose', 'parmesan', 'mozzarella'] },
    { id: 'nuts', label: 'Noix', keywords: ['nut', 'almond', 'cashew', 'walnut', 'pecan', 'peanut', 'hazelnut', 'pistachio', 'pine nut'] },
    { id: 'eggs', label: 'Œufs', keywords: ['egg'] },
    { id: 'soy', label: 'Soja', keywords: ['soy', 'soya', 'tofu', 'edamame', 'miso'] },
    { id: 'fish', label: 'Poisson', keywords: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'bass', 'anchov', 'sardine', 'trout'] },
    { id: 'shellfish', label: 'Crustacés', keywords: ['shrimp', 'prawn', 'lobster', 'crab', 'clam', 'mussel', 'oyster', 'scallop'] },
    { id: 'sesame', label: 'Sésame', keywords: ['sesame', 'tahini'] }
  ],
  getActive: () => { try { return JSON.parse(localStorage.getItem('walkart_allergens') || '[]'); } catch { return []; } },
  setActive: (ids) => localStorage.setItem('walkart_allergens', JSON.stringify(ids)),
  _getIngredientText: (recipe) => {
    if (recipe._spoonIngredients?.length) {
      return recipe._spoonIngredients.map(i => `${i.name || ''} ${i.original || ''}`).join(' ').toLowerCase();
    }
    const parts = [];
    for (let k = 1; k <= 20; k++) {
      if (recipe[`strIngredient${k}`]) parts.push(recipe[`strIngredient${k}`]);
    }
    return parts.join(' ').toLowerCase();
  },
  recipeContainsAllergen: (recipe, allergenId) => {
    const allergen = AllergenFilter.ALLERGENS.find(a => a.id === allergenId);
    if (!allergen) return false;
    const text = AllergenFilter._getIngredientText(recipe);
    return allergen.keywords.some(kw => text.includes(kw));
  },
  filterRecipes: (recipes) => {
    const active = AllergenFilter.getActive();
    if (!active.length) return recipes;
    return recipes.filter(r => !active.some(a => AllergenFilter.recipeContainsAllergen(r, a)));
  }
};

// ---- SMART PLANNER ----
const SmartPlanner = {
  generate: async () => {
    if (!currentProfile) return false;
    const p = currentProfile;
    const targetCal = p.daily_calories || 2000;
    const bfCal = Math.round(targetCal * 0.25);
    const lnCal = Math.round(targetCal * 0.35);
    const extra = p.goal === 'lose_weight' ? `&maxCalories=${lnCal + 100}`
      : p.goal === 'gain_muscle' ? `&minProtein=30` : '';
    Toast.show('⏳ Génération du plan en cours...', 20000);
    try {
      const [breakfasts, lunches, dinners] = await Promise.all([
        SmartPlanner._fetch('breakfast', 7, `&maxCalories=${bfCal + 100}`),
        SmartPlanner._fetch('main course', 7, extra),
        SmartPlanner._fetch('main course', 7, extra + '&offset=7')
      ]);
      const dates = Planner.getWeekDates(0);
      const plan = Planner.get();
      dates.forEach((date, i) => {
        if (!plan[date]) plan[date] = {};
        const bf = breakfasts[i % Math.max(1, breakfasts.length)];
        const ln = lunches[i % Math.max(1, lunches.length)];
        const dn = dinners[i % Math.max(1, dinners.length)];
        if (bf) plan[date].breakfast = { idMeal: bf.idMeal, strMeal: bf.strMeal, strMealThumb: bf.strMealThumb };
        if (ln) plan[date].lunch = { idMeal: ln.idMeal, strMeal: ln.strMeal, strMealThumb: ln.strMealThumb };
        if (dn) plan[date].dinner = { idMeal: dn.idMeal, strMeal: dn.strMeal, strMealThumb: dn.strMealThumb };
      });
      localStorage.setItem('walkart_planner', JSON.stringify(plan));
      Toast.show('✅ Plan de la semaine généré !');
      return true;
    } catch { Toast.show('❌ Erreur lors de la génération'); return false; }
  },
  _fetch: async (type, n, extra = '') => {
    try {
      const url = `${SPOON_BASE}/complexSearch?apiKey=${SPOON_KEY}&number=${n}&type=${encodeURIComponent(type)}&addRecipeInformation=true&addRecipeNutrition=true${extra}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const d = await res.json();
      const recipes = (d.results || []).map(SpoonRecipes._normalize);
      recipes.forEach(r => RecipeStore.set(r.idMeal, r));
      return recipes;
    } catch { return []; }
  }
};

// ---- FRIDGE MODE ----
const FridgeMode = {
  search: async (ingredients) => {
    const ingList = ingredients.map(i => encodeURIComponent(i.trim())).join(',');
    try {
      const url = `${SPOON_BASE}/findByIngredients?apiKey=${SPOON_KEY}&ingredients=${ingList}&number=12&ranking=1&ignorePantry=true`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map(r => ({
        idMeal: 'spoon_' + r.id, strMeal: r.title,
        strMealThumb: r.image || '', strCategory: '', strArea: '',
        _missedCount: r.missedIngredientCount || 0,
        _usedCount: r.usedIngredientCount || 0,
        _missedIngredients: (r.missedIngredients || []).map(i => i.name)
      }));
    } catch { return []; }
  }
};

// ---- PLAN SHARE ----
const PlanShare = {
  encode: (planData) => {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(planData)))); } catch { return ''; }
  },
  decode: (encoded) => {
    try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch { return null; }
  },
  getShareUrl: () => {
    const plan = Planner.get();
    const encoded = PlanShare.encode(plan);
    return `${window.location.origin}${window.location.pathname}#shared-plan/${encoded}`;
  },
  getQRUrl: (url) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
  loadSharedPlan: (encoded) => {
    const plan = PlanShare.decode(encoded);
    if (!plan) return false;
    if (confirm('Importer ce plan de repas partagé ? Votre plan actuel sera remplacé.')) {
      localStorage.setItem('walkart_planner', JSON.stringify(plan));
      App.navigate('planner');
      Toast.show('✅ Plan importé !');
      return true;
    }
    return false;
  }
};

// ---- SOCIAL ----
const Social = {
  follow: async (userId) => {
    if (!currentUser) return { error: { message: 'Connectez-vous' } };
    const { error } = await supa.from('follows').insert({ follower_id: currentUser.id, followed_id: userId });
    return { error };
  },
  unfollow: async (userId) => {
    if (!currentUser) return;
    await supa.from('follows').delete().eq('follower_id', currentUser.id).eq('followed_id', userId);
  },
  isFollowing: async (userId) => {
    if (!currentUser) return false;
    try {
      const { data } = await supa.from('follows').select('follower_id')
        .eq('follower_id', currentUser.id).eq('followed_id', userId).maybeSingle();
      return !!data;
    } catch { return false; }
  },
  getFollowing: async () => {
    if (!currentUser) return [];
    try {
      const { data } = await supa.from('follows')
        .select('followed_id, profiles!follows_followed_id_fkey(id, full_name)')
        .eq('follower_id', currentUser.id);
      return data || [];
    } catch { return []; }
  },
  searchUsers: async (query) => {
    try {
      const { data } = await supa.from('profiles').select('id, full_name')
        .ilike('full_name', `%${query}%`).neq('id', currentUser?.id || '').limit(10);
      return data || [];
    } catch { return []; }
  },
  getFriendFavorites: async (userId) => {
    try {
      const { data } = await supa.from('favorites').select('*')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      return data || [];
    } catch { return []; }
  }
};

// ---- SHARED COLLECTIONS ----
const SharedCollections = {
  makePublic: async (name) => {
    if (!currentUser) return { error: { message: 'Connectez-vous' } };
    const localCols = Collections.get();
    const col = localCols[name];
    if (!col) return { error: { message: 'Collection introuvable' } };
    const shareToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const { data, error } = await supa.from('shared_collections').insert({
      user_id: currentUser.id, name, recipes: col, share_token: shareToken, is_public: true
    }).select().single();
    return { error, shareToken, data };
  },
  getByToken: async (token) => {
    try {
      const { data } = await supa.from('shared_collections')
        .select('*').eq('share_token', token).eq('is_public', true).single();
      return data;
    } catch { return null; }
  },
  getShareUrl: (token) => `${window.location.origin}${window.location.pathname}#shared-collection/${token}`
};

// ---- LEADERBOARD ----
const Leaderboard = {
  trackView: async (recipe) => {
    if (!recipe?.idMeal || recipe.idMeal.startsWith('custom_')) return;
    const key = `walkart_lbv_${recipe.idMeal}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    try {
      const { data: existing } = await supa.from('recipe_views')
        .select('id, total_views').eq('recipe_id', recipe.idMeal).maybeSingle();
      if (existing) {
        await supa.from('recipe_views').update({
          total_views: (existing.total_views || 0) + 1, last_seen: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await supa.from('recipe_views').insert({
          recipe_id: recipe.idMeal, recipe_title: recipe.strMeal || '',
          recipe_thumb: recipe.strMealThumb || '', total_views: 1,
          last_seen: new Date().toISOString()
        });
      }
    } catch {}
  },
  getTop: async (limit = 20) => {
    try {
      const { data } = await supa.from('recipe_views').select('*')
        .order('total_views', { ascending: false }).limit(limit);
      return data || [];
    } catch { return []; }
  }
};

// ============================================================
// FEATURE RENDERS
// ============================================================
const FeatureRender = {

  commentsSection: async (recipeId) => {
    const comments = await Comments.load(recipeId);
    const inputHtml = currentUser ? `
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <textarea id="comment-text" class="form-input" placeholder="Votre commentaire..." rows="2" style="resize:none;flex:1;min-height:60px;"></textarea>
        <button class="btn btn-primary" style="align-self:flex-end;white-space:nowrap;" onclick="FeatureActions.postComment('${Safe.attr(recipeId)}')">Envoyer</button>
      </div>` : `<p style="color:var(--text-muted);text-align:center;padding:12px 0;"><a href="#" onclick="App.navigate('login')" style="color:var(--primary);">Connectez-vous</a> pour commenter.</p>`;
    const commentItems = comments.map(c => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">👤 ${Safe.html(c.user_name || 'Utilisateur')}</span>
          <span class="comment-date">${new Date(c.created_at).toLocaleDateString()}</span>
          ${currentUser?.id === c.user_id ? `<button style="background:none;border:none;cursor:pointer;font-size:0.9rem;color:var(--text-muted);" onclick="FeatureActions.deleteComment('${c.id}', '${Safe.attr(recipeId)}')">🗑️</button>` : ''}
        </div>
        <p class="comment-text">${Safe.html(c.text)}</p>
      </div>`).join('');
    return `
      <div class="feature-section" id="comments-section">
        <h3 class="section-title">💬 Commentaires (${comments.length})</h3>
        ${inputHtml}
        <div class="comments-list">${commentItems || '<p style="color:var(--text-muted);text-align:center;padding:16px;">Soyez le premier à commenter !</p>'}</div>
      </div>`;
  },

  photosSection: async (recipeId) => {
    const photos = await CookingPhotos.load(recipeId);
    const uploadHtml = currentUser ? `
      <label class="photo-upload-area" style="cursor:pointer;display:block;border:2px dashed var(--border);border-radius:12px;padding:16px;text-align:center;margin-bottom:12px;">
        <input type="file" accept="image/*" style="display:none" onchange="FeatureActions.uploadPhoto('${Safe.attr(recipeId)}', this)">
        <span style="font-size:2rem;">📸</span><br>
        <span style="color:var(--text-muted);font-size:0.9rem;">Ajouter votre réalisation</span>
      </label>` : '';
    const photoGrid = photos.length ? `
      <div class="photo-grid">${photos.map(p => `
        <div class="photo-card">
          <img src="${Safe.attr(p.photo_url)}" class="photo-thumb" loading="lazy" onclick="FeatureActions.viewPhoto('${Safe.attr(p.photo_url)}')" style="cursor:pointer;">
          ${p.caption ? `<p class="photo-caption">${Safe.html(p.caption)}</p>` : ''}
        </div>`).join('')}
      </div>` : '<p style="color:var(--text-muted);text-align:center;padding:8px;">Aucune photo encore.</p>';
    return `
      <div class="feature-section" id="photos-section">
        <h3 class="section-title">📸 Réalisations (${photos.length})</h3>
        ${uploadHtml}${photoGrid}
      </div>`;
  },

  customRecipes: async () => {
    if (!currentUser) return `
      <div class="container" style="padding:40px 20px;text-align:center;">
        <button class="btn btn-ghost" onclick="App.goBack()" style="margin-bottom:24px;">← Retour</button>
        <div style="font-size:3rem;margin-bottom:16px;">🍽️</div>
        <p style="margin-bottom:16px;">Connectez-vous pour créer vos propres recettes.</p>
        <button class="btn btn-primary" onclick="App.navigate('login')">Se connecter</button>
      </div>`;
    const recipes = await CustomRecipes.getAll();
    const cards = recipes.map(r => `
      <div class="recipe-card">
        <div style="position:relative;cursor:pointer;" onclick="App.navigate('recipe', {id: 'custom_${r.id}'})">
          ${r.image_url
            ? `<img src="${Safe.attr(r.image_url)}" class="recipe-card-img" loading="lazy" onerror="this.style.display='none'">`
            : `<div class="recipe-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--surface);">🍽️</div>`}
          <div style="position:absolute;top:8px;left:8px;background:var(--primary);color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:20px;">Ma recette</div>
        </div>
        <div class="recipe-card-body">
          <h3 class="recipe-card-title" style="cursor:pointer;" onclick="App.navigate('recipe', {id: 'custom_${r.id}'})">${Safe.html(r.title)}</h3>
          ${r.calories ? `<span class="badge-cal">${r.calories} kcal</span>` : ''}
          ${r.prep_time ? `<span class="badge-cal" style="background:var(--surface);">⏱️ ${r.prep_time}min</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--border);">
          <button class="btn btn-ghost" style="flex:1;font-size:0.8rem;" onclick="App.navigate('edit-custom-recipe', {id: '${r.id}'})">✏️ Modifier</button>
          <button class="btn btn-ghost" style="color:#e53935;font-size:0.8rem;" onclick="FeatureActions.deleteCustomRecipe('${r.id}')">🗑️</button>
        </div>
      </div>`).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;flex:1;">🍽️ Mes Recettes</h2>
          <button class="btn btn-primary" onclick="App.navigate('create-custom-recipe')">+ Créer</button>
        </div>
        ${recipes.length ? `<div class="recipe-grid">${cards}</div>` : `
          <div style="text-align:center;padding:60px 20px;">
            <div style="font-size:4rem;margin-bottom:16px;">🍽️</div>
            <h3 style="margin-bottom:8px;">Aucune recette personnalisée</h3>
            <p style="color:var(--text-muted);margin-bottom:24px;">Créez et partagez vos propres recettes !</p>
            <button class="btn btn-primary" onclick="App.navigate('create-custom-recipe')">+ Créer une recette</button>
          </div>`}
      </div>`;
  },

  customRecipeForm: async (recipeId = null) => {
    let recipe = null;
    if (recipeId) recipe = await CustomRecipes.getById(recipeId);
    const r = recipe || {};
    const ingredients = r.ingredients?.length ? r.ingredients : [{ name: '', amount: '', unit: '' }];
    FeatureActions._customIngredients = ingredients.map(i => ({ ...i }));
    const ingRows = ingredients.map((ing, i) => `
      <div class="ingredient-row" id="ing-row-${i}" style="display:flex;gap:6px;margin-bottom:6px;">
        <input class="form-input" style="flex:3;" placeholder="Ingrédient" value="${Safe.attr(ing.name || '')}" oninput="FeatureActions._updateIng(${i}, 'name', this.value)">
        <input class="form-input" style="flex:1;" placeholder="Qté" value="${Safe.attr(String(ing.amount || ''))}" oninput="FeatureActions._updateIng(${i}, 'amount', this.value)">
        <input class="form-input" style="flex:1;" placeholder="Unité" value="${Safe.attr(ing.unit || '')}" oninput="FeatureActions._updateIng(${i}, 'unit', this.value)">
        <button style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#e53935;padding:0 4px;" onclick="FeatureActions.removeIng(${i})">✕</button>
      </div>`).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;max-width:600px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">${recipeId ? '✏️ Modifier la recette' : '✨ Nouvelle recette'}</h2>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="form-group">
            <label class="form-label">Nom de la recette *</label>
            <input id="cr-title" class="form-input" placeholder="Ex: Tarte aux pommes maison" value="${Safe.attr(r.title || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Photo de la recette</label>
            <div class="cr-image-row">
              <div class="cr-image-preview" id="cr-image-preview" ${r.image_url ? `style="background-image:url('${Safe.attr(r.image_url)}')"` : ''}>
                ${r.image_url ? '' : '<span class="cr-image-placeholder">📷</span>'}
              </div>
              <label class="btn btn-outline cr-upload-btn" for="cr-image-file">
                📁 Choisir une photo
                <input type="file" id="cr-image-file" accept="image/*" style="display:none" onchange="FeatureActions.previewRecipeImage(this)">
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ingrédients</label>
            <div id="ingredients-list">${ingRows}</div>
            <button class="btn btn-ghost" style="margin-top:8px;width:100%;" onclick="FeatureActions.addIng()">+ Ajouter un ingrédient</button>
          </div>
          <div class="form-group">
            <label class="form-label">Instructions *</label>
            <textarea id="cr-instructions" class="form-input" rows="6" placeholder="Étape 1 : Préchauffez le four...">${Safe.html(r.instructions || '')}</textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Calories</label>
              <input id="cr-calories" type="number" class="form-input" placeholder="kcal" value="${r.calories || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Protéines (g)</label>
              <input id="cr-protein" type="number" class="form-input" placeholder="g" value="${r.protein_g || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Temps de prep (min)</label>
              <input id="cr-time" type="number" class="form-input" placeholder="30" value="${r.prep_time || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Portions</label>
              <input id="cr-servings" type="number" class="form-input" placeholder="4" value="${r.servings || 4}">
            </div>
          </div>
          <p id="cr-error" style="color:#e53935;display:none;padding:8px;background:#fef2f2;border-radius:8px;font-size:0.9rem;"></p>
          <button class="btn btn-primary btn-full" onclick="FeatureActions.saveCustomRecipe(${recipeId ? `'${recipeId}'` : 'null'})">
            💾 ${recipeId ? 'Sauvegarder les modifications' : 'Créer la recette'}
          </button>
        </div>
      </div>`;
  },

  challenges: () => {
    const current = Challenges.getCurrent();
    const progress = Challenges.getProgress();
    const cur = progress[current.id] || { count: 0, recipes: [] };
    const completed = !!cur.completedAt;
    const pct = Math.min(100, Math.round((cur.count / current.target) * 100));
    const allCards = Challenges._list.map(c => {
      const data = progress[c.id] || { count: 0 };
      const done = !!data.completedAt;
      return `
        <div class="challenge-card ${done ? 'challenge-done' : ''}">
          <span class="challenge-emoji">${c.emoji}</span>
          <div class="challenge-info">
            <h4>${Safe.html(c.title)}</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;">${Safe.html(c.desc)}</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, Math.round((data.count / c.target) * 100))}%"></div></div>
            <span style="font-size:0.8rem;color:var(--text-muted);">${data.count} / ${c.target}</span>
          </div>
          ${done ? '<span style="font-size:1.5rem;">🏆</span>' : ''}
        </div>`;
    }).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">🏆 Défis Culinaires</h2>
        </div>
        <div class="challenge-hero ${completed ? 'challenge-hero-done' : ''}">
          <div style="font-size:3rem;margin-bottom:8px;">${current.emoji}</div>
          <h3 style="font-size:1.2rem;">${Safe.html(current.title)}</h3>
          <p style="color:var(--text-muted);margin-bottom:16px;">${Safe.html(current.desc)}</p>
          <div class="progress-bar" style="max-width:300px;margin:0 auto 8px;"><div class="progress-fill" style="width:${pct}%;"></div></div>
          <p style="font-weight:700;">${cur.count} / ${current.target} ${completed ? '🏆 Complété !' : ''}</p>
          ${!completed ? '<p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">Cuisinez des recettes pour progresser !</p>' : ''}
        </div>
        <h3 style="font-size:1.1rem;margin:24px 0 12px;">Tous les défis</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">${allCards}</div>
      </div>`;
  },

  nutritionTracker: async () => {
    const logs = await NutritionTracker.getLast30Days();
    const target = currentProfile?.daily_calories || 2000;
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.log_date === today) || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    const last14 = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = logs.find(l => l.log_date === key);
      last14.push({ date: key, calories: found?.calories || 0 });
    }
    const maxCal = Math.max(target * 1.2, ...last14.map(d => d.calories), 1);
    const chartW = 320, chartH = 100;
    const barW = Math.floor(chartW / last14.length) - 3;
    const bars = last14.map((d, i) => {
      const h = Math.max(2, Math.round((d.calories / maxCal) * chartH));
      const x = Math.round(i * (chartW / last14.length));
      const y = chartH - h;
      const color = d.date === today ? 'var(--primary)' : d.calories >= target ? '#22c55e' : d.calories > 0 ? '#f59e0b' : '#e5e7eb';
      return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${color}"/>`;
    }).join('');
    const targetY = chartH - Math.round((target / maxCal) * chartH);
    const targetLine = `<line x1="0" y1="${targetY}" x2="${chartW}" y2="${targetY}" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>`;
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (logs.find(l => l.log_date === key && l.calories > 0)) streak++;
      else break;
    }
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">📊 Suivi Nutritionnel</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;">
          <div class="stat-card"><div class="stat-val">${todayLog.calories}</div><div class="stat-lbl">kcal aujourd'hui</div></div>
          <div class="stat-card"><div class="stat-val">${target}</div><div class="stat-lbl">objectif kcal</div></div>
          <div class="stat-card"><div class="stat-val">${Math.round(todayLog.protein_g || 0)}g</div><div class="stat-lbl">protéines</div></div>
          <div class="stat-card"><div class="stat-val">${streak}🔥</div><div class="stat-lbl">jours de suite</div></div>
        </div>
        <div style="background:var(--surface);border-radius:16px;padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:0.9rem;font-weight:600;">14 derniers jours</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">— objectif ${target} kcal</span>
          </div>
          <svg viewBox="0 0 ${chartW} ${chartH}" style="width:100%;height:auto;">${bars}${targetLine}</svg>
          <div style="display:flex;gap:8px;margin-top:8px;font-size:0.7rem;flex-wrap:wrap;">
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#22c55e;border-radius:2px;display:inline-block;"></span>Objectif atteint</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#f59e0b;border-radius:2px;display:inline-block;"></span>En dessous</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:var(--primary);border-radius:2px;display:inline-block;"></span>Aujourd'hui</span>
          </div>
        </div>
        <div style="background:var(--surface);border-radius:16px;padding:16px;">
          <h3 style="font-size:1rem;margin-bottom:12px;">Ajouter manuellement</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <input id="log-cal" type="number" class="form-input" placeholder="Calories (kcal)">
            <input id="log-prot" type="number" class="form-input" placeholder="Protéines (g)">
          </div>
          <button class="btn btn-primary btn-full" onclick="FeatureActions.logNutrition()">+ Enregistrer</button>
        </div>
      </div>`;
  },

  barcodeScanner: () => `
    <div class="container page-enter" style="padding:24px 16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button class="btn btn-ghost" onclick="BarcodeScanner.stop(); App.goBack()">←</button>
        <h2 style="font-size:1.4rem;">📷 Scanner un produit</h2>
      </div>
      <div style="position:relative;border-radius:16px;overflow:hidden;background:#000;margin-bottom:20px;min-height:200px;">
        <video id="scanner-video" autoplay muted playsinline style="width:100%;max-height:280px;object-fit:cover;display:block;"></video>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
          <div style="width:200px;height:120px;border:2px solid var(--primary);border-radius:8px;"></div>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:20px;">
        <button class="btn btn-primary" onclick="FeatureActions.startScan()" id="scan-btn">📷 Démarrer la caméra</button>
      </div>
      <div style="position:relative;margin:20px 0;">
        <div style="border-top:1px solid var(--border);"></div>
        <span style="position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--bg);padding:0 12px;color:var(--text-muted);font-size:0.85rem;">ou</span>
      </div>
      <div class="form-group">
        <label class="form-label">Code-barres manuel</label>
        <div style="display:flex;gap:8px;">
          <input id="barcode-manual" class="form-input" placeholder="Ex: 3017620422003" type="number" style="flex:1;">
          <button class="btn btn-primary" onclick="FeatureActions.lookupBarcode()">Rechercher</button>
        </div>
      </div>
      <div id="product-result" style="margin-top:20px;"></div>
    </div>`,

  fridgeMode: () => `
    <div class="container page-enter" style="padding:24px 16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button class="btn btn-ghost" onclick="App.goBack()">←</button>
        <h2 style="font-size:1.4rem;">🧊 Vider le Frigo</h2>
      </div>
      <p style="color:var(--text-muted);margin-bottom:20px;">Entrez les ingrédients disponibles et trouvez des recettes adaptées !</p>
      <div class="form-group">
        <label class="form-label">Mes ingrédients</label>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input id="fridge-ing" class="form-input" placeholder="Ex: poulet, tomates, riz..." style="flex:1;"
            onkeydown="if(event.key==='Enter')FeatureActions.addFridgeIng()">
          <button class="btn btn-primary" onclick="FeatureActions.addFridgeIng()">+</button>
        </div>
        <div id="fridge-tags" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;"></div>
      </div>
      <button class="btn btn-primary btn-full" style="margin:16px 0;" onclick="FeatureActions.searchFridge()">
        🔍 Trouver des recettes
      </button>
      <div id="fridge-results"></div>
    </div>`,

  planShare: () => {
    const url = PlanShare.getShareUrl();
    const qr = PlanShare.getQRUrl(url);
    const plan = Planner.get();
    const hasPlan = Object.keys(plan).some(date => Object.keys(plan[date] || {}).length > 0);
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">🔗 Partager mon Plan</h2>
        </div>
        ${!hasPlan ? `<div style="text-align:center;padding:40px 20px;">
          <div style="font-size:3rem;margin-bottom:12px;">📅</div>
          <p style="color:var(--text-muted);">Votre planificateur est vide.</p>
          <button class="btn btn-primary" onclick="App.navigate('planner')" style="margin-top:16px;">Aller au planificateur</button>
        </div>` : `
        <p style="color:var(--text-muted);margin-bottom:24px;">Partagez votre plan de repas avec un lien ou un QR code.</p>
        <div style="text-align:center;margin-bottom:24px;background:var(--surface);border-radius:16px;padding:24px;">
          <img src="${Safe.attr(qr)}" alt="QR Code" style="width:180px;height:180px;border-radius:12px;">
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">Scannez pour importer le plan</p>
        </div>
        <div class="form-group">
          <label class="form-label">Lien de partage</label>
          <div style="display:flex;gap:8px;">
            <input class="form-input" value="${Safe.attr(url)}" readonly style="flex:1;font-size:0.75rem;overflow:hidden;text-overflow:ellipsis;">
            <button class="btn btn-primary" onclick="FeatureActions.copyPlanLink()">📋 Copier</button>
          </div>
        </div>
        <button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="FeatureActions.sharePlanWhatsApp()">
          💬 Partager via WhatsApp
        </button>`}
      </div>`;
  },

  social: async () => {
    if (!currentUser) return `
      <div class="container" style="padding:40px 20px;text-align:center;">
        <button class="btn btn-ghost" onclick="App.goBack()" style="margin-bottom:24px;">←</button>
        <div style="font-size:3rem;margin-bottom:16px;">👥</div>
        <p style="margin-bottom:16px;">Connectez-vous pour suivre des amis.</p>
        <button class="btn btn-primary" onclick="App.navigate('login')">Se connecter</button>
      </div>`;
    const following = await Social.getFollowing();
    const friendCards = following.length ? following.map(f => {
      const name = f.profiles?.full_name || 'Utilisateur';
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface);border-radius:12px;margin-bottom:8px;cursor:pointer;" onclick="App.navigate('friend-profile', {id: '${f.followed_id}'})">
          <div style="width:40px;height:40px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;">👤</div>
          <span style="flex:1;font-weight:600;">${Safe.html(name)}</span>
          <button class="btn btn-ghost" style="font-size:0.8rem;" onclick="event.stopPropagation();FeatureActions.unfollow('${f.followed_id}')">Se désabonner</button>
        </div>`;
    }).join('') : '<p style="color:var(--text-muted);text-align:center;padding:24px;">Vous ne suivez encore personne.</p>';
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">👥 Mes Amis</h2>
        </div>
        <div style="margin-bottom:20px;">
          <label class="form-label">Rechercher des utilisateurs</label>
          <div style="display:flex;gap:8px;">
            <input id="user-search" class="form-input" placeholder="Nom..." style="flex:1;"
              onkeydown="if(event.key==='Enter')FeatureActions.searchUsers()">
            <button class="btn btn-primary" onclick="FeatureActions.searchUsers()">🔍</button>
          </div>
          <div id="user-search-results" style="margin-top:8px;"></div>
        </div>
        <h3 style="font-size:1rem;margin-bottom:12px;">Abonnements (${following.length})</h3>
        <div>${friendCards}</div>
      </div>`;
  },

  friendProfile: async (userId) => {
    const [favs, profileRes, isFollowing] = await Promise.all([
      Social.getFriendFavorites(userId),
      supa.from('profiles').select('full_name, goal').eq('id', userId).single(),
      Social.isFollowing(userId)
    ]);
    const profileData = profileRes.data;
    const recipeCards = favs.map(f => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:12px;margin-bottom:8px;cursor:pointer;" onclick="App.navigate('recipe', {id: '${Safe.attr(f.recipe_id)}'})">
        ${f.recipe_image ? `<img src="${Safe.attr(f.recipe_image)}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" loading="lazy">` : '<div style="width:48px;height:48px;background:var(--bg);border-radius:8px;display:flex;align-items:center;justify-content:center;">🍽️</div>'}
        <span style="flex:1;font-size:0.9rem;">${Safe.html(f.recipe_title || '')}</span>
      </div>`).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <div style="width:48px;height:48px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.4rem;">👤</div>
          <h2 style="font-size:1.4rem;flex:1;">${Safe.html(profileData?.full_name || 'Utilisateur')}</h2>
          ${currentUser?.id !== userId ? `
          <button class="btn ${isFollowing ? 'btn-ghost' : 'btn-primary'}" onclick="FeatureActions.${isFollowing ? 'unfollow' : 'follow'}('${Safe.attr(userId)}')">
            ${isFollowing ? 'Se désabonner' : '+ Suivre'}
          </button>` : ''}
        </div>
        <h3 style="font-size:1rem;margin-bottom:12px;">❤️ Ses favoris (${favs.length})</h3>
        <div>${recipeCards || '<p style="color:var(--text-muted);text-align:center;">Aucun favori public.</p>'}</div>
      </div>`;
  },

  leaderboard: async () => {
    const top = await Leaderboard.getTop(20);
    const rows = top.map((r, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface);border-radius:12px;margin-bottom:8px;cursor:pointer;" onclick="App.navigate('recipe', {id: '${Safe.attr(r.recipe_id)}'})">
        <span style="font-size:${i < 3 ? '1.5' : '1'}rem;min-width:32px;text-align:center;">${i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</span>
        ${r.recipe_thumb ? `<img src="${Safe.attr(r.recipe_thumb)}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" loading="lazy">` : '<div style="width:48px;height:48px;background:var(--bg);border-radius:8px;display:flex;align-items:center;justify-content:center;">🍽️</div>'}
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.9rem;">${Safe.html(r.recipe_title || 'Recette')}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">${r.total_views} vues</div>
        </div>
      </div>`).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.goBack()">←</button>
          <h2 style="font-size:1.4rem;">🏆 Top Recettes</h2>
        </div>
        <p style="color:var(--text-muted);margin-bottom:20px;">Les recettes les plus consultées par la communauté.</p>
        <div>${rows || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Pas encore de données. Explorez des recettes !</p>'}</div>
      </div>`;
  },

  allergenPicker: () => {
    const active = AllergenFilter.getActive();
    return `
      <div style="margin-top:12px;">
        <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:8px;">🚫 Exclure allergènes</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${AllergenFilter.ALLERGENS.map(a => `
            <button class="allergen-btn ${active.includes(a.id) ? 'allergen-btn-active' : ''}"
              onclick="FeatureActions.toggleAllergen('${a.id}', this)">
              ${Safe.html(a.label)}
            </button>`).join('')}
        </div>
      </div>`;
  },

  viewSharedCollection: async (token) => {
    const col = await SharedCollections.getByToken(token);
    if (!col) return `
      <div class="container" style="padding:40px 20px;text-align:center;">
        <div style="font-size:3rem;margin-bottom:16px;">🔗</div>
        <h3>Collection introuvable</h3>
        <p style="color:var(--text-muted);">Ce lien est invalide ou expiré.</p>
        <button class="btn btn-primary" onclick="App.navigate('home')" style="margin-top:16px;">Accueil</button>
      </div>`;
    const recipes = Array.isArray(col.recipes) ? col.recipes : [];
    const cards = recipes.map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface);border-radius:12px;margin-bottom:8px;cursor:pointer;" onclick="App.navigate('recipe', {id: '${Safe.attr(r.idMeal || r.recipe_id || '')}' })">
        ${(r.strMealThumb || r.image) ? `<img src="${Safe.attr(r.strMealThumb || r.image)}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;" loading="lazy">` : '<div style="width:52px;height:52px;background:var(--bg);border-radius:8px;display:flex;align-items:center;justify-content:center;">🍽️</div>'}
        <span style="flex:1;font-weight:500;">${Safe.html(r.strMeal || r.title || 'Recette')}</span>
      </div>`).join('');
    return `
      <div class="container page-enter" style="padding:24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button class="btn btn-ghost" onclick="App.navigate('home')">←</button>
          <h2 style="font-size:1.4rem;">📁 ${Safe.html(col.name)}</h2>
        </div>
        <p style="color:var(--text-muted);margin-bottom:20px;">${recipes.length} recette${recipes.length > 1 ? 's' : ''} dans cette collection.</p>
        <div>${cards || '<p style="color:var(--text-muted);text-align:center;">Collection vide.</p>'}</div>
      </div>`;
  }
};

// ============================================================
// FEATURE ACTIONS
// ============================================================
const FeatureActions = {
  _customIngredients: [],
  _fridgeIngredients: [],

  postComment: async (recipeId) => {
    const text = document.getElementById('comment-text')?.value?.trim();
    if (!text) { Toast.show('❌ Écrivez un commentaire'); return; }
    const { error } = await Comments.post(recipeId, text);
    if (error) { Toast.show('❌ ' + (error.message || 'Erreur')); return; }
    document.getElementById('comment-text').value = '';
    const section = document.getElementById('comments-section');
    if (section) section.outerHTML = await FeatureRender.commentsSection(recipeId);
    Toast.show('💬 Commentaire ajouté !');
  },

  deleteComment: async (commentId, recipeId) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    await Comments.delete(commentId);
    const section = document.getElementById('comments-section');
    if (section) section.outerHTML = await FeatureRender.commentsSection(recipeId);
    Toast.show('🗑️ Commentaire supprimé');
  },

  uploadPhoto: async (recipeId, input) => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { Toast.show('❌ Image trop lourde (max 5MB)'); return; }
    const caption = prompt('Légende (optionnel) :') || '';
    Toast.show('⏳ Upload en cours...');
    const { error } = await CookingPhotos.upload(recipeId, file, caption);
    if (error) { Toast.show('❌ ' + (error.message || 'Erreur upload')); return; }
    Toast.show('📸 Photo ajoutée !');
    const section = document.getElementById('photos-section');
    if (section) section.outerHTML = await FeatureRender.photosSection(recipeId);
  },

  viewPhoto: (url) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `<img src="${Safe.attr(url)}" style="max-width:95vw;max-height:95vh;border-radius:12px;object-fit:contain;">`;
    document.body.appendChild(overlay);
  },

  _updateIng: (i, field, value) => {
    if (!FeatureActions._customIngredients[i]) FeatureActions._customIngredients[i] = { name: '', amount: '', unit: '' };
    FeatureActions._customIngredients[i][field] = value;
  },

  addIng: () => {
    const idx = FeatureActions._customIngredients.length;
    FeatureActions._customIngredients.push({ name: '', amount: '', unit: '' });
    const list = document.getElementById('ingredients-list');
    if (!list) return;
    const row = document.createElement('div');
    row.id = `ing-row-${idx}`;
    row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;';
    row.innerHTML = `
      <input class="form-input" style="flex:3;" placeholder="Ingrédient" oninput="FeatureActions._updateIng(${idx}, 'name', this.value)">
      <input class="form-input" style="flex:1;" placeholder="Qté" oninput="FeatureActions._updateIng(${idx}, 'amount', this.value)">
      <input class="form-input" style="flex:1;" placeholder="Unité" oninput="FeatureActions._updateIng(${idx}, 'unit', this.value)">
      <button style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#e53935;padding:0 4px;" onclick="FeatureActions.removeIng(${idx})">✕</button>`;
    list.appendChild(row);
    row.querySelector('input').focus();
  },

  removeIng: (i) => {
    document.getElementById(`ing-row-${i}`)?.remove();
    FeatureActions._customIngredients[i] = null;
  },

  saveCustomRecipe: async (id) => {
    const title = document.getElementById('cr-title')?.value?.trim();
    const instructions = document.getElementById('cr-instructions')?.value?.trim();
    const errEl = document.getElementById('cr-error');
    if (!title) { if (errEl) { errEl.textContent = 'Le nom est requis.'; errEl.style.display = 'block'; } return; }
    if (!instructions) { if (errEl) { errEl.textContent = 'Les instructions sont requises.'; errEl.style.display = 'block'; } return; }

    // Handle image: use existing URL from preview if no new file selected
    let image_url = '';
    const fileInput = document.getElementById('cr-image-file');
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      const ext = file.name.split('.').pop();
      const path = `custom/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supa.storage.from('cooking-photos').upload(path, file, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supa.storage.from('cooking-photos').getPublicUrl(path);
        image_url = urlData?.publicUrl || image_url;
      }
    }

    const ingredients = FeatureActions._customIngredients.filter(i => i && i.name?.trim());
    const recipe = {
      id, title, image_url, ingredients, instructions,
      calories: document.getElementById('cr-calories')?.value || null,
      protein_g: document.getElementById('cr-protein')?.value || null,
      prep_time: document.getElementById('cr-time')?.value || null,
      servings: document.getElementById('cr-servings')?.value || 4
    };
    const { error } = await CustomRecipes.save(recipe);
    if (error) { if (errEl) { errEl.textContent = 'Erreur: ' + error.message; errEl.style.display = 'block'; } return; }
    Toast.show('✅ Recette sauvegardée !');
    App.navigate('custom-recipes');
  },

  previewRecipeImage: (input) => {
    const file = input?.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const prev = document.getElementById('cr-image-preview');
      if (prev) { prev.style.backgroundImage = `url('${e.target.result}')`; prev.innerHTML = ''; }
      // Clear URL input since file takes priority
      const urlInp = document.getElementById('cr-image-url');
      if (urlInp) urlInp.value = '';
    };
    reader.readAsDataURL(file);
  },

  deleteCustomRecipe: async (id) => {
    if (!confirm('Supprimer cette recette ?')) return;
    await CustomRecipes.delete(id);
    Toast.show('🗑️ Recette supprimée');
    App.navigate('custom-recipes');
  },

  logNutrition: async () => {
    const cal = parseInt(document.getElementById('log-cal')?.value) || 0;
    const prot = parseFloat(document.getElementById('log-prot')?.value) || 0;
    if (!cal) { Toast.show('❌ Entrez les calories'); return; }
    await NutritionTracker.log(cal, prot);
    Toast.show('✅ Repas enregistré !');
    App.navigate('nutrition-tracker');
  },

  startScan: async () => {
    const video = document.getElementById('scanner-video');
    const btn = document.getElementById('scan-btn');
    if (!video) return;
    if (btn) { btn.textContent = '⏳ Démarrage...'; btn.disabled = true; }
    const started = await BarcodeScanner.start(video, async (barcode) => {
      BarcodeScanner.stop();
      await FeatureActions._handleBarcode(barcode);
    });
    if (!started) {
      if (btn) { btn.textContent = '❌ Caméra non disponible'; btn.disabled = false; }
      Toast.show('Utilisez la saisie manuelle ci-dessous');
    } else if (btn) {
      btn.textContent = '🔴 Scanning...';
    }
  },

  lookupBarcode: async () => {
    const code = document.getElementById('barcode-manual')?.value?.trim();
    if (!code) { Toast.show('❌ Entrez un code-barres'); return; }
    await FeatureActions._handleBarcode(code);
  },

  _handleBarcode: async (barcode) => {
    const resultEl = document.getElementById('product-result');
    if (resultEl) resultEl.innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner"></div></div>';
    const product = await BarcodeScanner.lookupProduct(barcode);
    if (!resultEl) return;
    if (!product) {
      resultEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Produit non trouvé pour ce code-barres.</p>';
      return;
    }
    resultEl.innerHTML = `
      <div style="background:var(--surface);border-radius:16px;padding:16px;">
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          ${product.image ? `<img src="${Safe.attr(product.image)}" style="width:72px;height:72px;object-fit:contain;border-radius:8px;background:#fff;">` : ''}
          <div>
            <h3 style="font-size:1rem;margin-bottom:4px;">${Safe.html(product.name)}</h3>
            ${product.brand ? `<p style="color:var(--text-muted);font-size:0.85rem;">${Safe.html(product.brand)}</p>` : ''}
            ${product.quantity ? `<p style="font-size:0.85rem;">${Safe.html(product.quantity)}</p>` : ''}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;">
          ${product.calories ? `<div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px;"><div style="font-weight:700;">${product.calories}</div><div style="font-size:0.7rem;color:var(--text-muted);">kcal/100g</div></div>` : ''}
          ${product.protein ? `<div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px;"><div style="font-weight:700;">${product.protein}g</div><div style="font-size:0.7rem;color:var(--text-muted);">protéines</div></div>` : ''}
          ${product.carbs ? `<div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px;"><div style="font-weight:700;">${product.carbs}g</div><div style="font-size:0.7rem;color:var(--text-muted);">glucides</div></div>` : ''}
          ${product.fat ? `<div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px;"><div style="font-weight:700;">${product.fat}g</div><div style="font-size:0.7rem;color:var(--text-muted);">lipides</div></div>` : ''}
        </div>
        <button class="btn btn-primary btn-full" onclick="FeatureActions.addScannedToShopping('${Safe.attr(product.name)}')">
          🛒 Ajouter à la liste de courses
        </button>
      </div>`;
  },

  addScannedToShopping: (name) => {
    state.shoppingList.push({ id: Date.now(), text: name, checked: false });
    localStorage.setItem('walkart_shopping', JSON.stringify(state.shoppingList));
    Toast.show('🛒 Ajouté à la liste de courses !', 3000, () => App.navigate('shopping'), 'Voir');
  },

  toggleAllergen: (id, btn) => {
    const active = AllergenFilter.getActive();
    const idx = active.indexOf(id);
    if (idx === -1) active.push(id);
    else active.splice(idx, 1);
    AllergenFilter.setActive(active);
    if (btn) btn.classList.toggle('allergen-btn-active', active.includes(id));
    Toast.show(active.includes(id) ? `🚫 ${id} exclu des résultats` : `✅ ${id} autorisé`);
  },

  generatePlan: async () => {
    if (!currentProfile?.goal) {
      Toast.show('⚠️ Complétez votre profil nutritionnel d\'abord');
      App.navigate('profile-setup'); return;
    }
    const success = await SmartPlanner.generate();
    if (success) App.navigate('planner');
  },

  addFridgeIng: () => {
    const input = document.getElementById('fridge-ing');
    const val = input?.value?.trim();
    if (!val) return;
    if (!FeatureActions._fridgeIngredients.includes(val)) {
      FeatureActions._fridgeIngredients.push(val);
    }
    input.value = '';
    FeatureActions._renderFridgeTags();
  },

  _renderFridgeTags: () => {
    const container = document.getElementById('fridge-tags');
    if (!container) return;
    container.innerHTML = FeatureActions._fridgeIngredients.map((ing, i) => `
      <span style="display:inline-flex;align-items:center;gap:4px;background:var(--primary);color:#fff;padding:4px 10px;border-radius:20px;font-size:0.85rem;">
        ${Safe.html(ing)}
        <button style="background:none;border:none;cursor:pointer;color:#fff;font-size:0.9rem;padding:0;line-height:1;" onclick="FeatureActions._removeFridgeIng(${i})">✕</button>
      </span>`).join('');
  },

  _removeFridgeIng: (i) => {
    FeatureActions._fridgeIngredients.splice(i, 1);
    FeatureActions._renderFridgeTags();
  },

  searchFridge: async () => {
    if (!FeatureActions._fridgeIngredients.length) { Toast.show('❌ Ajoutez des ingrédients'); return; }
    const resultEl = document.getElementById('fridge-results');
    if (resultEl) resultEl.innerHTML = '<div style="text-align:center;padding:24px;"><div class="spinner"></div></div>';
    const results = await FridgeMode.search(FeatureActions._fridgeIngredients);
    if (!resultEl) return;
    if (!results.length) {
      resultEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px;">Aucune recette trouvée. Essayez avec d\'autres ingrédients.</p>';
      return;
    }
    const cards = results.map(r => `
      <div style="display:flex;gap:12px;padding:12px;background:var(--surface);border-radius:12px;margin-bottom:8px;cursor:pointer;" onclick="App.navigate('recipe', {id: '${Safe.attr(r.idMeal)}'})">
        ${r.strMealThumb ? `<img src="${Safe.attr(r.strMealThumb)}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0;" loading="lazy">` : '<div style="width:64px;height:64px;background:var(--bg);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">🍽️</div>'}
        <div style="flex:1;min-width:0;">
          <h4 style="font-size:0.9rem;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Safe.html(r.strMeal)}</h4>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="font-size:0.75rem;background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;">✅ ${r._usedCount} ingredients</span>
            ${r._missedCount > 0 ? `<span style="font-size:0.75rem;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:20px;">⚠️ ${r._missedCount} manquants</span>` : ''}
          </div>
          ${r._missedIngredients?.length ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Manquants: ${r._missedIngredients.slice(0,3).join(', ')}</p>` : ''}
        </div>
      </div>`).join('');
    resultEl.innerHTML = `<h3 style="font-size:1rem;margin-bottom:12px;">${results.length} recettes trouvées</h3>${cards}`;
  },

  copyPlanLink: async () => {
    const url = PlanShare.getShareUrl();
    try { await navigator.clipboard.writeText(url); Toast.show('📋 Lien copié !'); }
    catch { Toast.show('Copiez manuellement le lien ci-dessus'); }
  },

  sharePlanWhatsApp: () => {
    const url = PlanShare.getShareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(`📅 Mon plan de repas Walkart\n${url}`)}`, '_blank');
  },

  shareCollection: async (name) => {
    Toast.show('⏳ Création du lien de partage...');
    const { error, shareToken } = await SharedCollections.makePublic(name);
    if (error) { Toast.show('❌ ' + (error.message || 'Erreur')); return; }
    const url = SharedCollections.getShareUrl(shareToken);
    try { await navigator.clipboard.writeText(url); Toast.show('🔗 Lien copié ! Partagez-le !'); }
    catch { alert(`Lien de partage:\n${url}`); }
  },

  follow: async (userId) => {
    const { error } = await Social.follow(userId);
    if (error) Toast.show('❌ ' + (error.message || 'Erreur'));
    else { Toast.show('✅ Abonné !'); App.navigate('friend-profile', { id: userId }); }
  },

  unfollow: async (userId) => {
    if (!confirm('Se désabonner ?')) return;
    await Social.unfollow(userId);
    Toast.show('👋 Désabonné');
    if (state.currentRoute === 'friend-profile') App.navigate('social');
    else App.navigate('social');
  },

  searchUsers: async () => {
    const q = document.getElementById('user-search')?.value?.trim();
    if (!q) return;
    const users = await Social.searchUsers(q);
    const el = document.getElementById('user-search-results');
    if (!el) return;
    if (!users.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:8px 0;">Aucun utilisateur trouvé.</p>'; return; }
    el.innerHTML = `<div style="background:var(--surface);border-radius:12px;overflow:hidden;">${users.map(u => `
      <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--border);">
        <span style="flex:1;">👤 ${Safe.html(u.full_name || 'Utilisateur')}</span>
        <button class="btn btn-primary" style="font-size:0.8rem;padding:4px 12px;" onclick="App.navigate('friend-profile', {id: '${u.id}'})">Voir</button>
      </div>`).join('')}</div>`;
  }
};

// ============================================================
// PATCH App.navigate (after DOM ready, both scripts loaded)
// ============================================================
(function patchNavigate() {
  const _origNavigate = App.navigate.bind(App);

  App.navigate = function(route, params) {
    // Reset fridge ingredients when leaving fridge mode
    if (route !== 'fridge-mode' && state.currentRoute === 'fridge-mode') {
      FeatureActions._fridgeIngredients = [];
    }

    // Handle new routes
    const newRoutes = [
      'custom-recipes', 'create-custom-recipe', 'edit-custom-recipe',
      'challenges', 'nutrition-tracker', 'barcode-scanner', 'fridge-mode',
      'plan-share', 'social', 'friend-profile', 'leaderboard',
      'shared-collection', 'view-shared-collection'
    ];

    if (!newRoutes.includes(route)) {
      return _origNavigate(route, params);
    }

    state.prevRoute = state.currentRoute;
    state.currentRoute = route;
    window.location.hash = route;
    state._lastNavigatedHash = window.location.hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));

    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `<div class="container"><div class="spinner" style="margin:60px auto;"></div></div>`;

    (async () => {
      let html = '';
      try {
        if (route === 'custom-recipes') html = await FeatureRender.customRecipes();
        else if (route === 'create-custom-recipe') html = await FeatureRender.customRecipeForm(null);
        else if (route === 'edit-custom-recipe') html = await FeatureRender.customRecipeForm(params?.id);
        else if (route === 'challenges') html = FeatureRender.challenges();
        else if (route === 'nutrition-tracker') html = await FeatureRender.nutritionTracker();
        else if (route === 'barcode-scanner') { BarcodeScanner.stop(); html = FeatureRender.barcodeScanner(); }
        else if (route === 'fridge-mode') { FeatureActions._fridgeIngredients = []; html = FeatureRender.fridgeMode(); }
        else if (route === 'plan-share') html = FeatureRender.planShare();
        else if (route === 'social') html = await FeatureRender.social();
        else if (route === 'friend-profile') html = await FeatureRender.friendProfile(params?.id);
        else if (route === 'leaderboard') html = await FeatureRender.leaderboard();
        else if (route === 'view-shared-collection') html = await FeatureRender.viewSharedCollection(params?.token);
        root.innerHTML = html;
      } catch (e) {
        console.error('Feature navigate error:', e);
        root.innerHTML = `<div class="container error-state"><div class="error-icon">😕</div><h2>Erreur</h2><p>${Safe.html(e.message || 'Vérifiez votre connexion')}</p><button class="btn btn-primary" onclick="App.navigate('home')">Accueil</button></div>`;
      }
    })();
  };
})();

// ============================================================
// INJECT FEATURE SECTIONS INTO RECIPE DETAIL
// ============================================================
(function hookRecipeDetail() {
  const _origNavigate = App.navigate.bind(App);
  // We only need to hook into the existing navigate for 'recipe' route
  // We patch _origNavigate-level by intercepting after DOM update
  // Use MutationObserver to detect when recipe detail renders

  let _lastRecipeId = null;

  document.addEventListener('_recipeRendered', async (e) => {
    const recipeId = e.detail?.id;
    if (!recipeId || recipeId === _lastRecipeId) return;
    _lastRecipeId = recipeId;

    // Find the last div in detail-card to append feature sections
    const detailCard = document.querySelector('.detail-card');
    if (!detailCard) return;

    // Track leaderboard view
    const recipe = RecipeStore.get(recipeId) || state.currentRecipe;
    Leaderboard.trackView(recipe);
    Challenges.addProgress(recipeId);

    // Log nutrition if recipe has calories
    if (recipe?._calories) {
      NutritionTracker.log(recipe._calories, recipe._protein || 0, recipe._carbs || 0, recipe._fat || 0)
        .catch(() => {});
    }

    // Create feature container
    const featDiv = document.createElement('div');
    featDiv.id = 'recipe-feature-sections';
    detailCard.appendChild(featDiv);

    // Load in parallel
    const [commentsHtml, photosHtml] = await Promise.all([
      FeatureRender.commentsSection(recipeId),
      FeatureRender.photosSection(recipeId)
    ]);

    if (document.getElementById('recipe-feature-sections')) {
      document.getElementById('recipe-feature-sections').innerHTML = photosHtml + commentsHtml;
    }
  });
})();

// ============================================================
// HANDLE SHARED PLAN/COLLECTION DEEP LINKS
// ============================================================
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  const [seg, ...rest] = hash.split('/');
  const param = rest.join('/');
  if (seg === 'shared-plan' && param) {
    setTimeout(() => PlanShare.loadSharedPlan(param), 500);
  } else if (seg === 'shared-collection' && param) {
    App.navigate('view-shared-collection', { token: param });
  }
});
