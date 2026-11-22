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
  - Cabecera editorial con fotografía, conteo de ingredientes y pasos, acceso rápido a favoritos y enlaces multimedia.
  - Lista de ingredientes tipo recetario con miniaturas reales (`images/ingredients/{nombre}-small.png`) y medidas alineadas.
  - Pasos de preparación numerados de lectura limpia (`62ch`) sin controles innecesarios.
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

## Despliegue en Vercel

El proyecto está listo para desplegarse directamente desde GitHub en Vercel sin variables de entorno obligatorias:

- `vercel.json`: define `framework: "nextjs"`, `fluid: true`, cabeceras `Cache-Control: public, max-age=0, must-revalidate` + `Service-Worker-Allowed: /` para `/sw.js` y `/manifest.webmanifest`, además de cabeceras básicas de seguridad.
- `next.config.ts`: habilita `image/avif` y `image/webp` con `minimumCacheTTL` de 30 días para las imágenes de `www.themealdb.com`, evitando transformaciones redundantes.
- `app/api/meals/*`: ejecuta en Node.js con cabeceras CDN `s-maxage=3600, stale-while-revalidate=86400` en `/api/meals/filter` y `/api/meals/lookup`, y `no-store` en `/api/meals/random`.
- `app/layout.tsx`: configura `metadataBase` automático con `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`.

Pasos para publicar:
1. Importar el repositorio `Pollo28-24/pwa-recetas-simples` en [vercel.com/new](https://vercel.com/new) (detecta Next.js automáticamente).
2. Hacer clic en **Deploy** (o ejecutar `vercel --prod` desde Vercel CLI tras autenticarse).

## Atribución

Datos e imágenes de recetas proporcionados por [TheMealDB](https://www.themealdb.com/) (revisar sus [términos de uso](https://www.themealdb.com/terms_of_use.php) para publicación comercial o tiendas de aplicaciones).
