# Petropolis — Landing

Landing page para Veterinaria Petropolis (Ciudad de Guatemala). Astro 6 + Tailwind v4 + TypeScript.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # genera dist/
npm run preview      # sirve dist/ localmente
npm test             # corre los tests con Vitest
npm run astro check  # type-check + content collections
```

## Estructura clave

- `src/data/site.ts` — fuente única de verdad para textos, WhatsApp, coords, horarios, servicios y mensajes pre-armados.
- `src/lib/whatsapp.ts` — helper `buildWhatsAppUrl(message)`.
- `src/components/illustrations/` — siete ilustraciones SVG (ODog del logo + 6 retratos de la galería).
- `src/styles/global.css` — Tailwind v4 con tokens en `@theme` y variables de superficie para modo oscuro.

## Decisiones de Astro

- **Layout `.astro`** envuelve cada página y maneja el `<head>` (SEO, fonts, anti-FOUC del tema, Schema.org).
- **Componentes `.astro` sin `client:*`** renderean a HTML puro — cero JS al cliente.
- **Islas interactivas** (3 únicas):
  - `ThemeToggle` — `<script>` que toggle `data-theme` en `<html>` y persiste en localStorage
  - `LocationMap` — `<script>` con `import` de Leaflet, hidrata al cargar la página
  - `PawCursor` — `<script>` que se activa solo en desktop con hover fino
- **Tailwind v4** se registra como plugin de Vite en `astro.config.mjs`. Todos los tokens van en `src/styles/global.css` dentro de `@theme` (no hay `tailwind.config.js`).

## Placeholders a reemplazar después

- `public/og-image.png` — actualmente no existe (404 al compartir). Generar imagen 1200×630 con logo + fondo turquesa.
- `site.url` en `src/data/site.ts` — actualizar al dominio real cuando se publique.
- `site.hours` — horarios placeholder, confirmar con el cliente y actualizar.
- Testimoniales en `src/components/SocialProof.astro` — reemplazar con reseñas reales de Google cuando se tengan.
- Fotos reales del local — pueden ir en una sección nueva tipo "Conocé el local" o reemplazar el visual del hero.

## Sobre el logo

Las letras de "petropolis" son texto seleccionable con clases de Tailwind para los colores (`text-pink`, `text-teal`, etc). Solo el "o" central es SVG inline (`<ODog />`). Esto mantiene la accesibilidad (lector de pantalla lee "Petropolis"), permite que el texto se copie, y deja un único punto de variación visual.

## Spec y plan de implementación

- Spec de diseño: [`docs/superpowers/specs/2026-05-27-petropolis-landing-design.md`](docs/superpowers/specs/2026-05-27-petropolis-landing-design.md)
- Plan de implementación: [`docs/superpowers/plans/2026-05-27-petropolis-landing.md`](docs/superpowers/plans/2026-05-27-petropolis-landing.md)
