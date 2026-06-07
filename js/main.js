/* Walkart Deals — Main JS */

/* ── Stores ticker data ── */
const STORES = [
  { name: 'Walmart',       abbr: 'W',    bg: '#0071CE' },
  { name: 'Amazon',        abbr: 'A',    bg: '#FF9900' },
  { name: 'Target',        abbr: 'T',    bg: '#CC0000' },
  { name: 'Best Buy',      abbr: 'BB',   bg: '#0046BE' },
  { name: 'Home Depot',    abbr: 'HD',   bg: '#F96302' },
  { name: "Lowe's",        abbr: 'L',    bg: '#004990' },
  { name: 'Costco',        abbr: 'C',    bg: '#005DAA' },
  { name: "Kohl's",        abbr: 'K',    bg: '#1A5EA3' },
  { name: "Macy's",        abbr: 'M',    bg: '#E31837' },
  { name: 'Nordstrom',     abbr: 'N',    bg: '#111111' },
  { name: 'TJ Maxx',       abbr: 'TJM',  bg: '#CE0000' },
  { name: 'Nike',          abbr: 'NK',   bg: '#111111' },
  { name: 'Adidas',        abbr: 'ADI',  bg: '#000000' },
  { name: 'Wayfair',       abbr: 'W',    bg: '#7B2D8B' },
  { name: 'eBay',          abbr: 'eB',   bg: '#E53238' },
  { name: 'Etsy',          abbr: 'E',    bg: '#F1641E' },
  { name: 'Sephora',       abbr: 'S',    bg: '#000000' },
  { name: 'Ulta',          abbr: 'U',    bg: '#F96302' },
  { name: 'Apple',         abbr: '',     bg: '#555555' },
  { name: "Dick's",        abbr: 'D',    bg: '#1E3A5F' },
  { name: 'Gap',           abbr: 'GAP',  bg: '#000000' },
  { name: 'Old Navy',      abbr: 'ON',   bg: '#1F3762' },
  { name: 'H&M',           abbr: 'H&M',  bg: '#E50010' },
  { name: 'Zara',          abbr: 'ZARA', bg: '#111111' },
  { name: 'IKEA',          abbr: 'IKEA', bg: '#0058A3' },
  { name: 'Dollar Tree',   abbr: '$1',   bg: '#8CC63F' },
  { name: 'Dollar General',abbr: 'DG',   bg: '#FFCC00', color: '#000' },
  { name: 'CVS',           abbr: 'CVS',  bg: '#CC0000' },
  { name: 'Walgreens',     abbr: 'WG',   bg: '#E31837' },
  { name: 'PetSmart',      abbr: 'PS',   bg: '#003087' },
  { name: 'Petco',         abbr: 'PC',   bg: '#0069B4' },
  { name: 'Michaels',      abbr: 'M',    bg: '#BE0D34' },
  { name: 'Hobby Lobby',   abbr: 'HL',   bg: '#006341' },
  { name: 'Bath & Body',   abbr: 'BBW',  bg: '#9B0D2B' },
  { name: 'REI',           abbr: 'REI',  bg: '#007847' },
  { name: 'AutoZone',      abbr: 'AZ',   bg: '#FF6200' },
  { name: "Sam's Club",    abbr: 'SC',   bg: '#0071CE' },
  { name: 'Staples',       abbr: 'S',    bg: '#CC0000' },
  { name: 'GameStop',      abbr: 'GS',   bg: '#003087' },
  { name: "Victoria's",    abbr: 'VS',   bg: '#BA0060' },
];

// ── Replace this with your email to receive newsletter signups ──
const NEWSLETTER_EMAIL = 'little93savage@gmail.com';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Build store ticker ── */
  const track = document.getElementById('ticker-track');
  if (track && STORES.length) {
    const buildItems = () => STORES.map(s => {
      const icon = s.abbr === '' ? '🍎' : s.abbr;
      const textColor = s.color || '#fff';
      return `<div class="ticker-item">
        <div class="ticker-badge" style="background:${s.bg};color:${textColor}">${icon}</div>
        <span class="ticker-name">${s.name}</span>
      </div>`;
    }).join('');
    // Duplicate for seamless infinite loop
    track.innerHTML = buildItems() + buildItems();
  }

  /* ── Newsletter forms (all pages) ── */
  document.querySelectorAll('.email-form, #newsletter-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"], button[type="button"]');
      const msgEl = document.getElementById('newsletter-msg') || form.nextElementSibling;
      const email = emailInput?.value?.trim();

      if (!email || !email.includes('@')) {
        emailInput.style.borderColor = '#dc2626';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Subscribing…';

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${NEWSLETTER_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            email,
            _subject: '🔔 New Walkart Deals Newsletter Signup',
            _captcha: 'false',
            source: window.location.pathname
          })
        });

        if (res.ok) {
          form.innerHTML = `<p style="color:#fff;font-size:15px;font-weight:700">✅ You're subscribed! Check your inbox for a confirmation email.</p>`;
        } else {
          throw new Error('Failed');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Subscribe Free';
        emailInput.style.borderColor = '#dc2626';
        const err = document.createElement('p');
        err.style.cssText = 'color:#fff;font-size:13px;margin-top:8px;opacity:.9';
        err.textContent = 'Something went wrong. Please try again.';
        form.appendChild(err);
      }
    });
  });

  /* ── Contact form ── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      const data = {};
      contactForm.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id) data[el.id] = el.value;
      });
      data._subject = 'New contact message — Walkart Deals';
      data._captcha = 'false';

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${NEWSLETTER_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          contactForm.innerHTML = '<div class="alert alert-success"><strong>Message sent!</strong><br>We\'ll get back to you within 1–2 business days.</div>';
        } else throw new Error();
      } catch {
        btn.disabled = false;
        btn.textContent = 'Send message';
        alert('Something went wrong. Please email us directly at contact@walkart.us');
      }
    });
  }

  /* ── Animated counters ── */
  const animateCounter = (el, target, suffix = '') => {
    const duration = 1800;
    const start = performance.now();
    const step = ts => {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.count, 10), el.dataset.suffix || '');
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));

});
