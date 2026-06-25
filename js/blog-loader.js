/**
 * FinLAR — Blog Loader
 * ====================
 * Lee automáticamente los archivos Markdown de /blog/posts/
 * y genera las tarjetas de artículos en educacion.html.
 *
 * Para añadir un nuevo artículo al blog: crea un archivo .md
 * en /blog/posts/ (desde el panel de administración en /admin)
 * y añade su slug a la lista POSTS_MANIFEST aquí abajo.
 *
 * ─── PARA AÑADIR UN NUEVO ARTÍCULO ─────────────────────
 * Añade el slug del artículo a la lista POSTS_MANIFEST.
 * El slug es el nombre del archivo sin la extensión .md.
 * Ejemplo: si el archivo es "mi-articulo.md", el slug es "mi-articulo"
 */

;(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────
  // LISTA DE ARTÍCULOS PUBLICADOS
  // Añade aquí el slug de cada nuevo artículo que publiques.
  // El orden determina el orden de aparición (primero = más reciente).
  // ────────────────────────────────────────────────────────────
  var POSTS_MANIFEST = [
    'fondo-emergencia'
    // Ejemplo de cómo añadir más artículos:
    // 'tipo-fijo-vs-variable',
    // 'guia-fondos-indexados',
    // 'amortizar-plazo-vs-cuota'
  ];

  // ────────────────────────────────────────────────────────────
  // Colores de categoría
  // ────────────────────────────────────────────────────────────
  var CATEGORY_CONFIG = {
    ahorro:    { label: 'Ahorro',    color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)' },
    hipotecas: { label: 'Hipotecas', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
    inversion: { label: 'Inversión', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' }
  };

  var grid = document.getElementById('blog-grid');
  var loadingEl = document.getElementById('blog-loading');
  var emptyEl = document.getElementById('blog-empty');

  // No hacer nada si no estamos en la página con el grid de blog
  if (!grid) return;

  // ────────────────────────────────────────────────────────────
  // Parsear el frontmatter YAML de un archivo Markdown
  // ────────────────────────────────────────────────────────────
  function parseFrontmatter(raw) {
    var match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    var meta = {};
    match[1].split('\n').forEach(function (line) {
      var colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;
      var key = line.slice(0, colonIndex).trim();
      var val = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = val;
    });
    return meta;
  }

  // ────────────────────────────────────────────────────────────
  // Crear la tarjeta HTML de un artículo
  // ────────────────────────────────────────────────────────────
  function createCard(slug, meta) {
    var cat = meta.category || 'ahorro';
    var catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.ahorro;
    var postUrl = 'blog/post.html?slug=' + slug;

    var card = document.createElement('div');
    card.className = 'card blog-card';
    card.setAttribute('data-category', cat);
    card.innerHTML =
      '<div style="display:inline-block; padding:4px 12px; border-radius:9999px; font-size:0.8rem; font-weight:600; font-family:\'Inter\',sans-serif; margin-bottom:16px; background:' + catCfg.bg + '; color:' + catCfg.color + '; border:1px solid ' + catCfg.border + ';">' + catCfg.label + '</div>' +
      '<h3 style="font-size:1.2rem; margin-bottom:12px; color:var(--color-text); font-family:\'Outfit\',sans-serif;">' + escapeHtml(meta.title || 'Sin título') + '</h3>' +
      '<p class="text-muted" style="font-size:0.95rem; line-height:1.6; margin-bottom:24px;">' + escapeHtml(meta.excerpt || '') + '</p>' +
      '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        '<a href="' + postUrl + '" class="btn btn-secondary" style="display:inline-flex;align-items:center;gap:8px;font-size:0.9rem;padding:8px 16px;">' +
          'Leer artículo <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
        '</a>' +
        (meta.read_time ? '<span class="text-muted" style="font-size:0.8rem;">' + escapeHtml(meta.read_time) + '</span>' : '') +
      '</div>';

    return card;
  }

  // ────────────────────────────────────────────────────────────
  // Sanitizar HTML para evitar XSS
  // ────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ────────────────────────────────────────────────────────────
  // Cargar todos los artículos en paralelo
  // ────────────────────────────────────────────────────────────
  var allCards = [];

  var promises = POSTS_MANIFEST.map(function (slug) {
    return fetch('blog/posts/' + slug + '.md')
      .then(function (res) {
        if (!res.ok) throw new Error('Not found: ' + slug);
        return res.text();
      })
      .then(function (raw) {
        var meta = parseFrontmatter(raw);
        return { slug: slug, meta: meta };
      })
      .catch(function (err) {
        console.warn('[FinLAR Blog] No se pudo cargar el artículo:', slug, err.message);
        return null;
      });
  });

  Promise.all(promises).then(function (results) {
    // Eliminar el spinner de carga
    if (loadingEl) loadingEl.remove();

    // Filtrar los que fallaron
    var loaded = results.filter(Boolean);

    if (loaded.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    // Insertar las tarjetas en el grid
    loaded.forEach(function (item) {
      var card = createCard(item.slug, item.meta);
      allCards.push(card);
      grid.appendChild(card);
    });

    // Reinicializar el filtro de blog ahora que las tarjetas están en el DOM
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Conectar el filtro de categorías con las nuevas tarjetas
    var filterContainer = document.getElementById('blog-filters');
    if (filterContainer) {
      filterContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;

        // Actualizar botones activos
        filterContainer.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('badge-cyan', 'active');
          b.style.background = 'transparent';
          b.style.border = '1px solid var(--color-glass-border)';
          b.style.color = 'var(--color-text-muted)';
        });
        btn.classList.add('badge-cyan', 'active');
        btn.style.background = '';
        btn.style.border = 'none';
        btn.style.color = '';

        var category = btn.dataset.filter;
        var anyVisible = false;

        allCards.forEach(function (card) {
          var matches = category === 'all' || card.dataset.category === category;
          card.style.display = matches ? '' : 'none';
          if (matches) anyVisible = true;
        });

        if (emptyEl) emptyEl.style.display = anyVisible ? 'none' : 'block';
      });
    }
  });

})();
