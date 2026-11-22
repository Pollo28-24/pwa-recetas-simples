---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/receta/[id]/page.tsx","app/favoritos/page.tsx"]
---

# Surface Brief: Recetario (Explorador, Detalle y Favoritos)

- **Mode:** Operate
- **Related targets:** `app/receta/[id]/page.tsx`, `app/favoritos/page.tsx`, `app/offline/page.tsx`

## Direction contract

- **THESIS:** Una libreta de cocina diurna de alto contraste y respuesta instantánea: rechaza el formato de blog con historias largas antes de los ingredientes y el fondo oscuro técnico previo, poniendo al chef, el buscador, las categorías ilustradas y las recetas reales al frente desde el primer píxel.
- **OWN-WORLD:** Superficie papel cálido (`#FFFDF7`) y mesada soleada (`#FFF8E6`) con tarjetas blancas (`#FFFFFF`) delimitadas por líneas finas arena (`#EADFD2`), tinta marrón espresso (`#2B0000`) del ícono `chef_gorro_blanco`, acento primario rojo tomate (`#CA2F35`, texto blanco 5.29:1) y amarillo sol (`#FED84F`) usado exclusivamente como fondo de insignias/selecciones con tinta `#2B0000` (13.74:1). Tipografía `Bricolage Grotesque` para títulos y `Figtree` para UI/lectura.
- **STORY:** Quien entra encuentra qué cocinar en segundos (buscando, filtrando por categoría/cocina/ingrediente o pidiendo una receta aleatoria), abre la ficha directa con ingredientes ilustrados y marca avances mientras cocina sin depender de conexión tras guardar favoritos.
- **FIRST VIEWPORT:** Cabecera fija opaca de 64px con logotipo `chef_gorro_blanco`, enlaces `Recetas` y `Favoritos`, y botón `Instalar app`. Debajo, banda de bienvenida compacta sobre `#FFF8E6` con el chef, el titular `<h1>`, resumen numérico real del catálogo, campo de búsqueda y botón primario `¿Qué cocino hoy?`, seguido de la barra de categorías con miniaturas y los selectores de cocina e ingrediente.
- **FORM:** Cocinas iluminadas y cuaderno de recetas impreso moderno (posición 4, `seed:99afb0a4bddba2e0`), adaptado como aplicación operativa con controles estándar web, sin bordes laterales gruesos ni emojis de adorno.
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
