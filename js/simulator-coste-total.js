/**
 * FinLAR — Simulator 3: Total Mortgage Cost and Bindings Simulator
 * ==============================================================
 * Compares the real financial impact of linked products across 3 banks.
 * Calculates effective TIN, monthly payment (French system), accumulated
 * costs of insurance with compound interest inflation rate, and overall cost.
 *
 * Depends on: charts-config.js, Chart.js v4
 */
;(function () {
  'use strict';

  var CHART_ID = 'cost-comparison-chart';
  var calculatedData = []; // Cache calculation results to easily render charts/tables

  /* ── Math Helpers ── */

  /**
   * French amortization monthly payment.
   * @param {number} P  Principal
   * @param {number} r  Monthly interest rate (decimal, not %)
   * @param {number} n  Number of months
   * @returns {number}
   */
  function calculateMonthlyPayment(P, r, n) {
    if (r === 0) return P / n;
    return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  /**
   * Compounded accumulated cost of a linked product.
   * Formula: P_y = P_1 * (1 + k)^(y-1) summed for y from 1 to Plazo
   * @param {number} baseCost Cost in year 1
   * @param {number} rate Annual increase rate (decimal, e.g. 0.02 for 2%)
   * @param {number} years Total term in years
   * @returns {number}
   */
  function calculateAccumulatedCost(baseCost, rate, years) {
    var total = 0;
    for (var y = 1; y <= years; y++) {
      total += baseCost * Math.pow(1 + rate, y - 1);
    }
    return total;
  }

  /**
   * Net Present Value (NPV) helper for monthly cash flows.
   */
  function calculateNPV(rate, cashFlows) {
    var npv = 0;
    for (var t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
  }

  /**
   * Internal Rate of Return (IRR) monthly solver.
   * Uses Secant method with Bisection fallback.
   */
  function calculateIRR(cashFlows) {
    var maxIterations = 150;
    var tolerance = 1e-7;
    
    // Initial guesses (approx. 0.1% and 1% monthly interest)
    var x0 = 0.001;
    var x1 = 0.01;
    
    var f0 = calculateNPV(x0, cashFlows);
    var f1 = calculateNPV(x1, cashFlows);
    
    for (var i = 0; i < maxIterations; i++) {
      if (Math.abs(f1 - f0) < 1e-12) {
        break;
      }
      
      var x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
      
      if (Math.abs(x2 - x1) < tolerance) {
        return x2;
      }
      
      x0 = x1;
      f0 = f1;
      x1 = x2;
      f1 = calculateNPV(x1, cashFlows);
    }
    
    // Bisection fallback
    var low = -0.99;
    var high = 2.0;
    var fLow = calculateNPV(low, cashFlows);
    var fHigh = calculateNPV(high, cashFlows);
    
    if (fLow * fHigh < 0) {
      for (var j = 0; j < 100; j++) {
        var mid = (low + high) / 2;
        var fMid = calculateNPV(mid, cashFlows);
        if (Math.abs(fMid) < 1e-6 || (high - low) / 2 < tolerance) {
          return mid;
        }
        if (fMid * fLow > 0) {
          low = mid;
          fLow = fMid;
        } else {
          high = mid;
        }
      }
    }
    
    return x1;
  }

  /* ── Data Retrieval and Calculation ── */

  function doCalculation() {
    var capital = parseFloat(document.getElementById('global-capital').value) || 0;
    var termYears = parseInt(document.getElementById('global-term').value, 10) || 0;
    var termMonths = termYears * 12;

    var opTypeInput = document.querySelector('input[name="operation-type"]:checked');
    var opType = opTypeInput ? opTypeInput.value : 'nueva';
    var cancelationCosts = 0;
    if (opType === 'subrogacion') {
      cancelationCosts = parseFloat(document.getElementById('cancelation-costs').value) || 0;
    }

    calculatedData = [];

    var bankCards = document.querySelectorAll('.bank-card');
    bankCards.forEach(function (card, index) {
      var bankIndex = parseInt(card.getAttribute('data-bank-index'), 10);
      var name = card.querySelector('.bank-name').value || ('Banco ' + String.fromCharCode(65 + bankIndex));
      var baseTin = parseFloat(card.querySelector('.bank-base-tin').value) || 0;

      var effectiveTin = baseTin;
      var totalInsuranceCost = 0;
      var totalOtherCost = 0;

      // Loop through each binding product (row)
      var rows = card.querySelectorAll('.vinculacion-row');
      var bindingsData = [];

      rows.forEach(function (row) {
        var isChecked = row.querySelector('.vinc-checkbox').checked;
        var nameLabel = row.querySelector('.vinc-name-label').textContent.trim();
        var penalization = parseFloat(row.querySelector('.vinc-penalizacion').value) || 0;
        var cost = parseFloat(row.querySelector('.vinc-coste').value) || 0;
        var costExtInput = row.querySelector('.vinc-coste-externo');
        var costExt = costExtInput ? parseFloat(costExtInput.value) || 0 : 0;
        var period = row.querySelector('.vinc-periodo').value;
        var increaseRate = (parseFloat(row.querySelector('.vinc-incremento').value) || 0) / 100;

        // If NOT checked, apply TIN penalization
        if (!isChecked) {
          effectiveTin += penalization;
        }

        // Calculate accumulated cost (Coste Banco if checked, Coste Externo if unchecked)
        var activeCost = isChecked ? cost : costExt;
        var accumulatedCost = 0;
        if (activeCost > 0) {
          var firstYearCost = period === 'mensual' ? activeCost * 12 : activeCost;
          accumulatedCost = calculateAccumulatedCost(firstYearCost, increaseRate, termYears);
        }

        var isInsurance = nameLabel.toLowerCase().indexOf('seguro') !== -1 || 
                          row.getAttribute('data-vinc-id') === 'hogar' || 
                          row.getAttribute('data-vinc-id') === 'vida';

        if (isInsurance) {
          totalInsuranceCost += accumulatedCost;
        } else {
          totalOtherCost += accumulatedCost;
        }

        bindingsData.push({
          name: nameLabel,
          isChecked: isChecked,
          penalization: penalization,
          cost: cost,
          costExt: costExt,
          period: period,
          increaseRate: increaseRate,
          accumulatedCost: accumulatedCost,
          isInsurance: isInsurance
        });
      });

      // Calculate Mortgage Payment
      var monthlyRate = (effectiveTin / 100) / 12;
      var monthlyQuota = 0;
      if (termMonths > 0) {
        monthlyQuota = calculateMonthlyPayment(capital, monthlyRate, termMonths);
      }

      var totalMortgageCost = monthlyQuota * termMonths;
      var totalInterest = Math.max(totalMortgageCost - capital, 0);
      
      var bankCancelationCosts = 0;
      if (opType === 'subrogacion') {
        bankCancelationCosts = (bankIndex === 0) ? 0 : cancelationCosts;
      }
      var grandTotalCost = totalMortgageCost + totalInsuranceCost + totalOtherCost + bankCancelationCosts;

      // Calculate TAE Global using cash flows
      var cashFlows = [];
      // Mes 0: +Capital - cancelationCosts (disbursement net)
      cashFlows.push(capital - bankCancelationCosts);

      for (var m = 1; m <= termMonths; m++) {
        var currentYear = Math.ceil(m / 12);
        var monthlyBindingsCost = 0;

        bindingsData.forEach(function (bind) {
          var activeCost = bind.isChecked ? bind.cost : bind.costExt;
          if (activeCost > 0) {
            var firstYearCost = bind.period === 'mensual' ? activeCost * 12 : activeCost;
            var yearlyCost = firstYearCost * Math.pow(1 + bind.increaseRate, currentYear - 1);
            monthlyBindingsCost += yearlyCost / 12;
          }
        });

        // Cash flow is negative (payment)
        cashFlows.push(-(monthlyQuota + monthlyBindingsCost));
      }

      var irrMonthly = 0;
      var taeGlobal = 0;
      if (termMonths > 0 && capital > 0) {
        irrMonthly = calculateIRR(cashFlows);
        if (!isNaN(irrMonthly)) {
          taeGlobal = (Math.pow(1 + irrMonthly, 12) - 1) * 100;
        }
      }

      calculatedData.push({
        index: bankIndex,
        name: name,
        baseTin: baseTin,
        effectiveTin: effectiveTin,
        taeGlobal: taeGlobal,
        monthlyQuota: monthlyQuota,
        totalMortgageCost: totalMortgageCost,
        totalInterest: totalInterest,
        totalInsuranceCost: totalInsuranceCost,
        totalOtherCost: totalOtherCost,
        cancelationCosts: bankCancelationCosts,
        grandTotalCost: grandTotalCost,
        bindings: bindingsData
      });
    });

    // Render components
    renderComparisonCards();
    renderChart();
    renderAmortizationTable();
  }

  /* ── Rendering Functions ── */

  function renderComparisonCards() {
    var container = document.getElementById('comparison-results-cards');
    if (!container) return;

    if (calculatedData.length === 0) return;

    var opTypeInput = document.querySelector('input[name="operation-type"]:checked');
    var opType = opTypeInput ? opTypeInput.value : 'nueva';

    // Find the best option (lowest grandTotalCost)
    var bestIndex = 0;
    var lowestCost = Infinity;
    calculatedData.forEach(function (data, idx) {
      if (data.grandTotalCost < lowestCost && data.grandTotalCost > 0) {
        lowestCost = data.grandTotalCost;
        bestIndex = idx;
      }
    });

    var fmt = ChartConfig.formatCurrency;
    var html = '';

    calculatedData.forEach(function (data, idx) {
      var isBest = (idx === bestIndex && data.grandTotalCost > 0);
      var highlightStyle = isBest ? 'border-color: var(--color-smart-cyan); box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);' : '';
      var badgeHtml = isBest ? '<span class="badge badge-cyan" style="position: absolute; top: 16px; right: 16px;">Mejor Opción</span>' : '';

      html += `
        <div class="card" style="position: relative; background: var(--color-luxury-navy); ${highlightStyle}">
          ${badgeHtml}
          <h3 class="card-title mb-16" style="color: ${isBest ? 'var(--color-smart-cyan)' : 'var(--color-pure-white)'}; padding-right: 80px;">
            ${data.name}
          </h3>
          
          <div class="flex flex-col flex-gap-md">
            <div class="grid grid-2" style="gap: var(--space-2); margin: 0;">
              <div class="result-card-inner" style="padding: var(--space-3); min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                <span class="text-muted" style="font-size: 10px; display: block; margin-bottom: 2px; line-height: 1;">TIN EFECTIVO</span>
                <span class="result-highlight" style="color: var(--color-smart-cyan); font-size: 1.15rem; line-height: 1.2;">${data.effectiveTin.toFixed(2)} %</span>
                <span class="text-muted" style="font-size: 9px; display: block; margin-top: 2px; line-height: 1;">Base: ${data.baseTin.toFixed(2)}%</span>
              </div>
              <div class="result-card-inner" style="padding: var(--space-3); min-height: 80px; display: flex; flex-direction: column; justify-content: center; border-color: rgba(99, 102, 241, 0.4); background: rgba(99, 102, 241, 0.05);">
                <span class="text-muted" style="font-size: 10px; display: block; margin-bottom: 2px; line-height: 1;">TAE GLOBAL</span>
                <span class="result-highlight" style="color: #818cf8; font-size: 1.15rem; line-height: 1.2;">${data.taeGlobal.toFixed(2)} %</span>
                <span class="text-muted" style="font-size: 9px; display: block; margin-top: 2px; line-height: 1;">Coste Real</span>
              </div>
            </div>

            <div class="result-card-inner">
              <span class="text-muted" style="font-size: 11px; display: block; margin-bottom: 2px;">CUOTA MENSUAL</span>
              <span class="result-highlight">${fmt(data.monthlyQuota)} /mes</span>
            </div>

            <div class="result-card-inner flex flex-col flex-gap-sm">
              <div class="flex flex-between" style="font-size: 12px;">
                <span class="text-muted">Coste Hipoteca:</span>
                <span class="font-semibold" style="color: var(--color-pure-white);">${fmt(data.totalMortgageCost)}</span>
              </div>
              <div class="flex flex-between" style="font-size: 12px; margin-top: 2px;">
                <span class="text-muted">Coste Seguros:</span>
                <span class="font-semibold" style="color: var(--color-pure-white);">${fmt(data.totalInsuranceCost)}</span>
              </div>
              <div class="flex flex-between" style="font-size: 12px; margin-top: 2px;">
                <span class="text-muted">Otras Vinculac.:</span>
                <span class="font-semibold" style="color: var(--color-pure-white);">${fmt(data.totalOtherCost)}</span>
              </div>
              ${opType === 'subrogacion' ? `
              <div class="flex flex-between" style="font-size: 12px; margin-top: 2px;">
                <span class="text-muted">Gastos Cancelación:</span>
                <span class="font-semibold" style="color: ${data.index === 0 ? 'var(--color-success)' : 'var(--color-pure-white)'};">
                  ${data.index === 0 ? '0 € (Banco actual)' : fmt(data.cancelationCosts)}
                </span>
              </div>
              ` : ''}
            </div>

            <div class="result-card-inner" style="background: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.2);">
              <span class="text-muted" style="font-size: 11px; display: block; margin-bottom: 2px;">GRAN COSTE TOTAL</span>
              <span class="result-highlight gradient-text" style="font-size: 1.4rem;">${fmt(data.grandTotalCost)}</span>
              <span class="text-muted" style="font-size: 10px; display: block; margin-top: 4px;">Capital + Intereses + Gastos vinculaciones</span>
            </div>
          </div>
        </div>
      `;

      // Update select option names dynamically
      var select = document.getElementById('amortization-bank-select');
      if (select && select.options[idx]) {
        select.options[idx].text = data.name;
      }
    });

    container.innerHTML = html;
  }

  function renderChart() {
    var canvas = document.getElementById(CHART_ID);
    if (!canvas) return;

    var labels = [];
    var principalData = [];
    var interestData = [];
    var insuranceData = [];
    var otherData = [];
    var cancelationData = [];

    var capital = parseFloat(document.getElementById('global-capital').value) || 0;

    calculatedData.forEach(function (data) {
      labels.push(data.name);
      principalData.push(capital);
      interestData.push(data.totalInterest);
      insuranceData.push(data.totalInsuranceCost);
      otherData.push(data.totalOtherCost);
      cancelationData.push(data.cancelationCosts || 0);
    });

    function buildChart() {
      ChartConfig.destroyChart(CHART_ID);

      var c = ChartConfig.getColors();

      var chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: (function () {
            var opTypeInput = document.querySelector('input[name="operation-type"]:checked');
            var opType = opTypeInput ? opTypeInput.value : 'nueva';
            var list = [
              {
                label: 'Préstamo (Capital)',
                data: principalData,
                backgroundColor: c.blue + 'cc',
                borderColor: c.blue,
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Intereses',
                data: interestData,
                backgroundColor: c.amber + 'cc',
                borderColor: c.amber,
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Seguros',
                data: insuranceData,
                backgroundColor: c.cyan + 'cc',
                borderColor: c.cyan,
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Otros vinculados',
                data: otherData,
                backgroundColor: c.green + 'cc',
                borderColor: c.green,
                borderWidth: 1,
                borderRadius: 4
              }
            ];
            if (opType === 'subrogacion') {
              list.push({
                label: 'Gastos cancelación',
                data: cancelationData,
                backgroundColor: c.red + 'cc',
                borderColor: c.red,
                borderWidth: 1,
                borderRadius: 4
              });
            }
            return list;
          })()
        },
        options: Object.assign({}, ChartConfig.getDefaultOptions('Comparación de Gran Coste Total'), {
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: c.text,
                font: { family: "'Outfit', sans-serif", size: 12, weight: '500' }
              },
              grid: { display: false }
            },
            y: {
              stacked: true,
              ticks: {
                color: c.textMuted,
                font: { family: "'Inter', sans-serif", size: 11 },
                callback: function (v) {
                  return ChartConfig.formatCurrency(v);
                }
              },
              grid: { color: c.grid }
            }
          },
          plugins: Object.assign(
            {},
            ChartConfig.getDefaultOptions().plugins,
            {
              title: {
                display: false
              },
              tooltip: Object.assign({}, ChartConfig.getDefaultOptions().plugins.tooltip, {
                callbacks: {
                  label: function (ctx) {
                    return ctx.dataset.label + ': ' + ChartConfig.formatCurrency(ctx.parsed.y);
                  }
                }
              })
            }
          )
        })
      });

      ChartConfig.setInstance(CHART_ID, chart);
      return chart;
    }

    ChartConfig.register(CHART_ID, buildChart);
    buildChart();
  }

  function renderAmortizationTable() {
    var tbody = document.getElementById('amortization-table-body');
    if (!tbody) return;

    var select = document.getElementById('amortization-bank-select');
    if (!select) return;

    var bankIdx = parseInt(select.value, 10);
    var bankData = calculatedData.find(function (d) { return d.index === bankIdx; });
    if (!bankData) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay datos disponibles</td></tr>';
      return;
    }

    var capital = parseFloat(document.getElementById('global-capital').value) || 0;
    var termYears = parseInt(document.getElementById('global-term').value, 10) || 0;
    var termMonths = termYears * 12;

    if (capital <= 0 || termMonths <= 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Introduce valores válidos para capital y plazo.</td></tr>';
      return;
    }

    var fmt = ChartConfig.formatCurrency;
    var html = '';

    var monthlyRate = (bankData.effectiveTin / 100) / 12;
    var balance = capital;
    var monthlyQuota = bankData.monthlyQuota;

    for (var m = 1; m <= termMonths; m++) {
      var interest = balance * monthlyRate;
      var principal = monthlyQuota - interest;

      if (balance - principal < 0.1 || m === termMonths) {
        principal = balance;
        monthlyQuota = interest + principal;
      }

      // Calculate bindings cost for this specific month
      var currentYear = Math.ceil(m / 12);
      var monthlyBindingsCost = 0;

      bankData.bindings.forEach(function (bind) {
        var activeCost = bind.isChecked ? bind.cost : bind.costExt;
        if (activeCost > 0) {
          var firstYearCost = bind.period === 'mensual' ? activeCost * 12 : activeCost;
          var yearlyCost = firstYearCost * Math.pow(1 + bind.increaseRate, currentYear - 1);
          monthlyBindingsCost += yearlyCost / 12;
        }
      });

      var totalPayment = monthlyQuota + monthlyBindingsCost;
      balance = Math.max(balance - principal, 0);

      // Only render first 60 months (5 years) and then every 12th month to keep performance high,
      // OR render everything inside the scrollable container but limit if needed?
      // Since it has max-height and overflow-y, we can render all, but let's optimize:
      // A standard table of 360 rows loads in ~10ms in modern browsers. Let's render all rows so the scroll is complete!
      html += `
        <tr>
          <td style="padding: var(--space-2) var(--space-3); font-weight: 500; color: var(--color-pure-white);">${m} <span class="text-muted" style="font-size: 10px; font-weight: normal;">(Año ${currentYear})</span></td>
          <td style="padding: var(--space-2) var(--space-3);">${fmt(monthlyQuota)}</td>
          <td style="padding: var(--space-2) var(--space-3); color: var(--color-error);">${fmt(interest)}</td>
          <td style="padding: var(--space-2) var(--space-3); color: var(--color-success);">${fmt(principal)}</td>
          <td style="padding: var(--space-2) var(--space-3);">${fmt(monthlyBindingsCost)}</td>
          <td style="padding: var(--space-2) var(--space-3); font-weight: 600; color: var(--color-pure-white);">${fmt(totalPayment)}</td>
          <td style="padding: var(--space-2) var(--space-3);">${fmt(balance)}</td>
        </tr>
      `;
    }

    tbody.innerHTML = html;
  }

  /* ── Custom bindings addition ── */

  function addCustomVinc(button) {
    var card = button.closest('.bank-card');
    if (!card) return;

    var nameInput = card.querySelector('.custom-name');
    var penInput = card.querySelector('.custom-penalizacion');
    var costInput = card.querySelector('.custom-coste');
    var costExtInput = card.querySelector('.custom-coste-externo');
    var periodSelect = card.querySelector('.custom-periodo');
    var incInput = card.querySelector('.custom-incremento');

    var name = nameInput.value.trim();
    if (!name) {
      alert('Por favor, introduce un nombre para la vinculación personalizada.');
      nameInput.focus();
      return;
    }

    var penalization = parseFloat(penInput.value) || 0;
    var cost = parseFloat(costInput.value) || 0;
    var costExt = costExtInput ? parseFloat(costExtInput.value) || 0 : 0;
    var period = periodSelect.value;
    var increment = parseFloat(incInput.value) || 0;

    var listContainer = card.querySelector('.vinculaciones-list');
    if (!listContainer) return;

    var customId = 'custom-' + Date.now();
    var newRow = document.createElement('div');
    newRow.className = 'vinculacion-row';
    newRow.setAttribute('data-vinc-id', customId);

    newRow.innerHTML = `
      <div class="vinc-header flex flex-between">
          <label class="flex flex-center flex-gap-sm" style="cursor: pointer;">
              <input type="checkbox" class="vinc-checkbox" checked>
              <span class="vinc-name-label font-semibold" style="color: var(--color-pure-white);">${name}</span>
          </label>
          <div class="flex flex-center flex-gap-sm">
              <span class="vinc-status-badge vinc-badge-active">Contratado</span>
              <a href="#" class="btn-delete-vinc flex flex-center" title="Eliminar vinculación"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></a>
          </div>
      </div>
      <div style="overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; margin-top: var(--space-2); padding-bottom: 4px;">
          <div class="vinc-inputs-grid" style="min-width: 460px; display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); margin-top: 0; border-bottom: none;">
              <div class="form-group-compact">
                  <label>Penaliz. TIN</label>
                  <input type="number" class="input input-sm vinc-penalizacion" value="${penalization.toFixed(2)}" step="0.05" min="0">
              </div>
              <div class="form-group-compact">
                  <label>Coste Banco</label>
                  <input type="number" class="input input-sm vinc-coste" value="${cost.toFixed(0)}" step="1" min="0">
              </div>
              <div class="form-group-compact">
                  <label>Coste Externo</label>
                  <input type="number" class="input input-sm vinc-coste-externo" value="${costExt.toFixed(0)}" step="1" min="0">
              </div>
              <div class="form-group-compact">
                  <label>Periodo</label>
                  <select class="input input-sm vinc-periodo">
                      <option value="anual" ${period === 'anual' ? 'selected' : ''}>Anual</option>
                      <option value="mensual" ${period === 'mensual' ? 'selected' : ''}>Mensual</option>
                  </select>
              </div>
              <div class="form-group-compact">
                  <label>Inc. Anual</label>
                  <input type="number" class="input input-sm vinc-incremento" value="${increment.toFixed(1)}" step="0.1" min="0">
              </div>
          </div>
      </div>
    `;

    listContainer.appendChild(newRow);

    // Clear custom form fields
    nameInput.value = '';
    penInput.value = '0.10';
    costInput.value = '100';
    if (costExtInput) costExtInput.value = '0';
    periodSelect.value = 'anual';
    incInput.value = '2.0';

    // Rerender icons and recalculate
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    doCalculation();
  }

  /* ── Event bindings ── */

  /* ── Excel Export ── */

  function downloadExcel() {
    if (calculatedData.length === 0) return;
    
    var opTypeInput = document.querySelector('input[name="operation-type"]:checked');
    var opType = opTypeInput ? opTypeInput.value : 'nueva';
    
    // Crear el libro Excel
    var wb = XLSX.utils.book_new();
    
    // Pestaña 1: Resumen Comparativo
    var resumeData = [
      ["Concepto"]
    ];
    
    calculatedData.forEach(function(bank) {
      var displayName = bank.name;
      if (opType === 'subrogacion') {
        displayName += (bank.index === 0) ? " (Hipoteca Actual)" : " (Nueva Oferta)";
      }
      resumeData[0].push(displayName);
    });
    
    var rowBaseTin = ["TIN Base (%)"];
    var rowEffectiveTin = ["TIN Efectivo (%)"];
    var rowTaeGlobal = ["TAE Global (%)"];
    var rowMonthlyQuota = ["Cuota mensual (€)"];
    var rowCancelation = ["Gastos cancelación (€)"];
    var rowInsurance = ["Coste seguros total (€)"];
    var rowOther = ["Otras vinculaciones total (€)"];
    var rowMortgage = ["Coste de hipoteca total (€)"];
    var rowGrandTotal = ["Gran Coste Total (€)"];
    
    calculatedData.forEach(function(bank) {
      rowBaseTin.push(parseFloat(bank.baseTin.toFixed(2)));
      rowEffectiveTin.push(parseFloat(bank.effectiveTin.toFixed(2)));
      rowTaeGlobal.push(parseFloat(bank.taeGlobal.toFixed(2)));
      rowMonthlyQuota.push(parseFloat(bank.monthlyQuota.toFixed(2)));
      rowCancelation.push(parseFloat((bank.cancelationCosts || 0).toFixed(2)));
      rowInsurance.push(parseFloat(bank.totalInsuranceCost.toFixed(2)));
      rowOther.push(parseFloat(bank.totalOtherCost.toFixed(2)));
      rowMortgage.push(parseFloat(bank.totalMortgageCost.toFixed(2)));
      rowGrandTotal.push(parseFloat(bank.grandTotalCost.toFixed(2)));
    });
    
    resumeData.push(rowBaseTin);
    resumeData.push(rowEffectiveTin);
    resumeData.push(rowTaeGlobal);
    resumeData.push(rowMonthlyQuota);
    if (opType === 'subrogacion') {
      resumeData.push(rowCancelation);
    }
    resumeData.push(rowInsurance);
    resumeData.push(rowOther);
    resumeData.push(rowMortgage);
    resumeData.push(rowGrandTotal);
    
    var wsResume = XLSX.utils.aoa_to_sheet(resumeData);
    XLSX.utils.book_append_sheet(wb, wsResume, "Resumen Comparativo");
    
    // Pestaña 2: Amortización Comparativa (Anual)
    var capital = parseFloat(document.getElementById('global-capital').value) || 0;
    var termYears = parseInt(document.getElementById('global-term').value, 10) || 0;
    var termMonths = termYears * 12;
    
    var amortHeaders = ["Año"];
    calculatedData.forEach(function(bank) {
      var suffix = "";
      if (opType === 'subrogacion') {
        suffix = bank.index === 0 ? " (Actual)" : " (Oferta)";
      }
      amortHeaders.push(
        bank.name + suffix + " - Cuota Hip. (€)",
        bank.name + suffix + " - Interés (€)",
        bank.name + suffix + " - Amortizado (€)",
        bank.name + suffix + " - Vinculac. (€)",
        bank.name + suffix + " - Pago Total (€)",
        bank.name + suffix + " - Pendiente (€)"
      );
    });
    
    var annualAmortization = [];
    var balances = calculatedData.map(function() { return capital; });
    var monthlyRates = calculatedData.map(function(bank) { return (bank.effectiveTin / 100) / 12; });
    var monthlyQuotas = calculatedData.map(function(bank) { return bank.monthlyQuota; });
    
    for (var y = 1; y <= termYears; y++) {
      var row = [y];
      
      calculatedData.forEach(function(bank, bIdx) {
        var rate = monthlyRates[bIdx];
        var quota = monthlyQuotas[bIdx];
        var balance = balances[bIdx];
        
        var yearQuota = 0;
        var yearInterest = 0;
        var yearPrincipal = 0;
        var yearBindings = 0;
        
        for (var m = 1; m <= 12; m++) {
          var monthIndex = (y - 1) * 12 + m;
          if (monthIndex > termMonths) break;
          
          var interest = balance * rate;
          var principal = quota - interest;
          
          if (balance - principal < 0.1 || monthIndex === termMonths) {
            principal = balance;
            quota = interest + principal;
          }
          
          var monthlyBindingsCost = 0;
          bank.bindings.forEach(function (bind) {
            var activeCost = bind.isChecked ? bind.cost : bind.costExt;
            if (activeCost > 0) {
              var firstYearCost = bind.period === 'mensual' ? activeCost * 12 : activeCost;
              var yearlyCost = firstYearCost * Math.pow(1 + bind.increaseRate, y - 1);
              monthlyBindingsCost += yearlyCost / 12;
            }
          });
          
          yearQuota += quota;
          yearInterest += interest;
          yearPrincipal += principal;
          yearBindings += monthlyBindingsCost;
          
          balance = Math.max(balance - principal, 0);
        }
        
        balances[bIdx] = balance;
        var yearTotalPayment = yearQuota + yearBindings;
        
        row.push(
          parseFloat(yearQuota.toFixed(2)),
          parseFloat(yearInterest.toFixed(2)),
          parseFloat(yearPrincipal.toFixed(2)),
          parseFloat(yearBindings.toFixed(2)),
          parseFloat(yearTotalPayment.toFixed(2)),
          parseFloat(balance.toFixed(2))
        );
      });
      
      annualAmortization.push(row);
    }
    
    var amortData = [amortHeaders].concat(annualAmortization);
    var wsAmort = XLSX.utils.aoa_to_sheet(amortData);
    XLSX.utils.book_append_sheet(wb, wsAmort, "Amortización Comparativa");
    
    XLSX.writeFile(wb, "comparativa_hipotecas.xlsx");
  }

  /* ── Event bindings ── */

  document.addEventListener('DOMContentLoaded', function () {
    var capital = document.getElementById('global-capital');
    if (!capital) return; // Not on the coste-total page

    // Input listeners for real-time recalculations
    capital.addEventListener('input', doCalculation);
    document.getElementById('global-term').addEventListener('input', doCalculation);

    var selectAmortization = document.getElementById('amortization-bank-select');
    if (selectAmortization) {
      selectAmortization.addEventListener('change', renderAmortizationTable);
    }

    // operation-type and cancelation costs listeners
    var opTypeRadios = document.querySelectorAll('input[name="operation-type"]');
    opTypeRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var cancelContainer = document.getElementById('cancelation-costs-container');
        var legalPanel = document.getElementById('legal-explanation-panel');
        var roleBadges = document.querySelectorAll('.bank-role-badge');
        if (this.value === 'subrogacion') {
          if (cancelContainer) cancelContainer.style.display = 'block';
          if (legalPanel) legalPanel.style.display = 'block';
          roleBadges.forEach(function (badge) {
            badge.style.display = 'inline-block';
          });
        } else {
          if (cancelContainer) cancelContainer.style.display = 'none';
          if (legalPanel) legalPanel.style.display = 'none';
          roleBadges.forEach(function (badge) {
            badge.style.display = 'none';
          });
        }
        doCalculation();
      });
    });

    // Inicializar visibilidad según el tipo de operación seleccionado al cargar
    var initialOpType = document.querySelector('input[name="operation-type"]:checked');
    if (initialOpType) {
      var cancelContainer = document.getElementById('cancelation-costs-container');
      var legalPanel = document.getElementById('legal-explanation-panel');
      var roleBadges = document.querySelectorAll('.bank-role-badge');
      if (initialOpType.value === 'subrogacion') {
        if (cancelContainer) cancelContainer.style.display = 'block';
        if (legalPanel) legalPanel.style.display = 'block';
        roleBadges.forEach(function (badge) {
          badge.style.display = 'inline-block';
        });
      } else {
        if (cancelContainer) cancelContainer.style.display = 'none';
        if (legalPanel) legalPanel.style.display = 'none';
        roleBadges.forEach(function (badge) {
          badge.style.display = 'none';
        });
      }
    }

    var cancelCostsInput = document.getElementById('cancelation-costs');
    if (cancelCostsInput) {
      cancelCostsInput.addEventListener('input', doCalculation);
    }

    // Excel download button listener
    var downloadBtn = document.getElementById('download-excel-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadExcel);
    }

    var banksContainer = document.getElementById('banks-container');
    if (banksContainer) {
      // Event delegation for checkbox changes, inputs, deletions and custom adds
      banksContainer.addEventListener('input', function (e) {
        if (e.target.classList.contains('vinc-checkbox')) {
          var row = e.target.closest('.vinculacion-row');
          var badge = row.querySelector('.vinc-status-badge');
          if (badge) {
            if (e.target.checked) {
              badge.textContent = 'Contratado';
              badge.className = 'vinc-status-badge vinc-badge-active';
            } else {
              badge.textContent = 'No contratado';
              badge.className = 'vinc-status-badge vinc-badge-inactive';
            }
          }
        }
        doCalculation();
      });

      banksContainer.addEventListener('change', function () {
        doCalculation();
      });

      banksContainer.addEventListener('click', function (e) {
        var deleteBtn = e.target.closest('.btn-delete-vinc');
        if (deleteBtn) {
          e.preventDefault();
          var row = deleteBtn.closest('.vinculacion-row');
          if (row) {
            row.parentNode.removeChild(row);
            doCalculation();
          }
        }

        var addBtn = e.target.closest('.btn-add-custom-vinc');
        if (addBtn) {
          e.preventDefault();
          addCustomVinc(addBtn);
        }
      });
    }

    // Modal de Ayuda
    var helpBtn = document.getElementById('floating-help-btn');
    var helpOverlay = document.getElementById('help-modal-overlay');
    var helpClose = document.getElementById('help-modal-close');

    if (helpBtn && helpOverlay && helpClose) {
      helpBtn.addEventListener('click', function () {
        helpOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });

      helpClose.addEventListener('click', function () {
        helpOverlay.style.display = 'none';
        document.body.style.overflow = '';
      });

      helpOverlay.addEventListener('click', function (e) {
        if (e.target === helpOverlay) {
          helpOverlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Run initially
    doCalculation();
  });
})();
