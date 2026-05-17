/* =====================================================
   WALKART - i18n Engine
   Languages: FR, EN, ES, AR, IT, JA
   ===================================================== */

const TRANSLATIONS = {
  fr: {
    // Navigation
    nav_home:'Accueil', nav_recipes:'Recettes', nav_categories:'Catégories',
    nav_favorites:'Favoris', nav_shopping:'Liste de courses', nav_login:'Connexion',
    tab_explore:'Explorer', tab_plan:'Planning',
    nav_register:"S'inscrire", nav_profile:'Mon profil', nav_logout:'Déconnexion',
    nav_search_placeholder:'Rechercher une recette, un ingrédient...',
    // Hero / Home
    featured:'À la une', cook_now:'Cuisiner', surprise_me:'Surprends-moi',
    recently_viewed:'Récemment vus', todays_picks:'Sélection du jour',
    you_may_like:'Vous aimerez aussi', section_world:'Cuisines du monde',
    see_all:'Voir tout', section_categories:'Catégories', load_more:'Charger plus',
    footer_about:'À propos', footer_privacy_link:'Confidentialité',
    // Search
    recent_searches:'Recherches récentes', section_popular:'Populaires',
    search_results:'résultats', no_results:'Aucune recette trouvée',
    explore_categories:'Explorer les catégories', filter_all:'Tout',
    back:'← Retour',
    // Recipe detail
    ingredients:'Ingrédients', preparation:'Préparation', start_cooking:'CUISINER',
    share:'Partager', servings:'Portions', source:'Source', print:'Imprimer',
    your_rating:'Votre note', add_all:'Tout ajouter', add_to_plan:'Ajouter au plan',
    // Shopping
    shopping_title:'Liste de courses', no_items:'Votre liste est vide',
    clear_all:'Tout effacer', shopping_hint:'Ajoutez des ingrédients depuis une recette.',
    discover_recipes:'Découvrir des recettes', done:'faits',
    add_item_placeholder:'Ajouter un article...', qty:'Qté',
    share_list:'Partager', clear_done:'Effacer cochés',
    // Categories / Cuisines
    cuisine:'Cuisine', no_cuisine_recipes:'Aucune recette trouvée pour cette cuisine.',
    explore_cuisines:'Explorer toutes les cuisines',
    // Auth
    connexion:'Connexion', create_account:'Créer un compte',
    already_account:"J'ai déjà un compte", or:'ou',
    login_access:'Accédez à vos menus personnalisés',
    register_access:'Obtenez des menus adaptés à vos objectifs',
    email:'Email', email_placeholder:'vous@exemple.com',
    password:'Mot de passe', password_placeholder:'••••••••',
    full_name:'Prénom & Nom', full_name_placeholder:'Jean Dupont',
    btn_login:'Se connecter', btn_register:"S'inscrire",
    // Profile setup
    my_goal:'Mon objectif', profile_hint:'Complétez votre profil pour des menus personnalisés',
    age:'Âge', gender_label:'Sexe', male:'Homme', female:'Femme',
    weight:'Poids (kg)', height:'Taille (cm)', activity_label:"Niveau d'activité",
    act_sedentary:'🪑 Sédentaire (peu/pas de sport)', act_light:'🚶 Légère (1-3j/sem)',
    act_moderate:'🏃 Modérée (3-5j/sem)', act_active:'⚡ Active (6-7j/sem)',
    act_very_active:'🔥 Très active (2x/jour)',
    goal_label:'Mon objectif',
    goal_lose_label:'Perte de poids', goal_maintain_label:'Maintien',
    goal_gain_label:'Prise de masse', goal_muscle_label:'Prise de muscle',
    goal_lose_sub:'Déficit calorique', goal_maintain_sub:'Équilibre calorique',
    goal_gain_sub:'Surplus calorique', goal_muscle_sub:'Surplus + protéines',
    save_and_menu:'Sauvegarder & Voir mon menu',
    choose_lang:'Choisir la langue',
    // Profile page
    kcal_per_day:'kcal/jour', protein_per_day:'protéines/jour',
    current_weight:'poids actuel', objective:'objectif',
    view_my_menu:'Voir mon menu personnalisé',
    complete_profile:'Complétez votre profil pour obtenir un menu personnalisé !',
    set_goal:'Définir mon objectif', edit_profile:'Modifier mon profil',
    logout_btn:'Se déconnecter',
    // My menu
    my_menu_title:'Mon Menu Personnalisé', new_menu:'Nouveau menu',
    day_0:'Lundi', day_1:'Mardi', day_2:'Mercredi', day_3:'Jeudi',
    day_4:'Vendredi', day_5:'Samedi', day_6:'Dimanche',
    meal_breakfast:'🌅 Petit-déj', meal_lunch:'☀️ Déjeuner', meal_dinner:'🌙 Dîner',
    // Privacy / About
    privacy_title:'Politique de confidentialité', about_sub:'Découvrez les saveurs du monde entier',
    // Toasts
    toast_added_fav:'Ajouté aux favoris !', toast_removed_fav:'Retiré des favoris',
    toast_added_shopping:'Ajouté à la liste', toast_login_required:'Connectez-vous pour accéder à cette fonctionnalité',
    toast_copied:'Lien copié !', toast_error:'Une erreur est survenue', toast_saved:'Sauvegardé !',
    // Footer
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  },

  en: {
    nav_home:'Home', nav_recipes:'Recipes', nav_categories:'Categories',
    nav_favorites:'Favorites', nav_shopping:'Shopping List', nav_login:'Login',
    tab_explore:'Explore', tab_plan:'Plan',
    nav_register:'Sign Up', nav_profile:'My Profile', nav_logout:'Logout',
    nav_search_placeholder:'Search recipes, ingredients...',
    featured:'Featured', cook_now:'Cook now', surprise_me:'Surprise me',
    recently_viewed:'Recently viewed', todays_picks:"Today's Picks",
    you_may_like:'You may also like', section_world:'World Cuisines',
    see_all:'See all', section_categories:'Categories', load_more:'Load more',
    footer_about:'About', footer_privacy_link:'Privacy',
    recent_searches:'Recent searches', section_popular:'Popular',
    search_results:'results', no_results:'No recipe found',
    explore_categories:'Explore categories', filter_all:'All',
    back:'← Back',
    ingredients:'Ingredients', preparation:'Preparation', start_cooking:'START COOKING',
    share:'Share', servings:'Servings', source:'Source', print:'Print',
    your_rating:'Your rating', add_all:'Add all', add_to_plan:'Add to plan',
    shopping_title:'Shopping List', no_items:'Your list is empty',
    clear_all:'Clear all', shopping_hint:'Add ingredients from a recipe.',
    discover_recipes:'Discover recipes', done:'done',
    add_item_placeholder:'Add an item...', qty:'Qty',
    share_list:'Share list', clear_done:'Clear done',
    cuisine:'Cuisine', no_cuisine_recipes:'No recipes found for this cuisine yet.',
    explore_cuisines:'Explore all cuisines',
    connexion:'Login', create_account:'Create an account',
    already_account:'I already have an account', or:'or',
    login_access:'Access your personalized menus',
    register_access:'Get menus tailored to your goals',
    email:'Email', email_placeholder:'you@email.com',
    password:'Password', password_placeholder:'••••••••',
    full_name:'Full name', full_name_placeholder:'John Doe',
    btn_login:'Log In', btn_register:'Sign Up',
    my_goal:'My Goal', profile_hint:'Complete your profile for personalized menus',
    age:'Age', gender_label:'Gender', male:'Male', female:'Female',
    weight:'Weight (kg)', height:'Height (cm)', activity_label:'Activity Level',
    act_sedentary:'🪑 Sedentary (little/no exercise)', act_light:'🚶 Light (1-3d/wk)',
    act_moderate:'🏃 Moderate (3-5d/wk)', act_active:'⚡ Active (6-7d/wk)',
    act_very_active:'🔥 Very active (2x/day)',
    goal_label:'My goal',
    goal_lose_label:'Weight Loss', goal_maintain_label:'Maintain',
    goal_gain_label:'Weight Gain', goal_muscle_label:'Muscle Gain',
    goal_lose_sub:'Calorie deficit', goal_maintain_sub:'Calorie balance',
    goal_gain_sub:'Calorie surplus', goal_muscle_sub:'Surplus + protein',
    save_and_menu:'Save & View my menu',
    choose_lang:'Choose language',
    kcal_per_day:'kcal/day', protein_per_day:'protein/day',
    current_weight:'current weight', objective:'goal',
    view_my_menu:'View my personalized menu',
    complete_profile:'Complete your profile to get a personalized menu!',
    set_goal:'Set my goal', edit_profile:'Edit my profile',
    logout_btn:'Log out',
    my_menu_title:'My Personalized Menu', new_menu:'New menu',
    day_0:'Monday', day_1:'Tuesday', day_2:'Wednesday', day_3:'Thursday',
    day_4:'Friday', day_5:'Saturday', day_6:'Sunday',
    meal_breakfast:'🌅 Breakfast', meal_lunch:'☀️ Lunch', meal_dinner:'🌙 Dinner',
    privacy_title:'Privacy Policy', about_sub:'Discover flavors from around the world',
    toast_added_fav:'Added to favorites!', toast_removed_fav:'Removed from favorites',
    toast_added_shopping:'Added to shopping list', toast_login_required:'Please log in to use this feature',
    toast_copied:'Link copied!', toast_error:'An error occurred', toast_saved:'Saved!',
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  },

  es: {
    nav_home:'Inicio', nav_recipes:'Recetas', nav_categories:'Categorías',
    nav_favorites:'Favoritos', nav_shopping:'Lista de compras', nav_login:'Iniciar sesión',
    tab_explore:'Explorar', tab_plan:'Planificar',
    nav_register:'Registrarse', nav_profile:'Mi perfil', nav_logout:'Cerrar sesión',
    nav_search_placeholder:'Buscar receta, ingrediente...',
    featured:'Destacadas', cook_now:'Cocinar ahora', surprise_me:'Sorpréndeme',
    recently_viewed:'Visto recientemente', todays_picks:'Selección de hoy',
    you_may_like:'También te gustará', section_world:'Cocinas del mundo',
    see_all:'Ver todo', section_categories:'Categorías', load_more:'Cargar más',
    footer_about:'Acerca de', footer_privacy_link:'Privacidad',
    recent_searches:'Búsquedas recientes', section_popular:'Populares',
    search_results:'resultados', no_results:'No se encontraron recetas',
    explore_categories:'Explorar categorías', filter_all:'Todo',
    back:'← Atrás',
    ingredients:'Ingredientes', preparation:'Preparación', start_cooking:'COCINAR',
    share:'Compartir', servings:'Porciones', source:'Fuente', print:'Imprimir',
    your_rating:'Tu calificación', add_all:'Añadir todo', add_to_plan:'Añadir al plan',
    shopping_title:'Lista de compras', no_items:'Tu lista está vacía',
    clear_all:'Borrar todo', shopping_hint:'Añade ingredientes desde una receta.',
    discover_recipes:'Descubrir recetas', done:'hechos',
    add_item_placeholder:'Añadir un artículo...', qty:'Cant.',
    share_list:'Compartir lista', clear_done:'Borrar marcados',
    cuisine:'Cocina', no_cuisine_recipes:'No se encontraron recetas para esta cocina.',
    explore_cuisines:'Explorar todas las cocinas',
    connexion:'Iniciar sesión', create_account:'Crear una cuenta',
    already_account:'Ya tengo una cuenta', or:'o',
    login_access:'Accede a tus menús personalizados',
    register_access:'Obtén menús adaptados a tus objetivos',
    email:'Correo electrónico', email_placeholder:'tu@email.com',
    password:'Contraseña', password_placeholder:'••••••••',
    full_name:'Nombre completo', full_name_placeholder:'Juan García',
    btn_login:'Iniciar sesión', btn_register:'Registrarse',
    my_goal:'Mi objetivo', profile_hint:'Completa tu perfil para menús personalizados',
    age:'Edad', gender_label:'Género', male:'Hombre', female:'Mujer',
    weight:'Peso (kg)', height:'Altura (cm)', activity_label:'Nivel de actividad',
    act_sedentary:'🪑 Sedentario (poco/nada de deporte)', act_light:'🚶 Ligera (1-3d/sem)',
    act_moderate:'🏃 Moderada (3-5d/sem)', act_active:'⚡ Activa (6-7d/sem)',
    act_very_active:'🔥 Muy activa (2x/día)',
    goal_label:'Mi objetivo',
    goal_lose_label:'Pérdida de peso', goal_maintain_label:'Mantenimiento',
    goal_gain_label:'Aumento de peso', goal_muscle_label:'Ganancia muscular',
    goal_lose_sub:'Déficit calórico', goal_maintain_sub:'Equilibrio calórico',
    goal_gain_sub:'Excedente calórico', goal_muscle_sub:'Excedente + proteínas',
    save_and_menu:'Guardar & Ver mi menú',
    choose_lang:'Elegir idioma',
    kcal_per_day:'kcal/día', protein_per_day:'proteínas/día',
    current_weight:'peso actual', objective:'objetivo',
    view_my_menu:'Ver mi menú personalizado',
    complete_profile:'¡Completa tu perfil para obtener un menú personalizado!',
    set_goal:'Definir mi objetivo', edit_profile:'Editar mi perfil',
    logout_btn:'Cerrar sesión',
    my_menu_title:'Mi Menú Personalizado', new_menu:'Nuevo menú',
    day_0:'Lunes', day_1:'Martes', day_2:'Miércoles', day_3:'Jueves',
    day_4:'Viernes', day_5:'Sábado', day_6:'Domingo',
    meal_breakfast:'🌅 Desayuno', meal_lunch:'☀️ Almuerzo', meal_dinner:'🌙 Cena',
    privacy_title:'Política de privacidad', about_sub:'Descubre sabores de todo el mundo',
    toast_added_fav:'¡Añadido a favoritos!', toast_removed_fav:'Eliminado de favoritos',
    toast_added_shopping:'Añadido a la lista', toast_login_required:'Por favor inicia sesión para usar esta función',
    toast_copied:'¡Enlace copiado!', toast_error:'Ha ocurrido un error', toast_saved:'¡Guardado!',
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  },

  ar: {
    nav_home:'الرئيسية', nav_recipes:'الوصفات', nav_categories:'الفئات',
    nav_favorites:'المفضلة', nav_shopping:'قائمة التسوق', nav_login:'تسجيل الدخول',
    tab_explore:'استكشاف', tab_plan:'التخطيط',
    nav_register:'إنشاء حساب', nav_profile:'ملفي الشخصي', nav_logout:'تسجيل الخروج',
    nav_search_placeholder:'ابحث عن وصفة أو مكون...',
    featured:'المميزة', cook_now:'اطبخ الآن', surprise_me:'فاجئني',
    recently_viewed:'شوهد مؤخراً', todays_picks:'اختيار اليوم',
    you_may_like:'قد يعجبك أيضاً', section_world:'مطابخ العالم',
    see_all:'عرض الكل', section_categories:'الفئات', load_more:'تحميل المزيد',
    footer_about:'عن التطبيق', footer_privacy_link:'الخصوصية',
    recent_searches:'البحث الأخير', section_popular:'الأكثر شعبية',
    search_results:'نتيجة', no_results:'لم يتم العثور على وصفات',
    explore_categories:'استكشف الفئات', filter_all:'الكل',
    back:'→ رجوع',
    ingredients:'المكونات', preparation:'طريقة التحضير', start_cooking:'ابدأ الطبخ',
    share:'مشاركة', servings:'الحصص', source:'المصدر', print:'طباعة',
    your_rating:'تقييمك', add_all:'إضافة الكل', add_to_plan:'إضافة للخطة',
    shopping_title:'قائمة التسوق', no_items:'قائمتك فارغة',
    clear_all:'مسح الكل', shopping_hint:'أضف مكونات من وصفة.',
    discover_recipes:'استكشف الوصفات', done:'منجزة',
    add_item_placeholder:'إضافة عنصر...', qty:'الكمية',
    share_list:'مشاركة القائمة', clear_done:'مسح المحددة',
    cuisine:'مطبخ', no_cuisine_recipes:'لا توجد وصفات لهذا المطبخ بعد.',
    explore_cuisines:'استكشف جميع المطابخ',
    connexion:'تسجيل الدخول', create_account:'إنشاء حساب',
    already_account:'لدي حساب بالفعل', or:'أو',
    login_access:'الوصول إلى قوائمك المخصصة',
    register_access:'احصل على قوائم مصممة لأهدافك',
    email:'البريد الإلكتروني', email_placeholder:'you@email.com',
    password:'كلمة المرور', password_placeholder:'••••••••',
    full_name:'الاسم الكامل', full_name_placeholder:'أحمد محمد',
    btn_login:'تسجيل الدخول', btn_register:'إنشاء حساب',
    my_goal:'هدفي', profile_hint:'أكمل ملفك الشخصي للحصول على قوائم طعام مخصصة',
    age:'العمر', gender_label:'الجنس', male:'ذكر', female:'أنثى',
    weight:'الوزن (كجم)', height:'الطول (سم)', activity_label:'مستوى النشاط',
    act_sedentary:'🪑 مستقر (قليل/لا رياضة)', act_light:'🚶 خفيف (1-3 أيام/أسبوع)',
    act_moderate:'🏃 متوسط (3-5 أيام/أسبوع)', act_active:'⚡ نشيط (6-7 أيام/أسبوع)',
    act_very_active:'🔥 نشط جداً (مرتين/يوم)',
    goal_label:'هدفي',
    goal_lose_label:'خسارة الوزن', goal_maintain_label:'الحفاظ على الوزن',
    goal_gain_label:'زيادة الوزن', goal_muscle_label:'بناء العضلات',
    goal_lose_sub:'عجز السعرات', goal_maintain_sub:'توازن السعرات',
    goal_gain_sub:'فائض السعرات', goal_muscle_sub:'فائض + بروتين',
    save_and_menu:'حفظ ومشاهدة قائمتي',
    choose_lang:'اختر اللغة',
    kcal_per_day:'سعرة/يوم', protein_per_day:'بروتين/يوم',
    current_weight:'الوزن الحالي', objective:'الهدف',
    view_my_menu:'عرض قائمتي المخصصة',
    complete_profile:'أكمل ملفك الشخصي للحصول على قائمة طعام مخصصة!',
    set_goal:'تحديد هدفي', edit_profile:'تعديل ملفي الشخصي',
    logout_btn:'تسجيل الخروج',
    my_menu_title:'قائمتي المخصصة', new_menu:'قائمة جديدة',
    day_0:'الاثنين', day_1:'الثلاثاء', day_2:'الأربعاء', day_3:'الخميس',
    day_4:'الجمعة', day_5:'السبت', day_6:'الأحد',
    meal_breakfast:'🌅 فطور', meal_lunch:'☀️ غداء', meal_dinner:'🌙 عشاء',
    privacy_title:'سياسة الخصوصية', about_sub:'اكتشف نكهات من حول العالم',
    toast_added_fav:'تمت الإضافة إلى المفضلة!', toast_removed_fav:'تمت الإزالة من المفضلة',
    toast_added_shopping:'تمت الإضافة إلى قائمة التسوق', toast_login_required:'يرجى تسجيل الدخول لاستخدام هذه الميزة',
    toast_copied:'تم نسخ الرابط!', toast_error:'حدث خطأ ما', toast_saved:'تم الحفظ!',
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  },

  it: {
    nav_home:'Home', nav_recipes:'Ricette', nav_categories:'Categorie',
    nav_favorites:'Preferiti', nav_shopping:'Lista della spesa', nav_login:'Accedi',
    tab_explore:'Esplora', tab_plan:'Pianifica',
    nav_register:'Registrati', nav_profile:'Il mio profilo', nav_logout:'Esci',
    nav_search_placeholder:'Cerca ricette, ingredienti...',
    featured:'In evidenza', cook_now:'Cucina ora', surprise_me:'Sorprendimi',
    recently_viewed:'Visti di recente', todays_picks:'Selezione di oggi',
    you_may_like:'Potrebbe piacerti', section_world:'Cucine del mondo',
    see_all:'Vedi tutto', section_categories:'Categorie', load_more:'Carica altro',
    footer_about:'Chi siamo', footer_privacy_link:'Privacy',
    recent_searches:'Ricerche recenti', section_popular:'Popolari',
    search_results:'risultati', no_results:'Nessuna ricetta trovata',
    explore_categories:'Esplora categorie', filter_all:'Tutto',
    back:'← Indietro',
    ingredients:'Ingredienti', preparation:'Preparazione', start_cooking:'CUCINA',
    share:'Condividi', servings:'Porzioni', source:'Fonte', print:'Stampa',
    your_rating:'La tua valutazione', add_all:'Aggiungi tutto', add_to_plan:'Aggiungi al piano',
    shopping_title:'Lista della spesa', no_items:'La tua lista è vuota',
    clear_all:'Cancella tutto', shopping_hint:'Aggiungi ingredienti da una ricetta.',
    discover_recipes:'Scopri ricette', done:'fatti',
    add_item_placeholder:'Aggiungi un articolo...', qty:'Qtà',
    share_list:'Condividi lista', clear_done:'Cancella selezionati',
    cuisine:'Cucina', no_cuisine_recipes:'Nessuna ricetta trovata per questa cucina.',
    explore_cuisines:'Esplora tutte le cucine',
    connexion:'Accedi', create_account:'Crea un account',
    already_account:'Ho già un account', or:'o',
    login_access:'Accedi ai tuoi menu personalizzati',
    register_access:'Ottieni menu adattati ai tuoi obiettivi',
    email:'Email', email_placeholder:'tu@email.com',
    password:'Password', password_placeholder:'••••••••',
    full_name:'Nome completo', full_name_placeholder:'Mario Rossi',
    btn_login:'Accedi', btn_register:'Registrati',
    my_goal:'Il mio obiettivo', profile_hint:'Completa il profilo per menu personalizzati',
    age:'Età', gender_label:'Sesso', male:'Uomo', female:'Donna',
    weight:'Peso (kg)', height:'Altezza (cm)', activity_label:'Livello di attività',
    act_sedentary:'🪑 Sedentario (poco/nessuno sport)', act_light:'🚶 Leggero (1-3g/sett)',
    act_moderate:'🏃 Moderato (3-5g/sett)', act_active:'⚡ Attivo (6-7g/sett)',
    act_very_active:'🔥 Molto attivo (2x/giorno)',
    goal_label:'Il mio obiettivo',
    goal_lose_label:'Perdita di peso', goal_maintain_label:'Mantenimento',
    goal_gain_label:'Aumento di peso', goal_muscle_label:'Guadagno muscolare',
    goal_lose_sub:'Deficit calorico', goal_maintain_sub:'Equilibrio calorico',
    goal_gain_sub:'Surplus calorico', goal_muscle_sub:'Surplus + proteine',
    save_and_menu:'Salva e Visualizza il menu',
    choose_lang:'Scegli la lingua',
    kcal_per_day:'kcal/giorno', protein_per_day:'proteine/giorno',
    current_weight:'peso attuale', objective:'obiettivo',
    view_my_menu:'Visualizza il mio menu',
    complete_profile:'Completa il profilo per un menu personalizzato!',
    set_goal:'Imposta il mio obiettivo', edit_profile:'Modifica il profilo',
    logout_btn:'Esci',
    my_menu_title:'Il Mio Menu Personalizzato', new_menu:'Nuovo menu',
    day_0:'Lunedì', day_1:'Martedì', day_2:'Mercoledì', day_3:'Giovedì',
    day_4:'Venerdì', day_5:'Sabato', day_6:'Domenica',
    meal_breakfast:'🌅 Colazione', meal_lunch:'☀️ Pranzo', meal_dinner:'🌙 Cena',
    privacy_title:'Informativa sulla privacy', about_sub:'Scopri i sapori di tutto il mondo',
    toast_added_fav:'Aggiunto ai preferiti!', toast_removed_fav:'Rimosso dai preferiti',
    toast_added_shopping:'Aggiunto alla lista', toast_login_required:'Accedi per usare questa funzione',
    toast_copied:'Link copiato!', toast_error:'Si è verificato un errore', toast_saved:'Salvato!',
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  },

  ja: {
    nav_home:'ホーム', nav_recipes:'レシピ', nav_categories:'カテゴリ',
    nav_favorites:'お気に入り', nav_shopping:'買い物リスト', nav_login:'ログイン',
    tab_explore:'探索', tab_plan:'プラン',
    nav_register:'登録', nav_profile:'マイプロフィール', nav_logout:'ログアウト',
    nav_search_placeholder:'レシピ、食材を検索...',
    featured:'注目', cook_now:'今すぐ料理', surprise_me:'サプライズ',
    recently_viewed:'最近見たもの', todays_picks:'今日のおすすめ',
    you_may_like:'おすすめ', section_world:'世界の料理',
    see_all:'すべて見る', section_categories:'カテゴリ', load_more:'もっと見る',
    footer_about:'概要', footer_privacy_link:'プライバシー',
    recent_searches:'最近の検索', section_popular:'人気',
    search_results:'件', no_results:'レシピが見つかりません',
    explore_categories:'カテゴリを探す', filter_all:'すべて',
    back:'← 戻る',
    ingredients:'食材', preparation:'作り方', start_cooking:'料理を始める',
    share:'シェア', servings:'人分', source:'ソース', print:'印刷',
    your_rating:'あなたの評価', add_all:'すべて追加', add_to_plan:'プランに追加',
    shopping_title:'買い物リスト', no_items:'リストが空です',
    clear_all:'すべて削除', shopping_hint:'レシピから食材を追加してください。',
    discover_recipes:'レシピを発見', done:'完了',
    add_item_placeholder:'アイテムを追加...', qty:'数量',
    share_list:'リストをシェア', clear_done:'完了済みを削除',
    cuisine:'料理', no_cuisine_recipes:'この料理のレシピが見つかりません。',
    explore_cuisines:'すべての料理を探す',
    connexion:'ログイン', create_account:'アカウントを作成',
    already_account:'すでにアカウントがあります', or:'または',
    login_access:'パーソナライズされたメニューにアクセス',
    register_access:'あなたの目標に合ったメニューを取得',
    email:'メール', email_placeholder:'you@email.com',
    password:'パスワード', password_placeholder:'••••••••',
    full_name:'氏名', full_name_placeholder:'山田 太郎',
    btn_login:'ログイン', btn_register:'登録',
    my_goal:'私の目標', profile_hint:'パーソナライズされたメニューのためにプロフィールを完成してください',
    age:'年齢', gender_label:'性別', male:'男性', female:'女性',
    weight:'体重 (kg)', height:'身長 (cm)', activity_label:'活動レベル',
    act_sedentary:'🪑 座りがち（運動ほぼなし）', act_light:'🚶 軽い（週1-3日）',
    act_moderate:'🏃 普通（週3-5日）', act_active:'⚡ 活動的（週6-7日）',
    act_very_active:'🔥 とても活動的（1日2回）',
    goal_label:'私の目標',
    goal_lose_label:'減量', goal_maintain_label:'維持',
    goal_gain_label:'増量', goal_muscle_label:'筋肉増強',
    goal_lose_sub:'カロリー不足', goal_maintain_sub:'カロリーバランス',
    goal_gain_sub:'カロリー余剰', goal_muscle_sub:'余剰＋タンパク質',
    save_and_menu:'保存してメニューを見る',
    choose_lang:'言語を選択',
    kcal_per_day:'kcal/日', protein_per_day:'タンパク質/日',
    current_weight:'現在の体重', objective:'目標',
    view_my_menu:'パーソナライズされたメニューを見る',
    complete_profile:'パーソナライズされたメニューのためにプロフィールを完成してください！',
    set_goal:'目標を設定する', edit_profile:'プロフィールを編集',
    logout_btn:'ログアウト',
    my_menu_title:'パーソナライズされたメニュー', new_menu:'新しいメニュー',
    day_0:'月曜日', day_1:'火曜日', day_2:'水曜日', day_3:'木曜日',
    day_4:'金曜日', day_5:'土曜日', day_6:'日曜日',
    meal_breakfast:'🌅 朝食', meal_lunch:'☀️ 昼食', meal_dinner:'🌙 夕食',
    privacy_title:'プライバシーポリシー', about_sub:'世界の味を発見する',
    toast_added_fav:'お気に入りに追加！', toast_removed_fav:'お気に入りから削除',
    toast_added_shopping:'リストに追加', toast_login_required:'この機能を使用するにはログインしてください',
    toast_copied:'リンクをコピーしました！', toast_error:'エラーが発生しました', toast_saved:'保存しました！',
    footer_copyright:`© ${new Date().getFullYear()} Walkart`,
  }
};

