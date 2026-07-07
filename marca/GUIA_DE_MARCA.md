# Manual de Identidad de Marca — Design System

> **Version**: 2.0 — Edicion Generica
> **Ultima actualizacion**: Julio 2026
> **Uso**: Este documento es la referencia unica de diseno y componentes UI para cualquier web o aplicacion generada con este sistema. Es independiente de producto o nombre de marca especifico.

---

## 1. Esencia de Marca

Este design system esta concebido para productos digitales de caracter **profesional, tecnologico y de confianza**. Define la base visual para crear interfaces coherentes, accesibles y premium en modo oscuro.

| Atributo | Valor |
|----------|-------|
| **Tono** | Profesional, sobrio, tecnologico y de confianza |
| **Enfoque** | Experiencia de usuario y diseno limpio |
| **Modo** | Dark mode por defecto |
| **Paleta base** | Deep Navy + Cyan + Blue |

---

## 2. Creacion de Logo y Favicon

Cuando el usuario proporcione el nombre de una nueva web o aplicacion, se debe generar un **logotipo SVG** y un **favicon SVG** siguiendo estrictamente las reglas de este apartado.

### 2.1 Proceso de creacion

**Entrada requerida del usuario:**
- Nombre de la marca/producto (ej: `InmoApp`, `FinancePro`, `Invest360`, etc.)
- Descripcion breve del producto (para orientar el icono simbolico)

**Pasos de generacion:**

1. **Definir el simbolo iconico**: Elegir o disenar una forma geometrica simple que represente el concepto del producto. El simbolo usa el degradado corporativo Cyan to Blue (`#06b6d4` a `#3b82f6`).
2. **Componer el logotipo**: Combinar simbolo + nombre en tipografia Outfit Bold (700).
3. **Anadir descriptor** (opcional): Subtitulo con letra espaciada en Inter SemiBold.
4. **Exportar variantes**: Al menos 3 variantes (ver seccion 2.2).
5. **Generar favicon**: Version reducida del simbolo (sin texto) en 32x32px.

### 2.2 Variantes de logotipo

| Variante | Archivo sugerido | Uso |
|----------|-----------------|-----|
| **Transparente** | `logo_transparente.svg` | Fondos claros, documentos impresos |
| **Fondo oscuro** | `logo_fondo_oscuro.svg` | Fondos oscuros, app, web dark mode |
| **Texto blanco** | `logo_texto_blanco.svg` | Superposiciones transparentes oscuras |

### 2.3 Estructura SVG del logotipo

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" width="200" height="48">
  <defs>
    <!-- Degradado corporativo Cyan to Blue -->
    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>

  <!-- Simbolo iconico: personalizar segun el producto -->
  <!-- Ejemplo: chevron / tejado minimalista -->
  <polygon points="24,8 40,24 32,24 24,16 16,24 8,24"
           fill="url(#brand-gradient)"/>
  <rect x="8" y="26" width="32" height="4" rx="2"
        fill="url(#brand-gradient)" opacity="0.6"/>

  <!-- Nombre de marca -->
  <text x="52" y="22"
        font-family="'Outfit', sans-serif"
        font-weight="700"
        font-size="20"
        fill="#f8fafc">
    NOMBRE
  </text>

  <!-- Descriptor (opcional) -->
  <text x="52" y="38"
        font-family="'Inter', sans-serif"
        font-weight="600"
        font-size="9"
        letter-spacing="0.25em"
        fill="#94a3b8">
    DESCRIPTOR
  </text>
</svg>
```

### 2.4 Estructura SVG del favicon

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="fav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <!-- Solo el simbolo, sin texto, centrado en 32x32 -->
  <polygon points="16,4 28,16 22,16 16,10 10,16 4,16"
           fill="url(#fav-gradient)"/>
  <rect x="4" y="18" width="24" height="3" rx="1.5"
        fill="url(#fav-gradient)" opacity="0.6"/>
</svg>
```

### 2.5 Reglas de aplicacion del logo

