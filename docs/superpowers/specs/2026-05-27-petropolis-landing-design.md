# Veterinaria Petropolis — Landing Page

**Fecha:** 2026-05-27
**Tipo:** Proyecto desde cero
**Estado:** Spec — listo para implementar

---

## Resumen

Sitio web tipo landing para **Veterinaria Petropolis**, una veterinaria y centro de grooming en Ciudad de Guatemala. El objetivo es transmitir cercanía y profesionalismo a dueños de mascotas locales, y dirigir todas las conversiones a un único canal: **WhatsApp**. El proyecto es también de aprendizaje — el dueño es dev React Native con experiencia web pero nuevo en Astro, así que el código debe ser legible, con decisiones de arquitectura explicables.

## Decisiones de diseño tomadas en brainstorming

| Decisión | Valor final | Razón |
|---|---|---|
| Dirección visual | "Amigable Cálido" | Encaja con vete de barrio querida; ni corporativo frío ni infantil |
| Paleta primaria | Rosa `#EC4B82`, turquesa `#1FB6B6`, lima `#a8cc4a`, navy `#0F2A3A` | Colores reales del logo del cliente |
| Tipografía | Outfit (titulares), Plus Jakarta Sans (body), Nunito (logo) | Bold + redondeada + sans cálida = personalidad amigable |
| CTA principal | "Escríbenos por WhatsApp" en verde WhatsApp `#25D366` | Honesto sobre la acción; el negocio no agenda |
| Visual del hero | Logo grande centrado sobre gradient pastel rosa→turquesa→lima, con círculos decorativos | Minimalista, brand-forward, no depende de fotos reales |
| Logo | Texto multi-color con "o" central SVG (cara de Bulldog Francés) | Fiel al logo real, texto seleccionable, accesible |
| Sin badge de rating en hero | El 4.5★ va en sección de prueba social, no como gancho principal | El cliente no quiere enfocar en números |

## Stack

- **Astro 5** (última versión)
- **Tailwind CSS v4** vía `@tailwindcss/vite` plugin en `astro.config.mjs`, con tokens configurados en CSS usando `@theme` (en Tailwind v4 ya no se usa `tailwind.config.js`)
- **TypeScript** estricto en `astro.config.mjs`, `.astro` con `<script>` TS, y archivos `.ts` donde aplique
- **Imágenes**: `astro:assets` para optimización automática (avif/webp + lazy loading)
- **Mapa**: Leaflet 1.9 + OpenStreetMap tiles, como island (`client:visible`)
- **Iconos**: Lucide via `@iconify-json/lucide` + `astro-icon` (zero JS, SVG inline)
- **Fonts**: `@fontsource-variable/outfit`, `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/nunito` (self-host, no requests externos)
- **Sitemap**: `@astrojs/sitemap`

## Estructura de archivos

```
petropolis-astro/
├── astro.config.mjs           # vite plugin tailwindcss + @astrojs/sitemap
├── tsconfig.json              # strict mode
├── package.json
├── public/
│   ├── favicon.svg            # versión del "o-dog" del logo
│   └── og-image.png           # placeholder, reemplazable
├── src/
│   ├── layouts/
│   │   └── Layout.astro       # <head> con SEO, fonts, color-scheme, schema.org
│   ├── components/
│   │   ├── Logo.astro         # logo multi-color con "o-dog" SVG, prop size
│   │   ├── PawIcon.astro      # paw decorativo (filling color via prop)
│   │   ├── WhatsAppButton.astro  # variant: primary | secondary | floating
│   │   ├── ThemeToggle.astro  # botón sol/luna que toggle data-theme
│   │   ├── Nav.astro          # logo + links + CTA + theme toggle + menu mobile
│   │   ├── Hero.astro
│   │   ├── TwoPillars.astro   # cards Grooming + Veterinaria
│   │   ├── ServicesGrid.astro # grid completo de servicios con iconos
│   │   ├── SocialProof.astro  # 4.5★ + testimoniales (más sutil, no protagonista)
│   │   ├── Gallery.astro      # 6 retratos SVG inventados
│   │   ├── LocationMap.astro  # mapa Leaflet con pin pulsante
│   │   ├── Footer.astro
│   │   ├── PawCursor.astro    # script client: rastro de huellitas en mousemove
│   │   └── illustrations/
│   │       ├── ODog.astro     # cara Frenchie central del logo
│   │       ├── PetFrenchie.astro
│   │       ├── PetGrayCat.astro
│   │       ├── PetTabby.astro
│   │       ├── PetSchnauzer.astro
│   │       ├── PetPoodle.astro
│   │       └── PetRabbit.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── contacto.astro
│   ├── data/
│   │   └── site.ts            # tipado: nombre, WA, coords, horarios, servicios
│   ├── lib/
│   │   └── whatsapp.ts        # helper buildWhatsAppUrl(message)
│   └── styles/
│       └── global.css         # @tailwind + variables CSS para light/dark
└── docs/
    └── superpowers/specs/
        └── 2026-05-27-petropolis-landing-design.md  # este doc
```

