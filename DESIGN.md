---
name: Recetario — Cocina Simple
description: Sistema visual diurno, minimalista y vivo derivado del icono oficial del chef con gorro blanco para consultar, filtrar y cocinar recetas sin fricción.
colors:
  canvas-porcelain: "#FFFDF7"
  surface-pure: "#FFFFFF"
  panel-sunlit: "#FFF8E6"
  line-sand: "#EADFD2"
  line-warm-strong: "#D3C1AF"
  ink-espresso: "#2B0000"
  ink-cocoa-muted: "#6B4E47"
  primary-tomato: "#CA2F35"
  primary-tomato-hover: "#AD2329"
  primary-tomato-soft: "#FDECEB"
  primary-tomato-ink: "#9E1F24"
  secondary-saffron: "#FED84F"
  secondary-saffron-hover: "#F5CA32"
  success-basil: "#15803D"
  success-basil-soft: "#ECFDF3"
  success-basil-ink: "#166534"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-tomato}"
    textColor: "{colors.surface-pure}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-tomato-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-pure}"
    textColor: "{colors.ink-espresso}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.secondary-saffron}"
    textColor: "{colors.ink-espresso}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "44px"
  card-recipe:
    backgroundColor: "{colors.surface-pure}"
    textColor: "{colors.ink-espresso}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Recetario — Cocina Simple

## Overview

**Creative North Star: "La Libreta de Cocina Soleada"**

El sistema traslada los colores exactos del ícono `chef_gorro_blanco` a una aplicación web diurna de alta legibilidad diseñada para usarse en la cocina con luz natural o interior. Rechaza los fondos oscuros técnicos y los relatos interminables antes de la receta, priorizando fotografía nítida de platos, controles táctiles amplios (`>= 44px`) y jerarquía directa entre búsqueda, filtros y preparación paso a paso.

**Key Characteristics:**
- Fondos luminosos de papel cálido (`#FFFDF7`) y mesada soleada (`#FFF8E6`) con tarjetas blancas (`#FFFFFF`) delimitadas por bordes finos.
- Contraste tipográfico alto (`18.72:1`) mediante tinta marrón espresso (`#2B0000`) tomada de los trazos del ícono del chef.
- Amarillo sol (`#FED84F`) usado como acento de fondo/selección con tinta `#2B0000` (`13.74:1`), y rojo tomate (`#CA2F35`) reservado para acciones primarias con texto blanco (`5.29:1`).

## Colors

La paleta combina neutros cálidos de cocina con dos acentos vivos heredados del ícono oficial del chef.

### Primary
- **Rojo Tomate Vivo** (`#CA2F35`): Color de acción principal (botón «¿Qué cocino hoy?», enlace activo de navegación, botón favorito activo, foco visible y enlaces de recuperación). Hover en `#AD2329` y superficie suave `#FDECEB` con tinta `#9E1F24`.

### Secondary
- **Amarillo Sol del Chef** (`#FED84F`): Superficie de resaltado para categoría seleccionada, badge contador de favoritos, números de paso pendientes, banner de sugerencia aleatoria y selección de texto (`::selection`). Hover en `#F5CA32`.

### Neutral
- **Porcelana Cálida** (`#FFFDF7`): Fondo base de la aplicación (`html`, `body`, `theme_color` del manifest).
- **Blanco Puro** (`#FFFFFF`): Superficie de tarjetas, cabecera fija, campos de entrada e ingredientes.
- **Mesada Soleada** (`#FFF8E6`): Panel de bienvenida, pie de página, estados vacíos y contenedores de miniaturas.
- **Línea Arena** (`#EADFD2` / `#D3C1AF`): Bordes `1px` entre superficies y estados hover.
- **Tinta Espresso** (`#2B0000`): Titulares, texto principal, texto sobre amarillo sol y bordes activos de chips.
- **Cacao Secundario** (`#6B4E47`): Metadatos de receta, descripciones de categoría y texto secundario (`7.36:1` sobre `#FFFDF7`).

### Named Rules
**The Yellow Surface Rule.** El amarillo sol (`#FED84F`) nunca se usa como color de texto ni icono sobre blanco (`1.39:1`); siempre actúa como fondo de relleno con tinta espresso (`#2B0000`, `13.74:1`) encima.

**The No-Violet Rule.** Ningún token de color, borde, gradiente o estado utiliza tonos violeta o lavanda.

## Typography

**Display Font:** Bricolage Grotesque (`var(--font-bricolage)`, pesos `500`, `600`, `700`)
**Body Font:** Figtree (`var(--font-figtree)`, pesos `400`, `500`, `600`, `700`)

**Character:** Emparejamiento cálido y contemporáneo pensado para apps culinarias: `Bricolage Grotesque` aporta personalidad editorial en titulares sin sacrificar compacidad, y `Figtree` mantiene lectura cómoda de ingredientes y pasos a `15px–16px`.

