/**
 * FinLAR — Main Application Logic
 * ================================
 * Handles: Theme toggle, mobile navigation, active nav links,
 * smooth scrolling, accordion, tabs, Lucide icons, scroll animations.
 */
;(function () {
  'use strict';

  /* ──────────────────────────────────────────────
   * 1. THEME TOGGLE
   * ────────────────────────────────────────────── */

  const THEME_KEY = 'finlar-theme';

  /** Apply a theme ('dark' | 'light') to the document and persist it. */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);

    // Update toggle-button icon (Lucide data-lucide attribute)
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const icon = btn.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
        // Re-render the single icon
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    // Notify charts / other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(stored);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const current = document.documentElement.dataset.theme;
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  /* ──────────────────────────────────────────────
   * 2. MOBILE NAVIGATION
   * ────────────────────────────────────────────── */

  function initMobileNav() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('active');
    });

    // Close when clicking a link inside the menu
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  }

  /* ──────────────────────────────────────────────
   * 3. ACTIVE NAVIGATION LINK
   * ────────────────────────────────────────────── */

  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop().split('#')[0] || 'index.html';
      if (linkPage === currentPath) {
        link.classList.add('active');
      }
    });
  }

  /* ──────────────────────────────────────────────
   * 4. SMOOTH SCROLL
   * ────────────────────────────────────────────── */

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Offset for fixed navbar (default 80px)
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ──────────────────────────────────────────────
   * 5. ACCORDION
   * ────────────────────────────────────────────── */

  function initAccordion() {
    document.addEventListener('click', function (e) {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const content = header.nextElementSibling;
      if (!content || !content.classList.contains('accordion-content')) return;

      const parent = header.closest('.accordion');

      // Close other open items in the same accordion
      if (parent) {
        parent.querySelectorAll('.accordion-header.active').forEach(function (h) {
          if (h !== header) {
            h.classList.remove('active');
            var c = h.nextElementSibling;
            if (c) c.classList.remove('active');
          }
        });
      }

      // Toggle current
      header.classList.toggle('active');
      content.classList.toggle('active');
    });
  }

  /* ──────────────────────────────────────────────
   * 6. TABS
   * ────────────────────────────────────────────── */

  function initTabs() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      const tabGroup = btn.closest('.tabs, .tab-group, .tab-container') || btn.parentElement?.parentElement;
      if (!tabGroup) return;

      const targetTab = btn.dataset.tab;
      if (!targetTab) return;

      const tabWrapper = btn.closest('.tabs-wrapper, .card, .simulator-results') || document;

      // Deactivate sibling buttons
      btn.parentElement.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // Show matching pane, hide others
      tabWrapper.querySelectorAll('.tab-pane').forEach(function (pane) {
        if (pane.dataset.tab === targetTab || pane.id === 'tab-' + targetTab || pane.id === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  }

  /* ──────────────────────────────────────────────
   * 7. LUCIDE ICONS
   * ────────────────────────────────────────────── */

  function initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ──────────────────────────────────────────────
   * 8. SCROLL ANIMATIONS
   * ────────────────────────────────────────────── */

  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ──────────────────────────────────────────────
   * 9. BLOG FILTERS
   * ────────────────────────────────────────────── */

  function initBlogFilters() {
    const filterContainer = document.getElementById('blog-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      // Update active styling
      filterContainer.querySelectorAll('.filter-btn').forEach(function(b) {
        b.classList.remove('badge-cyan', 'active');
        b.style.background = 'transparent';
        b.style.border = '1px solid var(--color-glass-border)';
        b.style.color = 'var(--color-text-muted)';
      });
      btn.classList.add('badge-cyan', 'active');
      btn.style.background = '';
      btn.style.border = 'none';
      btn.style.color = '';

      const category = btn.dataset.filter;
      const cards = document.querySelectorAll('.blog-card');

      cards.forEach(function(card) {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  /* ──────────────────────────────────────────────
   * 10. INTERACTIVE WIZARD
   * ────────────────────────────────────────────── */

  function initWizard() {
    const wizardStep1 = document.getElementById('wizard-step-1');
    const wizardStep2 = document.getElementById('wizard-step-2');
    if (!wizardStep1 || !wizardStep2) return;

    const options = document.querySelectorAll('.wizard-option');
    const backBtn = document.getElementById('wizard-back');
    const contents = {
      'comprar': document.getElementById('wizard-content-comprar'),
      'hipoteca': document.getElementById('wizard-content-hipoteca'),
      'aprender': document.getElementById('wizard-content-aprender')
    };

    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        const goal = this.dataset.goal;
        
        // Hide step 1, show step 2
        wizardStep1.style.display = 'none';
        wizardStep2.style.display = 'block';
        
        // Hide all contents, show target
        Object.values(contents).forEach(c => { if(c) c.style.display = 'none'; });
        if (contents[goal]) {
          contents[goal].style.display = 'block';
        }
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function() {
        wizardStep2.style.display = 'none';
        wizardStep1.style.display = 'block';
      });
    }
  }

  /* ──────────────────────────────────────────────
   * BOOTSTRAP
   * ────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMobileNav();
    initActiveNav();
    initSmoothScroll();
    initAccordion();
    initTabs();
    initIcons();
    initScrollAnimations();
    initBlogFilters();
    initWizard();
  });
})();
