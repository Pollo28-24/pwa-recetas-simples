# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cocineros caseros, estudiantes y usuarios cotidianos en móvil y escritorio que buscan qué cocinar rápido, consultan recetas paso a paso con la pantalla a mano en la cocina, filtran por ingredientes que ya tienen y guardan favoritos para consultar incluso sin conexión.

## Product Purpose

Recetario PWA ligero y de carga rápida que convierte la base gratuita de TheMealDB en un explorador culinario instalable, buscable por nombre, categoría, cocina e ingrediente, con vista de preparación clara, favoritos persistentes offline y descubrimiento aleatorio.

## Positioning

PWA culinaria directa y sin ruido editorial: cero cuentas obligatorias, cero muros de texto antes de los ingredientes, acceso inmediato a 790 recetas con fotos reales, filtros útiles y modo offline real para recetas guardadas.

## Operating Context

- Uso habitual en cocina bajo luz diurna o interior bien iluminado (móvil en mano o tablet/laptop en mesada), con interacción rápida de una mano para tildar ingredientes y seguir pasos.
- La app consume la API gratuita V1 de TheMealDB (`/api/json/v1/1/`) con datos de recetas en inglés; la interfaz de usuario se presenta en español.
- Se instala como PWA en Android, escritorio y pantalla de inicio iOS; debe funcionar de forma resiliente ante caídas parciales de red o modo sin conexión.

## Capabilities and Constraints

- Stack: Next.js 16 App Router, React 19, Tailwind CSS 4 y TypeScript.
- Endpoints V1 de TheMealDB cubiertos: catálogo (`search.php?f=`), búsqueda (`search.php?s=`), detalle (`lookup.php?i=`), categorías (`categories.php`), listado y filtro por cocina (`list.php?a=list`, `filter.php?a=`), listado y filtro por ingrediente (`list.php?i=list`, `filter.php?i=`), filtro por categoría (`filter.php?c=`) y receta aleatoria (`random.php`).
- Atribución obligatoria a TheMealDB como fuente de datos e imágenes y enlaces a su web cuando corresponda (`terms_of_use.php`).
- Notificaciones web/push diferidas hasta definir backend/VAPID; el alcance actual no requiere base de datos ni autenticación.

## Brand Commitments

- Nombre de aplicación: Recetario.
- Iconografía oficial obligatoria: suite PNG de `chef_gorro_blanco` (72x72 a 512x512).
- Identidad visual de tema claro luminoso, moderno, minimalista y con colores vivos extraídos del ícono oficial (blanco cálido, amarillo sol `#FED84F` sobre fondos/badges con tinta marrón espresso `#2B0000`, y rojo tomate `#CA2F35` con contraste accesible AA/AAA).

## Evidence on Hand

- 8 iconos PNG verificados en `chef_gorro_blanco/` (`72x72` hasta `512x512`).
- API en vivo de TheMealDB V1 verificada: 790 recetas únicas, 14 categorías con miniatura y descripción, 37 cocinas activas con recetas y 992 ingredientes con miniatura y descripción.

## Product Principles

1. Claridad en la cocina primero: ingredientes, cantidades y pasos legibles antes que adornos.
2. Tolerancia a fallos de red y modo offline real para navegación básica y favoritos guardados.
3. Contraste accesible y lenguaje visual coherente con la marca del chef sin sacrificar legibilidad.
4. Sin relleno ni fricción: cada filtro, botón o metadato responde a una tarea real del cocinero.

## Accessibility & Inclusion

- Cumplimiento WCAG AA (≥ 4.5:1 en texto normal y ≥ 3:1 en texto grande/controles), skip link de teclado, foco visible sin transiciones lentas, objetivos táctiles ≥ 44px en acciones principales y respeto por `prefers-reduced-motion`.