- **Espacio de seguridad**: Margen libre equivalente a la altura de la primera letra del nombre.
- **Tamano minimo impreso**: 35 mm de ancho.
- **Tamano minimo digital**: 140 px de ancho.
- **Prohibiciones**: No distorsionar, no cambiar colores del degradado, no anadir sombras o efectos externos.

### 2.6 Integracion en HTML

```html
<!-- En el <head> de cada pagina -->
<link rel="icon" type="image/svg+xml" href="/marca/iconos/favicon.svg">

<!-- En la barra de navegacion -->
<img src="/marca/logos/logo_texto_blanco.svg" alt="Nombre de la marca"
     style="height: 32px;">
```

### 2.7 Uso en cada plataforma

| Plataforma | Logo a usar | Favicon | Paleta | Notas |
|------------|-------------|---------|--------|-------|
| **Web** | `logo_texto_blanco.svg` | `favicon.svg` | Dark completa | Web corporativa publica |
| **App** | `logo_fondo_oscuro.svg` | `favicon.svg` | Dark completa | SPA / PWA |
| **Documentos PDF** | `logo_fondo_oscuro.svg` | -- | Dark completa | Fondo `#030307` |
| **Impresion** | `logo_transparente.svg` | -- | Invertir a negro | Texto en negro, simbolo en degradado |
| **Email / Firma** | `logo_fondo_oscuro.svg` | -- | Simplificada | Solo Cyan + White |

---

## 3. Iconos de la Aplicacion

| Icono | Archivo | Uso |
|-------|---------|-----|
| **Favicon** | `marca/iconos/favicon.svg` | Pestana del navegador |
| **Icono App** | `marca/iconos/icono_app.svg` | Accesos directos, avatares, splash |

---

## 4. Paleta de Colores

### 4.1 Colores principales (fondo y superficie)

| Nombre | Variable CSS | Hex | Uso |
|--------|-------------|-----|-----|
| **Deep Obsidian** | `--color-deep-obsidian` | `#030307` | Fondo principal |
| **Luxury Navy** | `--color-luxury-navy` | `#080812` | Paneles, tarjetas |
| **Surface Slate** | `--color-surface-slate` | `#0f172a` | Elementos elevados, headers de tablas |
| **Glassmorphic Border** | `--color-glass-border` | `rgba(255,255,255, 0.06)` | Bordes de cuadros, divisores |

### 4.2 Colores de acento

| Nombre | Variable CSS | Hex | Uso |
|--------|-------------|-----|-----|
| **Smart Cyan** | `--color-cyan` | `#06b6d4` | Highlight primario, iconos, estados activos |
| **Sapphire Blue** | `--color-blue` | `#3b82f6` | Botones CTA, cabeceras secundarias |
| **Electric Indigo** | `--color-indigo` | `#6366f1` | Graficos, estados especiales |

### 4.3 Colores de texto

| Nombre | Variable CSS | Hex | Uso |
|--------|-------------|-----|-----|
| **Pure White** | `--color-pure-white` | `#f8fafc` | Titulos principales |
| **Slate Grey** | `--color-slate-grey` | `#94a3b8` | Cuerpo de texto |
| **Muted Slate** | `--color-muted-slate` | `#64748b` | Notas, leyendas, subtitulos menores |

### 4.4 Colores funcionales

| Nombre | Variable CSS | Hex | Uso |
|--------|-------------|-----|-----|
| **Success Green** | `--color-green` | `#10b981` | Confirmacion, estados correctos |
| **Warning Amber** | `--color-amber` | `#f59e0b` | Alertas, advertencias |
| **Error Red** | `--color-red` | `#ef4444` | Errores |

### 4.5 Degradados corporativos