const LANG_CONFIG = {
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr', font: '' },
  en: { name: 'English',  flag: '🇬🇧', dir: 'ltr', font: '' },
  es: { name: 'Español',  flag: '🇪🇸', dir: 'ltr', font: '' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl', font: "'Cairo', sans-serif" },
  it: { name: 'Italiano', flag: '🇮🇹', dir: 'ltr', font: '' },
  ja: { name: '日本語',   flag: '🇯🇵', dir: 'ltr', font: "'Noto Sans JP', sans-serif" }
};

class I18n {
  constructor() {
    this.current = localStorage.getItem('walkart_lang') || 'fr';
    this.apply();
  }

  t(key) {
    return TRANSLATIONS[this.current]?.[key] ?? TRANSLATIONS['fr']?.[key] ?? key;
  }

  set(lang) {
    if (!LANG_CONFIG[lang]) return;
    this.current = lang;
    localStorage.setItem('walkart_lang', lang);
    this.apply();
    this.render();
  }

  apply() {
    const cfg = LANG_CONFIG[this.current];
    if (!cfg) return;
    document.documentElement.lang = this.current;
    document.documentElement.dir  = cfg.dir;
    document.body.style.fontFamily = cfg.font || '';
    if (this.current === 'ar') {
      if (!document.getElementById('arabic-font')) {
        const el = document.createElement('link');
        el.id = 'arabic-font'; el.rel = 'stylesheet';
        el.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
        document.head.appendChild(el);
      }
    }
    if (this.current === 'ja') {
      if (!document.getElementById('jp-font')) {
        const el = document.createElement('link');
        el.id = 'jp-font'; el.rel = 'stylesheet';
        el.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap';
        document.head.appendChild(el);
      }
    }
  }

  render() {
    // Update all [data-i18n] text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val && val !== key) el.textContent = val;
    });
    // Update all [data-i18n-placeholder] inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.t(key);
      if (val && val !== key) el.placeholder = val;
    });
  }
}

const i18n = new I18n();
window.i18n = i18n;
