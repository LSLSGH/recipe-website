/* Walkart – Language Detection & Switching (shared by all static pages) */
(function () {
  var SUPPORTED = ['fr', 'en', 'es', 'ar', 'it', 'ja'];
  var stored = localStorage.getItem('lang');
  var browser = (navigator.language || navigator.userLanguage || 'fr').split('-')[0];
  var initialLang = SUPPORTED.indexOf(stored) > -1 ? stored
    : (SUPPORTED.indexOf(browser) > -1 ? browser : 'fr');

  function applyLang(l) {
    /* Fall back to French if no content exists for chosen language */
    var hasContent = document.querySelector('[data-lang="' + l + '"]');
    var active = hasContent ? l : 'fr';

    localStorage.setItem('lang', l);
    var root = document.documentElement;
    root.setAttribute('lang', active);
    root.setAttribute('dir', active === 'ar' ? 'rtl' : 'ltr');

    /* Show / hide language content blocks */
    var blocks = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].style.display = blocks[i].getAttribute('data-lang') === active ? '' : 'none';
    }

    /* Highlight active button */
    var btns = document.querySelectorAll('.lang-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-lang') === l);
    }

    /* Update <title> if per-language titles exist */
    var titleEl = document.querySelector('[data-title-lang="' + active + '"]');
    if (titleEl) { document.title = titleEl.textContent + ' – Walkart'; }
  }

  window.setLang = applyLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyLang(initialLang); });
  } else {
    applyLang(initialLang);
  }
})();
