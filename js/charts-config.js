/**
 * FinLAR — Shared Chart.js Configuration
 * ========================================
 * Provides theme-aware colors, default chart options,
 * formatting utilities, and a chart registry so every
 * chart can be rebuilt when the user switches theme.
 *
 * Depends on Chart.js v4 being loaded before this file.
 */
const ChartConfig = (function () {
  'use strict';

  /* ── Chart registry ── */
  const _registry = new Map(); // id → { canvas, buildFn }

  /* ── Brand palette ── */
  const scenarioColors = {
    '1a': '#94a3b8', // Slate Grey  — boring savings
    '1b': '#f59e0b', // Amber       — remunerated account
    '2a': '#3b82f6', // Sapphire    — reduce quota
    '2b': '#06b6d4', // Smart Cyan  — reduce term
    '3':  '#10b981', // Green       — invest in funds
  };

  /** Return theme-aware palette. */
  function getColors() {
    var isDark = document.documentElement.dataset.theme !== 'light';
    return {
      text:      isDark ? '#94a3b8' : '#475569',
      textMuted: isDark ? '#64748b' : '#94a3b8',
      grid:      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      surface:   isDark ? '#080812' : '#ffffff',
      cyan:   '#06b6d4',
      blue:   '#3b82f6',
      indigo: '#6366f1',
      green:  '#10b981',
      amber:  '#f59e0b',
      red:    '#ef4444',
    };
  }

  /** Sensible defaults for any chart. */
  function getDefaultOptions(titleText) {
    var colors = getColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: !!titleText,
          text: titleText || '',
          color: colors.text,
          font: { family: "'Outfit', sans-serif", size: 16, weight: '600' },
          padding: { bottom: 20 },
        },
        legend: {
          position: 'bottom',
          labels: {
            color: colors.text,
            font: { family: "'Inter', sans-serif", size: 12 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: colors.surface,
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1,
          titleFont: { family: "'Outfit', sans-serif", weight: '600' },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              var val = context.parsed.y != null ? context.parsed.y : context.parsed.x;
              return (
                context.dataset.label +
                ': ' +
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(val)
              );
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: colors.textMuted,
            font: { family: "'Inter', sans-serif", size: 11 },
          },
          grid: { color: colors.grid },
          border: { color: colors.grid },
        },
        y: {
          ticks: {
            color: colors.textMuted,
            font: { family: "'Inter', sans-serif", size: 11 },
            callback: function (value) {
              return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: 'compact',
                maximumFractionDigits: 0,
              }).format(value);
            },
          },
          grid: { color: colors.grid },
          border: { color: colors.grid },
        },
      },
    };
  }

  /* ── Formatting helpers ── */

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }

  /* ── Chart registry helpers ── */

  /**
   * Register a chart so it can be rebuilt on theme change.
   * @param {string}   id       Unique identifier (usually canvas id).
   * @param {Function} buildFn  Function that creates (and returns) the Chart instance.
   *                            It receives the canvas element as its sole argument.
   */
  function register(id, buildFn) {
    var oldEntry = _registry.get(id);
    _registry.set(id, { buildFn: buildFn, instance: oldEntry ? oldEntry.instance : null });
  }

  /** Destroy a previously created chart instance by registry id. */
  function destroyChart(id) {
    var entry = _registry.get(id);
    if (entry && entry.instance) {
      entry.instance.destroy();
      entry.instance = null;
    }
  }

  /** Store reference to a chart instance in the registry. */
  function setInstance(id, chartInstance) {
    var entry = _registry.get(id);
    if (entry) entry.instance = chartInstance;
  }

  /** Retrieve current chart instance. */
  function getInstance(id) {
    var entry = _registry.get(id);
    return entry ? entry.instance : null;
  }

  /** Rebuild every registered chart (called on theme change). */
  function rebuildAll() {
    _registry.forEach(function (entry, id) {
      if (entry.instance) {
        entry.instance.destroy();
        entry.instance = null;
      }
      if (typeof entry.buildFn === 'function') {
        entry.instance = entry.buildFn();
      }
    });
  }

  /* ── Listen for theme changes ── */
  window.addEventListener('themechange', function () {
    rebuildAll();
  });

  /* ── Public API ── */
  return {
    getColors: getColors,
    getDefaultOptions: getDefaultOptions,
    scenarioColors: scenarioColors,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    register: register,
    destroyChart: destroyChart,
    setInstance: setInstance,
    getInstance: getInstance,
    rebuildAll: rebuildAll,
  };
})();