```css
/* Degradado principal (iconos, botones, acentos) */
background: linear-gradient(135deg, #06b6d4, #3b82f6);

/* Degradado de fondo premium */
background: linear-gradient(135deg, #030307, #0f172a);

/* Degradado de texto (titulos de seccion) */
background: linear-gradient(90deg, #f8fafc 0%, #06b6d4 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 5. Tipografia

### 5.1 Familias tipograficas

| Rol | Variable CSS | Fuente | Familia |
|-----|-------------|--------|---------|
| **Titulos y encabezados** | `--font-heading` | Outfit | Sans-serif geometrica |
| **Cuerpo y tablas** | `--font-body` | Inter | Sans-serif neutral |

### 5.2 Escala tipografica

| Token | Variable CSS | Valor | Uso |
|-------|-------------|-------|-----|
| `font-size-sm` | `--font-size-sm` | 0.875rem (14px) | Textos de tarjeta, notas |
| `font-size-base` | `--font-size-base` | 1rem (16px) | Cuerpo de texto |
| `font-size-lg` | `--font-size-lg` | 1.25rem (20px) | Subtitulos menores |
| `font-size-xl` | `--font-size-xl` | 1.5rem (24px) | **Titulos de tarjeta** |
| `font-size-2xl` | `--font-size-2xl` | 2rem (32px) | Titulos de seccion |
| `font-size-3xl` | `--font-size-3xl` | 2.5rem (40px) | Titulos de pagina |

### 5.3 Jerarquia en HTML

| Elemento | Fuente | Peso | Token | Color |
|----------|--------|------|-------|-------|
| H1 pagina | Outfit | Bold (700) | `font-size-3xl` | `--color-pure-white` o degradado |
| H2 seccion | Outfit | Medium (500) | `font-size-2xl` | `--color-pure-white` |
| H3 subseccion | Outfit | Medium (500) | `font-size-xl` | `--color-pure-white` |
| H4 tarjeta (`.card-title`) | Outfit | Medium (500) | `font-size-xl` = **1.5rem** | `--color-pure-white` |
| Cuerpo (`.card-text`) | Inter | Regular (400) | `font-size-sm` | `--color-slate-grey` |
| Notas/hints | Inter | Regular (400) | `font-size-sm` | `--color-muted-slate` |

### 5.4 Carga en HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 6. Iconografia

### 6.1 Libreria de iconos

Se utiliza **Lucide Icons** como libreria principal por su estilo geometrico y limpio.

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

### 6.2 Reglas de uso

- **Trazo**: 1.5px a 2px.
- **Tamano estandar**: 20x20px (UI), 24x24px (acciones principales), 16x16px (inline), 14x14px (dentro de botones `btn-sm`).
- **Color en headers de tarjeta**: Siempre `var(--color-cyan)`.
- **Color en botones**: Hereda el color del texto del boton.

---

## 7. Componentes UI

### 7.1 Botones

```css
/* Boton primario: CTA principal */
.btn-primary {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #f8fafc;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
}

/* Boton secundario (outline) */
.btn-secondary {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 20px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
}

/* Variante pequena */
.btn-sm {
    padding: 6px 14px;
    font-size: 13px;
}
```

Todos los CTAs dentro de `.card` usan `btn btn-primary btn-sm` o `btn btn-secondary btn-sm`. **Nunca** usar `<a>` con `style="color: var(--color-cyan)"` como pseudo-boton.

---

### 7.2 Tarjetas

**Regla fundamental:** Nunca usar colores inline ni `font-family` inline en los elementos hijos de una tarjeta. Usar siempre las clases del design system.

#### Estructura HTML estandar de una tarjeta

```html
<div class="card">
    <!-- Cabecera con icono (opcional) -->
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <i data-lucide="nombre-icono" style="width:20px;height:20px;color:var(--color-cyan);"></i>
        <h4 class="card-title m-0">Titulo de la tarjeta</h4>
    </div>
    <!-- Sin icono: <h4 class="card-title">Titulo de la tarjeta</h4> -->

    <!-- Cuerpo de texto -->
    <p class="card-text text-muted">Descripcion del contenido.</p>

    <!-- Boton de accion (opcional) -->
    <a href="..." class="btn btn-primary btn-sm">Texto del boton</a>
