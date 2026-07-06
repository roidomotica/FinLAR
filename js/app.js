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
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const currentPage = pathParts[pathParts.length - 1] || 'index.html';
    const parentDir = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const hrefParts = href.replace('../', '').split('/');
      const linkPage = hrefParts[hrefParts.length - 1].split('#')[0] || 'index.html';
      const linkDir = hrefParts.length > 1 ? hrefParts[0] : '';

      if (linkPage === currentPage ||
          (parentDir && linkDir === '' && linkPage.replace('.html', '') === parentDir)) {
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
    const wizardStep3 = document.getElementById('wizard-step-3');
    const wizardTitle = document.getElementById('wizard-title');
    
    if (!wizardStep1 || !wizardStep2 || !wizardStep3) return;

    const options = document.querySelectorAll('.wizard-option');
    const backTo1Btn = document.getElementById('wizard-back-to-1');
    const backTo2Btn = document.getElementById('wizard-back-to-2');
    
    const questionText = document.getElementById('wizard-question-text');
    const answersGrid = document.getElementById('wizard-answers-grid');
    
    const resultTitle = document.getElementById('wizard-result-title');
    const resultText = document.getElementById('wizard-result-text');
    const resultBtn = document.getElementById('wizard-result-btn');

    let currentGoal = '';
    let currentAnswer = '';

    const wizardData = {
      'comprar': {
        title: 'Planificación de Compra',
        question: '¿Tienes ahorrado el 30% para la entrada y los gastos de la vivienda?',
        answers: [
          { text: 'Sí, dispongo de los ahorros', value: 'si' },
          { text: 'No, no llego a ese importe', value: 'no' },
          { text: 'No lo sé con seguridad', value: 'no-lo-se' }
        ],
        results: {
          'si': {
            title: '¡Tienes una excelente base financiera!',
            text: 'Disponer del 30% de entrada (20% que no suele financiar el banco más 10% aproximado de gastos de compraventa e impuestos) te sitúa en una posición óptima. El siguiente paso es calcular exactamente qué rango de precio de vivienda te puedes permitir y conocer tu cuota mensual máxima.',
            btnText: 'Realizar Análisis Financiero',
            btnUrl: 'comprar/analisis-financiero.html'
          },
          'no': {
            title: 'Planifica tu ahorro primero',
            text: 'Comprar una vivienda requiere habitualmente una aportación inicial del 30%. Si aún no dispones de ella, es preferible trazar un plan de ahorro y entender todos los pasos del proceso para evitar riesgos. Te recomendamos consultar nuestra guía de compra detallada.',
            btnText: 'Ver Guía de Compra',
            btnUrl: 'comprar.html'
          },
          'no-lo-se': {
            title: 'Analicemos tu capacidad real',
            text: 'No te preocupes, es una duda muy común. Mediante un análisis financiero detallado de tus ingresos y gastos actuales, podremos determinar si cuentas con el capital inicial necesario o qué precio máximo de vivienda deberías buscar.',
            btnText: 'Calcular Capacidad Financiera',
            btnUrl: 'comprar/analisis-financiero.html'
          }
        }
      },
      'vender': {
        title: 'Planificación de Venta',
        question: '¿Conoces los gastos e impuestos asociados a la venta de una vivienda en España?',
        answers: [
          { text: 'Sí, los tengo calculados', value: 'si' },
          { text: 'No, necesito saber cuánto me costará', value: 'no' }
        ],
        results: {
          'si': {
            title: '¡Perfecto! Estás listo para vender',
            text: 'Tener claros los impuestos como la Plusvalía Municipal y el IRPF te permite fijar un precio de venta adecuado sin sorpresas de última hora. Te sugerimos revisar la documentación obligatoria necesaria para la firma de la escritura.',
            btnText: 'Ver Guía de Venta de Vivienda',
            btnUrl: 'vender.html'
          },
          'no': {
            title: 'Calcula tus costes de venta',
            text: 'Vender una casa conlleva impuestos significativos (IRPF por ganancia patrimonial, Plusvalía Municipal) y gastos de gestión. Descubre en nuestra guía completa cuáles son y cómo calcularlos para maximizar tu rentabilidad neta.',
            btnText: 'Aprender a Vender mi Casa',
            btnUrl: 'vender.html'
          }
        }
      },
      'optimizar': {
        title: 'Optimización de Hipoteca',
        question: '¿Qué tipo de interés tiene tu hipoteca actualmente?',
        answers: [
          { text: 'Tipo Fijo', value: 'fijo' },
          { text: 'Tipo Variable', value: 'variable' }
        ],
        results: {
          'fijo': {
            title: 'Estrategia para Hipoteca Fija',
            text: 'Con un tipo de interés fijo tienes la seguridad de una cuota estable. Si dispones de excedente de capital, puedes amortizar anticipadamente para reducir el plazo (años de deuda) y ahorrar intereses totales, o bien reducir la cuota mensual.',
            btnText: 'Simular Estrategia de Amortización',
            btnUrl: 'simuladores/amortizacion.html'
          },
          'variable': {
            title: 'Estrategia para Hipoteca Variable',
            text: 'Las hipotecas a tipo variable dependen directamente del Euríbor. Amortizar capital de forma anticipada te permite reducir tu exposición a futuras subidas de tipos y bajar el importe de tus cuotas mensuales de forma inmediata.',
            btnText: 'Simular Estrategia de Amortización',
            btnUrl: 'simuladores/amortizacion.html'
          }
        }
      },
      'educacion': {
        title: 'Educación Financiera',
        question: '¿Qué área te gustaría mejorar prioritariamente en tus finanzas?',
        answers: [
          { text: 'Ahorro y Presupuestos', value: 'ahorro' },
          { text: 'Inversión Básica', value: 'inversion' },
          { text: 'Gestión de Deudas', value: 'deudas' }
        ],
        results: {
          'ahorro': {
            title: 'Construye tus cimientos financieros',
            text: 'Controlar tus gastos mensuales y crear un fondo de emergencia sólido (de 3 a 6 meses de gastos) es el paso fundamental antes de cualquier decisión inmobiliaria. Descubre cómo hacerlo en nuestra sección especializada.',
            btnText: 'Ir a Guías de Ahorro y Presupuestos',
            btnUrl: 'educacion.html#ahorro'
          },
          'inversion': {
            title: 'Haz crecer tu patrimonio',
            text: 'Aprende los fundamentos del interés compuesto, cómo batir a la inflación y cómo funcionan los productos de inversión básica para que tu capital no pierda poder adquisitivo con el paso de los años.',
            btnText: 'Ir a Guías de Inversión',
            btnUrl: 'educacion.html#inversion'
          },
          'deudas': {
            title: 'Elimina y gestiona tu deuda',
            text: 'Aprende a diferenciar la deuda buena (apalancamiento para activos) de la deuda mala (consumo rápido) y descubre las metodologías más eficaces (bola de nieve, avalancha) para liquidar tus deudas pendientes.',
            btnText: 'Ir a Guías de Gestión de Deudas',
            btnUrl: 'educacion.html#deudas'
          }
        }
      }
    };

    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        currentGoal = this.dataset.goal;
        const data = wizardData[currentGoal];
        if (!data) return;

        wizardTitle.textContent = data.title;
        questionText.textContent = data.question;
        
        answersGrid.innerHTML = '';
        data.answers.forEach(ans => {
          const btn = document.createElement('button');
          btn.className = 'card card-glow text-center wizard-answer-opt';
          btn.style.border = '1px solid var(--color-glass-border)';
          btn.style.background = 'transparent';
          btn.style.cursor = 'pointer';
          btn.style.padding = '20px';
          btn.style.width = '100%';
          btn.dataset.value = ans.value;
          
          btn.innerHTML = `<h4 style="margin:0; font-weight:500;">${ans.text}</h4>`;
          
          btn.addEventListener('click', function() {
            currentAnswer = this.dataset.value;
            showStep3();
          });
          
          answersGrid.appendChild(btn);
        });

        wizardStep1.style.display = 'none';
        wizardStep2.style.display = 'block';
        wizardStep3.style.display = 'none';
      });
    });

    function showStep3() {
      const data = wizardData[currentGoal];
      if (!data) return;
      const result = data.results[currentAnswer];
      if (!result) return;

      wizardTitle.textContent = 'Tu Plan de Acción';
      resultTitle.textContent = result.title;
      resultText.textContent = result.text;
      resultBtn.textContent = result.btnText;
      resultBtn.setAttribute('href', result.btnUrl);

      wizardStep2.style.display = 'none';
      wizardStep3.style.display = 'block';
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    if (backTo1Btn) {
      backTo1Btn.addEventListener('click', function() {
        wizardTitle.textContent = '¿Qué quieres conseguir hoy?';
        wizardStep2.style.display = 'none';
        wizardStep1.style.display = 'block';
      });
    }

    if (backTo2Btn) {
      backTo2Btn.addEventListener('click', function() {
        const data = wizardData[currentGoal];
        if (data) wizardTitle.textContent = data.title;
        wizardStep3.style.display = 'none';
        wizardStep2.style.display = 'block';
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