### Hierarchy
- **Display / H1** (`700`, `1.5rem–1.875rem` / `2.25rem` en detalle, `line-height: 1.15`, `letter-spacing: -0.025em`): Título del explorador y nombre de la receta.
- **Headline / H2** (`700`, `1.25rem`, `line-height: 1.25`): Secciones de «Ingredientes», «Preparación paso a paso» y recetas relacionadas.
- **Title / H3** (`600`, `1rem`, `line-height: 1.35`): Títulos de tarjeta en grilla.
- **Body** (`400–500`, `1rem`, `line-height: 1.5–1.65`, medida máxima `65ch` en pasos de preparación): Lectura cómoda a distancia de mesada.
- **Label / Meta** (`500–600`, `0.8125rem` / `13px`): Categoría, país de origen, contadores con `tabular-nums` y controles secundarios.

### Named Rules
**The Readable Floor Rule.** Ningún texto informativo o metadato baja de `13px` (`0.8125rem`), evitando etiquetas microscópicas ilegibles.

## Layout

Contenedor centrado de ancho máximo `max-w-6xl` (`1152px`) con márgenes adaptativos (`px-4` móvil, `px-6` tablet, `px-8` escritorio). Cabecera fija superior de `64px` (`h-16`), grilla responsive de recetas (`1` columna móvil, `2` tablet, `4` escritorio con `gap-4` y tarjeta destacada en primera fila), y ficha de receta organizada en cabecera superior partida (`6 / 6`) más libro abierto inferior de ingredientes fijos (`5 / 12`) y preparación editorial (`7 / 12`).

## Elevation & Depth

Superficies planas por defecto delimitadas por bordes `1px` en `#EADFD2`. Las sombras suaves (`0 12px 28px -14px rgba(43, 0, 0, 0.18)`) y el desplazamiento vertical sutil (`-2px`) aparecen únicamente como respuesta interactiva al pasar el cursor sobre tarjetas linkeadas.

### Named Rules
**The Flat-By-Default Rule.** Las tarjetas en reposo no llevan sombras pesadas ni bordes laterales gruesos; la jerarquía nace de la diferencia tonal entre `#FFFDF7`, `#FFF8E6` y `#FFFFFF`.

## Shapes

Sistema de radios consistente: `12px` (`rounded-xl`) para botones, inputs, selectores y chips de categoría; `16px` (`rounded-2xl`) para tarjetas de receta, pasos e ingredientes; `24px` (`rounded-3xl`) para contenedores hero y bloques vacíos; `9999px` (`rounded-full`) para el botón circular de favorito, emblema del header y contadores.

## Components

### Buttons
- **Shape:** `12px` (`rounded-xl`), altura mínima táctil `44px` (`min-h-11`).
- **Primary:** Relleno `#CA2F35`, texto `#FFFFFF`, hover `#AD2329`, escala `0.985` al presionar.
- **Secondary / Tonal:** Superficie `#FFFFFF` o `#FFF8E6` con borde `#D3C1AF` y tinta `#2B0000`.

### Chips
- **Style:** Borde `1px`, altura `44px`, miniatura de categoría `24x24px` y texto `13px` semibold.
- **State:** Inactivo en `#FFFFFF` (`#6B4E47`); activo en `#FED84F` con tinta y borde `#2B0000`.

### Cards
- **Corner Style:** `24px` (`rounded-3xl`).
- **Background:** `#FFFFFF` con borde `1px` `#EADFD2`.
- **Hover:** Elevación `-4px` (`-translate-y-1`), zoom de foto `1.05` dentro de `overflow-hidden` (`500ms ease-out`), flecha direccional deslizante y sombra suave.
- **Motion:** Entrada escalonada controlada (`enter-up`, máx. `10` pasos a `35ms`) al montar o cambiar filtros, más pulso `heart-pop` al marcar favorito, desactivados bajo `prefers-reduced-motion`.

### Inputs
- **Style:** Fondo `#FFFFFF`, borde `#D3C1AF`, radio `12px`, altura mínima `48px` (`min-h-12`).
- **Focus:** Borde `#CA2F35` y anillo `:focus-visible` instantáneo de `2px` con `outline-offset: 2px`.

### Navigation
- Cabecera opaca (`#FFFFFF`, `border-b #EADFD2`) con el logotipo `chef_gorro_blanco`, enlaces `Recetas` y `Favoritos` (badge contador en `#FED84F` con `#2B0000`) y botón contextual `Instalar app`.

## Do's and Don'ts

### Do:
- **Do** mantener todos los objetivos táctiles (`button`, `a`, filas de checklist) en al menos `44px` de alto.
- **Do** usar `#CA2F35` con blanco y `#FED84F` con `#2B0000` para garantizar contraste WCAG AA/AAA.
- **Do** usar iconografía SVG uniforme junto a las imágenes reales de TheMealDB y `chef_gorro_blanco`.

### Don't:
- **Don't** usar emojis como iconos de interfaz ni kickers/eyebrows encima de los titulares.
- **Don't** colocar texto blanco ni amarillo claro sobre fondos claros.
- **Don't** introducir animaciones de scroll o tarjetas con bordes laterales gruesos de color.