</div>
```

#### Clases de tipografia de tarjeta

| Clase CSS | Propiedad | Valor | Uso |
|-----------|-----------|-------|-----|
| `.card-title` | `font-family` | `var(--font-heading)` = Outfit | Titulos de todas las tarjetas |
| `.card-title` | `font-weight` | `var(--font-weight-medium)` = 500 | Titulos de todas las tarjetas |
| `.card-title` | `font-size` | `var(--font-size-xl)` = **1.5rem / 24px** | Titulos de todas las tarjetas |
| `.card-title` | `color` | `var(--color-pure-white)` = `#f8fafc` | Titulos de todas las tarjetas |
| `.card-text` | `font-family` | `var(--font-body)` = Inter | Textos descriptivos en tarjetas |
| `.card-text` | `color` | `var(--color-slate-grey)` = `#94a3b8` | Textos descriptivos en tarjetas |
| `.card-text` | `font-size` | `var(--font-size-sm)` = 0.875rem | Textos descriptivos en tarjetas |

> **IMPORTANTE: Tamano de titulo de tarjeta** — El tamano estandar de `.card-title` es `var(--font-size-xl)` = 1.5rem (24px). No usar `font-size-lg` (1.25rem), ya que produce inconsistencia visual respecto a los `<h4>` nativos del navegador.

#### Variantes de tarjeta autorizadas

| Variante | Clase | Cuando usarla |
|----------|-------|---------------|
| **Estandar** | `.card` | Tarjetas de contenido general, herramientas, listas |
| **Glow** | `.card.card-glow` | Tarjetas destacadas o de accion principal |
| **Feature** | `.card.feature-card` | Tarjetas de caracteristicas (homepage, portada) |

Prohibido crear fondos personalizados con `rgba()` inline sin justificacion explicita.

#### Iconos en encabezados de tarjeta

```html
<!-- Correcto: icon + card-title en flex container -->
<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
    <i data-lucide="calculator" style="width:20px;height:20px;color:var(--color-cyan);"></i>
    <h4 class="card-title m-0">Titulo</h4>
</div>

<!-- Incorrecto: h4 con color inline -->
<!-- <h4 style="color: #818cf8;">Titulo</h4> -->
<!-- <h4 style="color: var(--color-cyan);">Titulo</h4> -->
```

Los iconos en headers de tarjeta siempre usan `var(--color-cyan)`. Otros colores de acento (indigo, purpura) se reservan para graficos y estados funcionales.

#### Reglas Anti-Ambiguedad

| Incorrecto | Correcto |
|------------|----------|
| `<h4 style="color: #818cf8;">Titulo</h4>` | `<h4 class="card-title">Titulo</h4>` |
| `<h4 style="font-family: var(--font-heading); color: var(--color-cyan);">` | `<h4 class="card-title">` |
| `<p style="font-size: 0.85rem; line-height: 1.5; color: ...">` | `<p class="card-text text-muted">` |
| `.card { background: rgba(99,102,241,0.05); }` (sin razon) | `.card` (variante estandar) |
| `<a style="color:var(--color-cyan); font-size:0.8rem;">Ver mas</a>` | `<a class="btn btn-primary btn-sm">Ver mas</a>` |

#### CSS de referencia (css/components.css)

```css
.card-title {
  font-family: var(--font-heading);       /* Outfit */
  font-weight: var(--font-weight-medium); /* 500 */
  font-size: var(--font-size-xl);         /* 1.5rem = 24px */
  color: var(--color-pure-white);         /* #f8fafc */
  margin-bottom: var(--space-2);
}

.card-text {
  font-family: var(--font-body);          /* Inter */
  color: var(--color-slate-grey);         /* #94a3b8 */
  font-size: var(--font-size-sm);         /* 0.875rem */
  line-height: var(--line-height-relaxed);
}

/* Los <p> dentro de .card no heredan el limite global 75ch */
.card p {
  max-width: 100%;
}
```

---

### 7.3 Tablas

