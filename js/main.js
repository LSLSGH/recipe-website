/* Walkart Deals — Main JS */

// ── Replace this with your email to receive newsletter signups ──
const NEWSLETTER_EMAIL = 'little93savage@gmail.com';

document.addEventListener('DOMContentLoaded', () => {

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
