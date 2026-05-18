/* =====================================================
   WALKART — Blog / Articles
   Contenu éditorial original pour chaque langue
   ===================================================== */

const BLOG_ARTICLES = [
  {
    slug: 'cuisine-mediterraneenne',
    date: '2025-03-10',
    readMin: 6,
    category: 'nutrition',
    emoji: '🫒',
    title: {
      fr: 'Les secrets de la cuisine méditerranéenne',
      en: 'The Secrets of Mediterranean Cuisine',
      es: 'Los secretos de la cocina mediterránea',
      ar: 'أسرار المطبخ المتوسطي',
      it: 'I segreti della cucina mediterranea',
      ja: '地中海料理の秘密'
    },
    excerpt: {
      fr: 'Découvrez pourquoi la cuisine méditerranéenne est reconnue mondialement pour ses bienfaits sur la santé et comment l\'adopter au quotidien.',
      en: 'Discover why Mediterranean cuisine is recognized worldwide for its health benefits and how to adopt it in daily life.'
    },
    content: {
      fr: `<p>La cuisine méditerranéenne est bien plus qu'un simple régime alimentaire : c'est un véritable art de vivre, né sur les rives de la mer Méditerranée. Reconnue par l'UNESCO comme patrimoine culturel immatériel de l'humanité, elle séduit chaque année des millions de personnes à travers le monde, non seulement pour ses saveurs exceptionnelles, mais aussi pour ses nombreux bienfaits sur la santé.</p>

<h3>Les piliers de la cuisine méditerranéenne</h3>
<p>Au cœur de ce mode d'alimentation se trouvent quelques ingrédients phares. L'<strong>huile d'olive extra vierge</strong> est sans conteste la reine de cette cuisine. Riche en acides gras mono-insaturés et en antioxydants, elle remplace avantageusement le beurre et les huiles raffinées. Les <strong>légumes frais et de saison</strong> occupent une place centrale : tomates, courgettes, aubergines, poivrons, artichauts... la palette est infinie.</p>

<p>Les <strong>légumineuses</strong> — pois chiches, lentilles, haricots — constituent une source de protéines végétales indispensable. Combinées aux céréales complètes comme l'épeautre, le boulgour ou le pain au levain, elles forment des repas équilibrés et nourrissants. Le <strong>poisson</strong>, notamment les petits poissons gras comme la sardine et le maquereau, apporte des oméga-3 essentiels.</p>

<h3>Les bienfaits prouvés par la science</h3>
<p>De nombreuses études scientifiques confirment les vertus de ce régime. L'étude PREDIMED, menée sur plus de 7 000 personnes, a démontré une réduction significative du risque cardiovasculaire chez les personnes suivant un régime méditerranéen. D'autres recherches montrent des effets bénéfiques sur la prévention du diabète de type 2, certains cancers et les maladies neurodégénératives comme Alzheimer.</p>

<p>La richesse en fibres favorise une bonne santé intestinale, tandis que les polyphénols présents dans l'huile d'olive, le vin rouge (consommé avec modération) et les herbes aromatiques exercent une action anti-inflammatoire puissante.</p>

<h3>Comment adopter ce mode d'alimentation ?</h3>
<p>Adopter la cuisine méditerranéenne ne nécessite pas de bouleverser complètement ses habitudes. Commencez par remplacer le beurre par de l'huile d'olive pour la cuisson. Intégrez une portion de légumineuses deux à trois fois par semaine. Privilégiez le poisson au moins deux fois par semaine et réduisez la consommation de viande rouge à une ou deux fois par semaine.</p>

<p>N'oubliez pas les herbes aromatiques : basilic, thym, origan, romarin et persil parfument les plats tout en réduisant le besoin de sel. La cuisine méditerranéenne est aussi une cuisine conviviale : les repas sont partagés en famille ou entre amis, dans une atmosphère détendue. Ce lien social fait partie intégrante de ses bienfaits sur le bien-être général.</p>

<p>Avec Walkart, explorez des centaines de recettes méditerranéennes authentiques et commencez votre voyage culinaire dès aujourd'hui.</p>`,

      en: `<p>Mediterranean cuisine is far more than a simple diet: it is a true art of living, born on the shores of the Mediterranean Sea. Recognized by UNESCO as an intangible cultural heritage of humanity, it attracts millions of people worldwide every year, not only for its exceptional flavors but also for its many health benefits.</p>

<h3>The Pillars of Mediterranean Cuisine</h3>
<p>At the heart of this way of eating are a few key ingredients. <strong>Extra virgin olive oil</strong> is undeniably the queen of this cuisine. Rich in monounsaturated fatty acids and antioxidants, it advantageously replaces butter and refined oils. <strong>Fresh, seasonal vegetables</strong> occupy a central place: tomatoes, zucchini, eggplant, peppers, artichokes — the palette is endless.</p>

<p><strong>Legumes</strong> — chickpeas, lentils, beans — are an essential source of plant protein. Combined with whole grains such as spelt, bulgur, or sourdough bread, they form balanced and nourishing meals. <strong>Fish</strong>, especially small oily fish like sardines and mackerel, provides essential omega-3 fatty acids.</p>

<h3>Benefits Proven by Science</h3>
<p>Numerous scientific studies confirm the virtues of this diet. The PREDIMED study, conducted on more than 7,000 people, demonstrated a significant reduction in cardiovascular risk among people following a Mediterranean diet. Other research shows beneficial effects on the prevention of type 2 diabetes, certain cancers, and neurodegenerative diseases like Alzheimer's.</p>

<p>The high fiber content promotes good gut health, while the polyphenols in olive oil, red wine (consumed in moderation), and aromatic herbs exert a powerful anti-inflammatory action.</p>

<h3>How to Adopt This Way of Eating?</h3>
<p>Adopting Mediterranean cuisine does not require completely overhauling your habits. Start by replacing butter with olive oil for cooking. Incorporate a serving of legumes two to three times a week. Favor fish at least twice a week and reduce red meat consumption to once or twice a week.</p>

<p>Don't forget aromatic herbs: basil, thyme, oregano, rosemary, and parsley flavor dishes while reducing the need for salt. Mediterranean cuisine is also convivial: meals are shared with family or friends in a relaxed atmosphere. This social bond is an integral part of its benefits for overall well-being.</p>

<p>With Walkart, explore hundreds of authentic Mediterranean recipes and start your culinary journey today.</p>`
    }
  },
  {
    slug: 'planifier-repas-semaine',
    date: '2025-03-18',
    readMin: 7,
    category: 'conseils',
    emoji: '📅',
    title: {
      fr: 'Comment planifier ses repas pour toute la semaine',
      en: 'How to Plan Your Meals for the Whole Week',
      es: 'Cómo planificar tus comidas para toda la semana',
      ar: 'كيف تخطط وجباتك لكل الأسبوع',
      it: 'Come pianificare i pasti per tutta la settimana',
      ja: '1週間の食事プランの立て方'
    },
    excerpt: {
      fr: 'La planification des repas est la clé pour manger sain, gagner du temps et économiser de l\'argent. Voici notre guide complet pour vous lancer.',
      en: 'Meal planning is the key to eating healthy, saving time, and saving money. Here is our complete guide to get you started.'
    },
    content: {
      fr: `<p>La planification des repas — ou <em>meal prep</em> — est l'une des meilleures habitudes que vous pouvez adopter pour améliorer votre alimentation, réduire le gaspillage alimentaire et diminuer votre stress en semaine. Avec un peu d'organisation, vous pouvez transformer vos habitudes culinaires en quelques week-ends seulement.</p>

<h3>Pourquoi planifier ses repas ?</h3>
<p>Les avantages sont nombreux. D'abord, vous <strong>mangez mieux</strong> : en planifiant à l'avance, vous évitez les décisions impulsives qui mènent souvent vers des plats transformés ou des repas trop riches. Ensuite, vous <strong>économisez de l'argent</strong> : une liste de courses précise réduit les achats impulsifs et le gaspillage. Enfin, vous <strong>gagnez du temps</strong> : préparer en batch le dimanche signifie des repas prêts en 10 minutes en semaine.</p>

<h3>Étape 1 : Faire l'inventaire</h3>
<p>Avant de planifier, regardez ce que vous avez déjà dans votre réfrigérateur, congélateur et placards. Notez les produits qui arrivent à expiration prochaine et construisez vos repas de la semaine autour d'eux. Cela réduit considérablement le gaspillage.</p>

<h3>Étape 2 : Choisir vos recettes</h3>
<p>Sélectionnez 4 à 5 repas principaux pour la semaine. Privilégiez les recettes qui partagent des ingrédients communs pour optimiser vos achats. Par exemple, si vous achetez des épinards pour une quiche, prévoyez aussi une salade ou un sauté d'épinards. Pensez aussi à vos obligations de la semaine : certains soirs, vous aurez besoin de recettes ultra-rapides (moins de 20 minutes).</p>

<h3>Étape 3 : La liste de courses</h3>
<p>Une fois vos recettes choisies, dressez une liste précise organisée par rayon (fruits et légumes, produits frais, épicerie, surgelés). Cette organisation vous fera gagner un temps précieux en magasin et évitera les oublis. L'application Walkart peut générer automatiquement votre liste de courses à partir de vos recettes sélectionnées.</p>

<h3>Étape 4 : Le batch cooking</h3>
<p>Consacrez 1h30 à 2h le week-end pour préparer vos bases. Cuisez vos céréales (riz, quinoa, lentilles), préparez vos sauces et marinades, découpez vos légumes. Ces préparations se conservent 3 à 5 jours au réfrigérateur. Vous pouvez aussi congeler des portions pour les semaines chargées.</p>

<h3>Conseils pour tenir dans la durée</h3>
<p>Commencez petit : planifiez seulement 3 repas sur 7 au début. Gardez toujours 2 ou 3 recettes "de secours" ultra-simples pour les soirs difficiles. Variez vos cuisines — méditerranéenne une semaine, asiatique la suivante — pour éviter la lassitude. Et surtout, soyez indulgent avec vous-même : si un soir vous dérogez au plan, ce n'est pas grave.</p>

<p>Le planificateur de repas Walkart vous aide à organiser votre semaine et génère automatiquement votre liste de courses. Essayez-le dès maintenant !</p>`,

      en: `<p>Meal planning — or meal prep — is one of the best habits you can adopt to improve your diet, reduce food waste, and decrease your stress during the week. With a little organization, you can transform your culinary habits in just a few weekends.</p>

<h3>Why Plan Your Meals?</h3>
<p>The benefits are numerous. First, you <strong>eat better</strong>: by planning ahead, you avoid impulsive decisions that often lead to processed foods or overly rich meals. Second, you <strong>save money</strong>: a precise shopping list reduces impulse purchases and waste. Finally, you <strong>save time</strong>: batch cooking on Sunday means meals ready in 10 minutes on weekdays.</p>

<h3>Step 1: Take Inventory</h3>
<p>Before planning, look at what you already have in your refrigerator, freezer, and pantry. Note products with upcoming expiration dates and build your weekly meals around them. This significantly reduces waste.</p>

<h3>Step 2: Choose Your Recipes</h3>
<p>Select 4 to 5 main meals for the week. Favor recipes that share common ingredients to optimize your shopping. For example, if you buy spinach for a quiche, also plan a salad or spinach sauté. Also think about your obligations during the week: some evenings you will need ultra-fast recipes (less than 20 minutes).</p>

<h3>Step 3: The Shopping List</h3>
<p>Once your recipes are chosen, draw up a precise list organized by aisle (fruits and vegetables, fresh produce, grocery, frozen). This organization will save you precious time in the store and avoid forgetting items. The Walkart app can automatically generate your shopping list from your selected recipes.</p>

<h3>Step 4: Batch Cooking</h3>
<p>Dedicate 1.5 to 2 hours on the weekend to prepare your bases. Cook your grains (rice, quinoa, lentils), prepare your sauces and marinades, cut your vegetables. These preparations keep for 3 to 5 days in the refrigerator. You can also freeze portions for busy weeks.</p>

<h3>Tips for Long-Term Success</h3>
<p>Start small: plan only 3 meals out of 7 at first. Always keep 2 or 3 ultra-simple "emergency" recipes for difficult evenings. Vary your cuisines — Mediterranean one week, Asian the next — to avoid monotony. And above all, be kind to yourself: if one evening you deviate from the plan, it's not a big deal.</p>

<p>The Walkart meal planner helps you organize your week and automatically generates your shopping list. Try it now!</p>`
    }
  },
  {
    slug: 'macronutriments-guide',
    date: '2025-03-25',
    readMin: 8,
    category: 'nutrition',
    emoji: '💪',
    title: {
      fr: 'Macronutriments : le guide complet pour les comprendre',
      en: 'Macronutrients: The Complete Guide to Understanding Them',
      es: 'Macronutrientes: la guía completa para entenderlos',
      ar: 'المغذيات الكبرى: الدليل الشامل لفهمها',
      it: 'Macronutrienti: la guida completa per capirli',
      ja: '三大栄養素：完全理解ガイド'
    },
    excerpt: {
      fr: 'Protéines, glucides, lipides : que sont vraiment les macronutriments et comment les équilibrer pour atteindre vos objectifs de santé ?',
      en: 'Proteins, carbohydrates, fats: what are macronutrients really and how to balance them to achieve your health goals?'
    },
    content: {
      fr: `<p>Quand on s'intéresse à la nutrition, on entend très souvent parler des macronutriments. Ces trois grandes familles — protéines, glucides et lipides — constituent la totalité de l'énergie que nous apportons à notre organisme. Comprendre leur rôle respectif est la première étape vers une alimentation vraiment équilibrée.</p>

<h3>Les protéines : les bâtisseurs du corps</h3>
<p>Les protéines apportent <strong>4 kilocalories par gramme</strong> et jouent un rôle fondamental dans la construction et la réparation des tissus musculaires, la fabrication des enzymes et des hormones, ainsi que dans le fonctionnement du système immunitaire. On les trouve dans les viandes, poissons, œufs, produits laitiers, mais aussi dans les légumineuses (lentilles, pois chiches, haricots) et le tofu.</p>

<p>Les recommandations générales sont d'environ <strong>0,8 à 1 g de protéines par kilo de poids corporel</strong> pour une personne sédentaire. Ce chiffre monte à 1,5 à 2 g pour les personnes pratiquant une activité physique intense.</p>

<h3>Les glucides : le carburant préféré du cerveau</h3>
<p>Avec également <strong>4 kcal par gramme</strong>, les glucides sont la principale source d'énergie de l'organisme, et surtout du cerveau qui consomme à lui seul environ 120 g de glucose par jour. Il est important de distinguer les <em>glucides simples</em> (sucres, sucreries, sodas) à absorption rapide, des <em>glucides complexes</em> (céréales complètes, légumineuses, légumes) à absorption lente qui maintiennent une énergie stable tout au long de la journée.</p>

<p>Les glucides complexes sont aussi riches en fibres, essentielles à une bonne digestion et à la sensation de satiété. Ils devraient représenter la majorité de votre apport glucidique.</p>

<h3>Les lipides : bien plus qu'une source d'énergie</h3>
<p>Long diabolisés, les lipides sont pourtant indispensables. Avec <strong>9 kcal par gramme</strong>, ils constituent la source d'énergie la plus concentrée. Mais leur rôle va bien au-delà : ils participent à la fabrication des membranes cellulaires, à l'absorption des vitamines liposolubles (A, D, E, K), à la production d'hormones et à la protection des organes vitaux.</p>

<p>La clé est de privilégier les <em>bonnes graisses</em> : acides gras mono-insaturés (huile d'olive, avocat, amandes) et polyinsaturés oméga-3 (poissons gras, graines de lin, noix). À réduire : les graisses saturées en excès et surtout les acides gras trans présents dans les produits ultra-transformés.</p>

<h3>Comment équilibrer ses macronutriments ?</h3>
<p>Une répartition équilibrée classique pour une personne active est d'environ <strong>50-55% de glucides, 20-25% de protéines, 25-30% de lipides</strong>. Ces ratios varient selon vos objectifs : prise de masse musculaire, perte de poids, endurance sportive. L'essentiel est de privilegier la qualité des aliments au-delà des chiffres.</p>

<p>Le tracker nutritionnel Walkart analyse automatiquement vos recettes et vous donne la répartition exacte des macronutriments de chaque plat.</p>`,

      en: `<p>When you become interested in nutrition, you very often hear about macronutrients. These three major families — proteins, carbohydrates, and fats — make up all the energy we provide to our body. Understanding their respective roles is the first step toward truly balanced eating.</p>

<h3>Proteins: The Body's Builders</h3>
<p>Proteins provide <strong>4 kilocalories per gram</strong> and play a fundamental role in building and repairing muscle tissue, making enzymes and hormones, and supporting immune system function. They are found in meats, fish, eggs, dairy products, as well as in legumes (lentils, chickpeas, beans) and tofu.</p>

<p>General recommendations are approximately <strong>0.8 to 1 g of protein per kilogram of body weight</strong> for a sedentary person. This figure rises to 1.5 to 2 g for people engaged in intense physical activity.</p>

<h3>Carbohydrates: The Brain's Preferred Fuel</h3>
<p>Also providing <strong>4 kcal per gram</strong>, carbohydrates are the body's main source of energy, especially for the brain which alone consumes about 120 g of glucose per day. It is important to distinguish <em>simple carbohydrates</em> (sugars, sweets, sodas) with rapid absorption from <em>complex carbohydrates</em> (whole grains, legumes, vegetables) with slow absorption that maintain stable energy throughout the day.</p>

<p>Complex carbohydrates are also rich in fiber, essential for good digestion and feeling of satiety. They should make up the majority of your carbohydrate intake.</p>

<h3>Fats: Much More Than an Energy Source</h3>
<p>Long demonized, fats are nevertheless indispensable. With <strong>9 kcal per gram</strong>, they constitute the most concentrated energy source. But their role goes much further: they participate in making cell membranes, absorbing fat-soluble vitamins (A, D, E, K), producing hormones, and protecting vital organs.</p>

<p>The key is to favor <em>good fats</em>: monounsaturated fatty acids (olive oil, avocado, almonds) and polyunsaturated omega-3s (fatty fish, flaxseeds, walnuts). To reduce: excess saturated fats and especially trans fatty acids found in ultra-processed products.</p>

<h3>How to Balance Your Macronutrients?</h3>
<p>A classic balanced distribution for an active person is approximately <strong>50-55% carbohydrates, 20-25% proteins, 25-30% fats</strong>. These ratios vary according to your goals: muscle building, weight loss, sports endurance. The essential thing is to prioritize food quality beyond the numbers.</p>

<p>The Walkart nutrition tracker automatically analyzes your recipes and gives you the exact macronutrient breakdown of each dish.</p>`
    }
  },
  {
    slug: 'epices-indispensables',
    date: '2025-04-02',
    readMin: 5,
    category: 'conseils',
    emoji: '🌶️',
    title: {
      fr: 'Les 10 épices indispensables dans votre cuisine',
      en: '10 Essential Spices for Your Kitchen',
      es: 'Las 10 especias indispensables en tu cocina',
      ar: '10 توابل لا غنى عنها في مطبخك',
      it: 'Le 10 spezie indispensabili nella tua cucina',
      ja: 'キッチンに欠かせない10のスパイス'
    },
    excerpt: {
      fr: 'Transformez vos plats avec les bonnes épices. Voici les 10 incontournables à avoir absolument dans vos placards.',
      en: 'Transform your dishes with the right spices. Here are the 10 must-haves to absolutely have in your pantry.'
    },
    content: {
      fr: `<p>Les épices sont les alliées secrètes des grands cuisiniers. Elles transforment un plat ordinaire en une expérience gustative mémorable, apportent couleur et arôme, et offrent souvent des bienfaits nutritionnels insoupçonnés. Voici les 10 épices qu'il vous faut absolument dans vos placards.</p>

<h3>1. Le curcuma</h3>
<p>Star des cuisines indiennes et moyen-orientales, le curcuma doit sa couleur jaune vif à la curcumine, un puissant anti-inflammatoire naturel. Il se marie parfaitement avec le poivre noir qui décuple son absorption par l'organisme. À utiliser dans les currys, soupes, riz et même les lattes.</p>

<h3>2. Le cumin</h3>
<p>Épice fondamentale dans les cuisines mexicaine, indienne et nord-africaine, le cumin apporte une note chaude et légèrement terreuse. Il est excellent dans les légumineuses, les tajines et les marinades pour viandes.</p>

<h3>3. Le paprika fumé</h3>
<p>Le paprika fumé apporte une profondeur de saveur incomparable aux plats. Il colore les sauces, les soupes et les viandes d'une belle teinte orangée tout en leur donnant une note fumée irrésistible. Indispensable dans la paëlla et les ragoûts espagnols.</p>

<h3>4. La cannelle</h3>
<p>Ne réservez pas la cannelle aux desserts ! Elle est extraordinaire dans les plats salés : tajines marocains, currys indiens, plats d'agneau au Moyen-Orient. Elle apporte chaleur et complexité à vos recettes.</p>

<h3>5. Le gingembre</h3>
<p>Frais ou en poudre, le gingembre apporte fraîcheur et piquant. Excellent pour la digestion, il se marie bien avec les cuisines asiatiques, les marinades et les boissons chaudes.</p>

<h3>6. La coriandre moulue</h3>
<p>Douce et légèrement citronnée, la coriandre moulue (à ne pas confondre avec les feuilles fraîches) est indispensable dans les mélanges d'épices comme le ras-el-hanout ou le garam masala.</p>

<h3>7. Le piment de Cayenne</h3>
<p>Pour ceux qui aiment le piquant, le piment de Cayenne est incontournable. Utilisé avec parcimonie, il réveille tous les plats et stimule le métabolisme.</p>

<h3>8. La cardamome</h3>
<p>Épice précieuse au parfum envoûtant, la cardamome est reine dans les cuisines scandinave, indienne et moyen-orientale. Elle parfume les desserts, les cafés et les currys.</p>

<h3>9. Le zaatar</h3>
<p>Ce mélange moyen-oriental de thym, sumac, sésame et herbes séchées est extraordinairement polyvalent. À saupoudrer sur du pain avec de l'huile d'olive, sur les légumes rôtis ou le houmous.</p>

<h3>10. Le poivre noir fraîchement moulu</h3>
<p>Souvent négligé, le poivre noir fraîchement moulu est d'une tout autre dimension que le poivre en poudre. Il contient de la pipérine qui améliore l'absorption de nombreux nutriments, dont la curcumine du curcuma.</p>

<p>Avec Walkart, filtrez les recettes par épice ou cuisine pour explorer tout ce que ces trésors aromatiques peuvent apporter à vos plats.</p>`,

      en: `<p>Spices are the secret allies of great cooks. They transform an ordinary dish into a memorable taste experience, bring color and aroma, and often offer unsuspected nutritional benefits. Here are the 10 spices you absolutely must have in your pantry.</p>

<h3>1. Turmeric</h3>
<p>A star of Indian and Middle Eastern cuisines, turmeric owes its bright yellow color to curcumin, a powerful natural anti-inflammatory. It pairs perfectly with black pepper, which multiplies its absorption by the body. Use it in curries, soups, rice, and even lattes.</p>

<h3>2. Cumin</h3>
<p>A fundamental spice in Mexican, Indian, and North African cuisines, cumin brings a warm, slightly earthy note. It is excellent in legumes, tagines, and meat marinades.</p>

<h3>3. Smoked Paprika</h3>
<p>Smoked paprika brings incomparable depth of flavor to dishes. It colors sauces, soups, and meats with a beautiful orange hue while giving them an irresistible smoky note. Essential in paella and Spanish stews.</p>

<h3>4. Cinnamon</h3>
<p>Don't save cinnamon just for desserts! It is extraordinary in savory dishes: Moroccan tagines, Indian curries, lamb dishes in the Middle East. It brings warmth and complexity to your recipes.</p>

<h3>5. Ginger</h3>
<p>Fresh or powdered, ginger brings freshness and heat. Excellent for digestion, it pairs well with Asian cuisines, marinades, and hot drinks.</p>

<h3>6. Ground Coriander</h3>
<p>Mild and slightly lemony, ground coriander (not to be confused with fresh leaves) is essential in spice blends like ras el hanout or garam masala.</p>

<h3>7. Cayenne Pepper</h3>
<p>For those who love heat, cayenne pepper is essential. Used sparingly, it livens up all dishes and stimulates metabolism.</p>

<h3>8. Cardamom</h3>
<p>A precious spice with an enchanting fragrance, cardamom is queen in Scandinavian, Indian, and Middle Eastern cuisines. It flavors desserts, coffees, and curries.</p>

<h3>9. Za'atar</h3>
<p>This Middle Eastern blend of thyme, sumac, sesame, and dried herbs is extraordinarily versatile. Sprinkle it on bread with olive oil, on roasted vegetables, or on hummus.</p>

<h3>10. Freshly Ground Black Pepper</h3>
<p>Often overlooked, freshly ground black pepper is in a completely different dimension from powdered pepper. It contains piperine which improves the absorption of many nutrients, including curcumin from turmeric.</p>

<p>With Walkart, filter recipes by spice or cuisine to explore everything these aromatic treasures can bring to your dishes.</p>`
    }
  },
  {
    slug: 'lire-etiquette-nutritionnelle',
    date: '2025-04-10',
    readMin: 6,
    category: 'nutrition',
    emoji: '🏷️',
    title: {
      fr: 'Comment lire une étiquette nutritionnelle comme un expert',
      en: 'How to Read a Nutrition Label Like an Expert',
      es: 'Cómo leer una etiqueta nutricional como un experto',
      ar: 'كيف تقرأ الملصق الغذائي كالخبراء',
      it: 'Come leggere un\'etichetta nutrizionale come un esperto',
      ja: '栄養成分表示の読み方'
    },
    excerpt: {
      fr: 'Les étiquettes nutritionnelles contiennent une mine d\'informations. Apprenez à les déchiffrer pour faire de meilleurs choix alimentaires.',
      en: 'Nutrition labels contain a wealth of information. Learn to decipher them to make better food choices.'
    },
    content: {
      fr: `<p>Vous passez des heures dans les rayons du supermarché, perdu face aux étiquettes incompréhensibles ? Vous n'êtes pas seul. La lecture des étiquettes nutritionnelles est une compétence qui s'apprend, et qui peut transformer radicalement votre façon de faire vos courses.</p>

<h3>La taille d'une portion : la première piège</h3>
<p>Toutes les valeurs nutritionnelles sont indiquées <strong>pour 100 g</strong> ou pour une portion définie par le fabricant. Attention : cette "portion" est souvent bien inférieure à ce que vous consommez réellement. Un paquet de chips mentionnant "150 kcal par portion" peut cacher 3 ou 4 portions dans un seul sachet. Vérifiez toujours la quantité et multipliez en conséquence.</p>

<h3>Les calories : nécessaires mais insuffisantes</h3>
<p>La valeur énergétique (en kcal) est utile, mais ne dites pas tout. Un aliment peut être très calorique et très nutritif (noix, avocat), ou peu calorique et sans intérêt nutritionnel (sodas light). Regardez toujours la qualité des calories au-delà du chiffre brut.</p>

<h3>Les graisses : distinguer les bonnes des mauvaises</h3>
<p>La mention "matières grasses" est suivie de "dont acides gras saturés". Ce sont ces derniers qu'il faut surveiller en priorité (à limiter sous 20 g/jour pour un adulte). Méfiez-vous surtout des <strong>acides gras trans</strong> — souvent cachés sous "huiles partiellement hydrogénées" dans la liste d'ingrédients — qui sont les plus néfastes pour la santé cardiovasculaire.</p>

<h3>Les glucides et les sucres</h3>
<p>Sous "glucides", cherchez "dont sucres". Cette valeur représente les sucres simples totaux (naturels + ajoutés). L'OMS recommande de limiter les sucres ajoutés à moins de 50 g par jour. Un yaourt aux fruits peut contenir autant de sucre qu'une barre chocolatée ! Préférez toujours la version nature.</p>

<h3>Les protéines et les fibres</h3>
<p>Les protéines et les fibres sont souvent les grandes oubliées, pourtant ce sont de précieux indicateurs de la qualité d'un aliment. Un aliment riche en fibres (plus de 6 g/100g) rassasie plus longtemps et favorise une bonne santé digestive. Les protéines maintiennent la masse musculaire et la satiété.</p>

<h3>La liste d'ingrédients</h3>
<p>La liste d'ingrédients est organisée <strong>par ordre décroissant de quantité</strong> : le premier ingrédient est le plus présent. Si le sucre, l'huile de palme ou le sel apparaissent dans les trois premiers, méfiance. En règle générale, plus la liste est courte et compréhensible, meilleur est le produit.</p>

<p>Le scanner de code-barres Walkart analyse instantanément les valeurs nutritionnelles de vos produits et vous aide à faire des choix éclairés à chaque repas.</p>`,

      en: `<p>Do you spend hours in supermarket aisles, lost in front of incomprehensible labels? You're not alone. Reading nutrition labels is a skill that can be learned, and one that can radically transform how you shop.</p>

<h3>Serving Size: The First Trap</h3>
<p>All nutritional values are listed <strong>per 100g</strong> or per a serving size defined by the manufacturer. Warning: this "serving" is often well below what you actually consume. A bag of chips stating "150 kcal per serving" may hide 3 or 4 servings in a single bag. Always check the quantity and multiply accordingly.</p>

<h3>Calories: Necessary But Insufficient</h3>
<p>The energy value (in kcal) is useful, but it doesn't tell the whole story. A food can be very caloric and very nutritious (nuts, avocado), or low-calorie and nutritionally worthless (diet sodas). Always look at the quality of calories beyond the raw number.</p>

<h3>Fats: Distinguishing Good from Bad</h3>
<p>The "fat" entry is followed by "of which saturates." These are the ones to monitor first (limit to under 20g/day for adults). Beware especially of <strong>trans fatty acids</strong> — often hidden as "partially hydrogenated oils" in the ingredient list — which are the most harmful for cardiovascular health.</p>

<h3>Carbohydrates and Sugars</h3>
<p>Under "carbohydrates," look for "of which sugars." This value represents total simple sugars (natural + added). The WHO recommends limiting added sugars to less than 50g per day. A fruit yogurt can contain as much sugar as a chocolate bar! Always prefer the plain version.</p>

<h3>Proteins and Fiber</h3>
<p>Proteins and fiber are often forgotten, yet they are precious indicators of food quality. A fiber-rich food (more than 6g/100g) keeps you fuller longer and promotes good digestive health. Proteins maintain muscle mass and satiety.</p>

<h3>The Ingredient List</h3>
<p>The ingredient list is organized <strong>in descending order of quantity</strong>: the first ingredient is the most present. If sugar, palm oil, or salt appears in the first three, be wary. As a rule, the shorter and more understandable the list, the better the product.</p>

<p>The Walkart barcode scanner instantly analyzes the nutritional values of your products and helps you make informed choices at every meal.</p>`
    }
  },
  {
    slug: 'cuisine-petit-budget',
    date: '2025-04-18',
    readMin: 6,
    category: 'conseils',
    emoji: '💰',
    title: {
      fr: 'Bien manger avec un petit budget : nos meilleures astuces',
      en: 'Eating Well on a Small Budget: Our Best Tips',
      es: 'Comer bien con poco dinero: nuestros mejores consejos',
      ar: 'الأكل الجيد بميزانية محدودة: أفضل نصائحنا',
      it: 'Mangiare bene con un piccolo budget: i nostri migliori consigli',
      ja: '少ない予算で健康的に食べる方法'
    },
    excerpt: {
      fr: 'Manger sainement ne coûte pas forcément cher. Découvrez nos stratégies pour composer des repas nutritifs et savoureux sans vous ruiner.',
      en: 'Eating healthily doesn\'t necessarily cost a lot. Discover our strategies for composing nutritious and tasty meals without breaking the bank.'
    },
    content: {
      fr: `<p>L'idée reçue selon laquelle bien manger est réservé aux budgets confortables est tenace. Pourtant, avec les bonnes stratégies, il est tout à fait possible de composer des repas équilibrés, savoureux et variés pour moins de 5€ par personne et par jour. Voici comment.</p>

<h3>Misez sur les protéines bon marché</h3>
<p>Les protéines animales de qualité peuvent être coûteuses. Mais les <strong>légumineuses</strong> — lentilles, pois chiches, haricots rouges — offrent des protéines végétales complètes pour une fraction du prix. Un kilo de lentilles corail coûte moins de 2€ et permet de préparer 4 à 6 repas. Les <strong>œufs</strong> restent également l'une des meilleures sources de protéines qualité-prix. En matière de viande, privilégiez les morceaux à mijoter (joue de bœuf, collier d'agneau, cuisses de poulet) : moins chers que les filets, ils sont souvent bien plus savoureux une fois cuits lentement.</p>

<h3>Cuisiner de saison</h3>
<p>Les fruits et légumes de saison coûtent deux à trois fois moins cher que les produits hors saison importés. En hiver, misez sur les choux, carottes, poireaux, pommes de terre et betteraves. Au printemps, les asperges, petits pois et fraises. En été, tomates, courgettes, aubergines et haricots verts. En automne, courges, champignons et pommes. Les marchés de fin de journée proposent souvent des rabais importants sur les invendus.</p>

<h3>Le surgelé, un allié sous-estimé</h3>
<p>Les légumes surgelés sont une excellente option : cueillis à maturité et congelés immédiatement, ils conservent la majorité de leurs nutriments. Ils coûtent bien moins cher que les frais hors saison et ne génèrent aucun gaspillage. Petits pois, épinards, brocolis, haricots verts : constituez-vous un stock de base.</p>

<h3>Acheter en vrac et en grandes quantités</h3>
<p>Céréales, légumineuses, huile d'olive, conserves de tomates : achetez ces incontournables en grande quantité. Le coût unitaire est bien inférieur et vous évitez les ruptures de stock. Prévoyez un budget mensuel plutôt que de faire des courses au jour le jour.</p>

<h3>Zéro gaspillage</h3>
<p>Le gaspillage alimentaire représente en moyenne 20 à 30€ par mois pour un foyer. Vérifiez votre réfrigérateur avant chaque course, cuisinez les restes en soupes ou gratins, congelez ce qui ne sera pas consommé dans les 48 heures. Les épluchures de légumes font d'excellents bouillons maison.</p>

<h3>Cuisiner en grande quantité</h3>
<p>La règle d'or : cuisinez toujours plus que nécessaire. Un grand pot de soupe, de lentilles ou de riz cuit se consomme sur 3 à 4 jours et divise le coût par repas. Le batch cooking est la méthode la plus efficace pour manger bien et économique.</p>

<p>Utilisez le planificateur de repas Walkart pour optimiser votre budget alimentaire semaine après semaine.</p>`,

      en: `<p>The received idea that eating well is reserved for comfortable budgets is persistent. Yet with the right strategies, it is entirely possible to compose balanced, tasty, and varied meals for less than €5 per person per day. Here's how.</p>

<h3>Bet on Cheap Proteins</h3>
<p>Quality animal proteins can be expensive. But <strong>legumes</strong> — lentils, chickpeas, kidney beans — offer complete plant proteins for a fraction of the price. A kilo of red lentils costs less than €2 and allows you to prepare 4 to 6 meals. <strong>Eggs</strong> also remain one of the best protein sources for the price. For meat, favor slow-cooking cuts (beef cheek, lamb neck, chicken thighs): cheaper than fillets, they are often much tastier when cooked slowly.</p>

<h3>Cook Seasonally</h3>
<p>Seasonal fruits and vegetables cost two to three times less than out-of-season imported products. In winter, focus on cabbages, carrots, leeks, potatoes, and beets. In spring, asparagus, peas, and strawberries. In summer, tomatoes, zucchini, eggplant, and green beans. In autumn, squash, mushrooms, and apples. End-of-day markets often offer significant discounts on unsold items.</p>

<h3>Frozen Food: An Underestimated Ally</h3>
<p>Frozen vegetables are an excellent option: harvested at peak ripeness and frozen immediately, they retain the majority of their nutrients. They cost much less than out-of-season fresh vegetables and generate no waste. Peas, spinach, broccoli, green beans: build yourself a basic stock.</p>

<h3>Buy in Bulk and Large Quantities</h3>
<p>Grains, legumes, olive oil, canned tomatoes: buy these essentials in large quantities. The unit cost is much lower and you avoid running out. Plan a monthly budget rather than shopping day by day.</p>

<h3>Zero Waste</h3>
<p>Food waste represents an average of €20 to €30 per month for a household. Check your refrigerator before each shopping trip, cook leftovers into soups or gratins, freeze what won't be consumed within 48 hours. Vegetable peels make excellent homemade broths.</p>

<h3>Cook in Large Quantities</h3>
<p>The golden rule: always cook more than necessary. A large pot of soup, lentils, or cooked rice lasts 3 to 4 days and divides the cost per meal. Batch cooking is the most effective method for eating well economically.</p>

<p>Use the Walkart meal planner to optimize your food budget week after week.</p>`
    }
  },
  {
    slug: 'regime-vegetarien',
    date: '2025-04-26',
    readMin: 7,
    category: 'nutrition',
    emoji: '🥦',
    title: {
      fr: 'Régime végétarien : avantages, risques et conseils pratiques',
      en: 'Vegetarian Diet: Benefits, Risks, and Practical Tips',
      es: 'Dieta vegetariana: ventajas, riesgos y consejos prácticos',
      ar: 'النظام الغذائي النباتي: المزايا والمخاطر والنصائح العملية',
      it: 'Dieta vegetariana: vantaggi, rischi e consigli pratici',
      ja: 'ベジタリアン食：メリット、リスク、実践的なアドバイス'
    },
    excerpt: {
      fr: 'De plus en plus populaire, le régime végétarien offre de nombreux avantages pour la santé et la planète. Mais il nécessite quelques précautions.',
      en: 'Increasingly popular, the vegetarian diet offers many benefits for health and the planet. But it requires some precautions.'
    },
    content: {
      fr: `<p>En France, plus de 2,5 millions de personnes se déclarent végétariennes, et ce chiffre est en constante augmentation. Motivées par des considérations éthiques, environnementales ou de santé, elles choisissent d'exclure la viande et le poisson de leur alimentation. Mais quels sont les vrais avantages et les points de vigilance ?</p>

<h3>Les bienfaits prouvés du végétarisme</h3>
<p>De nombreuses études épidémiologiques montrent que les végétariens présentent en moyenne un <strong>risque plus faible de maladies cardiovasculaires</strong>, de diabète de type 2, de certains cancers (notamment le cancer colorectal) et d'obésité. Ces bénéfices sont attribués à une consommation plus élevée de fibres, antioxydants, vitamines et phytonutriments, couplée à une moindre consommation de graisses saturées.</p>

<p>Sur le plan environnemental, l'alimentation végétarienne génère en moyenne <strong>2 à 3 fois moins d'émissions de gaz à effet de serre</strong> qu'un régime omnivore, consomme moins d'eau et préserve davantage les terres agricoles.</p>

<h3>Les nutriments à surveiller</h3>
<p>Un régime végétarien mal planifié peut manquer de certains nutriments essentiels. La <strong>vitamine B12</strong> est naturellement absente des végétaux : une supplémentation est indispensable pour les végétaliens et recommandée pour les végétariens stricts. Le <strong>fer non héminique</strong> des végétaux est moins bien absorbé que le fer animal : associez-le toujours à une source de vitamine C (citron, poivron) pour en améliorer l'absorption.</p>

<p>Le <strong>zinc</strong>, les <strong>oméga-3</strong> (DHA et EPA), l'<strong>iode</strong> et la <strong>vitamine D</strong> méritent également une attention particulière. Pour les protéines, combinez différentes sources végétales (légumineuses + céréales) pour obtenir tous les acides aminés essentiels.</p>

<h3>Construire une assiette végétarienne équilibrée</h3>
<p>Une assiette végétarienne idéale se compose de : <strong>½ légumes</strong> (crus et/ou cuits, variés et colorés), <strong>¼ protéines végétales</strong> (légumineuses, tofu, tempeh, seitan) et <strong>¼ céréales complètes</strong> (riz complet, quinoa, épeautre). Ajoutez des noix et graines (lin, chia, chanvre) pour les oméga-3, et des produits laitiers ou alternatives végétales enrichies pour le calcium.</p>

<h3>Transitions en douceur</h3>
<p>Passer au végétarisme du jour au lendemain peut être difficile. Une approche progressive est souvent plus durable : commencez par 2 à 3 repas végétariens par semaine, découvrez de nouvelles recettes, explorez les cuisines du monde naturellement végétariennes (cuisine indienne, libanaise, éthiopienne).</p>

<p>Walkart propose des centaines de recettes végétariennes et véganes filtrables selon vos préférences et vos besoins nutritionnels.</p>`,

      en: `<p>In France, more than 2.5 million people declare themselves vegetarian, and this number is constantly growing. Motivated by ethical, environmental, or health considerations, they choose to exclude meat and fish from their diet. But what are the real advantages and points to watch out for?</p>

<h3>The Proven Benefits of Vegetarianism</h3>
<p>Numerous epidemiological studies show that vegetarians have on average a <strong>lower risk of cardiovascular disease</strong>, type 2 diabetes, certain cancers (notably colorectal cancer), and obesity. These benefits are attributed to higher consumption of fiber, antioxidants, vitamins, and phytonutrients, combined with lower consumption of saturated fats.</p>

<p>Environmentally, a vegetarian diet generates on average <strong>2 to 3 times fewer greenhouse gas emissions</strong> than an omnivorous diet, uses less water, and preserves more agricultural land.</p>

<h3>Nutrients to Monitor</h3>
<p>A poorly planned vegetarian diet can lack certain essential nutrients. <strong>Vitamin B12</strong> is naturally absent from plant foods: supplementation is essential for vegans and recommended for strict vegetarians. <strong>Non-heme iron</strong> from plants is less well absorbed than animal iron: always combine it with a source of vitamin C (lemon, bell pepper) to improve absorption.</p>

<p><strong>Zinc</strong>, <strong>omega-3s</strong> (DHA and EPA), <strong>iodine</strong>, and <strong>vitamin D</strong> also deserve special attention. For proteins, combine different plant sources (legumes + grains) to obtain all essential amino acids.</p>

<h3>Building a Balanced Vegetarian Plate</h3>
<p>An ideal vegetarian plate consists of: <strong>½ vegetables</strong> (raw and/or cooked, varied and colorful), <strong>¼ plant proteins</strong> (legumes, tofu, tempeh, seitan), and <strong>¼ whole grains</strong> (brown rice, quinoa, spelt). Add nuts and seeds (flax, chia, hemp) for omega-3s, and dairy products or enriched plant alternatives for calcium.</p>

<h3>Gradual Transitions</h3>
<p>Going vegetarian overnight can be difficult. A gradual approach is often more sustainable: start with 2 to 3 vegetarian meals per week, discover new recipes, explore naturally vegetarian world cuisines (Indian, Lebanese, Ethiopian).</p>

<p>Walkart offers hundreds of vegetarian and vegan recipes filterable by your preferences and nutritional needs.</p>`
    }
  },
  {
    slug: 'zero-gaspillage',
    date: '2025-05-05',
    readMin: 5,
    category: 'conseils',
    emoji: '♻️',
    title: {
      fr: 'Zéro gaspillage : transformer les restes en plats délicieux',
      en: 'Zero Waste: Turning Leftovers into Delicious Dishes',
      es: 'Cero desperdicios: convertir las sobras en platos deliciosos',
      ar: 'صفر هدر: تحويل بقايا الطعام إلى أطباق شهية',
      it: 'Zero sprechi: trasformare gli avanzi in piatti deliziosi',
      ja: 'ゼロウェイスト：残り物を美味しい料理に変える方法'
    },
    excerpt: {
      fr: 'En France, chaque foyer jette en moyenne 29 kg de nourriture par an. Voici comment transformer vos restes en plats savoureux et réduire votre impact environnemental.',
      en: 'In France, each household throws away an average of 29 kg of food per year. Here\'s how to transform your leftovers into tasty dishes and reduce your environmental impact.'
    },
    content: {
      fr: `<p>En France, le gaspillage alimentaire représente 10 millions de tonnes de nourriture jetée chaque année. À l'échelle d'un foyer, cela représente environ <strong>29 kg de nourriture et 260€ perdus par an</strong>. Adopter une cuisine zéro gaspillage n'est pas seulement bon pour la planète, c'est aussi excellent pour votre portefeuille et souvent source de créativité culinaire.</p>

<h3>Le frigo : organisation et méthode FIFO</h3>
<p>La première règle est d'organiser votre réfrigérateur selon la méthode <strong>FIFO (First In, First Out)</strong> : les produits achetés en premier doivent être consommés en premier. Placez les plus anciens à l'avant, les nouveaux derrière. Réservez un espace bien visible — l'étagère du milieu — pour les produits à consommer en priorité. Un simple coup d'œil avant chaque repas vous évitera bien des déceptions.</p>

<h3>Le pain rassis : trop d'idées pour le jeter</h3>
<p>Le pain est l'aliment le plus gaspillé en France. Pourtant, le pain rassis est un trésor culinaire. Transformez-le en <strong>chapelure maison</strong> (mixez et conservez au congélateur), en <strong>croûtons</strong> pour salades et soupes, en <strong>pain perdu</strong> sucré ou salé, ou en <strong>gazpacho</strong> dont il est un ingrédient clé. Le pain completement sec peut être moulu en poudre pour épaissir les sauces.</p>

<h3>Les légumes oubliés</h3>
<p>Carottes, courgettes, poireaux qui commencent à se flétrir peuvent toujours être cuisinés. Une <strong>soupe de légumes rôtis</strong> accepte n'importe quelle combinaison de légumes. Les légumes mous font d'excellentes <strong>purées</strong>, <strong>galettes</strong> ou <strong>farces</strong> pour des tartes salées. Les fanes de carottes, de radis ou de betteraves sont comestibles et font de délicieux pestos ou soupes.</p>

<h3>Les restes de viande et poisson</h3>
<p>Un reste de poulet rôti peut devenir une salade de poulet, une garniture de sandwich, une farce de tacos, une soupe asiatique ou un riz cantonais. Un reste de poisson peut être transformé en fishcakes (croquettes de poisson), en rillettes ou en sauce pour pâtes. Ne jetez jamais les carcasses de poulet ou les arêtes de poisson : elles font d'excellents bouillons.</p>

<h3>Le congélateur : votre meilleur allié</h3>
<p>Congeler à temps est la meilleure assurance anti-gaspillage. Congelez le pain en tranches, les restes de plats cuisinés en portions individuelles, les fruits trop mûrs pour des smoothies, les herbes fraîches hachées dans des bacs à glaçons avec de l'huile d'olive.</p>

<h3>Les épluchures</h3>
<p>Les épluchures de légumes propres (carottes, céleri, oignons, poireaux) accumulées au congélateur font un <strong>bouillon maison</strong> exceptionnel et gratuit. Les épluchures de pommes de terre légèrement huilées et salées, passées au four, font des chips croustillantes.</p>

<p>La fonctionnalité "Frigo mode" de Walkart vous aide à trouver des recettes avec exactement ce que vous avez sous la main.</p>`,

      en: `<p>In France, food waste represents 10 million tons of food thrown away every year. At the household level, this is approximately <strong>29 kg of food and €260 lost per year</strong>. Adopting a zero-waste kitchen is not only good for the planet, it is also excellent for your wallet and often a source of culinary creativity.</p>

<h3>The Fridge: FIFO Organization</h3>
<p>The first rule is to organize your refrigerator according to the <strong>FIFO (First In, First Out)</strong> method: products purchased first must be consumed first. Place the oldest at the front, the new ones behind. Reserve a clearly visible space — the middle shelf — for products to be consumed first. A quick glance before each meal will save you many disappointments.</p>

<h3>Stale Bread: Too Many Ideas to Throw Away</h3>
<p>Bread is the most wasted food in France. Yet stale bread is a culinary treasure. Transform it into <strong>homemade breadcrumbs</strong> (blend and freeze), <strong>croutons</strong> for salads and soups, <strong>French toast</strong> sweet or savory, or <strong>gazpacho</strong> of which it is a key ingredient.</p>

<h3>Forgotten Vegetables</h3>
<p>Carrots, zucchini, leeks starting to wilt can still be cooked. A <strong>roasted vegetable soup</strong> accepts any combination of vegetables. Soft vegetables make excellent <strong>purées</strong>, <strong>fritters</strong>, or <strong>fillings</strong> for savory tarts. Carrot, radish, or beet tops are edible and make delicious pestos or soups.</p>

<h3>Meat and Fish Leftovers</h3>
<p>A leftover roast chicken can become a chicken salad, sandwich filling, taco stuffing, Asian soup, or fried rice. Leftover fish can be transformed into fishcakes, rillettes, or pasta sauce. Never throw away chicken carcasses or fish bones: they make excellent broths.</p>

<h3>The Freezer: Your Best Ally</h3>
<p>Freezing in time is the best anti-waste insurance. Freeze bread in slices, leftover cooked dishes in individual portions, overripe fruits for smoothies, chopped fresh herbs in ice cube trays with olive oil.</p>

<p>The Walkart "Fridge Mode" feature helps you find recipes with exactly what you have on hand.</p>`
    }
  },
  {
    slug: 'cuisine-asiatique-debutants',
    date: '2025-05-12',
    readMin: 6,
    category: 'cuisine',
    emoji: '🍜',
    title: {
      fr: 'La cuisine asiatique pour les débutants : par où commencer ?',
      en: 'Asian Cuisine for Beginners: Where to Start?',
      es: 'La cocina asiática para principiantes: ¿por dónde empezar?',
      ar: 'المطبخ الآسيوي للمبتدئين: من أين نبدأ؟',
      it: 'La cucina asiatica per principianti: da dove cominciare?',
      ja: '初心者のためのアジア料理：どこから始めるか'
    },
    excerpt: {
      fr: 'La cuisine asiatique semble intimidante au premier abord, mais avec les bons ingrédients de base et quelques techniques simples, vous serez étonné de ce que vous pouvez créer.',
      en: 'Asian cuisine seems intimidating at first, but with the right basic ingredients and a few simple techniques, you\'ll be amazed at what you can create.'
    },
    content: {
      fr: `<p>La cuisine asiatique regroupe en réalité des dizaines de traditions culinaires différentes — chinoise, japonaise, coréenne, thaïlandaise, vietnamienne, indienne... — mais toutes partagent certains principes fondamentaux : l'équilibre des saveurs, la fraîcheur des ingrédients et des techniques de cuisson rapide qui préservent les nutriments.</p>

<h3>Les ingrédients indispensables</h3>
<p>Quelques ingrédients bien choisis vous permettront de cuisiner un large éventail de plats asiatiques. La <strong>sauce soja</strong> est la base de nombreuses marinades et sauces ; préférez la version à teneur réduite en sodium. L'<strong>huile de sésame</strong> toastée s'utilise en petite quantité en fin de cuisson pour parfumer. Le <strong>gingembre frais</strong> et l'<strong>ail</strong> sont incontournables. La <strong>pâte de piment</strong> (sambal oelek ou gochujang) apporte du piquant. Les <strong>nouilles de riz</strong> et le <strong>riz jasmin</strong> constituent des bases neutres et polyvalentes.</p>

<h3>Les techniques de base</h3>
<p>Le <strong>wok</strong> est l'ustensile roi de la cuisine asiatique. Sa forme particulière permet une cuisson à très haute température avec peu de matière grasse. La clé du succès : le wok doit être très chaud avant d'ajouter les ingrédients, et tout doit être préparé avant de commencer à cuire (mise en place). La cuisson à la vapeur — dans un panier bambou ou une cocotte-minute — est une technique saine et simple pour les poissons, légumes et bao.</p>

<h3>L'équilibre des cinq saveurs</h3>
<p>La cuisine asiatique repose sur l'équilibre de cinq saveurs fondamentales : <strong>salé</strong> (sauce soja, miso), <strong>sucré</strong> (miel, sucre de palme), <strong>acide</strong> (citron vert, vinaigre de riz), <strong>amer</strong> (légumes verts feuillus) et <strong>umami</strong> (champignons shiitake, sauce poisson, miso). Une bonne recette asiatique joue sur plusieurs de ces dimensions simultanément.</p>

<h3>Recettes pour débuter</h3>
<p>Commencez par des classiques accessibles : le <strong>fried rice</strong> (riz cantonais) qui utilise les restes de riz de la veille, les <strong>noodles sautés</strong> avec légumes et sauce soja, le <strong>pad thaï</strong> dont les ingrédients sont disponibles dans tous les supermarchés, ou encore la <strong>soupe miso</strong> qui ne demande que 5 minutes de préparation.</p>

<h3>Où trouver les ingrédients ?</h3>
<p>Les grandes surfaces proposent de plus en plus de produits asiatiques. Pour des ingrédients plus spécifiques (pâte de fermented black beans, feuilles de pandan, galangal), les épiceries asiatiques de votre ville sont souvent très accessibles et leurs prix bien inférieurs aux supermarchés classiques.</p>

<p>Explorez des centaines de recettes asiatiques authentiques sur Walkart, filtrables par cuisine, difficulté et temps de préparation.</p>`,

      en: `<p>Asian cuisine actually encompasses dozens of different culinary traditions — Chinese, Japanese, Korean, Thai, Vietnamese, Indian... — but all share certain fundamental principles: balance of flavors, freshness of ingredients, and quick cooking techniques that preserve nutrients.</p>

<h3>Essential Ingredients</h3>
<p>A few well-chosen ingredients will allow you to cook a wide range of Asian dishes. <strong>Soy sauce</strong> is the base of many marinades and sauces; prefer the reduced-sodium version. <strong>Toasted sesame oil</strong> is used in small amounts at the end of cooking for flavoring. Fresh <strong>ginger</strong> and <strong>garlic</strong> are essential. <strong>Chili paste</strong> (sambal oelek or gochujang) adds heat. <strong>Rice noodles</strong> and <strong>jasmine rice</strong> form neutral, versatile bases.</p>

<h3>Basic Techniques</h3>
<p>The <strong>wok</strong> is the king utensil of Asian cuisine. Its particular shape allows cooking at very high temperatures with little fat. The key to success: the wok must be very hot before adding ingredients, and everything must be prepared before starting to cook (mise en place). Steaming — in a bamboo basket or pressure cooker — is a healthy and simple technique for fish, vegetables, and bao.</p>

<h3>The Balance of Five Flavors</h3>
<p>Asian cuisine rests on the balance of five fundamental flavors: <strong>salty</strong> (soy sauce, miso), <strong>sweet</strong> (honey, palm sugar), <strong>sour</strong> (lime, rice vinegar), <strong>bitter</strong> (leafy green vegetables), and <strong>umami</strong> (shiitake mushrooms, fish sauce, miso). A good Asian recipe plays on several of these dimensions simultaneously.</p>

<h3>Recipes to Start With</h3>
<p>Start with accessible classics: <strong>fried rice</strong> which uses leftover rice from the previous day, <strong>stir-fried noodles</strong> with vegetables and soy sauce, <strong>pad thai</strong> whose ingredients are available in all supermarkets, or <strong>miso soup</strong> which requires only 5 minutes of preparation.</p>

<p>Explore hundreds of authentic Asian recipes on Walkart, filterable by cuisine, difficulty, and preparation time.</p>`
    }
  },
  {
    slug: 'superaliments-mythe-realite',
    date: '2025-05-18',
    readMin: 6,
    category: 'nutrition',
    emoji: '🫐',
    title: {
      fr: 'Super-aliments : mythe marketing ou vrais bienfaits nutritionnels ?',
      en: 'Superfoods: Marketing Myth or Real Nutritional Benefits?',
      es: 'Superalimentos: ¿mito de marketing o beneficios nutricionales reales?',
      ar: 'الأطعمة الفائقة: أسطورة تسويقية أم فوائد غذائية حقيقية؟',
      it: 'Supercibi: mito di marketing o veri benefici nutrizionali?',
      ja: 'スーパーフード：マーケティングの神話か本当の栄養効果か？'
    },
    excerpt: {
      fr: 'Baies de goji, spiruline, quinoa, graines de chia... Les super-aliments font régulièrement la une des magazines. Mais qu\'en dit vraiment la science ?',
      en: 'Goji berries, spirulina, quinoa, chia seeds... Superfoods regularly make the magazine headlines. But what does science really say?'
    },
    content: {
      fr: `<p>Le terme "super-aliment" n'a aucune définition légale ou scientifique. C'est avant tout un outil marketing inventé dans les années 2000 pour vendre des produits à prix premium. Pourtant, derrière l'effet de mode, certains de ces aliments ont de vraies qualités nutritionnelles. Faisons le tri.</p>

<h3>Les super-aliments qui tiennent leurs promesses</h3>
<p>Les <strong>myrtilles</strong> sont l'un des fruits les plus riches en antioxydants (anthocyanines), avec des effets documentés sur la santé cognitive et cardiovasculaire. L'<strong>avocat</strong> est une source exceptionnelle d'acides gras mono-insaturés, de potassium et de vitamines E et K. Le <strong>saumon sauvage</strong> est l'une des meilleures sources d'oméga-3 à longue chaîne (EPA et DHA). Le <strong>kale</strong> et les autres crucifères sont réellement riches en vitamines C et K, calcium et composés sulforaphane aux propriétés anti-cancer documentées.</p>

<h3>Les super-aliments surestimés</h3>
<p>Les <strong>baies de goji</strong> contiennent des antioxydants, certes, mais pas plus que les myrtilles ordinaires, 10 fois moins chères. La <strong>spiruline</strong> est une source de protéines et de certains nutriments, mais sa biodisponibilité est limitée et les quantités typiquement consommées (quelques grammes par jour) sont trop faibles pour avoir un impact significatif. L'<strong>huile de coco</strong>, longtemps promue comme un super-aliment, est en réalité très riche en acides gras saturés et doit être consommée avec modération.</p>

<h3>Les vrais super-aliments oubliés</h3>
<p>La science nutritionnelle montre que certains aliments ordinaires et peu coûteux sont parmi les plus nutritifs qui soient. Les <strong>sardines en boîte</strong> : exceptionnelles en oméga-3, calcium, vitamine D et B12. Les <strong>lentilles</strong> : protéines, fer, fibres, folates à un coût dérisoire. Les <strong>œufs</strong> : protéines complètes, choline, vitamine D. Les <strong>noix</strong> : oméga-3, magnésium, antioxydants. Les <strong>légumes crucifères</strong> (brocolis, chou, choux de Bruxelles) : composés anticancéreux documentés.</p>

<h3>La diversité plutôt que les miracles</h3>
<p>Aucun aliment seul, aussi "super" soit-il, ne peut compenser une alimentation globalement déséquilibrée. La vraie nutrition préventive repose sur la <strong>diversité alimentaire</strong> : des légumes et fruits variés et colorés, des protéines de qualité variées, des céréales complètes et des bonnes graisses. C'est cette diversité qui assure l'apport complet de tous les micronutriments dont votre corps a besoin.</p>

<p>Avec Walkart, explorez une diversité de recettes du monde entier pour naturellement enrichir votre alimentation de tous ces nutriments essentiels.</p>`,

      en: `<p>The term "superfood" has no legal or scientific definition. It is primarily a marketing tool invented in the 2000s to sell premium-priced products. Yet behind the trend, some of these foods have real nutritional qualities. Let's sort through them.</p>

<h3>Superfoods That Deliver on Their Promises</h3>
<p><strong>Blueberries</strong> are one of the fruits richest in antioxidants (anthocyanins), with documented effects on cognitive and cardiovascular health. <strong>Avocado</strong> is an exceptional source of monounsaturated fatty acids, potassium, and vitamins E and K. <strong>Wild salmon</strong> is one of the best sources of long-chain omega-3s (EPA and DHA). <strong>Kale</strong> and other cruciferous vegetables are genuinely rich in vitamins C and K, calcium, and sulforaphane compounds with documented anti-cancer properties.</p>

<h3>Overrated Superfoods</h3>
<p><strong>Goji berries</strong> contain antioxidants, yes, but no more than ordinary blueberries, which are 10 times cheaper. <strong>Spirulina</strong> is a source of protein and certain nutrients, but its bioavailability is limited and the quantities typically consumed (a few grams per day) are too small to have a significant impact. <strong>Coconut oil</strong>, long promoted as a superfood, is actually very rich in saturated fatty acids and should be consumed in moderation.</p>

<h3>The Forgotten Real Superfoods</h3>
<p>Nutritional science shows that some ordinary, inexpensive foods are among the most nutritious there are. <strong>Canned sardines</strong>: exceptional in omega-3s, calcium, vitamin D and B12. <strong>Lentils</strong>: protein, iron, fiber, folates at a minimal cost. <strong>Eggs</strong>: complete proteins, choline, vitamin D. <strong>Walnuts</strong>: omega-3s, magnesium, antioxidants. <strong>Cruciferous vegetables</strong> (broccoli, cabbage, Brussels sprouts): documented anti-cancer compounds.</p>

<h3>Diversity Rather Than Miracles</h3>
<p>No single food, however "super," can compensate for an overall unbalanced diet. True preventive nutrition is based on <strong>food diversity</strong>: varied and colorful vegetables and fruits, varied quality proteins, whole grains, and good fats. It is this diversity that ensures the complete supply of all the micronutrients your body needs.</p>

<p>With Walkart, explore a diversity of recipes from around the world to naturally enrich your diet with all these essential nutrients.</p>`
    }
  }
];

