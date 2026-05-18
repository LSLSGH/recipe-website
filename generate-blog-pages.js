/**
 * generate-blog-pages.js
 * Génère des pages HTML statiques pour chaque article du blog.
 * Ces pages sont indexées par Google sans JavaScript.
 * Usage: node generate-blog-pages.js
 */

const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

// ─── Données des articles (copie de blog.js sans les dépendances app) ──────
const ARTICLES = [
  { slug:'cuisine-mediterraneenne', date:'2025-03-10', readMin:6, emoji:'🫒',
    title:{fr:'Les secrets de la cuisine méditerranéenne',en:'The Secrets of Mediterranean Cuisine'},
    desc:{fr:'Découvrez pourquoi la cuisine méditerranéenne est reconnue mondialement pour ses bienfaits sur la santé.',en:'Discover why Mediterranean cuisine is recognized worldwide for its health benefits.'} },
  { slug:'planifier-repas-semaine', date:'2025-03-18', readMin:7, emoji:'📅',
    title:{fr:'Comment planifier ses repas pour toute la semaine',en:'How to Plan Your Meals for the Whole Week'},
    desc:{fr:'La planification des repas est la clé pour manger sain, gagner du temps et économiser de l\'argent.',en:'Meal planning is the key to eating healthy, saving time, and saving money.'} },
  { slug:'macronutriments-guide', date:'2025-03-25', readMin:8, emoji:'💪',
    title:{fr:'Macronutriments : le guide complet',en:'Macronutrients: The Complete Guide'},
    desc:{fr:'Protéines, glucides, lipides : comprenez les macronutriments pour atteindre vos objectifs de santé.',en:'Proteins, carbohydrates, fats: understand macronutrients to achieve your health goals.'} },
  { slug:'epices-indispensables', date:'2025-04-02', readMin:5, emoji:'🌶️',
    title:{fr:'Les 10 épices indispensables dans votre cuisine',en:'10 Essential Spices for Your Kitchen'},
    desc:{fr:'Transformez vos plats avec les bonnes épices. Voici les 10 incontournables à avoir dans vos placards.',en:'Transform your dishes with the right spices. Here are the 10 must-haves for your pantry.'} },
  { slug:'lire-etiquette-nutritionnelle', date:'2025-04-10', readMin:6, emoji:'🏷️',
    title:{fr:'Comment lire une étiquette nutritionnelle comme un expert',en:'How to Read a Nutrition Label Like an Expert'},
    desc:{fr:'Les étiquettes nutritionnelles contiennent une mine d\'informations. Apprenez à les déchiffrer.',en:'Nutrition labels contain a wealth of information. Learn to decipher them.'} },
  { slug:'cuisine-petit-budget', date:'2025-04-18', readMin:6, emoji:'💰',
    title:{fr:'Bien manger avec un petit budget',en:'Eating Well on a Small Budget'},
    desc:{fr:'Manger sainement ne coûte pas forcément cher. Nos stratégies pour des repas nutritifs sans se ruiner.',en:'Eating healthily doesn\'t have to cost a lot. Our strategies for nutritious meals on a budget.'} },
  { slug:'regime-vegetarien', date:'2025-04-26', readMin:7, emoji:'🥦',
    title:{fr:'Régime végétarien : avantages, risques et conseils',en:'Vegetarian Diet: Benefits, Risks, and Tips'},
    desc:{fr:'Le régime végétarien offre de nombreux avantages pour la santé et la planète. Mais il nécessite quelques précautions.',en:'The vegetarian diet offers many benefits for health and the planet.'} },
  { slug:'zero-gaspillage', date:'2025-05-05', readMin:5, emoji:'♻️',
    title:{fr:'Zéro gaspillage : transformer les restes en plats délicieux',en:'Zero Waste: Turning Leftovers into Delicious Dishes'},
    desc:{fr:'Chaque foyer jette en moyenne 29 kg de nourriture par an. Voici comment transformer vos restes.',en:'Each household throws away 29 kg of food per year. Here\'s how to turn leftovers into dishes.'} },
  { slug:'cuisine-asiatique-debutants', date:'2025-05-12', readMin:6, emoji:'🍜',
    title:{fr:'La cuisine asiatique pour les débutants',en:'Asian Cuisine for Beginners'},
    desc:{fr:'La cuisine asiatique semble intimidante, mais avec les bons ingrédients vous serez étonné de ce que vous pouvez créer.',en:'Asian cuisine seems intimidating, but with the right ingredients you\'ll be amazed at what you can create.'} },
  { slug:'superaliments-mythe-realite', date:'2025-05-18', readMin:6, emoji:'🫐',
    title:{fr:'Super-aliments : mythe ou vrais bienfaits ?',en:'Superfoods: Myth or Real Benefits?'},
    desc:{fr:'Baies de goji, spiruline, quinoa... Les super-aliments font la une des magazines. Qu\'en dit la science ?',en:'Goji berries, spirulina, quinoa... Superfoods make headlines. What does science say?'} }
];

