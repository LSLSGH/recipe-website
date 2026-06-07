/* Walkart Affiliate Platform — Main JS */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile nav toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  /* ── Active nav link ── */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href')?.replace(/\/$/, '') || '';
    if (href === path || (path !== '/' && href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });

  /* ── Publisher signup form ── */
  const signupForm = document.getElementById('publisher-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = signupForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Processing…';

      setTimeout(() => {
        signupForm.innerHTML = `
          <div class="alert alert-success">
            <strong>Application received!</strong><br>
            Thank you for registering. Our team will review your site and get back to you within 2 business days.
          </div>`;
      }, 1200);
    });
  }

  /* ── Merchant contact form ── */
  const merchantForm = document.getElementById('merchant-contact-form');
  if (merchantForm) {
    merchantForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = merchantForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        merchantForm.innerHTML = `
          <div class="alert alert-success">
            <strong>Request received!</strong><br>
            A member of our partnerships team will contact you within 24 hours.
          </div>`;
      }, 1200);
    });
  }

  /* ── Animated counters ── */
  const animateCounter = (el, target, suffix = '') => {
    const duration = 1800;
    const start = performance.now();
    const step = ts => {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.count;
        const suffix = el.dataset.suffix || '';
        animateCounter(el, parseInt(raw, 10), suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));

});