```css
.table th {
    background: var(--color-surface-slate);
    color: var(--color-pure-white);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-glass-border);
}

.table td {
    color: var(--color-slate-grey);
    font-family: 'Inter', sans-serif;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}
```

---

## 8. Diagramas SVG

### 8.1 Estilo de lineas funcionales

| Elemento | Color | Grosor |
|----------|-------|--------|
| Accion principal / Fase | `#ef4444` (rojo) | 2.5px |
| Flujo secundario / Neutro | `#3b82f6` (azul) | 2.5px |
| Estado de salida | `#f59e0b` (ambar) | 2.5px |
| Estado OK / Confirmado | `#10b981` (verde) | 2px |
| Fondo del diagrama | `#f8fafc` (blanco slate) | -- |
| Texto general | `#0f172a` (slate 900) | -- |

### 8.2 Formato SVG estandar

```xml
<svg viewBox="0 0 600 300" width="100%" height="250">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="300" y="30" font-family="'Outfit', sans-serif" font-size="14"
          font-weight="bold" fill="#0f172a" text-anchor="middle">
        TITULO DEL ESQUEMA EN MAYUSCULAS
    </text>
    <!-- Contenido del diagrama -->
</svg>
```

---

## 9. Anchura y Espaciado de Layout

### 9.1 Contenedor principal

```css
.container {
  max-width: 1440px;
  margin-inline: auto;
  padding-inline: var(--space-6); /* 24px */
}
```

### 9.2 Secciones de contenido

Las secciones de contenido textual (`.content-section`) deben usar `max-width: 100%` para aprovechar la totalidad del ancho del contenedor. Aplicar `max-width: 800px` unicamente cuando el diseno exija una columna estrecha de lectura.

```css
/* Correcto: aprovechar el ancho */
.content-section {
  max-width: 100%;
}

/* Solo en contextos de lectura larga sin tarjetas */
.content-section.narrow {
  max-width: 800px;
  margin: 0 auto;
}
```

### 9.3 Limite de longitud de parrafo global

El design system define `p { max-width: 75ch; }` como guia tipografica de lectura optima. Esta regla queda **anulada dentro de tarjetas** mediante `.card p { max-width: 100%; }` para que el texto ocupe el ancho total de la tarjeta.

---

## 10. Estructura de Carpetas del Proyecto

```
proyecto/
+-- index.html
+-- css/
|   +-- variables.css     <- Tokens de diseno (colores, fuentes, espaciados)
|   +-- base.css          <- Reset y estilos base (html, body, p, a, h1-h6)
|   +-- components.css    <- Cards, buttons, nav, footer, tables, alerts
|   +-- layout.css        <- Grid, content-section, page-header, sidebar
|   +-- simulators.css    <- Estilos especificos de simuladores/herramientas
|   +-- theme.css         <- Print styles, overrides de modo especifico
+-- js/
|   +-- app.js            <- Logica comun (scroll, Lucide init, tema)
+-- marca/
    +-- logos/
    |   +-- logo_transparente.svg
    |   +-- logo_fondo_oscuro.svg
    |   +-- logo_texto_blanco.svg
    +-- iconos/
    |   +-- favicon.svg
    |   +-- icono_app.svg
    +-- GUIA_DE_MARCA.md  <- Este documento
```

---

## 11. Checklist de Consistencia al Crear o Modificar Tarjetas

Antes de finalizar cualquier tarjeta nueva o modificada, verificar:

- [ ] El titulo usa la clase `.card-title` (no estilos inline de color o fuente)
- [ ] El texto usa `.card-text text-muted` (no `style="font-size: 0.85rem; color: ..."`)
- [ ] Los botones son `btn btn-primary btn-sm` o `btn btn-secondary btn-sm`
- [ ] El icono del header usa `color: var(--color-cyan)` y tamano `20x20px`
- [ ] No hay fondos `rgba()` custom sin justificacion
- [ ] Los `<p>` dentro de la tarjeta no tienen `max-width` inline (ya lo gestiona `.card p`)
