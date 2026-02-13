# 🎓 Aplicación Web de Horarios Escolares
## IE Nuevo Compartir - San Nicolás

Una aplicación web moderna y responsive para consultar horarios escolares.

## ✨ Características

✅ **Múltiples formas de búsqueda:**
- Por curso (grados 6-11)
- Por profesor
- Por salón
- Búsqueda avanzada con filtros

✅ **Diseño moderno y profesional:**
- Interfaz intuitiva y fácil de usar
- Responsive (funciona en móviles, tablets y computadores)
- Animaciones suaves
- Colores institucionales

✅ **Sin necesidad de servidor:**
- Aplicación estática (HTML, CSS, JavaScript puro)
- Funciona completamente en el navegador
- Rápida y eficiente

## 📁 Estructura de Archivos

```
horarios-app/
├── index.html          # Página principal
├── styles.css          # Estilos (diseño moderno)
├── app.js              # Lógica de la aplicación
└── horarios-data.js    # Datos de horarios (510 clases)
```

## 🚀 Opciones de Despliegue

### Opción 1: GitHub Pages (Recomendada - GRATIS)

1. **Crear cuenta en GitHub** (si no tienes):
   - Ve a https://github.com
   - Crea una cuenta gratuita

2. **Crear un nuevo repositorio:**
   - Click en "New repository"
   - Nombre: `horarios-ienc` (o el que prefieras)
   - Público
   - Click "Create repository"

3. **Subir archivos:**
   - En tu repositorio, click "uploading an existing file"
   - Arrastra los 4 archivos (index.html, styles.css, app.js, horarios-data.js)
   - Click "Commit changes"

4. **Activar GitHub Pages:**
   - Ve a Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: main → / (root)
   - Click "Save"

5. **¡Listo!**
   - Tu sitio estará en: `https://tu-usuario.github.io/horarios-ienc`
   - Tarda 1-2 minutos en activarse

### Opción 2: Netlify (GRATIS)

1. **Ir a Netlify:**
   - https://www.netlify.com
   - Crear cuenta gratuita

2. **Desplegar:**
   - Click "Sites" → "Add new site" → "Deploy manually"
   - Arrastra la carpeta `horarios-app` completa
   - ¡Listo! Tendrás una URL automática

3. **Personalizar URL (opcional):**
   - Site settings → Change site name
   - Cambia a: `horarios-ienc` o similar
   - URL final: `horarios-ienc.netlify.app`

### Opción 3: Vercel (GRATIS)

1. **Ir a Vercel:**
   - https://vercel.com
   - Crear cuenta gratuita

2. **Desplegar:**
   - Click "New Project"
   - Arrastra los 4 archivos
   - Click "Deploy"

3. **Tu sitio estará listo en segundos**

### Opción 4: Servidor Web Propio

Si ya tienes un servidor web (Apache, Nginx, etc.):

1. Copia todos los archivos a la carpeta pública del servidor
2. Ejemplo: `/var/www/html/horarios/`
3. Accede desde: `http://tu-dominio.com/horarios/`

## 📱 Cómo Usar la Aplicación

### Para Estudiantes:

1. Abre la aplicación en el navegador
2. Click en "Por Curso"
3. Selecciona tu curso (ej: 1105)
4. Click "Ver Horario"
5. ¡Listo! Verás tu horario semanal completo

### Para Profesores:

1. Click en "Por Profesor"
2. Busca tu nombre en la lista
3. Click "Ver Horario"
4. Verás todas tus clases organizadas

### Para Administración:

1. Click en "Por Salón" para ver la ocupación de cada salón
2. Click en "Búsqueda" para hacer consultas específicas:
   - Ver todas las clases de un día específico
   - Ver qué pasa en una hora específica
   - Combinar filtros

## 🔧 Actualizar Datos

Para actualizar los horarios:

1. Genera un nuevo archivo `schedule-data-complete.json` con los cambios
2. Ejecuta el script de conversión (ver más abajo)
3. Reemplaza el archivo `horarios-data.js`
4. Vuelve a subir a tu hosting

**Script de conversión:**

```bash
cd /home/claude
node -e "
const data = require('./schedule-data-complete.json');
const nombresPreferidos = require('./nombres_preferidos.json');

const dataConNombres = data.map(clase => ({
  ...clase,
  teacherDisplay: nombresPreferidos[clase.teacher] || clase.teacher
}));

const jsContent = \`const HORARIOS_DATA = \${JSON.stringify(dataConNombres, null, 2)};
const NOMBRES_DOCENTES = \${JSON.stringify(nombresPreferidos, null, 2)};\`;

require('fs').writeFileSync('./horarios-data.js', jsContent);
"
```

## 🎨 Personalización

### Cambiar Colores:

Edita `styles.css` en la sección `:root`:

```css
:root {
    --primary: #2563eb;        /* Color principal */
    --primary-dark: #1e40af;   /* Color oscuro */
    --secondary: #10b981;      /* Color secundario */
    --accent: #f59e0b;         /* Color de acento */
}
```

### Cambiar Nombre de la Institución:

Edita `index.html`:
- Línea 6: `<title>`
- Línea 18: `<p class="header-subtitle">`

## 💡 Consejos

- **Compartir el link:** Envía el link por WhatsApp, email, o redes sociales
- **QR Code:** Genera un código QR del link para posters o circulares
- **Agregar a favoritos:** Los usuarios pueden guardar la página en sus favoritos
- **Agregar a pantalla de inicio (móvil):** En el navegador móvil → Opciones → "Agregar a pantalla de inicio"

## 📊 Estadísticas

- **510 clases** registradas
- **17 cursos** (Grados 6-11)
- **24 profesores**
- **20 salones**
- **5 días** × **6 horas**

## 🆘 Soporte

Si necesitas ayuda:
1. Verifica que todos los archivos estén en la misma carpeta
2. Abre la consola del navegador (F12) para ver errores
3. Asegúrate de que `horarios-data.js` tenga los datos correctos

## 📄 Licencia

Desarrollado para IE Nuevo Compartir - San Nicolás
© 2026 - Todos los derechos reservados

---

**¿Necesitas ayuda para desplegar? Contáctame y te guío paso a paso.**
