# FinLAR — Guía de Gestión del Proyecto

Bienvenido a la guía de gestión de FinLAR. Este documento explica cómo hacer las tareas más comunes sin necesidad de conocimientos técnicos.

---

## ¿Qué necesito instalado en mi ordenador?

| Software | Para qué sirve | Dónde descargarlo |
|---|---|---|
| **Node.js** (versión LTS) | Ejecutar el panel de administración local | https://nodejs.org |

> **Nota:** Una vez instalado Node.js, no tendrás que hacer nada más. Todo lo demás se instala automáticamente al ejecutar `iniciar-admin.bat`.

---

## Cómo escribir un nuevo artículo del blog

### Paso 1 — Iniciar el entorno local
1. Ve a la carpeta del proyecto (`\\192.168.0.12\home\Proyectos\FinLAR`)
2. Haz **doble clic** en el archivo `iniciar-admin.bat`
3. Se abrirán dos ventanas negras (son los servidores locales) — **no las cierres**
4. Tu navegador abrirá automáticamente el panel de administración

### Paso 2 — Crear el artículo
1. En el panel de administración, haz clic en **"📝 Artículos del Blog"**
2. Haz clic en el botón **"New Artículo"**
3. Rellena los campos:
   - **Título:** El título del artículo
   - **Extracto:** Descripción corta (2-3 frases) que aparecerá en la tarjeta del blog
   - **Categoría:** Ahorro / Hipotecas / Inversión
   - **Fecha:** La fecha de publicación
   - **Tiempo de lectura:** Ej. `5 min de lectura`
   - **Contenido:** Escribe el artículo con el editor visual
4. Haz clic en **"Publish"** (o "Save" para guardarlo como borrador)

### Paso 3 — Ver el resultado
- El artículo quedará guardado en la carpeta `blog/posts/` como un archivo `.md`
- Para verlo en la web local: abre `http://localhost:8080/blog/post.html?slug=nombre-del-articulo`
- La tarjeta del artículo aparecerá automáticamente en la sección "Artículos y Guías" de Educación

---

## Cómo funciona el sistema de artículos (explicación sencilla)

```
Panel de Admin (tu navegador)
        │
        │  Cuando guardas un artículo...
        ↓
blog/posts/nombre-articulo.md   ←── Se crea este archivo automáticamente
        │
        │  Cuando alguien visita el blog...
        ↓
educacion.html                  ←── Lee los archivos .md y muestra las tarjetas
blog/post.html?slug=nombre      ←── Lee el .md y renderiza el artículo completo
```

---

## Estructura del proyecto

```
FinLAR/
├── index.html          ← Página de inicio (con el Asistente)
├── educacion.html      ← Hub de educación y listado del blog
├── comprar.html        ← Guía para compradores
├── vender.html         ← Guía para vendedores
├── mercado.html        ← Análisis del mercado hipotecario
│
├── /admin/             ← Panel de administración (Decap CMS)
│    ├── index.html     ← Punto de entrada al panel
│    └── config.yml     ← Configuración del panel (NO TOCAR)
│
├── /blog/
│    ├── post.html      ← Plantilla universal de artículos
│    └── /posts/        ← Aquí se guardan los artículos en formato .md
│         └── fondo-emergencia.md
│
├── /simuladores/
│    ├── capacidad.html     ← Simulador de capacidad de endeudamiento
│    └── amortizacion.html  ← Simulador de estrategia de amortización
│
├── /assets/            ← Imágenes, logo, favicon
├── /css/               ← Estilos visuales (NO TOCAR)
├── /js/                ← Lógica de la web (NO TOCAR)
└── /marca/             ← Guía de marca e identidad visual
```

---

## Preparativos para publicar en internet (cuando llegue el momento)

Cuando decidas publicar la web, necesitarás hacer estos pasos **una sola vez**:

### 1. Subir el proyecto a GitHub
1. Entra en tu cuenta de GitHub (https://github.com)
2. Crea un nuevo repositorio llamado `FinLAR`
3. Sube todos los archivos de la carpeta del proyecto (puedes arrastrarlos)

### 2. Activar GitHub Pages
1. Ve a la página del repositorio en GitHub
2. Haz clic en **Settings** → **Pages**
3. En "Source", selecciona **Deploy from a branch**
4. Selecciona la rama `main` y haz clic en **Save**
5. En unos minutos, tu web estará en: `https://tu-usuario.github.io/FinLAR`

### 3. Activar el panel de administración en producción
1. Abre el archivo `admin/config.yml`
2. Borra o comenta la línea `local_backend: true` (añade `#` al principio)
3. Descomenta las líneas de `backend:` y cambia `TU_USUARIO_GITHUB` por tu usuario real
4. Sube el archivo modificado a GitHub

### 4. Seguridad: activar 2FA en GitHub
1. Ve a GitHub → **Settings** → **Password and authentication**
2. Activa **Two-factor authentication** (autenticación en dos pasos)
3. Guarda los códigos de recuperación en un lugar seguro

---

## Preguntas frecuentes

**¿Puede alguien modificar mi web sin mi permiso?**
No. Solo tú puedes modificar el código porque solo tú tienes acceso a tu cuenta de GitHub. La web pública es de solo lectura para el mundo.

**¿Puede alguien publicar artículos sin mi permiso?**
No. El panel de administración está protegido por tu cuenta de GitHub. Solo quien tenga acceso a tu cuenta puede publicar artículos.

**¿Qué pasa si cierro el ordenador mientras edito un artículo?**
Si hiciste clic en "Save" o "Publish", el artículo está guardado. Si no, se habrá perdido el progreso no guardado (igual que en cualquier editor de texto).

**¿Puedo tener colaboradores que ayuden a escribir artículos?**
Sí. Puedes añadir colaboradores en GitHub (Settings → Collaborators). Solo ellos podrán acceder al panel. Tú siempre podrás revocar el acceso.
