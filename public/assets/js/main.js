/*!
 * HNB Investment Bank — Main Script
 * Covers: reveal, count-up, sparklines, bars, nav, animations, security
 */
(function () {
  'use strict';

  var motionOff = false;

  /* ── Helper: check motion preference ── */
  function checkMotion() {
    motionOff = document.body.classList.contains('motion-off')
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ══════════════════════════════════════
     SCROLL-FADE REVEAL (with stagger)
  ══════════════════════════════════════ */
  function initReveal() {
    var singles = document.querySelectorAll('.reveal:not(.reveal-group *)');
    var groups  = document.querySelectorAll('.reveal-group');
    var left    = document.querySelectorAll('.reveal-left');

    if (!singles.length && !groups.length && !left.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    singles.forEach(function (el) { obs.observe(el); });
    groups.forEach(function  (el) { obs.observe(el); });
    left.forEach(function    (el) { obs.observe(el); });
  }

  /* ══════════════════════════════════════
     COUNT-UP NUMBERS
  ══════════════════════════════════════ */
  function initCountUp() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var el       = entry.target;
        var target   = parseFloat(el.getAttribute('data-count-to'));
        var prefix   = el.getAttribute('data-count-prefix') || '';
        var suffix   = el.getAttribute('data-count-suffix') || '';
        var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
        var from     = parseFloat(el.getAttribute('data-count-from') || '0');
        var duration = 1600;

        if (motionOff) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
        var start = Date.now();
        (function tick() {
          var p    = Math.min((Date.now() - start) / duration, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (from + (target - from) * ease).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })();
      });
    }, { threshold: 0.25 });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ══════════════════════════════════════
     SPARKLINE DRAW
  ══════════════════════════════════════ */
  function initSparklines() {
    var paths = document.querySelectorAll('[data-sparkline]');
    paths.forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 200;
      p.style.strokeDasharray  = len;
      p.style.strokeDashoffset = len;
      p.style.transition       = 'none';
    });
    if (!paths.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var p = entry.target;
        if (motionOff) { p.style.strokeDashoffset = '0'; return; }
        setTimeout(function () {
          p.style.transition       = 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)';
          p.style.strokeDashoffset = '0';
        }, 80);
      });
    }, { threshold: 0.4 });
    paths.forEach(function (p) { obs.observe(p); });
  }

  /* ══════════════════════════════════════
     BAR ANIMATE
  ══════════════════════════════════════ */
  function initBars() {
    var bars = document.querySelectorAll('.bar[data-pct]');
    if (!bars.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var bar = entry.target;
        var pct = bar.getAttribute('data-pct');
        if (motionOff) { bar.style.width = pct + '%'; return; }
        setTimeout(function () {
          bar.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
          bar.style.width      = pct + '%';
        }, 60);
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { obs.observe(b); });
  }

  /* ══════════════════════════════════════
     NAV SCROLL SHADOW
  ══════════════════════════════════════ */
  function initNavScroll() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    function update() {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ══════════════════════════════════════
     MOBILE NAV TOGGLE
  ══════════════════════════════════════ */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');

    function openMenu() {
      /* Align overlay so the logo row sits exactly over the nav bar,
         even when the ticker is still visible (nav not yet at top:0). */
      var navRect = toggle.closest('.site-nav');
      var navTop  = navRect ? Math.max(0, navRect.getBoundingClientRect().top) : 0;
      links.style.paddingTop = navTop + 'px';

      links.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      links.style.paddingTop = '';
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('open')) { closeMenu(); } else { openMenu(); }
    });

    /* Close when a nav link is clicked (navigates away) */
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ══════════════════════════════════════
     BACK TO TOP BUTTON
  ══════════════════════════════════════ */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = '↑';
      document.body.appendChild(btn);
    }

    function updateVisibility() {
      if (window.scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: motionOff ? 'instant' : 'smooth' });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  /* ══════════════════════════════════════
     READING PROGRESS BAR (article pages)
  ══════════════════════════════════════ */
  function initReadingProgress() {
    var article = document.querySelector('.article-body, .legal-body');
    if (!article) return;

    var bar = document.getElementById('reading-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'reading-progress';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-label', 'Reading progress');
      document.body.insertBefore(bar, document.body.firstChild);
    }

    window.addEventListener('scroll', function () {
      var docH   = document.documentElement.scrollHeight - window.innerHeight;
      var pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════
     ACTIVE NAV LINK (highlight current page)
  ══════════════════════════════════════ */
  function initActiveNav() {
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a, .nav-links li a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hFile = href.split('/').pop();
      if (hFile === filename || (filename === '' && hFile === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ══════════════════════════════════════
     SMOOTH CARD TILT (subtle, optional)
  ══════════════════════════════════════ */
  function initCardTilt() {
    if (motionOff) return;
    var cards = document.querySelectorAll('.biz-card, .card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width  - 0.5;
        var y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = 'translateY(-2px) rotateX(' + (-y * 3) + 'deg) rotateY(' + (x * 3) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════
     FORM VALIDATION (basic client-side)
  ══════════════════════════════════════ */
  function initForms() {
    document.querySelectorAll('form').forEach(function (form) {
      /* Prevent default on submit — prototype has no backend */
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;

        /* Remove old errors */
        form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
        form.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });

        /* Validate required fields */
        form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
          if (!field.value.trim()) {
            field.classList.add('error');
            var err = document.createElement('p');
            err.className = 'field-error';
            err.textContent = 'This field is required.';
            field.parentNode.appendChild(err);
            valid = false;
          }
        });

        /* Validate email pattern */
        form.querySelectorAll('input[type="email"]').forEach(function (field) {
          if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            field.classList.add('error');
            var err = document.createElement('p');
            err.className = 'field-error';
            err.textContent = 'Please enter a valid email address.';
            field.parentNode.appendChild(err);
            valid = false;
          }
        });

        if (valid) {
          /* Show success state */
          var btn = form.querySelector('[type="submit"]');
          if (btn) {
            var orig = btn.textContent;
            btn.textContent = '✓ Sent — we\'ll be in touch';
            btn.disabled = true;
            btn.style.opacity = '.75';
            setTimeout(function () {
              btn.textContent = orig;
              btn.disabled = false;
              btn.style.opacity = '';
              form.reset();
            }, 4000);
          }
        }
      });

      /* Clear error on input */
      form.addEventListener('input', function (e) {
        var field = e.target;
        if (field.classList.contains('error')) {
          field.classList.remove('error');
          var err = field.parentNode.querySelector('.field-error');
          if (err) err.remove();
        }
      });
    });
  }

  /* ══════════════════════════════════════
     SECURITY: sanitise external links
  ══════════════════════════════════════ */
  function secureExternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      /* Add noopener noreferrer to external links */
      if (/^https?:\/\//i.test(href) && !href.includes(window.location.hostname)) {
        a.setAttribute('rel', 'noopener noreferrer');
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
      }
    });
  }

  /* ══════════════════════════════════════
     INITIALISE
  ══════════════════════════════════════ */
  function init() {
    checkMotion();
    initReveal();
    initCountUp();
    initSparklines();
    initBars();
    initNavScroll();
    initMobileNav();
    initBackToTop();
    initReadingProgress();
    initActiveNav();
    if (!motionOff) initCardTilt();
    initForms();
    secureExternalLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
