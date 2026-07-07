/**
 * FinLAR — Análisis de Capacidad Financiera
 * ==========================================
 * Toda la lógica de cálculo, quiz de perfil inversor,
 * comparador de plazos y glosario hipotecario.
 */
;(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────
   * DATOS: Tipos de impuesto por comunidad autónoma
   * ──────────────────────────────────────────────────────── */
  var ITP_RATES = {
    AND: { segunda: 0.07, nueva_ajd: 0.015, label: 'Andalucía' },
    ARA: { segunda: 0.08, nueva_ajd: 0.010, label: 'Aragón' },
    AST: { segunda: 0.08, nueva_ajd: 0.012, label: 'Asturias' },
    BAL: { segunda: 0.08, nueva_ajd: 0.012, label: 'Baleares' },
    CAN: { segunda: 0.065, nueva_ajd: 0.010, label: 'Canarias', especial: 'IGIC 6.5% (en vez de IVA 10%)' },
    CANT: { segunda: 0.09, nueva_ajd: 0.015, label: 'Cantabria' },
    CLM: { segunda: 0.09, nueva_ajd: 0.015, label: 'Castilla-La Mancha' },
    CYL: { segunda: 0.08, nueva_ajd: 0.015, label: 'Castilla y León' },
    CAT: { segunda: 0.10, nueva_ajd: 0.015, label: 'Cataluña' },
    VAL: { segunda: 0.09, nueva_ajd: 0.015, label: 'Comunitat Valenciana' },
    EXT: { segunda: 0.08, nueva_ajd: 0.015, label: 'Extremadura' },
    GAL: { segunda: 0.08, nueva_ajd: 0.015, label: 'Galicia' },
    MAD: { segunda: 0.06, nueva_ajd: 0.007, label: 'Madrid' },
    MUR: { segunda: 0.08, nueva_ajd: 0.015, label: 'Murcia' },
    NAV: { segunda: 0.06, nueva_ajd: 0.005, label: 'Navarra' },
    PV:  { segunda: 0.07, nueva_ajd: 0.000, label: 'País Vasco' },
    RIO: { segunda: 0.07, nueva_ajd: 0.010, label: 'La Rioja' }
  };

  /* ────────────────────────────────────────────────────────
   * UTILS: Formateo de moneda y porcentaje
   * ──────────────────────────────────────────────────────── */
  function fmt(n) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  }
  function fmtPct(n) {
    return n.toFixed(1) + '%';
  }

  /* ────────────────────────────────────────────────────────
   * CÁLCULO: Cuota hipotecaria mensual (sistema francés)
   * Fórmula: C = P * [r(1+r)^n] / [(1+r)^n - 1]
   * P = principal, r = tipo mensual, n = num meses
   * ──────────────────────────────────────────────────────── */
  function calcCuota(principal, tinAnual, anios) {
    var r = tinAnual / 100 / 12;
    var n = anios * 12;
    if (r === 0) return principal / n;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  /* Helper para cálculo por tramos de ITP progresivo */
  function calcTramo(valor, tramos) {
    var impuesto = 0;
    for (var i = 0; i < tramos.length; i++) {
      var limite = tramos[i].limite;
      var tipo = tramos[i].tipo;
      var anteriorLimite = i > 0 ? tramos[i-1].limite : 0;
      
      if (valor > limite) {
        impuesto += (limite - anteriorLimite) * tipo;
      } else {
        impuesto += (valor - anteriorLimite) * tipo;
        break;
      }
    }
    return impuesto;
  }

  /* ────────────────────────────────────────────────────────
   * CÁLCULO: Gastos de compraventa
   * ──────────────────────────────────────────────────────── */
  function calcGastos(precio, tipoVivienda, comunidad, esHabitual, esColectivo) {
    var ccaa = ITP_RATES[comunidad] || ITP_RATES.MAD;
    var gastos = {};
    var total = 0;

    if (tipoVivienda === 'segunda') {
      var itp = 0;
      var descITP = '';
      if (comunidad === 'PV') {
        var tasa = esHabitual ? 0.04 : 0.07;
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% Habitual)';
      } else if (comunidad === 'GAL') {
        var tasa = 0.08;
        if (precio < 240000) {
          tasa = esColectivo ? 0.03 : (esHabitual ? 0.07 : 0.08);
        }
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% ' + (tasa < 0.08 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'AND') {
        var tasa = 0.07;
        if (esColectivo && precio <= 150000) {
          tasa = 0.035;
        }
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(1) + '% ' + (tasa < 0.07 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'MAD') {
        var tasa = (esColectivo && esHabitual) ? 0.04 : 0.06;
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% ' + (tasa < 0.06 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'CAN') {
        var tasa = 0.065;
        if (precio <= 150000) {
          tasa = esColectivo ? 0.04 : (esHabitual ? 0.05 : 0.065);
        }
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(1) + '% ' + (tasa < 0.065 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'MUR') {
        var tasa = 0.08;
        if (esColectivo && precio <= 150000) {
          tasa = 0.03;
        }
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% ' + (tasa < 0.08 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'RIO') {
        var tasa = 0.07;
        if (esColectivo && precio <= 150000) {
          tasa = 0.03;
        }
        itp = precio * tasa;
        descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% ' + (tasa < 0.07 ? 'Bonificado' : 'General') + ')';
      } else if (comunidad === 'VAL') {
        if (precio <= 180000) {
          var tasa = esColectivo ? 0.04 : (esHabitual ? 0.08 : 0.09);
          itp = precio * tasa;
          descITP = 'ITP — ' + ccaa.label + ' (' + (tasa * 100).toFixed(0) + '% ' + (tasa < 0.09 ? 'Bonificado' : 'General') + ')';
        } else {
          var tramos = [
            { limite: 1000000, tipo: 0.09 },
            { limite: Infinity, tipo: 0.11 }
          ];
          itp = calcTramo(precio, tramos);
          descITP = 'ITP — ' + ccaa.label + ' (Escala 9%-11%)';
        }
      } else if (comunidad === 'CAT') {
        if (esColectivo && esHabitual) {
          var tasa = 0.05;
          itp = precio * tasa;
          descITP = 'ITP — ' + ccaa.label + ' (5% Colectivo Bonificado)';
        } else {
          var tramos = [
            { limite: 600000, tipo: 0.10 },
            { limite: 900000, tipo: 0.11 },
            { limite: 1500000, tipo: 0.12 },
            { limite: Infinity, tipo: 0.13 }
          ];
          itp = calcTramo(precio, tramos);
          descITP = 'ITP — ' + ccaa.label + ' (Escala 10%-13%)';
        }
      } else if (comunidad === 'ARA') {
        var tramos = [
          { limite: 400000, tipo: 0.08 },
          { limite: 450000, tipo: 0.085 },
          { limite: 500000, tipo: 0.09 },
          { limite: 750000, tipo: 0.095 },
          { limite: Infinity, tipo: 0.10 }
        ];
        itp = calcTramo(precio, tramos);
        descITP = 'ITP — ' + ccaa.label + ' (Escala 8%-10%)';
      } else if (comunidad === 'AST') {
        var tramos = [
          { limite: 300000, tipo: 0.08 },
          { limite: 500000, tipo: 0.09 },
          { limite: Infinity, tipo: 0.10 }
        ];
        itp = calcTramo(precio, tramos);
        descITP = 'ITP — ' + ccaa.label + ' (Escala 8%-10%)';
      } else if (comunidad === 'CYL') {
        var tramos = [
          { limite: 250000, tipo: 0.08 },
          { limite: Infinity, tipo: 0.10 }
        ];
        itp = calcTramo(precio, tramos);
        descITP = 'ITP — ' + ccaa.label + ' (Escala 8%-10%)';
      } else if (comunidad === 'EXT') {
        var tramos = [
          { limite: 360000, tipo: 0.08 },
          { limite: 600000, tipo: 0.10 },
          { limite: Infinity, tipo: 0.11 }
        ];
        itp = calcTramo(precio, tramos);
        descITP = 'ITP — ' + ccaa.label + ' (Escala 8%-11%)';
      } else if (comunidad === 'BAL') {
        var tramos = [
          { limite: 400000, tipo: 0.08 },
          { limite: 600000, tipo: 0.09 },
          { limite: 1000000, tipo: 0.10 },
          { limite: 2000000, tipo: 0.12 },
          { limite: Infinity, tipo: 0.13 }
        ];
        itp = calcTramo(precio, tramos);
        descITP = 'ITP — ' + ccaa.label + ' (Escala 8%-13%)';
      } else {
        itp = precio * ccaa.segunda;
        descITP = 'ITP — ' + ccaa.label + ' (' + (ccaa.segunda * 100).toFixed(1) + '%)';
      }
      gastos[descITP] = itp;
      total += itp;
    } else if (tipoVivienda === 'nueva') {
      var iva = comunidad === 'CAN' ? precio * 0.065 : precio * 0.10;
      var ajd = precio * ccaa.nueva_ajd;
      gastos[comunidad === 'CAN' ? 'IGIC (6.5%)' : 'IVA (10%)'] = iva;
      if (ajd > 0) gastos['AJD — ' + ccaa.label + ' (' + (ccaa.nueva_ajd * 100).toFixed(1) + '%)'] = ajd;
      total += iva + ajd;
    } else {
      // VPO: IVA reducido 4%
      var iva_vpo = precio * 0.04;
      gastos['IVA reducido VPO (4%)'] = iva_vpo;
      total += iva_vpo;
    }

    // Gastos fijos estimados
    var notaria = Math.min(Math.max(precio * 0.004, 700), 2000);
    var registro = Math.min(Math.max(precio * 0.002, 300), 800);
    var gestoria = 450;
    var tasacion = 350;

    gastos['Notaría (estimado)'] = notaria;
    gastos['Registro de la Propiedad (estimado)'] = registro;
    gastos['Gestoría (estimado)'] = gestoria;
    gastos['Tasación hipotecaria (estimado)'] = tasacion;

    total += notaria + registro + gestoria + tasacion;

    return { lineas: gastos, total: total };
  }

  /* ────────────────────────────────────────────────────────
   * WIZARD: Gestión de secciones y navegación
   * ──────────────────────────────────────────────────────── */
  var currentSection = 0;
  var maxSectionVisited = 0;

  window.goToSection = function (idx) {
    if (idx > maxSectionVisited) {
      maxSectionVisited = idx;
    }

    // Ocultar sección actual
    var sections = document.querySelectorAll('.analysis-section');
    sections.forEach(function (s) { s.classList.remove('active'); });

    // Activar nueva sección
    var target = document.getElementById('section-' + idx);
    if (target) target.classList.add('active');

    // Actualizar navegación
    var navItems = document.querySelectorAll('.progress-nav-item');
    navItems.forEach(function (btn, i) {
      btn.classList.remove('active', 'done');
      if (i === idx) {
        btn.classList.add('active');
      } else if (i <= maxSectionVisited) {
        btn.classList.add('done');
      }
    });

    currentSection = idx;
    guardarEstado();

    // Si entramos al paso de plazo, generar la tabla
    if (idx === 4) generarTablasPlazos();
    // Si entramos al glosario, generarlo si aún no está
    if (idx === 5 && !document.querySelector('#glosario-container .edu-panel')) generarGlosario();

    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ────────────────────────────────────────────────────────
   * PASO 3: CALCULAR Y MOSTRAR RESULTADOS
   * ──────────────────────────────────────────────────────── */
  window.calcularYMostrar = function (silencioso) {
    // Leer inputs paso 1
    var ingresos    = parseFloat(document.getElementById('ingresos').value) || 0;
    var gastosFijos = parseFloat(document.getElementById('gastos-fijos').value) || 0;
    var otrasDeudas = parseFloat(document.getElementById('otras-deudas').value) || 0;
    var ahorros     = parseFloat(document.getElementById('ahorros').value) || 0;

    // Leer inputs paso 2
    var precio      = parseFloat(document.getElementById('precio-vivienda').value) || 0;
    var tipoVivienda = document.getElementById('tipo-vivienda').value;
    var esHabitual = document.getElementById('es-habitual') ? document.getElementById('es-habitual').checked : true;
    var esColectivo = document.getElementById('es-colectivo') ? document.getElementById('es-colectivo').checked : false;
    var comunidad   = document.getElementById('comunidad').value;
    var importeHip  = parseFloat(document.getElementById('importe-hipoteca').value) || 0;
    var tin         = parseFloat(document.getElementById('tipo-interes').value) || 3.5;
    var plazo       = parseInt(document.getElementById('plazo-hipoteca').value) || 25;

    // ── Gastos de compraventa ──
    var gastos = calcGastos(precio, tipoVivienda, comunidad, esHabitual, esColectivo);

    // ── Liquidez mínima ──
    var entrada = precio - importeHip;
    var liquidezMin = entrada + gastos.total;

    // ── Cuota mensual ──
    var cuota = calcCuota(importeHip, tin, plazo);

    // ── Ratio de endeudamiento ──
    var totalDeuda = cuota + otrasDeudas;
    var ratio = ingresos > 0 ? (totalDeuda / ingresos) * 100 : 999;

    // ── Cuota máxima permitida ──
    var cuotaMax = ingresos * 0.35 - otrasDeudas;

    // ── Simulador de Compra Máxima y Financiación ──
    var rRate = (tin / 100) / 12;
    var nMonths = plazo * 12;
    var hipotecaMaxIngresos = 0;
    var cuotaMaxCalculada = (ingresos * 0.35) - otrasDeudas;
    
    if (cuotaMaxCalculada > 0) {
      if (rRate > 0) {
        hipotecaMaxIngresos = cuotaMaxCalculada * ((1 - Math.pow(1 + rRate, -nMonths)) / rRate);
      } else {
        hipotecaMaxIngresos = cuotaMaxCalculada * nMonths;
      }
    }

    // Calcular porcentaje de gastos real en base al precio actual introducido, o estimar por defecto
    var pctGastosReal = 0.11;
    if (precio > 0) {
      pctGastosReal = gastos.total / precio;
    } else {
      var gastosEstimadosDefault = calcGastos(200000, tipoVivienda, comunidad, esHabitual, esColectivo);
      pctGastosReal = gastosEstimadosDefault.total / 200000;
    }
    var factorAhorrosTotal = 0.20 + pctGastosReal;

    var precioMaxAhorros = ahorros / factorAhorrosTotal;
    var precioMaxIngresos = (ahorros + hipotecaMaxIngresos) / (1 + pctGastosReal);
    var precioMaxVivienda = 0;
    var hipotecaMaxVivienda = 0;
    var ahorroAportadoNecesario = 0;
    var factorLimitante = '';
    var explicacionCompraMax = '';

    if (cuotaMaxCalculada <= 0) {
      precioMaxVivienda = 0;
      hipotecaMaxVivienda = 0;
      ahorroAportadoNecesario = 0;
      factorLimitante = 'Capacidad de endeudamiento nula';
      explicacionCompraMax = '<strong style="color:var(--color-red);">Alerta de capacidad nula:</strong> Tus deudas mensuales actuales de ' + fmt(otrasDeudas) + ' ya consumen o superan el 35% de tus ingresos netos mensuales (' + fmt(ingresos) + '). Los bancos no te concederán financiación adicional hasta que canceles deudas o incrementes tus ingresos.';
      
      explicacionCompraMax += '<div class="edu-panel" style="margin-top: 16px; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-glass-border); background: rgba(239, 68, 68, 0.05);">' +
        '<h5 style="color: var(--color-red); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">' +
          '<i data-lucide="alert-triangle" style="width: 18px; height: 18px; color: var(--color-red);"></i> Estrategias para desbloquear tu capacidad de financiación:' +
        '</h5>' +
        '<ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; line-height: 1.6; color: var(--color-text-muted);">' +
          '<li style="margin-bottom: 8px;"><strong>Plan de amortización acelerado de deudas:</strong> Haz una lista de tus deudas pendientes y prioriza cancelar las de menor cuantía. Una vez eliminadas por completo, su cuota mensual desaparece de tu ratio de endeudamiento.</li>' +
          '<li style="margin-bottom: 8px;"><strong>Reunificación de préstamos:</strong> Si tienes varias deudas con cuotas altas, consolidarlas en un único préstamo personal a mayor plazo puede reducir tu gasto mensual consolidado a corto plazo, liberando espacio para la hipoteca.</li>' +
          '<li><strong>Incrementar ingresos justificables:</strong> El banco solo considerará ingresos recurrentes y declarados (nóminas fijas, contratos indefinidos o rendimientos declarados estables).</li>' +
        '</ul>' +
      '</div>';
    } else {
      precioMaxVivienda = Math.min(precioMaxAhorros, precioMaxIngresos);
      hipotecaMaxVivienda = (precioMaxVivienda === precioMaxAhorros) ? (precioMaxVivienda * 0.80) : hipotecaMaxIngresos;
      ahorroAportadoNecesario = (precioMaxVivienda - hipotecaMaxVivienda) + (precioMaxVivienda * pctGastosReal);

      if (precioMaxAhorros < precioMaxIngresos) {
        factorLimitante = 'Limitado por tus ahorros (falta de entrada/gastos)';
        explicacionCompraMax = '<p style="margin-bottom: 16px;">Tu principal factor limitante son tus <strong>ahorros disponibles</strong>. Aunque tus ingresos te permitirían una hipoteca mayor, no dispones de suficiente liquidez para cubrir el 20% de entrada de una vivienda más cara y el ' + (pctGastosReal * 100).toFixed(1) + '% de gastos obligatorios. Podrías comprar una vivienda de hasta <strong>' + fmt(precioMaxVivienda) + '</strong> aportando <strong>' + fmt(ahorroAportadoNecesario) + '</strong> en ahorros y solicitando una hipoteca de <strong>' + fmt(hipotecaMaxVivienda) + '</strong> (financiación del ' + (precioMaxVivienda > 0 ? ((hipotecaMaxVivienda / precioMaxVivienda) * 100).toFixed(0) : 0) + '%).</p>';
        
        explicacionCompraMax += '<div class="edu-panel" style="margin-top: 16px; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-glass-border); background: rgba(6, 182, 212, 0.05);">' +
          '<h5 style="color: var(--color-cyan); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">' +
            '<i data-lucide="lightbulb" style="width: 18px; height: 18px; color: var(--color-cyan);"></i> Estrategias para superar la limitación de ahorros:' +
          '</h5>' +
          '<ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; line-height: 1.6; color: var(--color-text-muted);">' +
            '<li style="margin-bottom: 8px;"><strong>Ayudas y avales públicos:</strong> Infórmate sobre los avales ICO o planes autonómicos (como Mi Primera Vivienda) que financian hasta el 95% o 100% de la compra, reduciendo la entrada necesaria al 5% o 0%.</li>' +
            '<li style="margin-bottom: 8px;"><strong>Viviendas de Protección Oficial (VPO):</strong> El tipo de IVA para VPO nuevas es del 4% en lugar del 10%, lo que reduce drásticamente los gastos de compra.</li>' +
            '<li style="margin-bottom: 8px;"><strong>Negociar mayor financiación:</strong> Algunos bancos o brókers hipotecarios pueden conseguir más del 80% de financiación (hasta el 90% o incluso 100%) si aportas un perfil laboral excelente o doble garantía (avalistas).</li>' +
            '<li><strong>Donaciones familiares bonificadas:</strong> En muchas CCAA de España, las donaciones en efectivo de padres a hijos para la compra de primera vivienda habitual tienen reducciones fiscales de hasta el 95%-99% en el Impuesto de Sucesiones y Donaciones.</li>' +
          '</ul>' +
        '</div>';
      } else {
        factorLimitante = 'Limitado por tus ingresos (límite de ratio de endeudamiento)';
        explicacionCompraMax = '<p style="margin-bottom: 16px;">Tu principal factor limitante son tus <strong>ingresos mensuales</strong> (capacidad de endeudamiento). Al disponer de ahorros elevados, puedes aportar una entrada mayor al 20% habitual (aportas un total de <strong>' + fmt(ahorroAportadoNecesario) + '</strong> entre entrada y gastos) y financiar un porcentaje menor del valor de la vivienda (<strong>' + (precioMaxVivienda > 0 ? ((hipotecaMaxVivienda / precioMaxVivienda) * 100).toFixed(0) : 0) + '%</strong>). Esto te permite acceder a una vivienda de hasta <strong>' + fmt(precioMaxVivienda) + '</strong> solicitando una hipoteca de <strong>' + fmt(hipotecaMaxVivienda) + '</strong> (con una cuota mensual máxima de <strong>' + fmt(cuotaMaxCalculada) + '</strong>) aportando el resto de tus ahorros.</p>';
        
        explicacionCompraMax += '<div class="edu-panel" style="margin-top: 16px; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-glass-border); background: rgba(245, 158, 11, 0.05);">' +
          '<h5 style="color: var(--color-amber); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">' +
            '<i data-lucide="lightbulb" style="width: 18px; height: 18px; color: var(--color-amber);"></i> Estrategias para superar la limitación de ingresos:' +
          '</h5>' +
          '<ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; line-height: 1.6; color: var(--color-text-muted);">' +
            '<li style="margin-bottom: 8px;"><strong>Alargar el plazo de amortización:</strong> Si pasas de 20 a 30 años, la cuota mensual disminuye significativamente, lo que te permite financiar un capital de hipoteca mayor con los mismos ingresos netos.</li>' +
            '<li style="margin-bottom: 8px;"><strong>Reducir o cancelar deudas preexistentes:</strong> Préstamos de coches, tarjetas de crédito o deudas de consumo restan capacidad euro a euro en tu cuota máxima. Amortizar estas deudas antes de pedir la hipoteca liberará ratio inmediatamente.</li>' +
            '<li style="margin-bottom: 8px;"><strong>Negociar un TIN más bajo:</strong> Consigue mejores tipos vinculando tu nómina, seguros, o recurriendo a un bróker hipotecario que negocie tipos preferentes. Un menor tipo de interés reduce directamente la cuota mensual para el mismo importe de préstamo.</li>' +
            '<li><strong>Aportar co-titulares o avalistas solidarios:</strong> Si sumas los ingresos estables de otra persona (por ejemplo, tu pareja), la capacidad de endeudamiento del banco se calculará sobre los ingresos conjuntos, aumentando la cuota mensual viable.</li>' +
          '</ul>' +
        '</div>';
      }
    }

    // Actualizar elementos visuales de Compra Máxima en el DOM
    var elMaxPrecio = document.getElementById('compra-max-precio');
    var elMaxFactor = document.getElementById('compra-max-factor');
    var elMaxHipoteca = document.getElementById('compra-max-hipoteca');
    var elMaxPct = document.getElementById('compra-max-pct');
    var elMaxAhorro = document.getElementById('compra-max-ahorro');
    var elMaxAhorroDesglose = document.getElementById('compra-max-ahorro-desglose');
    var elMaxExplicacion = document.getElementById('compra-max-explicacion');

    if (elMaxPrecio) elMaxPrecio.textContent = fmt(precioMaxVivienda);
    if (elMaxFactor) {
      elMaxFactor.textContent = factorLimitante;
      elMaxFactor.style.color = (cuotaMaxCalculada <= 0) ? 'var(--color-red)' : (precioMaxAhorros < precioMaxIngresos ? 'var(--color-cyan)' : 'var(--color-amber)');
    }
    if (elMaxHipoteca) elMaxHipoteca.textContent = fmt(hipotecaMaxVivienda);
    if (elMaxPct) {
      var pctFin = precioMaxVivienda > 0 ? ((hipotecaMaxVivienda / precioMaxVivienda) * 100).toFixed(0) : 0;
      elMaxPct.textContent = pctFin + '% de financiación máxima';
    }
    if (elMaxAhorro) elMaxAhorro.textContent = fmt(ahorroAportadoNecesario);
    if (elMaxAhorroDesglose) {
      var ent = precioMaxVivienda - hipotecaMaxVivienda;
      var pctEnt = precioMaxVivienda > 0 ? (ent / precioMaxVivienda) * 100 : 20;
      var gstReal = precioMaxVivienda * pctGastosReal;
      elMaxAhorroDesglose.textContent = fmt(ent) + ' entrada (' + pctEnt.toFixed(0) + '%) + ' + fmt(gstReal) + ' gastos (' + (pctGastosReal * 100).toFixed(1) + '%)';
    }
    if (elMaxExplicacion) elMaxExplicacion.innerHTML = explicacionCompraMax;

    // ── Evaluación global ──
    var puedePermitirse = ratio <= 35 && ahorros >= liquidezMin;
    var puedePermitirseFinanciacion = ratio <= 35;
    var tieneAhorrosSuficientes = ahorros >= liquidezMin;

    // ── Renderizar tabla de gastos ──
    var tbody = document.getElementById('gastos-tbody');
    tbody.innerHTML = '';
    Object.keys(gastos.lineas).forEach(function (k) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + k + '</td><td>' + fmt(gastos.lineas[k]) + '</td>';
      tbody.appendChild(tr);
    });
    var totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = '<td>TOTAL GASTOS</td><td>' + fmt(gastos.total) + '</td>';
    tbody.appendChild(totalRow);

    // ── Liquidez ──
    document.getElementById('res-liquidez-total').textContent = fmt(liquidezMin);
    document.getElementById('res-liquidez-hint').innerHTML =
      fmt(entrada) + ' de entrada (precio − hipoteca) + ' + fmt(gastos.total) + ' en gastos e impuestos';

    // ── Estado de ahorros ──
    var difAhorros = ahorros - liquidezMin;
    var ahorrosBlock = document.getElementById('res-estado-ahorros-block');
    document.getElementById('res-ahorros-diferencia').textContent =
      difAhorros >= 0 ? '+' + fmt(difAhorros) + ' de margen' : fmt(Math.abs(difAhorros)) + ' de déficit';
    document.getElementById('res-ahorros-hint').textContent =
      difAhorros >= 0
        ? 'Tus ahorros (' + fmt(ahorros) + ') cubren la liquidez necesaria. Te sobran ' + fmt(difAhorros) + '.'
        : 'Tus ahorros (' + fmt(ahorros) + ') no son suficientes. Te faltan ' + fmt(Math.abs(difAhorros)) + '.';
    ahorrosBlock.className = 'result-block ' + (difAhorros >= 0 ? 'success' : 'danger');
    document.getElementById('res-ahorros-diferencia').style.color = difAhorros >= 0 ? 'var(--color-green)' : 'var(--color-red)';

    // ── Cuota ──
    var cuotaBlock = document.getElementById('res-cuota-block');
    document.getElementById('res-cuota').textContent = fmt(cuota) + '/mes';
    cuotaBlock.className = 'result-block ' + (cuota <= cuotaMax ? 'success' : 'danger');
    document.getElementById('res-cuota').style.color = cuota <= cuotaMax ? 'var(--color-green)' : 'var(--color-red)';

    // ── Ratio ──
    var ratioBlock = document.getElementById('res-ratio-block');
    document.getElementById('res-ratio').textContent = fmtPct(Math.min(ratio, 100));
    var ratioColor = ratio <= 30 ? 'var(--color-green)' : ratio <= 35 ? 'var(--color-amber)' : 'var(--color-red)';
    document.getElementById('res-ratio').style.color = ratioColor;
    document.getElementById('ratio-bar').style.width = Math.min(ratio, 100) + '%';
    document.getElementById('ratio-bar').style.background = ratioColor;
    ratioBlock.className = 'result-block ' + (ratio <= 30 ? 'success' : ratio <= 35 ? 'warning' : 'danger');

    var ratioHint = '';
    if (ratio <= 30) ratioHint = '✅ Excelente. Estás muy por debajo del límite recomendado del 35%. El banco lo verá con buenos ojos.';
    else if (ratio <= 35) ratioHint = '⚠️ En el límite. Puede que el banco lo apruebe, pero sin mucho margen. Cualquier gasto extra puede complicarlo.';
    else ratioHint = '🚫 Por encima del 35%. Los bancos típicamente denegarán esta hipoteca con estos ingresos. Considera reducir el importe o ampliar el plazo.';
    document.getElementById('res-ratio-hint').textContent = ratioHint;

    // ── Cuota máxima ──
    document.getElementById('res-cuota-max').textContent = fmt(Math.max(cuotaMax, 0)) + '/mes';
    document.getElementById('res-cuota-max-hint').textContent =
      'El 35% de tus ingresos (' + fmt(ingresos) + ') menos otras deudas (' + fmt(otrasDeudas) + ')';

    // ── Semáforo principal ──
    var semaforo = document.getElementById('semaforo-resultado');
    var emoji    = document.getElementById('semaforo-emoji');
    var titulo   = document.getElementById('semaforo-titulo');
    var desc     = document.getElementById('semaforo-desc');

    if (puedePermitirse) {
      semaforo.style.background = 'rgba(16,185,129,0.08)';
      semaforo.style.borderColor = 'rgba(16,185,129,0.4)';
      emoji.textContent = '🟢';
      titulo.textContent = '¡Todo en orden! Esta compra parece viable';
      titulo.style.color = 'var(--color-green)';
      desc.textContent = 'Tu ratio de endeudamiento está dentro del rango aceptable y tus ahorros cubren la liquidez necesaria. El banco podría aprobar esta hipoteca.';
    } else if (puedePermitirseFinanciacion && !tieneAhorrosSuficientes) {
      semaforo.style.background = 'rgba(245,158,11,0.08)';
      semaforo.style.borderColor = 'rgba(245,158,11,0.4)';
      emoji.textContent = '🟡';
      titulo.textContent = 'Ingresos OK, pero faltan ahorros';
      titulo.style.color = 'var(--color-amber)';
      desc.textContent = 'Tu ratio de endeudamiento es correcto, pero tus ahorros actuales no cubren la entrada y los gastos. Necesitas ' + fmt(Math.abs(difAhorros)) + ' adicionales.';
    } else if (!puedePermitirseFinanciacion && tieneAhorrosSuficientes) {
      semaforo.style.background = 'rgba(245,158,11,0.08)';
      semaforo.style.borderColor = 'rgba(245,158,11,0.4)';
      emoji.textContent = '🟡';
      titulo.textContent = 'Ahorros OK, pero la cuota supera tu capacidad';
      titulo.style.color = 'var(--color-amber)';
      desc.textContent = 'Tienes suficientes ahorros, pero la cuota mensual supera el 35% de tus ingresos. Considera ampliar el plazo, reducir el importe o buscar una vivienda más económica.';
    } else {
      semaforo.style.background = 'rgba(239,68,68,0.08)';
      semaforo.style.borderColor = 'rgba(239,68,68,0.4)';
      emoji.textContent = '🔴';
      titulo.textContent = 'Esta compra no es viable en este momento';
      titulo.style.color = 'var(--color-red)';
      desc.textContent = 'Tanto los ahorros como la capacidad de endeudamiento presentan problemas. Te recomendamos revisar el precio de la vivienda, aumentar el plazo o esperar a tener mayor ahorro.';
    }

    guardarEstado();
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    if (!silencioso) {
      goToSection(2);
    }
  };

  /* ────────────────────────────────────────────────────────
   * PASO 4: QUIZ DE PERFIL INVERSOR
   * ──────────────────────────────────────────────────────── */
  var quizAnswers = {};

  window.selectQuizOption = function (btn) {
    var q = btn.dataset.q;
    var v = parseInt(btn.dataset.v);

    // Deseleccionar opciones de la misma pregunta
    document.querySelectorAll('.quiz-option[data-q="' + q + '"]').forEach(function (b) {
      b.classList.remove('selected');
    });
    btn.classList.add('selected');
    quizAnswers[q] = v;
    guardarEstado();

    // Activar botón si todas respondidas (ahora son 8 preguntas)
    var btnCalc = document.getElementById('btn-calcular-perfil');
    if (Object.keys(quizAnswers).length === 8) {
      btnCalc.disabled = false;
    }
  };

  window.calcularPerfil = function (silencioso) {
    var total = Object.values(quizAnswers).reduce(function (a, b) { return a + b; }, 0);
    // Puntuación: 8-13 Conservador, 14-19 Moderado, 20-24 Dinámico

    var nombre, desc, color, bg, recomendacion;

    if (total <= 13) {
      nombre = 'Perfil Conservador';
      desc = 'Valoras la seguridad y la tranquilidad financiera por encima de la rentabilidad. La estabilidad y el control son tus prioridades. Eso es completamente válido y tiene su propia estrategia ganadora.';
      color = '#3b82f6';
      bg = 'rgba(59,130,246,0.1)';
      recomendacion = generarGuiaHipotecaConservadora();
    } else if (total <= 19) {
      nombre = 'Perfil Moderado';
      desc = 'Buscas un equilibrio entre seguridad y crecimiento. Puedes tolerar cierta incertidumbre si existe una perspectiva de beneficio claro. Tienes margen para ser algo más estratégico con tu hipoteca.';
      color = '#06b6d4';
      bg = 'rgba(6,182,212,0.1)';
      recomendacion = generarGuiaHipotecaModerada();
    } else {
      nombre = 'Perfil Dinámico';
      desc = 'Entiendes el riesgo como herramienta para generar rentabilidad. Tienes horizonte largo, experiencia y estabilidad. Puedes adoptar estrategias hipotecarias más sofisticadas para maximizar tu patrimonio neto.';
      color = '#10b981';
      bg = 'rgba(16,185,129,0.1)';
      recomendacion = generarGuiaHipotecaDinamica();
    }

    var ring = document.getElementById('perfil-ring');
    ring.style.background = bg;
    ring.style.border = '4px solid ' + color;
    ring.style.color = color;
    document.getElementById('perfil-puntos').textContent = total + '/24';

    var card = document.getElementById('perfil-card');
    card.style.background = bg;
    card.style.border = '1px solid ' + color.replace(')', ',0.3)').replace('rgb', 'rgba');

    document.getElementById('perfil-nombre').textContent = nombre;
    document.getElementById('perfil-nombre').style.color = color;
    document.getElementById('perfil-desc').textContent = desc;

    document.getElementById('guia-hipoteca-content').innerHTML = recomendacion;
    document.getElementById('perfil-resultado').style.display = 'block';

    guardarEstado();
    if (!silencioso) {
      document.getElementById('perfil-resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  function generarGuiaHipotecaConservadora() {
    var precio = parseFloat(document.getElementById('precio-vivienda').value) || 0;
    var edad = parseInt(document.getElementById('edad').value) || 35;
    var plazoMaxEdad = Math.max(75 - edad, 0);
    var importe70 = precio * 0.70;
    var plazoRecomendado = Math.min(20, plazoMaxEdad);

    return '<div class="edu-note" style="border-left-color:var(--color-blue);">' +
      '<strong>Estrategia recomendada: Hipoteca mínima necesaria + tipo fijo</strong>' +
      '</div>' +
      '<p class="text-muted" style="line-height:1.8;margin-bottom:16px;">Con tu perfil, la tranquilidad financiera vale más que la optimización matemática. Tu recomendación detallada:</p>' +
      '<ul class="text-muted" style="padding-left:20px;line-height:1.8;margin-bottom:16px;">' +
        '<li><strong style="color:var(--color-text);">Importe recomendado:</strong> Te sugerimos pedir el menor importe de hipoteca posible, idealmente sin superar el 70% del valor de la vivienda (máx. <strong>' + fmt(importe70) + '</strong>). Aporta el máximo ahorro que puedas sin tocar tu fondo de emergencia.</li>' +
        '<li><strong style="color:var(--color-text);">Plazo recomendado:</strong> Un plazo corto-medio de entre <strong>15 y ' + plazoRecomendado + ' años</strong> (vencimiento máximo por tu edad: ' + plazoMaxEdad + ' años). Esto minimiza drásticamente el pago total de intereses al banco.</li>' +
        '<li><strong style="color:var(--color-text);">Tipo de interés recomendado:</strong> <strong>Tipo Fijo</strong>. Te garantiza una cuota constante y predecible para toda la vida del préstamo, protegiéndote al 100% de la volatilidad del mercado e incrementos del Euríbor.</li>' +
        '<li><strong style="color:var(--color-text);">Gestión del riesgo:</strong> Mantén tu fondo de emergencia intacto (mínimo 6 meses de gastos) antes de aportar ahorros extra a la entrada de la vivienda.</li>' +
      '</ul>';
  }

  function generarGuiaHipotecaModerada() {
    var precio = parseFloat(document.getElementById('precio-vivienda').value) || 0;
    var edad = parseInt(document.getElementById('edad').value) || 35;
    var plazoMaxEdad = Math.max(75 - edad, 0);
    var importeMin = precio * 0.70;
    var importeMax = precio * 0.75;
    var plazoRecomendado = Math.min(25, plazoMaxEdad);

    return '<div class="edu-note" style="border-left-color:var(--color-cyan);">' +
      '<strong>Estrategia recomendada: Hipoteca equilibrada + tipo mixto o fijo moderado</strong>' +
      '</div>' +
      '<p class="text-muted" style="line-height:1.8;margin-bottom:16px;">Buscas un equilibrio sensato entre rentabilidad, optimización y seguridad. Tu recomendación detallada:</p>' +
      '<ul class="text-muted" style="padding-left:20px;line-height:1.8;margin-bottom:16px;">' +
        '<li><strong style="color:var(--color-text);">Importe recomendado:</strong> Financiación equilibrada de entre el 70% y el 75% del valor de la vivienda (es decir, entre <strong>' + fmt(importeMin) + '</strong> y <strong>' + fmt(importeMax) + '</strong>). Conservarás liquidez en tu cuenta para imprevistos u otras oportunidades.</li>' +
        '<li><strong style="color:var(--color-text);">Plazo recomendado:</strong> Un plazo intermedio de <strong>20 a ' + plazoRecomendado + ' años</strong> (vencimiento máximo por tu edad: ' + plazoMaxEdad + ' años). Ofrece un buen balance entre una cuota mensual cómoda y un coste total de intereses razonable.</li>' +
        '<li><strong style="color:var(--color-text);">Tipo de interés recomendado:</strong> <strong>Tipo Mixto</strong> (tramo fijo los primeros 5-10 años, variable después) o <strong>Tipo Fijo competitivo</strong>. El tipo mixto te dará una cuota fija y bonificada en los primeros años, que es cuando debes más capital, dándote estabilidad inicial.</li>' +
        '<li><strong style="color:var(--color-text);">Estrategia activa:</strong> Intenta realizar amortizaciones parciales en plazo en los momentos que dispongas de ingresos extra, reduciendo así la duración total de la deuda.</li>' +
      '</ul>';
  }

  function generarGuiaHipotecaDinamica() {
    var precio = parseFloat(document.getElementById('precio-vivienda').value) || 0;
    var edad = parseInt(document.getElementById('edad').value) || 35;
    var plazoMaxEdad = Math.max(75 - edad, 0);
    var importe80 = precio * 0.80;
    var plazoRecomendado = Math.min(30, plazoMaxEdad);

    return '<div class="edu-note" style="border-left-color:var(--color-green);">' +
      '<strong>Estrategia recomendada: Hipoteca máxima + apalancamiento financiero inteligente</strong>' +
      '</div>' +
      '<p class="text-muted" style="line-height:1.8;margin-bottom:16px;">Tienes tolerancia al riesgo y un enfoque más estratégico de tus finanzas. Tu recomendación detallada:</p>' +
      '<ul class="text-muted" style="padding-left:20px;line-height:1.8;margin-bottom:16px;">' +
        '<li><strong style="color:var(--color-text);">Importe recomendado:</strong> Financiación máxima del 80% (aproximadamente <strong>' + fmt(importe80) + '</strong>). De este modo evitas descapitalizarte y aprovechas el apalancamiento financiero, permitiéndote destinar tu capital excedente a inversiones a largo plazo.</li>' +
        '<li><strong style="color:var(--color-text);">Plazo recomendado:</strong> Plazo largo de <strong>25 a ' + plazoRecomendado + ' años</strong> (máximo por edad: ' + plazoMaxEdad + ' años). Cuanto más largo sea el plazo, menor será la cuota mensual obligatoria, liberando mayor flujo de caja mensual para tu cartera de inversión.</li>' +
        '<li><strong style="color:var(--color-text);">Tipo de interés recomendado:</strong> <strong>Tipo Variable</strong> o <strong>Mixto a corto plazo</strong> (tramo fijo de 3-5 años). Te permite beneficiarte de la bajada de tipos a medio plazo y de las menores comisiones legales por amortización anticipada.</li>' +
        '<li><strong style="color:var(--color-text);">Apalancamiento y arbitraje:</strong> Si la rentabilidad neta anual media esperada de tus inversiones (ej. cartera de fondos indexados) es superior al TIN de la hipoteca, te conviene matemáticamente mantener el dinero invertido en lugar de amortizar hipoteca por adelantado.</li>' +
      '</ul>' +
      '<div class="alert" style="background:rgba(16,185,129,0.08);border-left:3px solid var(--color-green);font-size:0.88rem;color:var(--color-text-muted);">' +
        '⚠️ Esta estrategia optimiza al máximo tu patrimonio neto a largo plazo, pero incrementa el riesgo ante subidas de tipos y volatilidad de mercado. Solo es aconsejable si mantienes un colchón de liquidez muy sólido. El Euríbor oscilará y debes poder absorberlo sin estrés.' +
      '</div>';
  }

  /* ────────────────────────────────────────────────────────
   * PASO 5: TABLA COMPARATIVA DE PLAZOS
   * ──────────────────────────────────────────────────────── */
  function generarTablasPlazos() {
    var importeHip = parseFloat(document.getElementById('importe-hipoteca').value) || 200000;
    var tin        = parseFloat(document.getElementById('tipo-interes').value) || 3.5;
    var ingresos   = parseFloat(document.getElementById('ingresos').value) || 3000;
    var otrasDeudas = parseFloat(document.getElementById('otras-deudas').value) || 0;
    var edad       = parseInt(document.getElementById('edad').value) || 35;
    var plazoMaxEdad = Math.max(75 - edad, 0);

    var plazos = [10, 15, 20, 25, 30, 35, 40];
    var tbody  = document.getElementById('plazos-tbody');
    tbody.innerHTML = '';

    var plazoActual = parseInt(document.getElementById('plazo-hipoteca').value) || 25;

    plazos.forEach(function (p) {
      var tr = document.createElement('tr');
      if (p === plazoActual) tr.className = 'highlight-row';

      if (p > plazoMaxEdad) {
        tr.innerHTML =
          '<td><strong>' + p + ' años</strong> <span style="color:var(--color-red); font-size:0.75rem; font-weight:600; display:block;">Excede límite de edad (75 años)</span></td>' +
          '<td colspan="4" style="text-align:center; color:var(--color-text-muted); font-style:italic;">No viable (Edad al vencimiento: ' + (edad + p) + ' años)</td>';
      } else {
        var cuota  = calcCuota(importeHip, tin, p);
        var total  = cuota * p * 12;
        var intereses = total - importeHip;
        var ratio  = ingresos > 0 ? ((cuota + otrasDeudas) / ingresos) * 100 : 999;
        var ratioColor = ratio <= 30 ? '#10b981' : ratio <= 35 ? '#f59e0b' : '#ef4444';

        tr.innerHTML =
          '<td><strong>' + p + ' años</strong>' + (p === plazoActual ? ' ← tu elección' : '') + '</td>' +
          '<td><strong>' + fmt(cuota) + '/mes</strong></td>' +
          '<td>' + fmt(total) + '</td>' +
          '<td style="color:#ef4444;">' + fmt(intereses) + '</td>' +
          '<td style="color:' + ratioColor + ';font-weight:600;">' + fmtPct(ratio) + '</td>';
      }
      tbody.appendChild(tr);
    });

    // Edad y plazo máximo real
    document.getElementById('plazo-max-edad').textContent =
      plazoMaxEdad + ' años (para tu edad actual de ' + edad + ' años, con vencimiento a los 75)';

    // Diferencia intereses 20 vs 30
    var int20 = (calcCuota(importeHip, tin, 20) * 20 * 12) - importeHip;
    var int30 = (calcCuota(importeHip, tin, 30) * 30 * 12) - importeHip;
    document.getElementById('diferencia-intereses').textContent = fmt(int30 - int20) + ' más a 30 que a 20 años';

    // Recomendación de plazo
    var cuotaMax = ingresos * 0.35 - otrasDeudas;
    var plazoMinViable = null;
    for (var i = 5; i <= 40; i++) {
      if (calcCuota(importeHip, tin, i) <= cuotaMax) {
        plazoMinViable = i;
        break;
      }
    }

    var recTexto = '';
    if (plazoMinViable && plazoMinViable > plazoMaxEdad) {
      recTexto = '⚠️ Por tu edad (' + edad + ' años), el plazo máximo permitido es de ' + plazoMaxEdad + ' años. Sin embargo, para que la cuota no supere el 35% de tus ingresos necesitas un plazo de al menos ' + plazoMinViable + ' años. Esto significa que la operación tiene un riesgo muy elevado de ser denegada por rebasar la edad límite al vencimiento (75 años). Considera reducir el importe de la hipoteca, aportar más entrada o añadir un avalista más joven.';
    } else if (!plazoMinViable) {
      recTexto = '⚠️ Con estos ingresos y este importe de hipoteca, incluso a 40 años la cuota supera el 35% de tus ingresos. Es necesario reducir el importe de la hipoteca o aumentar los ingresos.';
    } else if (plazoMinViable <= 15) {
      var maxRecomendado = Math.min(plazoMaxEdad, Math.min(plazoMinViable + 10, 30));
      recTexto = '✅ Puedes permitirte amortizar en solo ' + plazoMinViable + ' años y tener la hipoteca pagada muy pronto. Sin embargo, considera si prefieres un plazo algo más largo (' + Math.min(plazoMinViable + 5, maxRecomendado) + '-' + maxRecomendado + ' años) para tener mayor liquidez mensual e ir invirtiendo la diferencia en fondos indexados. El simulador de amortización te ayudará a comparar ambas estrategias.';
    } else {
      var maxRecomendado = Math.min(plazoMaxEdad, Math.min(plazoMinViable + 10, 40));
      recTexto = '📊 El plazo mínimo en el que la cuota entra dentro del umbral del 35% es ' + plazoMinViable + ' años. Te recomendamos un plazo de ' + Math.min(plazoMinViable + 5, plazoMaxEdad) + '-' + maxRecomendado + ' años (teniendo en cuenta tu edad actual) para tener algo de margen mensual y poder realizar amortizaciones anticipadas en los años buenos. Recuerda que contratar a largo plazo no significa pagar durante todo ese tiempo: puedes amortizar anticipadamente cuando tengas excedente de efectivo.';
    }
    document.getElementById('recomendacion-plazo').textContent = recTexto;
  }

  /* ────────────────────────────────────────────────────────
   * PASO 6: GLOSARIO HIPOTECARIO
   * ──────────────────────────────────────────────────────── */
  var GLOSARIO = [
    {
      titulo: '🏦 ¿Qué es una hipoteca? El préstamo garantizado',
      contenido: '<p>Una hipoteca es un <strong>préstamo con garantía real</strong>: el banco te presta dinero para comprar una vivienda, y si dejas de pagar, puede ejecutar la garantía (quedarse con la vivienda) para recuperar el dinero. No es lo mismo que otros préstamos personales, que son más caros precisamente porque no tienen esa garantía.</p>' +
        '<p>Las hipotecas en España tienen una duración típica de 15 a 30 años, con cuotas mensuales constantes (en tipo fijo) o variables (en tipo variable). El banco inscribe la hipoteca en el Registro de la Propiedad, lo que protege también al comprador frente a deudas del vendedor.</p>'
    },
    {
      titulo: '🔢 Sistema de Amortización Francés: cómo funciona tu cuota',
      contenido: '<p>En España, la práctica totalidad de las hipotecas usan el <strong>sistema de amortización francés</strong>, también llamado de "cuota constante".</p>' +
        '<p>En este sistema, pagas siempre la misma cuota mensual, pero su composición cambia con el tiempo:</p>' +
        '<ul><li>Al principio: la cuota tiene <strong>mucho interés y poco capital</strong>. Es decir, los primeros años casi todo lo que pagas va al banco como coste del dinero.</li>' +
        '<li>Con el tiempo: la proporción se invierte. Cada vez pagas más capital (te debes menos) y menos intereses.</li></ul>' +
        '<p>Esto tiene una implicación importante: <strong>amortizar anticipadamente al principio de la hipoteca es mucho más eficiente</strong> que hacerlo al final, porque reduces la base sobre la que se calculan los intereses durante más tiempo.</p>'
    },
    {
      titulo: '📊 TIN y TAE: la diferencia que importa al comparar',
      contenido: '<p><strong>TIN (Tipo de Interés Nominal):</strong> Es el porcentaje de interés anual puro sobre el capital prestado. Se usa para calcular la cuota mensual. Es el número que verás más a menudo en la publicidad de los bancos.</p>' +
        '<p><strong>TAE (Tasa Anual Equivalente):</strong> Incluye el TIN más todos los gastos asociados: comisiones de apertura, seguros vinculados, costes de mantenimiento de cuenta, etc. Representa el coste real y total de la hipoteca expresado como un porcentaje anual.</p>' +
        '<p>La ley obliga a los bancos a informar la TAE. <strong>Para comparar hipotecas de distintos bancos, usa siempre la TAE</strong>: un banco con TIN más bajo pero muchos gastos puede resultar más caro que otro con TIN algo más alto pero sin comisiones.</p>'
    },
    {
      titulo: '📈 El Euríbor: el termómetro de las hipotecas variables',
      contenido: '<p>El <strong>Euríbor</strong> (Euro Interbank Offered Rate) es el tipo de interés al que los principales bancos europeos se prestan dinero entre sí. Lo publica diariamente el Banco Central Europeo y se calcula en distintos plazos (1 mes, 3 meses, 6 meses, 1 año).</p>' +
        '<p>En las hipotecas a tipo variable, tu cuota se revisa periódicamente (normalmente cada 6 o 12 meses) usando la fórmula: <strong>Cuota = f(Capital pendiente, Euríbor + Diferencial, Plazo restante)</strong>.</p>' +
        '<p>El diferencial es fijo durante toda la vida del préstamo (ej: 0.75%). Lo que cambia es el Euríbor. Si el Euríbor sube, tu cuota sube. Si baja, tu cuota baja. Históricamente ha oscilado entre -0.5% y +5%.</p>'
    },
    {
      titulo: '⚖️ Fijo, Variable o Mixto: qué elegir',
      contenido: '<p><strong>Tipo Fijo:</strong> El interés no cambia durante toda la vida del préstamo. Cuota constante y predecible. Mayor tranquilidad, pero suelen tener un TIN inicial algo más alto que los variables. Ideal si valoras la certeza y no quieres sorpresas.</p>' +
        '<p><strong>Tipo Variable:</strong> Se compone de Euríbor + diferencial. La cuota cambia cada 6 o 12 meses. Si el Euríbor baja, ahorras; si sube, pagas más. Históricamente han sido más baratos a largo plazo, pero con más incertidumbre. Adecuado si tienes colchón financiero y tolerancia al riesgo.</p>' +
        '<p><strong>Tipo Mixto:</strong> Combina ambos. Suele empezar con un periodo fijo (5-15 años) y después se convierte en variable. Protege la fase inicial (cuando la deuda es mayor) y permite beneficiarse de bajadas de tipos en la segunda fase.</p>' +
        '<p>No hay una opción objetivamente mejor: depende de tus circunstancias, del nivel actual del Euríbor y de tu aversión al riesgo.</p>'
    },
    {
      titulo: '🔗 Vinculaciones bancarias: el coste oculto',
      contenido: '<p>Los bancos suelen ofrecer bonificaciones en el interés si contratas productos adicionales. Son las llamadas <strong>vinculaciones</strong>. Las más comunes:</p>' +
        '<ul><li><strong>Domiciliación de nómina:</strong> Reducción de 0.25-0.5% en el TIN</li>' +
        '<li><strong>Seguro de hogar:</strong> Suele ser obligatorio (aunque puedes contratarlo en otra aseguradora)</li>' +
        '<li><strong>Seguro de vida:</strong> El banco lo vende, pero puede ser hasta 3 veces más caro que en el mercado</li>' +
        '<li><strong>Tarjeta de crédito del banco:</strong> Con uso mínimo mensual</li>' +
        '<li><strong>Plan de pensiones:</strong> Aportación mínima anual</li></ul>' +
        '<p>Importante: la ley te permite contratar seguros con cualquier compañía. El banco no puede imponerte los suyos (aunque sí puede exigir que tengas el seguro, no que lo controles con ellos). <strong>Calcula siempre el coste real de las vinculaciones</strong> y compara el TIN bonificado frente al no bonificado considerando todos los productos.</p>'
    },
    {
      titulo: '💡 Amortizar en Cuota vs en Plazo',
      contenido: '<p>Cuando realizas una amortización anticipada (pagas capital por adelantado), el banco te ofrece dos opciones:</p>' +
        '<p><strong>Reducir Cuota:</strong> Mantienes el mismo plazo pero pagas menos cada mes. Beneficio inmediato en liquidez. Pero sigues pagando el mismo tiempo.</p>' +
        '<p><strong>Reducir Plazo:</strong> La cuota mensual se mantiene igual, pero terminas de pagar antes. Pagas menos intereses totales porque el plazo es menor.</p>' +
        '<p>Matemáticamente, <strong>reducir plazo es casi siempre más eficiente</strong> desde el punto de vista del ahorro en intereses totales. Sin embargo, reducir cuota puede ser mejor si necesitas mejorar tu liquidez mensual.</p>' +
        '<p>Regla práctica: si tu situación financiera es cómoda, amortiza en plazo. Si quieres reducir tu carga mensual para tener más capacidad de ahorro o inversión, amortiza en cuota.</p>'
    },
    {
      titulo: '💰 Comisiones asociadas a la hipoteca',
      contenido: '<p>La Ley 5/2019 de Contratos de Crédito Inmobiliario regula y limita estrictamente las comisiones bancarias aplicables:</p>' +
        '<ul><li><strong>Comisión de apertura:</strong> Máximo 1% del capital (muchos bancos la han suprimido). Engloba todos los gastos de estudio y tramitación del préstamo.</li>' +
        '<li><strong>Comisión por amortización anticipada (tipo fijo):</strong> Comisión máxima del 2% durante los primeros 10 años de vida del préstamo, y del 1.5% a partir de entonces. El cobro de esta comisión está legalmente sujeto a que el reembolso anticipado genere una pérdida financiera demostrable para la entidad.</li>' +
        '<li><strong>Comisión por amortización anticipada (tipo variable):</strong> Comisión máxima del 0.25% durante los primeros 3 años de vigencia del contrato, o bien del 0.15% durante los primeros 5 años. Transcurridos dichos plazos, la amortización anticipada es completamente gratuita. Al igual que en tipo fijo, solo puede cobrarse si se demuestra pérdida financiera para el banco.</li>' +
        '<li><strong>Comisión por subrogación (cambio de banco):</strong> Limitada legalmente para facilitar la búsqueda de mejores condiciones financieras en otras entidades sin elevadas penalizaciones.</li>' +
        '<li><strong>Comisión por novación (renegociar con el mismo banco):</strong> Máximo 0.1% si implica un cambio de tipo de interés de variable a fijo.</li></ul>'
    },
    {
      titulo: '📄 ¿Qué es la FEIN? (Ficha Europea de Información Normalizada)',
      contenido: '<p>La <strong>FEIN</strong> es el documento estándar obligatorio que los bancos deben entregarte una vez estudiado tu perfil y aprobada la operación de forma preliminar.</p>' +
        '<p>Características fundamentales de la FEIN:</p>' +
        '<ul><li><strong>Carácter vinculante:</strong> A diferencia de las simulaciones comerciales iniciales, las condiciones reflejadas en la FEIN obligan legalmente al banco a mantener la oferta durante un plazo mínimo de 10 días naturales (14 días en Cataluña) en toda España.</li>' +
        '<li><strong>Para qué sirve:</strong> Contiene de forma detallada e inequívoca el TIN, la TAE, el desglose de comisiones, el cuadro de amortización previsto, los gastos obligatorios y los productos vinculados exigidos.</li>' +
        '<li><strong>Clave para comparar:</strong> Al ser un formato regulado y homogéneo para todos los bancos de la Unión Europea, te permite colocar las ofertas de diferentes entidades frente a frente para comparar objetivamente cuál es la que realmente te conviene más.</li></ul>'
    },
    {
      titulo: '🔄 Cómo comparar ofertas de distintos bancos',
      contenido: '<p>Para comparar correctamente hipotecas de distintas entidades, sigue este proceso:</p>' +
        '<ol><li><strong>Pide la FEIN</strong> (Ficha Europea de Información Normalizada) a cada banco. Es un documento estándar y obligatorio que resume todas las condiciones de forma comparable.</li>' +
        '<li><strong>Compara la TAE, no el TIN.</strong> La TAE incluye todos los costes.</li>' +
        '<li><strong>Calcula el coste total de las vinculaciones:</strong> Suma el coste anual del seguro de vida, hogar y cualquier producto exigido. Réstalo al ahorro en intereses por la bonificación. ¿Sigue saliendo a cuenta?</li>' +
        '<li><strong>Comprueba la flexibilidad de amortización:</strong> ¿Cobran comisión? ¿Puedes hacer amortizaciones parciales sin coste?</li>' +
        '<li><strong>Revisa las cláusulas suelo y techo</strong> si es variable: aunque la ley las limitó, asegúrate de que no existen.</li>' +
        '<li><strong>Pregunta por la subrogación:</strong> ¿Puedo cambiar de banco fácilmente si encuentro mejores condiciones en el futuro?</li></ol>'
    }
  ];

  function generarGlosario() {
    var container = document.getElementById('glosario-container');
    GLOSARIO.forEach(function (item, i) {
      var panel = document.createElement('div');
      panel.className = 'edu-panel';
      panel.innerHTML =
        '<div class="edu-panel-header" onclick="toggleEduPanel(this)">' +
          '<h4>' + item.titulo + '</h4>' +
          '<i data-lucide="chevron-down" class="edu-chevron" style="width:20px;height:20px;flex-shrink:0;"></i>' +
        '</div>' +
        '<div class="edu-panel-body">' +
          '<div class="edu-panel-body-inner">' + item.contenido + '</div>' +
        '</div>';
      container.appendChild(panel);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  window.toggleEduPanel = function (header) {
    var body = header.nextElementSibling;
    var chevron = header.querySelector('.edu-chevron');
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    chevron.classList.toggle('open', !isOpen);
  };

  function initProgressNav() {
    var navItems = document.querySelectorAll('.progress-nav-item');
    navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('done') || btn.classList.contains('active')) {
          var idx = parseInt(btn.dataset.section);
          window.goToSection(idx);
        }
      });
    });
  }

  /* ────────────────────────────────────────────────────────
   * PERSISTENCIA: localStorage
   * ──────────────────────────────────────────────────────── */
  function guardarEstado() {
    var estado = {
      ingresos: document.getElementById('ingresos') ? document.getElementById('ingresos').value : '',
      'gastos-fijos': document.getElementById('gastos-fijos') ? document.getElementById('gastos-fijos').value : '',
      'otras-deudas': document.getElementById('otras-deudas') ? document.getElementById('otras-deudas').value : '',
      ahorros: document.getElementById('ahorros') ? document.getElementById('ahorros').value : '',
      edad: document.getElementById('edad') ? document.getElementById('edad').value : '',
      'precio-vivienda': document.getElementById('precio-vivienda') ? document.getElementById('precio-vivienda').value : '',
      'tipo-vivienda': document.getElementById('tipo-vivienda') ? document.getElementById('tipo-vivienda').value : '',
      comunidad: document.getElementById('comunidad') ? document.getElementById('comunidad').value : '',
      'importe-hipoteca': document.getElementById('importe-hipoteca') ? document.getElementById('importe-hipoteca').value : '',
      'tipo-interes': document.getElementById('tipo-interes') ? document.getElementById('tipo-interes').value : '',
      'plazo-hipoteca': document.getElementById('plazo-hipoteca') ? document.getElementById('plazo-hipoteca').value : '',
      quizAnswers: quizAnswers,
      maxSectionVisited: maxSectionVisited,
      currentSection: currentSection
    };
    localStorage.setItem('finlar_analisis_financiero_estado', JSON.stringify(estado));
  }

  function initPersistence() {
    var fields = [
      'ingresos', 'gastos-fijos', 'otras-deudas', 'ahorros', 'edad',
      'precio-vivienda', 'tipo-vivienda', 'comunidad', 'importe-hipoteca',
      'tipo-interes', 'plazo-hipoteca'
    ];
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', guardarEstado);
        el.addEventListener('change', guardarEstado);
      }
    });
  }

  function cargarEstado() {
    var raw = localStorage.getItem('finlar_analisis_financiero_estado');
    if (!raw) return;
    try {
      var estado = JSON.parse(raw);
      if (!estado) return;

      var fields = [
        'ingresos', 'gastos-fijos', 'otras-deudas', 'ahorros', 'edad',
        'precio-vivienda', 'tipo-vivienda', 'comunidad', 'importe-hipoteca',
        'tipo-interes', 'plazo-hipoteca'
      ];
      fields.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && estado[id] !== undefined) {
          el.value = estado[id];
        }
      });

      var plazoVal = estado['plazo-hipoteca'];
      if (plazoVal) {
        var pDisplay = document.getElementById('plazo-display');
        if (pDisplay) pDisplay.textContent = plazoVal + ' años';
      }

      if (estado.quizAnswers) {
        quizAnswers = estado.quizAnswers;
        Object.keys(quizAnswers).forEach(function (q) {
          var v = quizAnswers[q];
          var opt = document.querySelector('.quiz-option[data-q="' + q + '"][data-v="' + v + '"]');
          if (opt) {
            opt.classList.add('selected');
          }
        });
        
        var btnCalc = document.getElementById('btn-calcular-perfil');
        if (btnCalc && Object.keys(quizAnswers).length === 8) {
          btnCalc.disabled = false;
        }
      }

      if (estado.maxSectionVisited !== undefined) {
        maxSectionVisited = estado.maxSectionVisited;
      }

      // Ejecutar cálculos silenciosamente
      calcularYMostrar(true);
      
      if (Object.keys(quizAnswers).length === 8) {
        calcularPerfil(true);
      }

      if (estado.currentSection !== undefined) {
        goToSection(estado.currentSection);
      }
    } catch (e) {
      console.error('Error al cargar el estado de localStorage:', e);
    }
  }

  function init() {
    initProgressNav();
    initPersistence();
    cargarEstado();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
