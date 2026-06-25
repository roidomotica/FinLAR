/**
 * FinLAR — Simulator 1: Debt Capacity & Maximum Purchase Price
 * ==============================================================
 * Calculates the user's maximum affordable property price
 * based on income, savings, existing debts, interest rate, and term.
 *
 * Renders:
 *  • A horizontal stacked-bar chart showing income allocation
 *  • A detailed results table
 *
 * Depends on: charts-config.js, Chart.js v4
 */
;(function () {
  'use strict';

  /* ── Constants ── */
  var PURCHASE_COST_RATE = 0.11;  // 11 % taxes + notary + registry
  var DOWN_PAYMENT_RATE  = 0.20;  // 20 % minimum down payment
  var TOTAL_UPFRONT_RATE = PURCHASE_COST_RATE + DOWN_PAYMENT_RATE; // 0.31
  var LTV                = 0.80;  // Loan-to-Value

  var CHART_ID = 'capacity-chart';

  /* ── Helpers ── */

  /**
   * French-amortization monthly payment.
   * @param {number} P  Principal
   * @param {number} r  Monthly interest rate
   * @param {number} n  Number of months
   * @returns {number}
   */
  function monthlyPayment(P, r, n) {
    if (r === 0) return P / n;
    return P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }

  /* ── Main calculation ── */

  function calculate() {
    // 1. Read inputs
    var income       = parseFloat(document.getElementById('income').value)       || 0;
    var savings      = parseFloat(document.getElementById('savings').value)      || 0;
    var debts        = parseFloat(document.getElementById('debts').value)        || 0;
    var annualRate   = parseFloat(document.getElementById('sim1-interest').value) || 0;
    var termYears    = parseInt(document.getElementById('sim1-term').value, 10)  || 25;

    var monthlyRate  = annualRate / 100 / 12;
    var termMonths   = termYears * 12;

    // 2. Calculated values
    var availableIncome = Math.max(income - debts, 0);
    var maxQuota30      = availableIncome * 0.30;
    var maxQuota35      = availableIncome * 0.35;
    var currentDebtRatio = income > 0 ? (debts / income) * 100 : 0;

    // Maximum loan amounts (present value of annuity)
    var maxLoan30 = maxQuota30 > 0 ? maxQuota30 * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate) : 0;
    var maxLoan35 = maxQuota35 > 0 ? maxQuota35 * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate) : 0;

    if (monthlyRate === 0) {
      maxLoan30 = maxQuota30 * termMonths;
      maxLoan35 = maxQuota35 * termMonths;
    }

    // Maximum property prices
    var maxPriceFromLTV = savings / TOTAL_UPFRONT_RATE; // Limited by having 20% + 11%

    var maxPrice30 = Math.min((maxLoan30 + savings) / (1 + PURCHASE_COST_RATE), maxPriceFromLTV);
    var maxPrice35 = Math.min((maxLoan35 + savings) / (1 + PURCHASE_COST_RATE), maxPriceFromLTV);

    // Actual loan needed at these prices
    // It's the price + costs - savings, OR 80% of price (whichever is less, as bank caps at 80%)
    var actualLoan30 = Math.min(maxPrice30 * (1 + PURCHASE_COST_RATE) - savings, maxPrice30 * LTV);
    var actualLoan35 = Math.min(maxPrice35 * (1 + PURCHASE_COST_RATE) - savings, maxPrice35 * LTV);
    
    // Ensure loan is not negative
    if (actualLoan30 < 0) actualLoan30 = 0;
    if (actualLoan35 < 0) actualLoan35 = 0;

    // Monthly payments at these loans
    var quota30 = monthlyPayment(actualLoan30, monthlyRate, termMonths);
    var quota35 = monthlyPayment(actualLoan35, monthlyRate, termMonths);

    // Debt ratios
    var ratio30 = income > 0 ? ((quota30 + debts) / income) * 100 : 0;
    var ratio35 = income > 0 ? ((quota35 + debts) / income) * 100 : 0;

    // Entry + costs
    var costs30 = maxPrice30 * PURCHASE_COST_RATE;
    var costs35 = maxPrice35 * PURCHASE_COST_RATE;
    // Entry cash is price - loan
    var entry30 = maxPrice30 - actualLoan30;
    var entry35 = maxPrice35 - actualLoan35;
    var totalSavingsNeeded30 = entry30 + costs30;
    var totalSavingsNeeded35 = entry35 + costs35;

    var savingsInsufficient = savings <= 0 && maxPrice30 > 0; // It's only strictly insufficient if they have 0 savings. If they have savings, maxPrice adjusts to what they can afford.

    // 3. Render results
    renderTable({
      quota30: quota30, quota35: quota35,
      maxLoan30: actualLoan30, maxLoan35: actualLoan35,
      maxPrice30: maxPrice30, maxPrice35: maxPrice35,
      entry30: entry30, entry35: entry35,
      costs30: costs30, costs35: costs35,
      totalNeeded30: totalSavingsNeeded30, totalNeeded35: totalSavingsNeeded35,
      ratio30: ratio30, ratio35: ratio35,
      savingsInsufficient: savingsInsufficient,
      savings: savings,
    });

    // 4. Render chart
    renderChart(income, debts, quota30, quota35);
  }

  /* ── Render results table ── */

  function renderTable(d) {
    var container = document.getElementById('capacity-results');
    if (!container) return;

    var fmt = ChartConfig.formatCurrency;
    var fmtP = ChartConfig.formatPercent;

    var alertHTML = '';
    if (d.savingsInsufficient) {
      alertHTML =
        '<div class="alert alert-warning" style="margin-bottom:1rem;">' +
        '<strong>⚠️ Ahorro insuficiente:</strong> Tus ahorros (' + fmt(d.savings) +
        ') no cubren la entrada + gastos mínimos (' + fmt(d.totalNeeded30) +
        '). Los precios mostrados están limitados por tu ahorro disponible.</div>';
    }

    container.innerHTML =
      alertHTML +
      '<div class="table-responsive">' +
      '<table class="table">' +
      '<thead><tr>' +
      '<th>Concepto</th>' +
      '<th style="color:#10b981">Conservador (30%)</th>' +
      '<th style="color:#f59e0b">Máximo (35%)</th>' +
      '</tr></thead>' +
      '<tbody>' +
      row('Cuota mensual máxima', fmt(d.quota30), fmt(d.quota35)) +
      row('Préstamo máximo', fmt(d.maxLoan30), fmt(d.maxLoan35)) +
      row('Precio máximo vivienda', fmt(d.maxPrice30), fmt(d.maxPrice35)) +
      row('Aportación inicial (entrada)', fmt(d.entry30), fmt(d.entry35)) +
      row('Gastos estimados (11%)', fmt(d.costs30), fmt(d.costs35)) +
      row('Total necesario (ahorro)', fmt(d.totalNeeded30), fmt(d.totalNeeded35)) +
      row('Ratio de endeudamiento', fmtP(d.ratio30), fmtP(d.ratio35)) +
      '</tbody></table></div>';
  }

  function row(label, v30, v35) {
    return '<tr><td>' + label + '</td><td>' + v30 + '</td><td>' + v35 + '</td></tr>';
  }

  /* ── Render chart ── */

  function renderChart(income, debts, quota30, quota35) {
    var canvas = document.getElementById(CHART_ID);
    if (!canvas) return;

    var colors = ChartConfig.getColors();

    var rest30 = Math.max(income - debts - quota30, 0);
    var rest35 = Math.max(income - debts - quota35, 0);
    var stressZone30 = quota35 - quota30; // difference between 35% and 30%

    function buildChart() {
      // Destroy previous instance
      ChartConfig.destroyChart(CHART_ID);

      var c = ChartConfig.getColors();

      var chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Tu situación (30%)', 'Límite estrés (35%)'],
          datasets: [
            {
              label: 'Deudas actuales',
              data: [debts, debts],
              backgroundColor: c.red + 'cc',
              borderColor: c.red,
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Cuota hipotecaria',
              data: [quota30, quota35],
              backgroundColor: [c.green + 'cc', c.amber + 'cc'],
              borderColor: [c.green, c.amber],
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Resto disponible',
              data: [rest30, rest35],
              backgroundColor: c.textMuted + '40',
              borderColor: c.textMuted + '60',
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: Object.assign({}, ChartConfig.getDefaultOptions('Distribución de Ingresos Mensuales'), {
          indexAxis: 'y',
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: c.textMuted,
                font: { family: "'Inter', sans-serif", size: 11 },
                callback: function (v) {
                  return ChartConfig.formatCurrency(v);
                },
              },
              grid: { color: c.grid },
              border: { color: c.grid },
            },
            y: {
              stacked: true,
              ticks: {
                color: c.text,
                font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
              },
              grid: { display: false },
              border: { display: false },
            },
          },
          plugins: Object.assign(
            {},
            ChartConfig.getDefaultOptions().plugins,
            {
              title: {
                display: true,
                text: 'Distribución de Ingresos Mensuales',
                color: c.text,
                font: { family: "'Outfit', sans-serif", size: 16, weight: '600' },
                padding: { bottom: 20 },
              },
              tooltip: Object.assign({}, ChartConfig.getDefaultOptions().plugins.tooltip, {
                callbacks: {
                  label: function (ctx) {
                    return ctx.dataset.label + ': ' + ChartConfig.formatCurrency(ctx.parsed.x);
                  },
                },
              }),
            }
          ),
        }),
      });

      ChartConfig.setInstance(CHART_ID, chart);
      return chart;
    }

    ChartConfig.register(CHART_ID, buildChart);
    buildChart();
  }

  /* ── Init ── */

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('calculate-capacity');
    if (!btn) return; // Not on the capacity page

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      calculate();
    });

    // Auto recalculate on input change
    var inputs = document.querySelectorAll('#simulator-capacity input');
    inputs.forEach(function(input) {
      input.addEventListener('input', calculate);
    });

    // Run once on load with default values
    calculate();
  });
})();