### Por qué Astro y cómo se usa cada pieza

- **Layout `.astro`**: header HTML compartido (meta tags, fonts, schema.org JSON-LD). Las páginas hacen `<Layout title="..." description="...">…</Layout>` y heredan todo.
- **Componentes `.astro` sin `client:*`**: por defecto el JS no se envía al navegador. Astro renderea a HTML estático. Solo islas interactivas (mapa, theme toggle, cursor de huellitas) llevan `client:`.
- **Directivas de hidratación usadas**:
  - `client:load` → ThemeToggle (necesita responder al click apenas el HTML llega)
  - `client:visible` → LocationMap (Leaflet pesa, se carga al entrar en viewport)
  - `client:idle` → PawCursor (no urgente, espera al idle del navegador)
- **`astro:assets`**: solo aplica si después se reemplazan los SVG placeholder por fotos reales del local; por ahora no usamos imágenes raster.
- **Tailwind v4**: registrado como plugin de Vite en `astro.config.mjs` (no se usa la integración `@astrojs/tailwind` que era para v3). Toda la configuración va inline en `global.css` con `@import "tailwindcss";` + bloque `@theme { ... }` donde definimos tokens custom (paleta, fonts, fluid type). Esto es nuevo en Tailwind v4 — vale la pena comentarlo en el código.

## Datos del negocio (`src/data/site.ts`)

```ts
export const site = {
  name: 'Veterinaria Petropolis',
  tagline: 'Zona de Mascotas',
  whatsapp: {
    raw: '+50245867364',
    pretty: '+502 4586-7364',
    base: 'https://wa.me/50245867364',
  },
  location: {
    plusCode: 'MCWC+J8Q',
    city: 'Ciudad de Guatemala',
    lat: 14.696417,
    lng: -90.579278,
    googleMapsUrl: 'https://maps.google.com/?q=14.696417,-90.579278',
  },
  hours: {
    weekdays: 'Lun–Sáb',
    closing: '6:00 PM',
    note: 'A confirmar con el cliente',
  },
  rating: { value: 4.5, count: 27 }, // usado solo en SocialProof, NO en hero
  messages: {
    general:    '¡Hola! Vi su página web y quisiera más información',
    grooming:   '¡Hola! Me gustaría agendar grooming para mi mascota',
    vet:        '¡Hola! Quisiera consultar sobre servicios veterinarios',
    products:   '¡Hola! Quisiera consultar sobre concentrados y accesorios',
    emergency:  '¡Hola! Tengo una emergencia con mi mascota',
  },
} as const;
```

`lib/whatsapp.ts` exporta `buildWhatsAppUrl(message: string)` que concatena `site.whatsapp.base` con `?text=` + `encodeURIComponent(message)`.

## Componentes clave

### `Logo.astro`

```astro
---
type Props = { size?: 'sm' | 'md' | 'lg'; class?: string };
const { size = 'md', class: className = '' } = Astro.props;
const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl md:text-6xl' };
---
<span class:list={['petropolis-logo font-display font-black tracking-tight inline-flex items-baseline', sizes[size], className]}>
  <span class="text-pink">p</span>
  <span class="text-teal">e</span>
  <span class="text-lime">t</span>
  <span class="text-pink">r</span>
  <ODog class="o-dog inline-block align-middle" />
  <span class="text-pink">p</span>
  <span class="text-navy dark:text-cream">olis</span>
</span>
```

Texto seleccionable y accesible. La carita del bulldog en el "o" central es un componente SVG inline aparte (`ODog.astro`), reutilizable también en favicon y como mini-personaje.

### `WhatsAppButton.astro`

Props: `variant: 'primary' | 'secondary' | 'floating'`, `message: keyof typeof site.messages | string`, `label?: string`, `class?: string`.

Renderea `<a href={buildWhatsAppUrl(...)} target="_blank" rel="noopener">` con clases distintas por variante. La variante `floating` se posiciona fixed bottom-right con animación de entrada (scale + fade) tras 800ms.

### `LocationMap.astro` (Leaflet island)

```astro
---
const { lat, lng } = Astro.props;
---
<div id="map" class="aspect-video rounded-2xl" data-lat={lat} data-lng={lng}></div>

<script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  const el = document.getElementById('map')!;
  const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng);
  const map = L.map(el).setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { ... }).addTo(map);
  // custom pin SVG + popup con horarios + botón "Cómo llegar"
</script>
```

Se hidrata con `client:visible` desde `index.astro`. El popup tiene un botón que abre Google Maps con la ruta lista.

### `PawCursor.astro` (cursor de huellitas)

Solo desktop (matchMedia `(hover: hover)` y `(pointer: fine)`). En `mousemove`, dropea un SVG paw con CSS animation que fade out en 600ms. Pool de elementos reutilizables (max 12 a la vez) para evitar memory leaks. Throttle a ~50ms.

### `ThemeToggle.astro`

