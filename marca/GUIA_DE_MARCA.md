# SmartLAR — Manual de Identidad de Marca

> **Versión**: 1.0  
> **Última actualización**: Junio 2026  
> **Uso**: Este documento es la referencia única para toda la comunicación visual de SmartLAR: web, app de dossieres, documentos de proyecto e informes de consultoría.

---

## 1. Esencia de Marca

SmartLAR representa la intersección entre la **arquitectura contemporánea de alta gama** y la **ingeniería invisible**.

| Atributo | Valor |
|----------|-------|
| **Tono** | Profesional, sobrio, tecnológico y de confianza |
| **Enfoque** | Experiencia de usuario y diseño limpio |
| **Audiencia** | Arquitectos, promotores, propietarios premium o tecnológicos |
| **Sector** | Consultoría de domótica e integración smart home |

---

## 2. Logotipos

### 2.1 Variantes disponibles

| Variante | Archivo | Uso |
|----------|---------|-----|
| **Logo transparente** | [`logo_transparente.svg`](file:///C:/Users/roica/Desktop/SmartLAR/marca/logos/logo_transparente.svg) | Fondos claros (web modo claro, documentos impresos) |
| **Logo fondo oscuro** | [`logo_fondo_oscuro.svg`](file:///C:/Users/roica/Desktop/SmartLAR/marca/logos/logo_fondo_oscuro.svg) | Fondos oscuros (app, web dark mode, dossieres) |
| **Logo texto blanco** | [`logo_texto_blanco.svg`](file:///C:/Users/roica/Desktop/SmartLAR/marca/logos/logo_texto_blanco.svg) | Fondos transparentes oscuros, superposiciones |

### 2.2 Estructura del logotipo

El logotipo consta de tres elementos:

1. **Icono de Tejado Smart** — Chevron minimalista con degradado Cyan→Blue que simboliza la domótica integrada en el hogar.
2. **Marca Nominativa** — "SmartLAR" en tipografía geométrica Outfit Bold (700).
3. **Descriptor** — "CONSULTING" con letra espaciada (letter-spacing: 0.25em) en Inter SemiBold.

### 2.3 Reglas de aplicación

- **Espacio de seguridad**: Margen libre equivalente a la altura de la "S" del logotipo.
- **Tamaño mínimo impreso**: 35 mm de ancho.
- **Tamaño mínimo digital**: 140 px de ancho.
- **Prohibiciones**: No distorsionar, no cambiar colores del degradado, no añadir sombras o efectos.

---

## 3. Iconos

| Icono | Archivo | Uso |
|-------|---------|-----|
| **Favicon** | [`favicon.svg`](file:///C:/Users/roica/Desktop/SmartLAR/marca/iconos/favicon.svg) | Pestaña del navegador (web y app) |
| **Icono App** | [`icono_app.svg`](file:///C:/Users/roica/Desktop/SmartLAR/marca/iconos/icono_app.svg) | Accesos directos, avatares, splash screens |

---

## 4. Paleta de Colores

### 4.1 Colores principales (fondo y superficie)

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Deep Obsidian** | `#030307` | (3, 3, 7) | Fondo principal de app, dossieres y web dark |
| **Luxury Navy** | `#080812` | (8, 8, 18) | Paneles, tarjetas, cajas de datos |
| **Surface Slate** | `#0f172a` | (15, 23, 42) | Elementos elevados, headers de tablas |
| **Glassmorphic Border** | `rgba(255,255,255, 0.06)` | — | Bordes de cuadros, divisores |

### 4.2 Colores de acento

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Smart Cyan** | `#06b6d4` | (6, 182, 212) | Highlight primario, iconos, estados activos |
| **Sapphire Blue** | `#3b82f6` | (59, 130, 246) | Botones CTA, cabeceras secundarias |
| **Electric Indigo** | `#6366f1` | (99, 102, 241) | Gráficos energéticos, cableado KNX |

### 4.3 Colores de texto

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Pure White** | `#f8fafc` | (248, 250, 252) | Títulos principales |
| **Slate Grey** | `#94a3b8` | (148, 163, 184) | Cuerpo de texto |
| **Muted Slate** | `#64748b` | (100, 116, 139) | Notas, leyendas, subtítulos menores |

### 4.4 Colores funcionales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Success Green** | `#10b981` | Confirmación, estados correctos |
| **Warning Amber** | `#f59e0b` | Alertas, cargas eléctricas |
| **Error Red** | `#ef4444` | Errores, línea de fase 230V |

### 4.5 Degradados corporativos

```css
/* Degradado principal (iconos, acentos) */
background: linear-gradient(135deg, #06b6d4, #3b82f6);

/* Degradado de lujo (fondos premium) */
background: linear-gradient(135deg, #030307, #0f172a);

/* Degradado de texto (títulos de sección) */
background: linear-gradient(90deg, #f8fafc 0%, #06b6d4 100%);
-webkit-background-clip: text;
```

---

## 5. Tipografía

### 5.1 Familias tipográficas

| Rol | Fuente | Familia | Fuente de carga |
|-----|--------|---------|----------------|
| **Títulos y encabezados** | Outfit | Sans-serif geométrica | Google Fonts |
| **Cuerpo y tablas** | Inter | Sans-serif neutral | Google Fonts |

### 5.2 Jerarquía en documentos

| Elemento | Fuente | Peso | Tamaño | Color |
|----------|--------|------|--------|-------|
| Título portada | Outfit | Bold (700) | 28–32pt | `#f8fafc` |
| H1 (sección) | Outfit | Medium (500) | 20–22pt | `#f8fafc` o degradado Cyan→Blue |
| H2 (subsección) | Outfit | Light (300) | 14–16pt | `#06b6d4` |
| Cuerpo | Inter | Light (300) | 10–11pt | `#94a3b8` |
| Tablas | Inter | Regular (400) | 9pt | `#94a3b8` |
| Etiquetas/Tags | Inter | SemiBold (600) | 8pt | `#64748b` |

### 5.3 Carga en HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 6. Iconografía

### 6.1 Librería de iconos

Se utiliza **Lucide Icons** como librería principal por su estilo geométrico, limpio y coherente con la marca.

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

### 6.2 Reglas de uso

- **Trazo**: 1.5px–2px (coherente con el estilo de línea del logo).
- **Tamaño estándar**: 20×20px (UI), 24×24px (acciones principales), 16×16px (inline).
- **Color**: Heredar el color de texto del contexto o usar Smart Cyan para estados activos.

---

## 7. Componentes UI Comunes

### 7.1 Botones

```css
/* Botón primario */
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

/* Botón secundario (outline) */
.btn-secondary {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 20px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
}

/* Botón danger */
.btn-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
}
```

### 7.2 Tarjetas

```css
.card {
    background: #080812;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 24px;
    backdrop-filter: blur(10px);
}
```

### 7.3 Tablas

```css
.table th {
    background: #0f172a;
    color: #f8fafc;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.table td {
    color: #94a3b8;
    font-family: 'Inter', sans-serif;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}
```

---

## 8. Diagramas SVG de Productos

### 8.1 Estilo de conexionado

Todos los esquemas de conexionado de productos deben seguir estas reglas:

| Elemento | Color | Grosor |
|----------|-------|--------|
| Línea de Fase (L) | `#ef4444` (rojo) | 2.5px |
| Neutro (N) | `#3b82f6` (azul) | 2.5px |
| Salida a carga | `#f59e0b` (ámbar) | 2.5px |
| Interruptor/Switch | `#10b981` (verde) | 2px |
| Caja del dispositivo Sonoff | `#f26522` (naranja Sonoff) | — |
| Caja del dispositivo Shelly | `#0284c7` (azul Shelly) | — |
| Caja del dispositivo Aqara | `#0ea5e9` (sky blue Aqara) | — |
| Fondo del diagrama | `#f8fafc` (blanco slate) | — |
| Texto general | `#0f172a` (slate 900) | — |

### 8.2 Formato SVG estándar

```xml
<svg viewBox="0 0 600 300" width="100%" height="250">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="300" y="30" font-family="'Outfit', sans-serif" font-size="14" 
          font-weight="bold" fill="#0f172a" text-anchor="middle">
        TÍTULO DEL ESQUEMA EN MAYÚSCULAS
    </text>
    <!-- Contenido del diagrama -->
</svg>
```

---

## 9. Pautas para Dossieres de Proyecto

### 9.1 Estructura de un dossier

1. **Portada** — Logo + nombre del proyecto + dirección + fecha
2. **Índice de contenidos**
3. **Resumen ejecutivo** — Descripción del proyecto en 1 párrafo
4. **Equipamiento propuesto** — Fichas de producto con imagen, specs y diagrama
5. **Planos domóticos** — Simbología smart sobre plano arquitectónico
6. **Presupuesto estimativo** — Tabla de equipos y mano de obra
7. **Condiciones** — Términos, garantías y soporte

### 9.2 Estilo visual de dossieres

- **Fondo**: Deep Obsidian (`#030307`)
- **Tarjetas de producto**: Luxury Navy (`#080812`) con borde glassmorphic
- **Imágenes de producto**: Sin fondo si es posible, o sobre fondo oscuro
- **Tablas de specs**: Estilo descrito en la sección 7.3

---

## 10. Uso en cada plataforma

| Plataforma | Logo a usar | Favicon | Paleta | Notas |
|------------|-------------|---------|--------|-------|
| **Web** (`web/`) | `logo_texto_blanco.svg` | `favicon.svg` | Dark completa | Web corporativa pública |
| **App** (`app/`) | `logo_fondo_oscuro.svg` | `favicon.svg` | Dark completa | SPA de dossieres |
| **Dossieres PDF** | `logo_fondo_oscuro.svg` | — | Dark completa | Fondo `#030307` |
| **Impresión** | `logo_transparente.svg` | — | Invertir a negro | Texto en negro, icono en degradado |
| **Email / Firma** | `logo_fondo_oscuro.svg` | — | Simplificada | Solo Cyan + White |

---

## Estructura de esta carpeta

```
marca/
├── logos/
│   ├── logo_transparente.svg      (fondos claros)
│   ├── logo_fondo_oscuro.svg      (fondos oscuros — uso principal)
│   └── logo_texto_blanco.svg      (superposiciones transparentes)
├── iconos/
│   ├── favicon.svg                (navegador)
│   └── icono_app.svg              (acceso directo / avatar)
└── GUIA_DE_MARCA.md               (este documento)
```