function page(a) {
  const date = new Date(a.date).toLocaleDateString('fr-FR', {year:'numeric',month:'long',day:'numeric'});
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${a.title.fr} – Blog Walkart</title>
  <meta name="description" content="${a.desc.fr}">
  <link rel="canonical" href="https://www.walkart.us/blog/${a.slug}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${a.title.fr} – Walkart">
  <meta property="og:description" content="${a.desc.fr}">
  <meta property="og:url" content="https://www.walkart.us/blog/${a.slug}">
  <meta property="og:image" content="https://www.walkart.us/favicon.png">
  <meta property="article:published_time" content="${a.date}">
  <meta property="article:author" content="Walkart">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${a.title.fr}">
  <meta name="twitter:description" content="${a.desc.fr}">
  <link rel="alternate" hreflang="en" href="https://www.walkart.us/blog/${a.slug}">
  <link rel="alternate" hreflang="fr" href="https://www.walkart.us/blog/${a.slug}">
  <link rel="icon" href="/favicon.png">
  <script>window.location.replace('/#article/${a.slug}');</script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#f8f9fa;color:#1a1a2e;line-height:1.7}
    .wrap{max-width:720px;margin:0 auto;padding:32px 20px}
    .back{display:inline-block;margin-bottom:20px;color:#FF4D6D;text-decoration:none;font-weight:600}
    .back:hover{text-decoration:underline}
    .hero{text-align:center;padding:32px 0 24px}
    .emoji{font-size:4rem;display:block;margin-bottom:16px}
    h1{font-size:1.9rem;font-weight:800;margin-bottom:12px;line-height:1.3}
    .meta{color:#888;font-size:0.85rem;margin-bottom:24px}
    .meta span{margin:0 8px}
    .excerpt{font-size:1.05rem;color:#555;background:#fff;border-left:4px solid #FF4D6D;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px}
    .cta{background:#FF4D6D;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block;margin:24px 0}
    .cta:hover{background:#c9184a}
    .articles{display:grid;gap:12px;margin-top:32px}
    .art-link{background:#fff;border-radius:10px;padding:14px 16px;text-decoration:none;color:#1a1a2e;border:1px solid #eee;display:flex;align-items:center;gap:10px}
    .art-link:hover{border-color:#FF4D6D}
    footer{text-align:center;padding:40px 0 20px;color:#aaa;font-size:0.82rem}
    footer a{color:#FF4D6D;text-decoration:none}
  </style>
</head>
<body>
  <div class="wrap">
    <a class="back" href="/blog">← Tous les articles</a>
    <div class="hero">
      <span class="emoji">${a.emoji}</span>
      <h1>${a.title.fr}</h1>
      <div class="meta">
        <span>📅 ${date}</span>
        <span>⏱️ ${a.readMin} min de lecture</span>
        <span>✍️ Walkart</span>
      </div>
    </div>
    <div class="excerpt">${a.desc.fr}</div>

    <p>Cet article est disponible en version interactive sur l'application Walkart avec toutes les fonctionnalités de nutrition, planification et recettes.</p>

    <a class="cta" href="/#article/${a.slug}">📖 Lire l'article complet →</a>

    <h2 style="margin:32px 0 12px;font-size:1.1rem">Autres articles</h2>
    <div class="articles">
      ${ARTICLES.filter(x=>x.slug!==a.slug).slice(0,4).map(x=>`<a class="art-link" href="/blog/${x.slug}">${x.emoji} ${x.title.fr}</a>`).join('')}
    </div>
  </div>
  <footer>
    <p><a href="/">Walkart</a> · <a href="/blog">Blog</a> · <a href="/#about">À propos</a> · <a href="/#privacy">Confidentialité</a></p>
    <p style="margin-top:8px">© ${new Date().getFullYear()} Walkart – Recettes du Monde</p>
  </footer>
</body>
</html>`;
}

// ─── Génération ────────────────────────────────────────────────────────────
const blogDir = join(__dirname, 'blog');
if (!existsSync(blogDir)) mkdirSync(blogDir);

ARTICLES.forEach(a => {
  const dir = join(blogDir, a.slug);
  if (!existsSync(dir)) mkdirSync(dir);
  writeFileSync(join(dir, 'index.html'), page(a), 'utf8');
  console.log(`✅ blog/${a.slug}/index.html`);
});

// Mettre à jour le blog/index.html aussi
writeFileSync(join(blogDir, 'index.html'), `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Cuisine & Nutrition – Walkart</title>
  <meta name="description" content="Conseils culinaires, nutrition, recettes du monde et art de vivre. Le blog Walkart pour tout savoir sur la cuisine saine.">
  <link rel="canonical" href="https://www.walkart.us/blog">
  <link rel="icon" href="/favicon.png">
  <script>window.location.replace('/#blog');</script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8f9fa;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .c{text-align:center;padding:40px}
    a{color:#FF4D6D}
    ul{list-style:none;margin-top:20px;display:grid;gap:8px}
    li a{display:block;background:#fff;border-radius:8px;padding:12px 16px;text-decoration:none;color:#1a1a2e;border:1px solid #eee}
    li a:hover{border-color:#FF4D6D}
  </style>
</head>
<body>
<div class="c">
  <h1 style="margin-bottom:8px">📝 Blog Walkart</h1>
  <p style="color:#888;margin-bottom:16px">Conseils culinaires & nutrition</p>
  <ul>
    ${ARTICLES.map(a=>`<li><a href="/blog/${a.slug}">${a.emoji} ${a.title.fr}</a></li>`).join('')}
  </ul>
  <p style="margin-top:20px"><a href="/">← Retour à l'application</a></p>
</div>
</body>
</html>`, 'utf8');

console.log('\n✅ blog/index.html');
console.log(`\n🎉 ${ARTICLES.length + 1} pages générées dans le dossier /blog/`);