Botón sol/luna. Toggle `data-theme="dark"` en `<html>`. Persiste en `localStorage`. Script inline en `<head>` para evitar FOUC (lee localStorage antes de render). Variables CSS en `global.css` cambian valores según `[data-theme="dark"]`.

## Páginas

### `/` (index)

Orden de secciones:

1. **Nav** — logo, links anchor (Servicios, Ubicación, Contacto), theme toggle, CTA WhatsApp pequeño en desktop
2. **Hero** — eyebrow pill "Zona de Mascotas", headline `Tu mascota, en <accent>buenas manos</accent>.`, lead, CTAs (WhatsApp primary + "Cómo llegar" anchor a #ubicacion), visual = logo grande sobre gradient pastel con shapes
3. **TwoPillars** — dos cards (Grooming + Veterinaria & Productos), cada una con icono, descripción y `WhatsAppButton` propio
4. **ServicesGrid** — todos los servicios listados, agrupados por categoría con iconos Lucide
5. **Gallery** — 6 retratos SVG con nombres ficticios (Lulú, Mishi, Naranja, Tito, Bianca, Conejín)
6. **SocialProof** — 4.5★, "27 reseñas en Google", 2–3 testimoniales placeholder. Sutil, no protagonista.
7. **LocationMap** (`#ubicacion`) — mapa Leaflet, dirección textual, horarios, CTA "Cómo llegar"
8. **Footer** — contacto, horarios, créditos
9. **WhatsAppButton variant="floating"** — siempre visible

### `/contacto`

- Info completa de contacto
- Mapa más grande
- Grid 2×2 de "¿Qué necesitás?" — Grooming · Vacunas/consulta · Productos · Emergencia. Cada uno es un `WhatsAppButton` con su `message` pre-armado.
- Nota visible: "WhatsApp es la vía más rápida; llamadas y correo no se contestan siempre."

## SEO

- `<title>` y `<meta description>` en español por página
- Open Graph completo (og:title, og:description, og:image, og:type, og:locale=es_GT)
- Twitter Card summary_large_image
- JSON-LD Schema.org `VeterinaryCare` con address, phone, openingHours, aggregateRating, geo
- `@astrojs/sitemap` con `priority` y `changefreq` por página
- `<html lang="es">`
- Open Graph image: placeholder PNG con logo sobre fondo turquesa; reemplazable después

## Accesibilidad

- Contraste verificado en ambos modos (light/dark) — todos los pares ≥ 4.5:1
- Todos los CTAs son `<a>` o `<button>` con texto descriptivo (no solo iconos)
- `aria-label` en theme toggle, menu mobile, botón flotante
- Focus visible con outline turquesa
- `prefers-reduced-motion` respeta animaciones (cursor de huellitas se desactiva, animaciones de scroll se reducen a fade simple)
- Skip to main content link al inicio del body

## Modo oscuro (paleta)

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#fafafa` | `#0d1620` |
| `--surface` | `white` | `#162230` |
| `--text` | `#0F2A3A` | `#f0f4f8` |
| `--text-soft` | `#2a4555` | `#a5b4c4` |
| `--teal` (igual en ambos) | `#1FB6B6` | `#1FB6B6` |
| `--lime` | `#a8cc4a` | `#a8cc4a` |
| `--pink` | `#EC4B82` | `#EC4B82` |
| `--accent-bg` | `#E8F8F8` | `rgba(31,182,182,0.18)` |

El logo se mantiene multicolor en ambos modos — solo "olis" cambia de navy a cream en dark.

## Entregables de la primera corrida

1. Proyecto Astro inicializado (`package.json`, `astro.config.mjs`, `tsconfig.json`, `global.css` con Tailwind v4)
2. `Layout.astro` con `<head>` SEO completo + script anti-FOUC para theme
3. Página `/` con todas las secciones funcionando
4. Página `/contacto`
5. Componentes: `Logo`, `WhatsAppButton`, `Nav`, `Hero`, `TwoPillars`, `ServicesGrid`, `Gallery` (6 ilustraciones SVG), `SocialProof`, `LocationMap` (Leaflet), `Footer`, `ThemeToggle`, `PawCursor`
6. README con `npm install`, `npm run dev`, `npm run build`, lista de placeholders a reemplazar después (fotos reales, horarios confirmados, og-image, testimoniales reales)

## Fuera de scope (Fase 2)

- Galería antes/después con fotos reales del grooming
- Blog de tips con Content Collections + MDX
- Versión inglés
- Tracking analytics
- Calculadora "edad de mascota"
- Widget interactivo "Mi mascota es..."

## Riesgos / decisiones que confirmar después

- **Horarios reales**: "Hasta 6:00 PM" es placeholder, hay que confirmarlo con el cliente
- **Testimoniales**: por ahora placeholder; eventualmente sacar 2–3 reseñas reales de Google
- **Fotos del local**: cuando lleguen, reemplazar el visual del hero (opcional) y usar en una sección nueva tipo "Conocé el local"
- **OG image**: el placeholder generado debe reemplazarse por algo más curado (idealmente foto + logo overlay)

---
