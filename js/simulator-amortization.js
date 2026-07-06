/**
 * FinLAR — Simulator 2: Advanced Amortization Strategy Comparison
 * ================================================================
 * Simulates 5 scenarios month-by-month with full precision:
 *
 *   1a  No amortizar + cuenta corriente (0 %)
 *   1b  No amortizar + cuenta remunerada
 *   2a  Amortizar reduciendo cuota (mantener plazo)
 *   2b  Amortizar reduciendo plazo (mantener cuota)
 *   3   No amortizar + invertir en fondos indexados

 *
 * Fair comparison: every scenario assumes the SAME total annual
 * cash outflow = 12 × originalPayment + extraSavings.
 * After mortgage cancellation in 2a/2b the freed cash accumulates.
 *
 * Depends on: charts-config.js, Chart.js v4
 */
;(function () {
  'use strict';

  var CHART_ID = 'amortization-chart';

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * FINANCIAL HELPERS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /**
   * Monthly payment (French system).
   * C = P × r(1+r)^n / ((1+r)^n − 1)
   */
  function monthlyPayment(P, r, n) {
    if (n <= 0) return 0;
    if (r === 0) return P / n;
    var factor = Math.pow(1 + r, n);
    return P * r * factor / (factor - 1);
  }

  /**
   * Remaining balance after k payments.
   */
  function remainingBalance(P, r, n, k) {
    if (k <= 0) return P;
    if (k >= n) return 0;
    if (r === 0) return P * (1 - k / n);
    var pmt = monthlyPayment(P, r, n);
    var factor = Math.pow(1 + r, k);
    return P * factor - pmt * (factor - 1) / r;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * SCENARIO SIMULATION (month-by-month)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /**
   * Run all 5 scenarios and return results keyed by scenario id.
   *
   * Each result = {
   *   debt: number[],          // remaining balance per year
   *   savings: number[],       // accumulated savings/investment per year
   *   interestPaid: number[],  // cumulative interest to bank per year
   *   netWealth: number[],     // savings − debt per year
   *   cancelYear: number|null  // first year debt ≤ 0
   * }
   */
  function simulate(capital, monthlyRate, termYears, extraSavings, savingsRate, fundReturn) {
    var termMonths    = termYears * 12;
    var origPayment   = monthlyPayment(capital, monthlyRate, termMonths);
    var annualMortgageCost = 12 * origPayment; // constant outflow in all scenarios
    var totalAnnualCash    = annualMortgageCost + extraSavings;

    /* helper: simulate one year of mortgage payments month-by-month,
       returning { newDebt, interestThisYear, monthsPaid } */
    function simulateMortgageYear(debt, payment, rate) {
      var interest = 0;
      var d = debt;
      var months = 0;
      for (var m = 0; m < 12; m++) {
        if (d <= 0) break;
        var intM = d * rate;
        var prinM = Math.min(payment - intM, d);
        if (prinM < 0) prinM = 0;
        interest += intM;
        d = Math.max(d - prinM, 0);
        months++;
      }
      return { newDebt: d, interestThisYear: interest, monthsPaid: months };
    }

    var results = {};
    var ids = ['1a', '1b', '2a', '2b', '3'];

    ids.forEach(function (id) {
      results[id] = {
        debt: [capital],
        savings: [0],
        interestPaid: [0],
        netWealth: [-capital],
        cancelYear: null,
      };
    });

    /* ── Rigorous Cashflow Simulation for all scenarios ── */
    
    function runScenario(id, isAmortizing, reduceQuota, returnRate) {
      var r = results[id];
      var debt = capital;
      var sav = 0;
      var cumInt = 0;
      var currentPayment = origPayment;

      for (var y = 1; y <= termYears; y++) {
        var cashAvailable = totalAnnualCash;
        
        // 1. Pay mortgage for up to 12 months
        if (debt > 0) {
          var dStart = debt;
          var sim = simulateMortgageYear(debt, currentPayment, monthlyRate);
          debt = sim.newDebt;
          cumInt += sim.interestThisYear;
          
          var cashSpentOnMortgage = (dStart - debt) + sim.interestThisYear;
          cashAvailable -= cashSpentOnMortgage;
        }

        // 2. Extra amortization
        if (isAmortizing && debt > 0) {
          var amortAmount = Math.min(extraSavings, debt);
          debt -= amortAmount;
          cashAvailable -= amortAmount;

          if (reduceQuota && debt > 0) {
            var remainingMonths = (termYears - y) * 12;
            currentPayment = monthlyPayment(debt, monthlyRate, remainingMonths);
          }
        }
        
        // Clean up tiny floating point remnants
        if (debt <= 0.01) {
          debt = 0;
        }

        // 3. Remaining cash goes to savings
        sav = sav * (1 + returnRate) + cashAvailable;

        // Check for crossover or organic cancellation
        if (r.cancelYear === null && (sav >= debt || debt === 0)) {
          r.cancelYear = y;
        }

        r.debt.push(debt);
        r.savings.push(sav);
        r.interestPaid.push(cumInt);
        r.netWealth.push(sav - debt);
      }
    }

    runScenario('1a', false, false, 0);
    runScenario('1b', false, false, savingsRate);
    runScenario('2a', true, true, 0);
    runScenario('2b', true, false, 0);
    runScenario('3',  false, false, fundReturn);

    return results;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * SCENARIO METADATA
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var SCENARIO_META = {
    '1a': { label: '1A · Ahorrar sin rendimiento',           shortLabel: 'Ahorro 0 %' },
    '1b': { label: '1B · Cuenta remunerada',                 shortLabel: 'Cuenta remunerada' },
    '2a': { label: '2A · Amortizar reduciendo cuota',        shortLabel: 'Reducir cuota' },
    '2b': { label: '2B · Amortizar reduciendo plazo',        shortLabel: 'Reducir plazo' },
    '3':  { label: '3 · Invertir en fondos indexados',       shortLabel: 'Fondos indexados' },
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * RENDERING (CHARTS & TABLE)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  function initAdvancedUI() {
    var container = document.querySelector('#simulator-amortization .simulator-results');
    if (!container || container.hasAttribute('data-advanced')) return;
    container.setAttribute('data-advanced', 'true');
    
    var summary = document.getElementById('amortization-summary');
    var html = `
      <div class="tabs-wrapper mb-32 mt-32">
          <div class="tab-group" id="amortization-tabs" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="tab-btn active" data-tab="tab-wealth">Patrimonio Neto</button>
              <button class="tab-btn" data-tab="tab-debt">Amortización</button>
              <button class="tab-btn" data-tab="tab-interest">Intereses</button>
              <button class="tab-btn" data-tab="tab-savings">Ahorros</button>
              <button class="tab-btn" data-tab="tab-crossover">Punto de Cruce</button>
              <button class="tab-btn" data-tab="tab-table">Tabla Anual</button>
              <button class="tab-btn" data-tab="tab-descriptions">Explicación</button>
          </div>
          <div class="tab-content mt-16" id="amortization-tab-content">
              <div id="tab-wealth" class="tab-pane active">
                  <div class="chart-container" style="height: 350px;">
                      <canvas id="amortization-chart-wealth"></canvas>
                  </div>
                  <p class="form-hint text-center mt-16">El patrimonio neto es tu riqueza real (Ahorros e Inversiones - Deuda Hipotecaria).</p>
              </div>
              <div id="tab-debt" class="tab-pane">
                  <div class="chart-container" style="height: 350px;">
                      <canvas id="amortization-chart-debt"></canvas>
                  </div>
              </div>
              <div id="tab-interest" class="tab-pane">
                  <div class="chart-container" style="height: 350px;">
                      <canvas id="amortization-chart-interest"></canvas>
                  </div>
              </div>
              <div id="tab-savings" class="tab-pane">
                  <div class="chart-container" style="height: 350px;">
                      <canvas id="amortization-chart-savings"></canvas>
                  </div>
              </div>
              <div id="tab-crossover" class="tab-pane">
                  <div style="margin-bottom: 16px; text-align: center;">
                      <label style="font-size: 0.9rem; margin-right: 8px; color: var(--color-text-muted);">Selecciona un escenario para ver el cruce:</label>
                      <select id="crossover-scenario-select" style="padding: 6px 12px; border-radius: 8px; border: 1px solid var(--color-glass-border); background: var(--color-surface); color: var(--color-text);">
                          <option value="1a">1A: Colchón (0%)</option>
                          <option value="1b">1B: Cuenta Remunerada</option>
                          <option value="2a">2A: Reducir Cuota</option>
                          <option value="2b">2B: Reducir Plazo</option>
                          <option value="3" selected>3: Fondos Indexados</option>
                      </select>
                  </div>
                  <div class="chart-container" style="height: 320px;">
                      <canvas id="amortization-chart-crossover"></canvas>
                  </div>
                  <p class="form-hint text-center mt-16">El <strong>Punto de Cruce</strong> ocurre cuando la línea de ahorro supera a la de deuda. En ese momento, tienes suficiente capital para cancelar la hipoteca de golpe si lo deseas.</p>
              </div>
              <div id="tab-table" class="tab-pane">
                  <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                      <table class="table results-table" style="font-size: 0.85rem;">
                          <thead>
                              <tr>
                                  <th>Año</th>
                                  <th>Escenario</th>
                                  <th>Deuda Hipoteca</th>
                                  <th>Intereses Acum.</th>
                                  <th>Ahorro / Fondo</th>
                                  <th>Patrimonio Neto</th>
                              </tr>
                          </thead>
                          <tbody id="amortization-results-table">
                          </tbody>
                      </table>
                  </div>
              </div>
              <div id="tab-descriptions" class="tab-pane">
                  <div class="card" style="font-size: 0.95rem; line-height: 1.6; color: var(--color-text-muted);">
                      <h4 class="mb-16" style="color: var(--color-text);">Descripción de los Escenarios</h4>
                      <p class="mb-16">Para que la comparativa sea matemática y justa, <strong>en todos los escenarios destinas exactamente el mismo dinero mes a mes</strong> (la cuota de la hipoteca + el ahorro extra que introduzcas en el simulador). Lo que cambia es el destino de ese dinero extra:</p>
                      <ul style="list-style: none; padding: 0;">
                          <li class="mb-16">
                              <strong style="color: var(--color-text); font-size: 1.05rem;">1. Ahorrar (sin amortizar)</strong><br>
                              Consiste en no hacer aportaciones a la hipoteca y guardar el dinero extra. Tienes dos opciones:<br>
                              <span style="display: inline-block; margin-top: 4px; padding-left: 12px; border-left: 2px solid var(--color-glass-border);">
                                  <strong>Ahorrar en cuenta corriente:</strong> El dinero se guarda en efectivo (rentabilidad del 0 %). La inflación hará que pierda valor adquisitivo con el tiempo.<br>
                                  <strong>Ahorrar en cuenta remunerada:</strong> El dinero se deposita en una cuenta conservadora que genera intereses fijos (por ejemplo, el 2 %), combatiendo la inflación.
                              </span>
                          </li>
                          <li class="mb-16">
                              <strong style="color: var(--color-text); font-size: 1.05rem;">2. Amortizar</strong><br>
                              Consiste en entregar el ahorro extra al banco para reducir tu deuda. Tienes dos opciones:<br>
                              <span style="display: inline-block; margin-top: 4px; padding-left: 12px; border-left: 2px solid var(--color-glass-border);">
                                  <strong>Amortizar en cuota:</strong> Inyectas el dinero extra a la hipoteca para que tu mensualidad baje. El sobrante que generas por la bajada de cuota suele ir a la cuenta corriente al 0 %. A la larga, pagas más intereses totales al banco.<br>
                                  <strong>Amortizar en plazo:</strong> Inyectas el dinero extra para recortar años de hipoteca manteniendo tu cuota mensual congelada. Te ahorras muchísimos intereses al eliminar años completos del préstamo, aunque te descapitalizas a corto plazo.
                              </span>
                          </li>
                          <li>
                              <strong style="color: var(--color-text); font-size: 1.05rem;">3. Invertir en fondos indexados o alternativas</strong><br>
                              No amortizas la hipoteca. Todo tu ahorro extra lo inviertes mensualmente o anualmente en fondos indexados buscando rentabilidad a largo plazo (por ejemplo, el 7 %). Suele ser la opción ganadora a nivel matemático si logras que el interés que te dan tus inversiones sea superior al interés que te cobra el banco por tu hipoteca (aprovechando el interés compuesto).
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    `;
    
    var oldChart = document.querySelector('#simulator-amortization .chart-container');
    var oldResults = document.getElementById('amortization-results');
    if (oldChart) oldChart.remove();
    if (oldResults) oldResults.remove();
    
    summary.insertAdjacentHTML('afterend', html);

    var tabs = document.querySelectorAll('#amortization-tabs .tab-btn');
    var panes = document.querySelectorAll('#amortization-tab-content .tab-pane');
    tabs.forEach(function(t) {
      t.addEventListener('click', function(e) {
        e.preventDefault();
        tabs.forEach(function(btn) { btn.classList.remove('active'); });
        panes.forEach(function(p) { p.classList.remove('active'); });
        t.classList.add('active');
        document.getElementById(t.getAttribute('data-tab')).classList.add('active');
      });
    });
  }

  function createLineChart(chartId, title, labels, datasets, isCurrency) {
    function buildFn() {
      ChartConfig.destroyChart(chartId);
      var canvas = document.getElementById(chartId);
      if (!canvas) return null;
      var c = ChartConfig.getColors();

      var yAxisOptions = {
        grid: { color: c.grid },
        border: { display: false },
        ticks: {
          color: c.textMuted,
          font: { family: "'Inter', sans-serif", size: 11 },
        }
      };
      
      if (isCurrency) {
        yAxisOptions.ticks.callback = function (v) { return ChartConfig.formatCurrency(v); };
      }

      var chart = new Chart(canvas, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: Object.assign({}, ChartConfig.getDefaultOptions(title), {
          scales: {
            x: {
              grid: { display: false },
              border: { color: c.grid },
              ticks: { color: c.textMuted, font: { family: "'Inter', sans-serif", size: 11 } }
            },
            y: yAxisOptions,
          },
          plugins: Object.assign({}, ChartConfig.getDefaultOptions().plugins, {
            title: { display: true, text: title, color: c.text, font: { family: "'Outfit', sans-serif", size: 16, weight: '600' } },
            tooltip: Object.assign({}, ChartConfig.getDefaultOptions().plugins.tooltip, {
              callbacks: isCurrency ? { label: function (ctx) { return ctx.dataset.label + ': ' + ChartConfig.formatCurrency(ctx.parsed.y); } } : {}
            })
          })
        })
      });
      ChartConfig.setInstance(chartId, chart);
      return chart;
    }
    ChartConfig.register(chartId, buildFn);
    buildFn();
  }

  function renderCrossoverChart(results, termYears, scenarioId) {
    var labels = [];
    for (var i = 0; i <= termYears; i++) {
      labels.push('Año ' + i);
    }
    
    var c = ChartConfig.getColors();
    var r = results[scenarioId];
    
    createLineChart('amortization-chart-crossover', 'Deuda vs Ahorro (' + SCENARIO_META[scenarioId].shortLabel + ')', labels, [
      { label: 'Deuda Pendiente', data: r.debt, borderColor: c.red, backgroundColor: c.red, borderWidth: 3, pointRadius: 1, tension: 0.3 },
      { label: 'Ahorro / Inversión', data: r.savings, borderColor: c.green, backgroundColor: c.green, borderWidth: 3, pointRadius: 1, tension: 0.3 }
    ], true);
  }

  function renderCharts(results, termYears) {
    initAdvancedUI();
    var labels = [];
    for (var i = 0; i <= termYears; i++) {
      labels.push('Año ' + i);
    }

    var c = ChartConfig.getColors();
    var s1aColor = ChartConfig.scenarioColors['1a'];
    var s1bColor = ChartConfig.scenarioColors['1b'];
    var s2aColor = ChartConfig.scenarioColors['2a'];
    var s2bColor = ChartConfig.scenarioColors['2b'];
    var s3Color  = ChartConfig.scenarioColors['3'];

    var commonOpts = { borderWidth: 2, pointRadius: 1, pointHoverRadius: 6, tension: 0.3 };

    // 1. Patrimonio Neto Chart
    createLineChart('amortization-chart-wealth', 'Evolución del Patrimonio Neto', labels, [
      Object.assign({ label: '1A: Colchón', data: results['1a'].netWealth, borderColor: s1aColor, backgroundColor: s1aColor }, commonOpts),
      Object.assign({ label: '1B: Remunerada', data: results['1b'].netWealth, borderColor: s1bColor, backgroundColor: s1bColor }, commonOpts),
      Object.assign({ label: '2A: Reducir Cuota', data: results['2a'].netWealth, borderColor: s2aColor, backgroundColor: s2aColor }, commonOpts),
      Object.assign({ label: '2B: Reducir Plazo', data: results['2b'].netWealth, borderColor: s2bColor, backgroundColor: s2bColor }, commonOpts),
      Object.assign({ label: '3: Indexados', data: results['3'].netWealth, borderColor: s3Color, backgroundColor: s3Color }, commonOpts),
    ], true);

    // 2. Deuda Chart
    createLineChart('amortization-chart-debt', 'Deuda Pendiente de Hipoteca', labels, [
      Object.assign({ label: 'Sin Amortizar Extra', data: results['1a'].debt, borderColor: s1aColor, backgroundColor: s1aColor, borderDash: [5, 5] }, commonOpts),
      Object.assign({ label: 'Reducir Cuota', data: results['2a'].debt, borderColor: s2aColor, backgroundColor: s2aColor }, commonOpts),
      Object.assign({ label: 'Reducir Plazo', data: results['2b'].debt, borderColor: s2bColor, backgroundColor: s2bColor }, commonOpts),
    ], true);

    // 3. Intereses Chart
    createLineChart('amortization-chart-interest', 'Intereses Pagados al Banco (Acumulado)', labels, [
      Object.assign({ label: 'Sin Amortizar Extra', data: results['1a'].interestPaid, borderColor: s1aColor, backgroundColor: s1aColor + '40', fill: true }, commonOpts),
      Object.assign({ label: 'Reducir Cuota', data: results['2a'].interestPaid, borderColor: s2aColor, backgroundColor: s2aColor + '40', fill: true }, commonOpts),
      Object.assign({ label: 'Reducir Plazo', data: results['2b'].interestPaid, borderColor: s2bColor, backgroundColor: s2bColor + '40', fill: true }, commonOpts),
    ], true);

    // 4. Ahorros Chart
    createLineChart('amortization-chart-savings', 'Crecimiento de Ahorros / Fondo', labels, [
      Object.assign({ label: '1A: Colchón', data: results['1a'].savings, borderColor: s1aColor, backgroundColor: s1aColor }, commonOpts),
      Object.assign({ label: '1B: Remunerada', data: results['1b'].savings, borderColor: s1bColor, backgroundColor: s1bColor }, commonOpts),
      Object.assign({ label: '2A: Ahorros Restantes', data: results['2a'].savings, borderColor: s2aColor, backgroundColor: s2aColor }, commonOpts),
      Object.assign({ label: '2B: Ahorros Post-Hipoteca', data: results['2b'].savings, borderColor: s2bColor, backgroundColor: s2bColor }, commonOpts),
      Object.assign({ label: '3: Fondo Indexado', data: results['3'].savings, borderColor: s3Color, backgroundColor: s3Color }, commonOpts),
    ], true);

    // 5. Crossover Chart (initial load)
    var crossoverSelect = document.getElementById('crossover-scenario-select');
    if (crossoverSelect) {
      renderCrossoverChart(results, termYears, crossoverSelect.value);
      
      // We only want to attach the event listener ONCE per initialization,
      // but initAdvancedUI adds data-advanced, so it only runs once!
      // Wait, we need to re-render the chart if the select changes!
      crossoverSelect.onchange = function() {
        renderCrossoverChart(results, termYears, this.value);
      };
    }
  }

  function renderTable(results, termYears) {
    var tbody = document.getElementById('amortization-results-table');
    if (!tbody) return;

    var fmt = ChartConfig.formatCurrency;
    var html = '';
    
    var scenarioNames = {
      '1a': '1A. Sin Amortizar (0%)',
      '1b': '1B. C. Remunerada',
      '2a': '2A. Reducir Cuota',
      '2b': '2B. Reducir Plazo',
      '3':  '3. Fondos Indexados'
    };

    var yearsToShow = [];
    for (var i = 1; i <= termYears; i++) {
      if (i === 1 || i % 5 === 0 || i === termYears) {
        yearsToShow.push(i);
      }
    }

    yearsToShow.forEach(function(yr) {
      ['1a', '1b', '2a', '2b', '3'].forEach(function(sc, index) {
        var r = results[sc];
        var isFirst = index === 0;
        
        html += '<tr class="' + (sc === '3' ? 'highlight-row' : '') + '" style="' + (sc === '3' ? 'border-bottom: 2px solid var(--color-glass-border);' : '') + '">';
        if (isFirst) {
          html += '<td rowspan="5" style="vertical-align: middle; border-bottom: 2px solid var(--color-glass-border);"><strong>Año ' + yr + '</strong></td>';
        }
        
        html += '<td>' + scenarioNames[sc] + '</td>';
        html += '<td>' + fmt(r.debt[yr]) + '</td>';
        html += '<td>' + fmt(r.interestPaid[yr]) + '</td>';
        html += '<td style="color: var(--color-smart-cyan);">' + fmt(r.savings[yr]) + '</td>';
        html += '<td style="font-weight: 600;">' + fmt(r.netWealth[yr]) + '</td>';
        html += '</tr>';
      });
    });

    tbody.innerHTML = html;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * SUMMARY CARDS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  function renderSummary(results, termYears) {
    var container = document.getElementById('amortization-summary');
    if (!container) return;

    var fmt = ChartConfig.formatCurrency;

    // Find best scenario (highest final net wealth)
    var bestId = '1a';
    var bestWealth = -Infinity;
    Object.keys(results).forEach(function (id) {
      var nw = results[id].netWealth[termYears];
      if (nw > bestWealth) {
        bestWealth = nw;
        bestId = id;
      }
    });

    // Create an array of scenarios with required details
    var scenarios = Object.keys(SCENARIO_META).map(function (id) {
      var r = results[id];
      return {
        id: id,
        meta: SCENARIO_META[id],
        cancelYear: r.cancelYear,
        finalWealth: r.netWealth[termYears],
        isBest: id === bestId,
        color: ChartConfig.scenarioColors[id]
      };
    });

    // Sort scenarios: by cancelYear ascending (null at the end).
    // Scenarios with cancelYear === null are sorted by finalWealth descending.
    scenarios.sort(function (a, b) {
      if (a.cancelYear === null && b.cancelYear === null) {
        return b.finalWealth - a.finalWealth;
      }
      if (a.cancelYear === null) return 1;
      if (b.cancelYear === null) return -1;
      return a.cancelYear - b.cancelYear;
    });

    var html = '<div class="scenario-cards">';
    scenarios.forEach(function (sc) {
      var cancelText  = sc.cancelYear !== null ? ('Año ' + sc.cancelYear) : 'No aplica';

      html +=
        '<div class="scenario-card' + (sc.isBest ? ' best-scenario' : '') + '">' +
        '  <div class="scenario-indicator" style="background:' + sc.color + '"></div>' +
        '  <h4 class="scenario-title">' + sc.meta.shortLabel + '</h4>' +
        '  <div class="scenario-value">' + fmt(sc.finalWealth) + '</div>' +
        '  <div class="scenario-label">Patrimonio neto final</div>' +
        '  <div class="scenario-meta">' +
        '    <span>Cancelación: ' + cancelText + '</span>' +
        '  </div>' +
        '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }



  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN CALCULATION ENTRY POINT
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  function calculate() {
    var capital        = parseFloat(document.getElementById('capital').value)        || 0;
    var annualInterest = (parseFloat(document.getElementById('interest').value)      || 0) / 100;
    var monthlyRate    = annualInterest / 12;
    var termYears      = parseInt(document.getElementById('term').value, 10)         || 25;
    var extraSavings   = parseFloat(document.getElementById('extra-savings').value)  || 0;
    var savingsRate    = (parseFloat(document.getElementById('savings-rate').value)   || 0) / 100;
    var fundReturn     = (parseFloat(document.getElementById('fund-return').value)    || 0) / 100;

    // Guard: need positive capital & term
    if (capital <= 0 || termYears <= 0) return;

    var results = simulate(capital, monthlyRate, termYears, extraSavings, savingsRate, fundReturn);

    renderCharts(results, termYears);
    renderSummary(results, termYears);
    renderTable(results, termYears, annualInterest, fundReturn);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * INIT
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('calculate-amortization');
    if (!btn) return; // Not on the amortization page

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      calculate();
    });

    // Auto recalculate on input change
    var inputs = document.querySelectorAll('#simulator-amortization input');
    inputs.forEach(function(input) {
      input.addEventListener('input', calculate);
    });

    // Run with default values on load
    calculate();
  });

  // Theme change: re-render chart with updated colors
  window.addEventListener('themechange', function () {
    if (_lastSimData && _lastTermYears) {
      // Chart is rebuilt by ChartConfig.rebuildAll() via the registry.
      // We only need to refresh summary cards (static HTML, but colors
      // and text don't depend on theme, so nothing extra needed).
    }
  });
})();
