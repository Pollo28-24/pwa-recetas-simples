# Recetario — Cocina Simple (PWA)

Aplicación web progresiva (PWA) de recetas construida con **Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript** sobre la API gratuita V1 de [TheMealDB](https://www.themealdb.com/documentation).

## Diseño e identidad visual

- **Tema claro diurno** derivado de la suite oficial de iconos en `chef_gorro_blanco/` (`public/icons/icon-72x72.png` hasta `512x512`).
- **Paleta accesible**: porcelana cálida (`#FFFDF7`), mesada soleada (`#FFF8E6`), tinta marrón espresso (`#2B0000`), rojo tomate vivo (`#CA2F35`) y amarillo sol (`#FED84F` sobre superficies con tinta `#2B0000`).
- **Tipografía**: `Bricolage Grotesque` para titulares y `Figtree` para UI y lectura, con soporte completo de `prefers-reduced-motion` y foco visible (`:focus-visible`).

## Funcionalidades principales

- **Explorador completo de TheMealDB V1**:
  - Catálogo de ~790 recetas (`search.php?f=a..z`) cargado en lotes controlados con protección ante fallos parciales.
  - Categorías con miniaturas y descripciones (`categories.php`).
  - Filtro por cocina/país (`list.php?a=list` + áreas reales del catálogo) y filtro dinámico por ingrediente principal (`list.php?i=list` + `filter.php?i=`).
  - Descubrimiento instantáneo con **«¿Qué cocino hoy?»** (`random.php` vía `/api/meals/random`).
- **Ficha de receta práctica para cocinar**:
  - Ingredientes con miniaturas (`images/ingredients/{nombre}-small.png`) y checklist persistente en `localStorage`.
  - Pasos de preparación numerados y marcables como completados en `localStorage`.
  - Metadatos completos: nombre alternativo, etiquetas y cocina/categoría enlazables, vídeo en YouTube, fuente original, enlace canónico a TheMealDB y recetas relacionadas por categoría y cocina.
- **PWA Offline**:
  - `app/manifest.ts` con los 8 iconos PNG oficiales y shortcuts de acceso rápido.
  - `public/sw.js` con caché por capas, navegación `network-first` con fallback a `/offline`, precacheo automático de recetas marcadas como favoritas y `components/offline-banner.tsx`.
  - `components/install-button.tsx` con detección de `display-mode: standalone` e instrucciones para Safari iOS.

## Scripts

```bash
npm install
npm run dev        # Servidor de desarrollo
npm run typecheck  # Verificación de tipos TypeScript
npm run build      # Compilación de producción
npm run start      # Servidor de producción
```

## Atribución

Datos e imágenes de recetas proporcionados por [TheMealDB](https://www.themealdb.com/) (revisar sus [términos de uso](https://www.themealdb.com/terms_of_use.php) para publicación comercial o tiendas de aplicaciones).