// ─── RENDU BLOG ────────────────────────────────────────────────────────────
const BlogRender = {
  _lang: () => (typeof state !== 'undefined' ? state.lang : 'fr') || 'fr',
  _t: (obj) => obj[BlogRender._lang()] || obj['fr'] || obj['en'] || '',

  list: () => {
    const lang = BlogRender._lang();
    const cats = {
      nutrition: { fr:'Nutrition', en:'Nutrition', es:'Nutrición', ar:'تغذية', it:'Nutrizione', ja:'栄養' },
      conseils:  { fr:'Conseils', en:'Tips', es:'Consejos', ar:'نصائح', it:'Consigli', ja:'アドバイス' },
      cuisine:   { fr:'Cuisine', en:'Cooking', es:'Cocina', ar:'طبخ', it:'Cucina', ja:'料理' }
    };
    const t_blog   = { fr:'Blog & Conseils', en:'Blog & Tips', es:'Blog y Consejos', ar:'المدونة والنصائح', it:'Blog e Consigli', ja:'ブログとヒント' }[lang] || 'Blog';
    const t_read   = { fr:'Lire l\'article', en:'Read article', es:'Leer artículo', ar:'قرأ المقال', it:'Leggi articolo', ja:'記事を読む' }[lang] || 'Read';
    const t_min    = { fr:'min de lecture', en:'min read', es:'min de lectura', ar:'دقيقة قراءة', it:'min di lettura', ja:'分で読める' }[lang] || 'min';

    const cards = BLOG_ARTICLES.map(a => {
      const cat = cats[a.category]?.[lang] || a.category;
      return `
        <div class="blog-card" onclick="App.navigate('article', {slug:'${a.slug}'})">
          <div class="blog-card-emoji">${a.emoji}</div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span class="blog-cat">${Safe.html(cat)}</span>
              <span class="blog-read">${a.readMin} ${t_min}</span>
            </div>
            <h3 class="blog-card-title">${Safe.html(BlogRender._t(a.title))}</h3>
            <p class="blog-card-excerpt">${Safe.html(BlogRender._t(a.excerpt))}</p>
            <span class="blog-read-link">${t_read} →</span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="container">
        <button class="btn btn-ghost" onclick="App.goBack()" style="margin-bottom:16px;">← ${T('back') || 'Back'}</button>
        <h1 class="section-title" style="font-size:1.8rem; margin-bottom:4px;">📝 ${Safe.html(t_blog)}</h1>
        <p style="color:var(--text-muted); margin-bottom:24px; font-size:0.9rem;">${{ fr:'Conseils culinaires, nutrition et art de vivre', en:'Culinary tips, nutrition and art of living', es:'Consejos culinarios, nutrición y arte de vivir', ar:'نصائح الطبخ والتغذية وفن العيش', it:'Consigli culinari, nutrizione e arte di vivere', ja:'料理のヒント、栄養、生活の芸術' }[lang] || ''}</p>
        <div class="blog-grid">${cards}</div>
      </div>`;
  },

  article: (slug) => {
    const a = BLOG_ARTICLES.find(x => x.slug === slug);
    if (!a) return `<div class="container" style="padding:40px 20px; text-align:center;"><button class="btn btn-ghost" onclick="App.goBack()">←</button><p>Article non trouvé.</p></div>`;
    const lang = BlogRender._lang();
    const content = a.content[lang] || a.content['fr'] || a.content['en'] || '';
    const date = new Date(a.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'ja' ? 'ja-JP' : lang === 'fr' ? 'fr-FR' : 'en-US', { year:'numeric', month:'long', day:'numeric' });
    const t_min = { fr:'min de lecture', en:'min read', es:'min de lectura', ar:'دقيقة قراءة', it:'min di lettura', ja:'分' }[lang] || 'min';
    const t_share = { fr:'Partager', en:'Share', es:'Compartir', ar:'مشاركة', it:'Condividi', ja:'シェア' }[lang] || 'Share';
    const t_more = { fr:'Autres articles', en:'More articles', es:'Más artículos', ar:'مقالات أخرى', it:'Altri articoli', ja:'他の記事' }[lang] || 'More';

    const others = BLOG_ARTICLES.filter(x => x.slug !== slug).slice(0, 3).map(x => `
      <div class="blog-card-sm" onclick="App.navigate('article', {slug:'${x.slug}'})">
        <span style="font-size:1.5rem;">${x.emoji}</span>
        <span>${Safe.html(BlogRender._t(x.title))}</span>
      </div>`).join('');

    return `
      <div class="container" style="max-width:800px; margin:0 auto;">
        <button class="btn btn-ghost" onclick="App.navigate('blog')" style="margin-bottom:20px;">← ${t_more}</button>
        <div class="article-hero">
          <div class="article-emoji">${a.emoji}</div>
          <h1 class="article-title">${Safe.html(BlogRender._t(a.title))}</h1>
          <p class="article-excerpt">${Safe.html(BlogRender._t(a.excerpt))}</p>
          <div class="article-meta">
            <span>📅 ${date}</span>
            <span>⏱️ ${a.readMin} ${t_min}</span>
            <span>✍️ Walkart</span>
          </div>
        </div>
        <div class="article-body">${content}</div>
        <div class="article-share">
          <button class="btn btn-outline" onclick="navigator.share ? navigator.share({title:'${Safe.attr(BlogRender._t(a.title))}', url: window.location.href}) : navigator.clipboard.writeText(window.location.href).then(()=>Toast.show('🔗 Lien copié !'))">
            📤 ${t_share}
          </button>
        </div>
        <div class="article-more">
          <h3 style="margin-bottom:12px; color:var(--text-muted); font-size:0.95rem;">${t_more}</h3>
          <div style="display:flex; flex-direction:column; gap:8px;">${others}</div>
        </div>
      </div>`;
  }
};
