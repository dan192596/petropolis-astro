# Petropolis Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Astro 5 landing page for Veterinaria Petropolis with a custom multi-color SVG logo, six hand-drawn pet illustrations, light/dark mode, paw-trail cursor, Leaflet map, and WhatsApp-driven conversion.

**Architecture:** Static-first Astro site. Almost everything renders to HTML at build time. Only three interactive islands ship JS: `ThemeToggle` (client:load), `PawCursor` (client:idle, desktop only), and `LocationMap` (client:visible). Tailwind v4 with inline `@theme` tokens in CSS (no `tailwind.config.js`). All copy in Spanish (es-GT). All conversion paths go to `wa.me/50245867364` with context-aware pre-filled messages.

**Tech Stack:** Astro 5, Tailwind v4 (via `@tailwindcss/vite`), TypeScript strict, Leaflet 1.9, @astrojs/sitemap, @fontsource-variable, Vitest (for pure-function tests).

**Spec:** [docs/superpowers/specs/2026-05-27-petropolis-landing-design.md](../specs/2026-05-27-petropolis-landing-design.md)

---

## Verification approach

For pure functions (`whatsapp.ts`) → real TDD with Vitest.
For components and pages → build verification via `npm run astro check` + `npm run build`, plus manual dev-server visual check. Astro doesn't have strong component-testing conventions, so "test" = "compiles + types check + renders correctly in browser."

After every task, the engineer should commit. Run `npm run astro check` before committing structural changes.

---

## File Structure

Every file the plan creates or modifies, with responsibility:

```
petropolis-astro/
├── astro.config.mjs            Astro config + @tailwindcss/vite plugin + sitemap
├── tsconfig.json               strict TS, extends astro/tsconfigs/strict
├── package.json                deps + scripts
├── .gitignore                  (already exists)
├── public/
│   ├── favicon.svg             stylized "o-dog" only, as standalone SVG
│   └── robots.txt              allow all + sitemap reference
├── src/
│   ├── env.d.ts                Astro types
│   ├── data/
│   │   └── site.ts             single source of truth: name, WA, coords, hours, services, messages
│   ├── lib/
│   │   └── whatsapp.ts         buildWhatsAppUrl(message) helper
│   ├── styles/
│   │   └── global.css          @import "tailwindcss" + @theme tokens + dark vars + reset
│   ├── layouts/
│   │   └── Layout.astro        <head> SEO + fonts + anti-FOUC theme script + Schema.org JSON-LD
│   ├── components/
│   │   ├── Logo.astro                  multi-color text + ODog island, prop size
│   │   ├── PawIcon.astro               decorative SVG paw, prop color
│   │   ├── WhatsAppButton.astro        variants: primary | secondary | floating
│   │   ├── ThemeToggle.astro           sun/moon button toggle
│   │   ├── Nav.astro                   logo + anchor links + ThemeToggle + WA CTA + mobile menu
│   │   ├── Hero.astro                  eyebrow + headline + lead + CTAs + logo card visual
│   │   ├── TwoPillars.astro            grooming + vet cards
│   │   ├── ServicesGrid.astro          all services grouped, icons
│   │   ├── Gallery.astro               6 pet portraits + heading
│   │   ├── SocialProof.astro           4.5★ + testimoniales placeholder
│   │   ├── LocationMap.astro           Leaflet island with pulse pin and popup
│   │   ├── Footer.astro                contact, hours, credits
│   │   ├── PawCursor.astro             desktop-only paw trail
│   │   └── illustrations/
│   │       ├── ODog.astro              the Bulldog face inside the logo's "o"
│   │       ├── PetFrenchie.astro       gallery: Lulú
│   │       ├── PetGrayCat.astro        gallery: Mishi
│   │       ├── PetTabby.astro          gallery: Naranja
│   │       ├── PetSchnauzer.astro      gallery: Tito
│   │       ├── PetPoodle.astro         gallery: Bianca
│   │       └── PetRabbit.astro         gallery: Conejín
│   └── pages/
│       ├── index.astro                 main landing
│       └── contacto.astro              contact page
└── tests/
    └── whatsapp.test.ts                vitest for the helper
```

---

## Task 1: Scaffold Astro and install dependencies

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `public/`

- [ ] **Step 1: Initialize Astro with the minimal template**

The cwd is `/Users/dan192596/Petropolis-astro`. The directory already contains `docs/`, `.gitignore`, and `.git/`. `create-astro` errors when the target directory is non-empty, so we temporarily stash the existing files, scaffold, then restore.

Run:
```bash
mkdir -p /tmp/petropolis-keep && \
mv docs /tmp/petropolis-keep/ && \
mv .gitignore /tmp/petropolis-keep/ && \
npm create astro@latest . -- --template minimal --typescript strict --install --no-git --skip-houston --yes && \
mv /tmp/petropolis-keep/docs ./ && \
mv -f /tmp/petropolis-keep/.gitignore ./ && \
rmdir /tmp/petropolis-keep
```

Expected: scaffolding completes, `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro` (placeholder), `public/favicon.svg` (default) and `node_modules/` appear. Our custom `.gitignore` overwrites the one Astro created (ours has `.superpowers/` etc). `docs/` and `.git/` survive intact.

Verify with:
```bash
ls -la
```

You should see at minimum: `astro.config.mjs`, `docs/`, `node_modules/`, `package.json`, `public/`, `src/`, `tsconfig.json`, `.git/`, `.gitignore`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install tailwindcss @tailwindcss/vite @astrojs/sitemap leaflet @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource-variable/nunito
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @types/leaflet
```

- [ ] **Step 4: Add test script to package.json**

Open `package.json` and add `"test": "vitest run"` to the `scripts` object. Final scripts block should look like:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run"
}
```

- [ ] **Step 5: Sanity build**

Run:
```bash
npm run build
```

Expected: success. The default Astro placeholder page builds to `dist/`. If it fails, fix before continuing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with dependencies"
```

---

## Task 2: Configure Astro + Tailwind v4 + sitemap

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Rewrite astro.config.mjs**

Replace the contents of `astro.config.mjs` with:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// NOTE: Tailwind v4 is wired in via a Vite plugin, not the legacy
// @astrojs/tailwind integration. Tokens are declared inline in
// src/styles/global.css using @theme — there is no tailwind.config.js.
export default defineConfig({
  site: 'https://petropolis.example.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Verify the config loads**

Run:
```bash
npm run astro check
```

Expected: passes (no type errors). The placeholder index.astro might emit hints, that's fine.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "chore: configure Tailwind v4 vite plugin and sitemap integration"
```

---

## Task 3: Global CSS with @theme tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write the global CSS**

Create `src/styles/global.css`:

```css
@import "tailwindcss";

/* Self-host font faces */
@import "@fontsource-variable/outfit";
@import "@fontsource-variable/plus-jakarta-sans";
@import "@fontsource-variable/nunito";

/*
 * Tailwind v4: tokens are defined here, not in a JS config.
 * Anything declared in @theme becomes a CSS custom property AND a
 * Tailwind utility (e.g. --color-teal -> bg-teal, text-teal, border-teal).
 */
@theme {
  --color-pink: #EC4B82;
  --color-pink-light: #F5A7B8;
  --color-teal: #1FB6B6;
  --color-teal-50: #E8F8F8;
  --color-teal-100: #C5EEEE;
  --color-teal-deep: #178a8a;
  --color-lime: #C5E86C;
  --color-lime-deep: #a8cc4a;
  --color-cream: #FFF6E8;
  --color-cream-deep: #F4D9A8;
  --color-navy: #0F2A3A;
  --color-navy-soft: #2a4555;
  --color-paper: #F8F5EF;
  --color-wa: #25D366;

  --font-display: "Outfit Variable", system-ui, sans-serif;
  --font-body: "Plus Jakarta Sans Variable", system-ui, sans-serif;
  --font-logo: "Nunito Variable", system-ui, sans-serif;
}

/*
 * Theme-aware surface tokens. These switch between light and dark.
 * The Tailwind tokens above stay constant (the brand colors don't shift),
 * but the surface/text/background tokens do.
 */
:root {
  --surface-bg: #fafafa;
  --surface-card: #ffffff;
  --surface-text: #0F2A3A;
  --surface-text-soft: #2a4555;
  --surface-accent-bg: #E8F8F8;
  color-scheme: light;
}

:root[data-theme="dark"] {
  --surface-bg: #0d1620;
  --surface-card: #162230;
  --surface-text: #f0f4f8;
  --surface-text-soft: #a5b4c4;
  --surface-accent-bg: rgba(31, 182, 182, 0.18);
  color-scheme: dark;
}

html { background: var(--surface-bg); }
body {
  font-family: var(--font-body);
  color: var(--surface-text);
  background: var(--surface-bg);
  -webkit-font-smoothing: antialiased;
}

/* Reduce motion preference: kill non-essential animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify it builds**

Run:
```bash
npm run build
```

Expected: builds without CSS errors. Tailwind will warn that no source files use any classes yet — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Tailwind v4 theme tokens and light/dark surface vars"
```

---

## Task 4: Site data file

**Files:**
- Create: `src/data/site.ts`

- [ ] **Step 1: Write the site data**

Create `src/data/site.ts`:

```typescript
export const site = {
  name: 'Veterinaria Petropolis',
  tagline: 'Zona de Mascotas',
  description:
    'Veterinaria y centro de grooming en Ciudad de Guatemala. Atención profesional con trato familiar para tu mascota.',
  url: 'https://petropolis.example.com',
  locale: 'es_GT',
  whatsapp: {
    raw: '+50245867364',
    digits: '50245867364',
    pretty: '+502 4586-7364',
    base: 'https://wa.me/50245867364',
  },
  location: {
    plusCode: 'MCWC+J8Q',
    city: 'Ciudad de Guatemala',
    addressLine: 'Plus Code MCWC+J8Q, Ciudad de Guatemala',
    lat: 14.696417,
    lng: -90.579278,
    googleMapsUrl: 'https://maps.google.com/?q=14.696417,-90.579278',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=14.696417,-90.579278',
  },
  hours: {
    weekdays: 'Lun–Sáb',
    closing: '6:00 PM',
    fullText: 'Lunes a sábado, hasta las 6:00 PM',
    note: 'Horario placeholder — confirmar con el cliente',
  },
  rating: { value: 4.5, count: 27 },
  messages: {
    general: '¡Hola! Vi su página web y quisiera más información',
    grooming: '¡Hola! Me gustaría agendar grooming para mi mascota',
    vet: '¡Hola! Quisiera consultar sobre servicios veterinarios',
    products: '¡Hola! Quisiera consultar sobre concentrados y accesorios',
    emergency: '¡Hola! Tengo una emergencia con mi mascota',
  },
  services: {
    grooming: [
      'Baño tibio',
      'Secado y cepillado',
      'Corte de pelo',
      'Corte de uñas',
      'Limpieza de orejas',
      'Drenaje de glándulas anales',
      'Loción',
      'Accesorios',
    ],
    vet: [
      'Vacunas',
      'Pipetas y collares antipulgas',
      'Desparasitantes',
      'Concentrados',
      'Atención médica',
      'Accesorios para mascotas',
    ],
  },
} as const;

export type MessageKey = keyof typeof site.messages;
```

- [ ] **Step 2: Verify types**

Run:
```bash
npm run astro check
```

Expected: no errors. The unused import warning for the file is normal at this stage.

- [ ] **Step 3: Commit**

```bash
git add src/data/site.ts
git commit -m "feat: add site data as single source of truth"
```

---

## Task 5: WhatsApp helper with TDD

**Files:**
- Create: `tests/whatsapp.test.ts`, `src/lib/whatsapp.ts`, `vitest.config.ts`

- [ ] **Step 1: Add vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `tests/whatsapp.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, getMessage } from '../src/lib/whatsapp';
import { site } from '../src/data/site';

describe('buildWhatsAppUrl', () => {
  it('builds a URL with an encoded literal message', () => {
    const url = buildWhatsAppUrl('Hola mundo');
    expect(url).toBe('https://wa.me/50245867364?text=Hola%20mundo');
  });

  it('encodes special characters and emoji', () => {
    const url = buildWhatsAppUrl('¡Hola! ¿Cómo está?');
    expect(url).toContain('%C2%A1Hola%21'); // ¡Hola!
    expect(url).toContain('%3F'); // ?
  });

  it('returns base URL with no text param if message is empty', () => {
    expect(buildWhatsAppUrl('')).toBe('https://wa.me/50245867364');
  });
});

describe('getMessage', () => {
  it('returns the literal string for known keys', () => {
    expect(getMessage('grooming')).toBe(site.messages.grooming);
    expect(getMessage('vet')).toBe(site.messages.vet);
  });

  it('passes through arbitrary strings as-is', () => {
    expect(getMessage('Custom message text')).toBe('Custom message text');
  });
});
```

- [ ] **Step 3: Run and confirm it fails**

```bash
npm test
```

Expected: fails with "Cannot find module '../src/lib/whatsapp'".

- [ ] **Step 4: Implement the helper**

Create `src/lib/whatsapp.ts`:

```typescript
import { site, type MessageKey } from '../data/site';

const KNOWN_KEYS = new Set<MessageKey>([
  'general',
  'grooming',
  'vet',
  'products',
  'emergency',
]);

export function getMessage(keyOrText: MessageKey | string): string {
  if ((KNOWN_KEYS as Set<string>).has(keyOrText)) {
    return site.messages[keyOrText as MessageKey];
  }
  return keyOrText;
}

export function buildWhatsAppUrl(message: string): string {
  if (!message) return site.whatsapp.base;
  return `${site.whatsapp.base}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 5: Run tests, confirm they pass**

```bash
npm test
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add tests/whatsapp.test.ts src/lib/whatsapp.ts vitest.config.ts
git commit -m "feat: add WhatsApp URL helper with tests"
```

---

## Task 6: Layout base (minimal, no theme script yet)

**Files:**
- Create: `src/layouts/Layout.astro`

- [ ] **Step 1: Write the base layout**

Create `src/layouts/Layout.astro`:

```astro
---
import '../styles/global.css';
import { site } from '../data/site';

interface Props {
  title?: string;
  description?: string;
  pathname?: string;
}

const {
  title = `${site.name} · ${site.tagline}`,
  description = site.description,
  pathname = Astro.url.pathname,
} = Astro.props;

const canonical = new URL(pathname, Astro.site ?? site.url).toString();
const ogImage = new URL('/og-image.png', Astro.site ?? site.url).toString();
---
<!doctype html>
<html lang="es" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonical} />

    <title>{title}</title>
    <meta name="description" content={description} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:locale" content={site.locale} />
    <meta property="og:image" content={ogImage} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <meta name="theme-color" content="#1FB6B6" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Replace the placeholder index with a layout test**

Overwrite `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout>
  <main class="p-8">
    <h1 class="font-display text-4xl text-navy">Petropolis (en construcción)</h1>
  </main>
</Layout>
```

- [ ] **Step 3: Verify it builds and renders**

Run:
```bash
npm run build
```

Expected: success. Check the produced `dist/index.html` contains the title and og tags.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/pages/index.astro
git commit -m "feat: add base Layout with full SEO head"
```

---

## Task 7: ODog illustration

**Files:**
- Create: `src/components/illustrations/ODog.astro`

The `ODog` is the central character of the brand — the Bulldog face that lives inside the "o" of the logo. It's reused in the logo, favicon, and as a mini brand icon.

- [ ] **Step 1: Write the component**

Create `src/components/illustrations/ODog.astro`:

```astro
---
interface Props {
  class?: string;
  /** Color used for the dog's silhouette and features. Defaults to navy. */
  color?: string;
}
const { class: className = '', color = '#0F2A3A' } = Astro.props;
---
<svg
  class={className}
  viewBox="0 0 100 100"
  aria-hidden="true"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="50" cy="55" r="42" fill={color} />
  <path d="M 22 28 Q 18 6, 32 16 Q 38 22, 34 36 Z" fill={color} />
  <path d="M 78 28 Q 82 6, 68 16 Q 62 22, 66 36 Z" fill={color} />
  <ellipse cx="50" cy="62" rx="26" ry="22" fill="#FFF6E8" />
  <path d="M 38 48 Q 50 44, 62 48" stroke={color} stroke-width="1.3" fill="none" opacity="0.5" stroke-linecap="round" />
  <circle cx="40" cy="58" r="3" fill={color} />
  <circle cx="60" cy="58" r="3" fill={color} />
  <path d="M 45 68 Q 50 64, 55 68 Q 56 74, 50 76 Q 44 74, 45 68 Z" fill={color} />
  <path d="M 50 76 L 50 80 Q 46 84, 43 82 M 50 80 Q 54 84, 57 82" stroke={color} stroke-width="1.5" fill="none" stroke-linecap="round" />
</svg>
```

- [ ] **Step 2: Verify**

Run:
```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/illustrations/ODog.astro
git commit -m "feat: add ODog brand illustration"
```

---

## Task 8: Logo component

**Files:**
- Create: `src/components/Logo.astro`

- [ ] **Step 1: Write the Logo**

Create `src/components/Logo.astro`:

```astro
---
import ODog from './illustrations/ODog.astro';

interface Props {
  /** Visual scale. `sm` = nav, `md` = card, `lg` = hero. */
  size?: 'sm' | 'md' | 'lg';
  /** When true the "olis" segment uses cream instead of navy (useful on dark surfaces). */
  invert?: boolean;
  class?: string;
}

const { size = 'md', invert = false, class: className = '' } = Astro.props;

const sizeClasses = {
  sm: 'text-xl md:text-2xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-5xl md:text-7xl',
};
---
<span
  class={`font-logo font-black tracking-tight inline-flex items-baseline leading-none ${sizeClasses[size]} ${className}`}
  aria-label="Petropolis"
>
  <span aria-hidden="true" class="text-pink">p</span>
  <span aria-hidden="true" class="text-teal">e</span>
  <span aria-hidden="true" class="text-lime-deep">t</span>
  <span aria-hidden="true" class="text-pink">r</span>
  <ODog class="inline-block align-middle w-[0.95em] h-[0.95em] -mx-[0.02em]" />
  <span aria-hidden="true" class="text-pink">p</span>
  <span aria-hidden="true" class={invert ? 'text-cream' : 'text-navy'}>olis</span>
</span>
```

- [ ] **Step 2: Use it on the index page to visually verify**

Replace `src/pages/index.astro` body with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Logo from '../components/Logo.astro';
---
<Layout>
  <main class="p-8 space-y-6">
    <Logo size="sm" />
    <Logo size="md" />
    <Logo size="lg" />
  </main>
</Layout>
```

- [ ] **Step 3: Start the dev server and visually verify**

Run in one terminal:
```bash
npm run dev
```

Open `http://localhost:4321`. Confirm three sizes of the logo render with the correct color sequence (pink·teal·lime·pink·dog·pink·navy "olis").

Stop the dev server when done (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add src/components/Logo.astro src/pages/index.astro
git commit -m "feat: add multi-color Logo component with size variants"
```

---

## Task 9: PawIcon component

**Files:**
- Create: `src/components/PawIcon.astro`

- [ ] **Step 1: Write the component**

Create `src/components/PawIcon.astro`:

```astro
---
interface Props {
  /** SVG fill color. Defaults to currentColor so it inherits from text. */
  color?: string;
  class?: string;
}
const { color = 'currentColor', class: className = '' } = Astro.props;
---
<svg
  class={className}
  viewBox="0 0 40 40"
  aria-hidden="true"
  fill={color}
  xmlns="http://www.w3.org/2000/svg"
>
  <ellipse cx="20" cy="26" rx="9" ry="8" />
  <ellipse cx="9" cy="14" rx="3.5" ry="4.5" />
  <ellipse cx="17" cy="9" rx="3.5" ry="4.5" />
  <ellipse cx="23" cy="9" rx="3.5" ry="4.5" />
  <ellipse cx="31" cy="14" rx="3.5" ry="4.5" />
</svg>
```

- [ ] **Step 2: Verify the build**

```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PawIcon.astro
git commit -m "feat: add PawIcon decorative SVG"
```

---

## Task 10: WhatsAppButton component

**Files:**
- Create: `src/components/WhatsAppButton.astro`

- [ ] **Step 1: Write the component**

Create `src/components/WhatsAppButton.astro`:

```astro
---
import { buildWhatsAppUrl, getMessage } from '../lib/whatsapp';
import type { MessageKey } from '../data/site';

interface Props {
  variant: 'primary' | 'secondary' | 'floating';
  /** Either a known message key from site.messages or a literal string. */
  message: MessageKey | string;
  label?: string;
  class?: string;
}

const { variant, message, label = 'Escríbenos por WhatsApp', class: className = '' } = Astro.props;

const text = getMessage(message);
const href = buildWhatsAppUrl(text);

const base =
  'inline-flex items-center justify-center gap-2 font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]';

const variants = {
  primary:
    'px-6 py-3.5 bg-wa text-white rounded-2xl text-sm md:text-base shadow-lg shadow-wa/30',
  secondary:
    'px-5 py-3 bg-white text-navy border-2 border-navy rounded-2xl text-sm dark:bg-transparent dark:text-cream dark:border-cream',
  floating:
    'fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-wa text-white shadow-xl shadow-wa/40 motion-safe:animate-[wa-pop_0.6s_ease_0.8s_both]',
};
---
<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  class={`${base} ${variants[variant]} ${className}`}
  aria-label={label}
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.9-.4-1.7-1-2.3-1.6-.6-.6-1.1-1.4-1.5-2.3-.1-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.2c.2.2 2.2 3.4 5.4 4.6.7.3 1.3.5 1.8.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.5-1.2C8.8 21.6 10.4 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
  {variant !== 'floating' && <span>{label}</span>}
  {variant === 'floating' && <span class="sr-only">{label}</span>}
</a>

<style is:global>
  @keyframes wa-pop {
    0% { transform: translateY(100%) scale(0.6); opacity: 0; }
    60% { transform: translateY(-6%) scale(1.05); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
</style>
```

- [ ] **Step 2: Test it on index**

Update `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Logo from '../components/Logo.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
---
<Layout>
  <main class="p-8 space-y-6">
    <Logo size="md" />
    <div class="flex flex-wrap gap-3">
      <WhatsAppButton variant="primary" message="general" />
      <WhatsAppButton variant="secondary" message="grooming" label="Hablemos de grooming" />
    </div>
    <WhatsAppButton variant="floating" message="general" />
  </main>
</Layout>
```

- [ ] **Step 3: Visually verify**

Run `npm run dev`, open `http://localhost:4321`. Confirm:
- Primary button: green WhatsApp color, rounded, with text and icon
- Secondary button: white with navy border
- Floating button: bottom-right circle that scales in after ~0.8s
- All open `https://wa.me/50245867364?text=...` in a new tab when clicked

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/WhatsAppButton.astro src/pages/index.astro
git commit -m "feat: add WhatsAppButton with primary/secondary/floating variants"
```

---

## Task 11: ThemeToggle component and anti-FOUC script

**Files:**
- Create: `src/components/ThemeToggle.astro`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add the anti-FOUC script to Layout**

Edit `src/layouts/Layout.astro`. Inside the `<head>` block, immediately after the `<meta name="viewport" ...>` line, add this inline script. It MUST run before paint to avoid a flash of the wrong theme.

```html
<script is:inline>
  // Read saved theme or fall back to OS preference. Apply before paint.
  (function () {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ?? (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  })();
</script>
```

Also change `<html lang="es" data-theme="light">` to just `<html lang="es">`. The script sets the attribute now.

- [ ] **Step 2: Create the toggle component**

Create `src/components/ThemeToggle.astro`:

```astro
---
interface Props {
  class?: string;
}
const { class: className = '' } = Astro.props;
---
<button
  type="button"
  class={`theme-toggle inline-grid place-items-center w-10 h-10 rounded-full bg-paper hover:bg-teal-100 transition-colors dark:bg-navy-soft dark:hover:bg-teal-deep ${className}`}
  aria-label="Cambiar entre modo claro y oscuro"
>
  <svg class="sun w-5 h-5 text-navy dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
  <svg class="moon w-5 h-5 text-cream hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
</button>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('.theme-toggle');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme ?? 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
    });
  });
</script>
```

- [ ] **Step 3: Add a `dark:` variant rule**

Tailwind v4 needs an explicit dark-mode selector when not using class strategy. Add this at the top of `src/styles/global.css`, right after the `@import` lines and before `@theme`:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

- [ ] **Step 4: Test it**

Update `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Logo from '../components/Logo.astro';
import ThemeToggle from '../components/ThemeToggle.astro';
---
<Layout>
  <main class="p-8 space-y-6">
    <div class="flex items-center justify-between">
      <Logo size="md" />
      <ThemeToggle />
    </div>
    <p class="text-navy dark:text-cream">El texto cambia con el modo.</p>
  </main>
</Layout>
```

- [ ] **Step 5: Visually verify**

Run `npm run dev`. Click the toggle. The page background, text color, and toggle icon should switch. Reload — the choice should persist (saved in localStorage). No flash on page load.

Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/ThemeToggle.astro src/layouts/Layout.astro src/styles/global.css src/pages/index.astro
git commit -m "feat: add ThemeToggle with anti-FOUC script"
```

---

## Task 12: Nav component

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Write the Nav**

Create `src/components/Nav.astro`:

```astro
---
import Logo from './Logo.astro';
import ThemeToggle from './ThemeToggle.astro';
import WhatsAppButton from './WhatsAppButton.astro';
---
<header class="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-[color:var(--surface-bg)]/80 border-b border-navy/5 dark:border-cream/10">
  <nav class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
    <a href="/" aria-label="Inicio">
      <Logo size="sm" />
    </a>

    <ul class="hidden md:flex items-center gap-7 text-sm font-semibold text-navy-soft dark:text-cream/80">
      <li><a href="#servicios" class="hover:text-teal transition-colors">Servicios</a></li>
      <li><a href="#galeria" class="hover:text-teal transition-colors">Galería</a></li>
      <li><a href="#ubicacion" class="hover:text-teal transition-colors">Ubicación</a></li>
      <li><a href="/contacto" class="hover:text-teal transition-colors">Contacto</a></li>
    </ul>

    <div class="flex items-center gap-2">
      <ThemeToggle />
      <div class="hidden sm:block">
        <WhatsAppButton variant="primary" message="general" label="WhatsApp" class="!py-2 !px-4 !text-sm" />
      </div>
      <button
        type="button"
        class="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-paper dark:bg-navy-soft text-navy dark:text-cream"
        aria-label="Abrir menú"
        data-mobile-toggle
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  </nav>

  <div class="md:hidden hidden px-5 pb-4" data-mobile-menu>
    <ul class="flex flex-col gap-2 text-sm font-semibold text-navy-soft dark:text-cream/80">
      <li><a href="#servicios" class="block py-2">Servicios</a></li>
      <li><a href="#galeria" class="block py-2">Galería</a></li>
      <li><a href="#ubicacion" class="block py-2">Ubicación</a></li>
      <li><a href="/contacto" class="block py-2">Contacto</a></li>
    </ul>
  </div>
</header>

<script>
  const toggle = document.querySelector<HTMLButtonElement>('[data-mobile-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 2: Use it on index**

Update `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
---
<Layout>
  <Nav />
  <main class="p-8">
    <p>Contenido más abajo…</p>
  </main>
</Layout>
```

- [ ] **Step 3: Visually verify**

Run `npm run dev`. Confirm:
- Logo + 4 nav links + theme toggle + WA button render
- Resize to mobile width — links collapse, hamburger appears
- Click hamburger — links appear stacked below
- Theme toggle still works
- Nav stays sticky on scroll

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/pages/index.astro
git commit -m "feat: add Nav with mobile menu and sticky header"
```

---

## Task 13: Hero section (logo-on-pastel design)

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Write the Hero**

Create `src/components/Hero.astro`:

```astro
---
import Logo from './Logo.astro';
import WhatsAppButton from './WhatsAppButton.astro';
import { site } from '../data/site';
---
<section class="relative overflow-hidden">
  <div class="max-w-6xl mx-auto px-5 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
    <!-- Text column -->
    <div class="relative">
      <span class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal text-white rounded-full text-[11px] font-extrabold tracking-[0.16em] uppercase shadow-md shadow-teal/30 mb-5">
        🐾 {site.tagline}
      </span>

      <h1 class="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight text-navy dark:text-cream mb-5">
        Tu mascota,<br />
        en <span class="inline-block bg-lime text-navy px-2 md:px-3 rounded-xl -rotate-1">buenas manos</span>.
      </h1>

      <p class="text-base md:text-lg text-navy-soft dark:text-cream/80 max-w-md leading-relaxed mb-7">
        Veterinaria y grooming en {site.location.city}. Atendemos a tu mascota como si fuera nuestra — desde un baño relajado hasta una consulta médica.
      </p>

      <div class="flex flex-wrap gap-3">
        <WhatsAppButton variant="primary" message="general" />
        <a
          href="#ubicacion"
          class="inline-flex items-center gap-2 px-5 py-3 bg-white text-navy border-2 border-navy rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform dark:bg-transparent dark:text-cream dark:border-cream"
        >
          Cómo llegar
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>

    <!-- Visual column: logo on pastel gradient with shapes -->
    <div class="relative aspect-[5/4] rounded-3xl overflow-hidden grid place-items-center bg-gradient-to-br from-pink-light/40 via-teal-50 to-lime/30 dark:from-pink/15 dark:via-teal/15 dark:to-lime/15">
      <!-- decorative shapes -->
      <span aria-hidden="true" class="absolute top-[8%] right-[10%] w-16 h-16 rounded-full bg-lime/60 dark:bg-lime/30"></span>
      <span aria-hidden="true" class="absolute bottom-[10%] left-[8%] w-10 h-10 rounded-full bg-pink-light/70 dark:bg-pink/30"></span>
      <span aria-hidden="true" class="absolute top-1/2 left-[5%] w-4 h-4 rounded-full bg-teal/40"></span>
      <span aria-hidden="true" class="absolute top-[20%] left-[40%] w-3 h-3 rounded-full bg-lime/50"></span>

      <div class="relative z-10 text-center px-4">
        <Logo size="lg" />
        <div class="mt-3 font-logo font-black text-xs md:text-sm tracking-[0.32em] text-navy dark:text-cream">
          ZONA DE MASCOTAS
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Use it on index**

Update `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---
<Layout>
  <Nav />
  <main>
    <Hero />
  </main>
</Layout>
```

- [ ] **Step 3: Visually verify**

Run `npm run dev`. Confirm:
- Two-column layout on desktop (text left, logo card right)
- Stacks vertically on mobile
- Eyebrow pill is turquoise with text "🐾 Zona de Mascotas"
- Headline has green lime highlight on "buenas manos"
- "Cómo llegar" anchor scrolls to `#ubicacion` (won't scroll yet since no target)
- Pastel gradient visible, decorative circles in corners
- Logo readable in both themes

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add Hero section with logo card visual"
```

---

## Task 14: TwoPillars section

**Files:**
- Create: `src/components/TwoPillars.astro`

- [ ] **Step 1: Write the component**

Create `src/components/TwoPillars.astro`:

```astro
---
import WhatsAppButton from './WhatsAppButton.astro';
---
<section id="pilares" class="py-16 md:py-20 bg-paper dark:bg-[color:var(--surface-card)]">
  <div class="max-w-6xl mx-auto px-5">
    <div class="text-center mb-10">
      <p class="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-teal-deep dark:text-teal mb-2">Lo que hacemos</p>
      <h2 class="font-display font-black text-3xl md:text-5xl text-navy dark:text-cream tracking-tight">
        Dos pilares, un mismo cariño.
      </h2>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <article class="bg-white dark:bg-navy/40 rounded-3xl p-7 md:p-9 shadow-lg shadow-navy/5 border border-navy/5 dark:border-cream/10">
        <div class="w-14 h-14 grid place-items-center rounded-2xl bg-teal-50 dark:bg-teal/20 mb-5 text-3xl">✂️</div>
        <h3 class="font-display font-black text-2xl md:text-3xl text-navy dark:text-cream mb-3">Grooming</h3>
        <p class="text-navy-soft dark:text-cream/80 mb-5 leading-relaxed">
          Baños, cortes y mimos. Cuidamos el pelaje, las uñas y la salud externa de tu mascota con productos suaves y un trato paciente.
        </p>
        <WhatsAppButton variant="primary" message="grooming" label="Agendar grooming" class="!px-5 !py-3 !text-sm" />
      </article>

      <article class="bg-white dark:bg-navy/40 rounded-3xl p-7 md:p-9 shadow-lg shadow-navy/5 border border-navy/5 dark:border-cream/10">
        <div class="w-14 h-14 grid place-items-center rounded-2xl bg-lime/30 dark:bg-lime/20 mb-5 text-3xl">🩺</div>
        <h3 class="font-display font-black text-2xl md:text-3xl text-navy dark:text-cream mb-3">Veterinaria & Productos</h3>
        <p class="text-navy-soft dark:text-cream/80 mb-5 leading-relaxed">
          Vacunas, desparasitantes, atención médica y todo lo que tu mascota necesita en casa — concentrados, pipetas, accesorios y más.
        </p>
        <WhatsAppButton variant="primary" message="vet" label="Consultar veterinaria" class="!px-5 !py-3 !text-sm" />
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add it to index**

Update `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import TwoPillars from '../components/TwoPillars.astro';
---
<Layout>
  <Nav />
  <main>
    <Hero />
    <TwoPillars />
  </main>
</Layout>
```

- [ ] **Step 3: Visually verify**

Run `npm run dev`. Confirm both cards render side-by-side on desktop, stacked on mobile. The Grooming card has a teal icon background, the Vet card has a lime icon background. CTA buttons work.

- [ ] **Step 4: Commit**

```bash
git add src/components/TwoPillars.astro src/pages/index.astro
git commit -m "feat: add TwoPillars section for grooming + veterinary"
```

---

## Task 15: ServicesGrid section

**Files:**
- Create: `src/components/ServicesGrid.astro`

- [ ] **Step 1: Write the component**

Create `src/components/ServicesGrid.astro`:

```astro
---
import { site } from '../data/site';

const groomingIcons: Record<string, string> = {
  'Baño tibio': '🛁',
  'Secado y cepillado': '💨',
  'Corte de pelo': '✂️',
  'Corte de uñas': '💅',
  'Limpieza de orejas': '👂',
  'Drenaje de glándulas anales': '🩺',
  'Loción': '🌿',
  'Accesorios': '🎀',
};

const vetIcons: Record<string, string> = {
  'Vacunas': '💉',
  'Pipetas y collares antipulgas': '🛡️',
  'Desparasitantes': '💊',
  'Concentrados': '🍖',
  'Atención médica': '❤️',
  'Accesorios para mascotas': '🦴',
};
---
<section id="servicios" class="py-16 md:py-20">
  <div class="max-w-6xl mx-auto px-5">
    <div class="text-center mb-10">
      <p class="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-teal-deep dark:text-teal mb-2">Servicios</p>
      <h2 class="font-display font-black text-3xl md:text-5xl text-navy dark:text-cream tracking-tight">
        Todo lo que ofrecemos.
      </h2>
    </div>

    <div class="grid md:grid-cols-2 gap-8 md:gap-10">
      <div>
        <h3 class="font-display font-black text-xl text-navy dark:text-cream mb-4 flex items-center gap-2">
          <span class="w-8 h-8 grid place-items-center rounded-lg bg-teal-50 dark:bg-teal/20">✂️</span>
          Grooming
        </h3>
        <ul class="grid grid-cols-2 gap-2.5">
          {site.services.grooming.map((s) => (
            <li class="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-navy/40 rounded-xl border border-navy/5 dark:border-cream/10 text-sm font-semibold text-navy dark:text-cream">
              <span class="text-lg" aria-hidden="true">{groomingIcons[s] ?? '🐾'}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 class="font-display font-black text-xl text-navy dark:text-cream mb-4 flex items-center gap-2">
          <span class="w-8 h-8 grid place-items-center rounded-lg bg-lime/30 dark:bg-lime/20">🩺</span>
          Veterinaria y productos
        </h3>
        <ul class="grid grid-cols-2 gap-2.5">
          {site.services.vet.map((s) => (
            <li class="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-navy/40 rounded-xl border border-navy/5 dark:border-cream/10 text-sm font-semibold text-navy dark:text-cream">
              <span class="text-lg" aria-hidden="true">{vetIcons[s] ?? '🐾'}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add to index**

Update `src/pages/index.astro` `<main>`:

```astro
<main>
  <Hero />
  <TwoPillars />
  <ServicesGrid />
</main>
```

And import it at the top.

- [ ] **Step 3: Verify**

Run `npm run dev`. The services should render as two columns of pill cards, each with emoji icon.

- [ ] **Step 4: Commit**

```bash
git add src/components/ServicesGrid.astro src/pages/index.astro
git commit -m "feat: add ServicesGrid with all services grouped by category"
```

---

## Task 16: Six pet illustration components

**Files:**
- Create: `src/components/illustrations/PetFrenchie.astro`, `PetGrayCat.astro`, `PetTabby.astro`, `PetSchnauzer.astro`, `PetPoodle.astro`, `PetRabbit.astro`

All six follow the same Astro pattern: a single SVG with `viewBox="0 0 200 200"`. Differences are entirely inside the SVG paths. Each accepts an optional `class` prop.

- [ ] **Step 1: Create the Frenchie**

Create `src/components/illustrations/PetFrenchie.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="60" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="155" rx="42" ry="22" fill="#F4D9A8"/>
  <circle cx="100" cy="98" r="52" fill="#F4D9A8"/>
  <path d="M 50 70 Q 44 28, 64 50 Q 72 58, 66 88 Q 56 84, 50 70 Z" fill="#F4D9A8"/>
  <path d="M 150 70 Q 156 28, 136 50 Q 128 58, 134 88 Q 144 84, 150 70 Z" fill="#F4D9A8"/>
  <path d="M 55 64 Q 52 44, 58 56 Q 66 70, 62 82 Z" fill="#F5A7B8"/>
  <path d="M 145 64 Q 148 44, 142 56 Q 134 70, 138 82 Z" fill="#F5A7B8"/>
  <ellipse cx="100" cy="108" rx="38" ry="30" fill="#FFF6E8"/>
  <path d="M 78 78 Q 100 74, 122 78" stroke="#0F2A3A" stroke-width="1.5" fill="none" opacity="0.3" stroke-linecap="round"/>
  <ellipse cx="80" cy="100" rx="13" ry="9" fill="#A8714F" opacity="0.3"/>
  <ellipse cx="120" cy="100" rx="13" ry="9" fill="#A8714F" opacity="0.3"/>
  <ellipse cx="80" cy="102" rx="7" ry="8" fill="#0F2A3A"/>
  <ellipse cx="120" cy="102" rx="7" ry="8" fill="#0F2A3A"/>
  <circle cx="82" cy="99" r="2.4" fill="white"/>
  <circle cx="122" cy="99" r="2.4" fill="white"/>
  <ellipse cx="100" cy="122" rx="20" ry="13" fill="#FFF6E8"/>
  <path d="M 93 116 Q 100 112, 107 116 Q 109 124, 100 126 Q 91 124, 93 116 Z" fill="#0F2A3A"/>
  <path d="M 100 126 L 100 134" stroke="#0F2A3A" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 100 134 Q 92 140, 86 135 M 100 134 Q 108 140, 114 135" stroke="#0F2A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M 65 142 Q 100 156, 135 142 L 137 150 Q 100 164, 63 150 Z" fill="#1FB6B6"/>
  <circle cx="100" cy="156" r="5" fill="#C5E86C"/>
</svg>
```

- [ ] **Step 2: Create the GrayCat**

Create `src/components/illustrations/PetGrayCat.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="55" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="160" rx="40" ry="28" fill="#5B6F7C"/>
  <circle cx="100" cy="98" r="48" fill="#5B6F7C"/>
  <path d="M 56 80 L 48 30 L 86 70 Z" fill="#5B6F7C"/>
  <path d="M 144 80 L 152 30 L 114 70 Z" fill="#5B6F7C"/>
  <path d="M 62 70 L 56 40 L 78 68 Z" fill="#F5A7B8"/>
  <path d="M 138 70 L 144 40 L 122 68 Z" fill="#F5A7B8"/>
  <ellipse cx="100" cy="108" rx="34" ry="28" fill="#9CABB5"/>
  <ellipse cx="82" cy="98" rx="9" ry="12" fill="white"/>
  <ellipse cx="118" cy="98" rx="9" ry="12" fill="white"/>
  <ellipse cx="82" cy="98" rx="7" ry="10" fill="#a8cc4a"/>
  <ellipse cx="118" cy="98" rx="7" ry="10" fill="#a8cc4a"/>
  <ellipse cx="82" cy="98" rx="2" ry="9" fill="#0F2A3A"/>
  <ellipse cx="118" cy="98" rx="2" ry="9" fill="#0F2A3A"/>
  <circle cx="85" cy="93" r="1.6" fill="white"/>
  <circle cx="121" cy="93" r="1.6" fill="white"/>
  <path d="M 94 120 L 106 120 L 100 128 Z" fill="#F5A7B8"/>
  <path d="M 100 128 L 100 134" stroke="#0F2A3A" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 100 134 Q 94 139, 90 137 M 100 134 Q 106 139, 110 137" stroke="#0F2A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="74" y1="124" x2="58" y2="120" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="74" y1="130" x2="58" y2="130" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="126" y1="124" x2="142" y2="120" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="126" y1="130" x2="142" y2="130" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <path d="M 70 142 Q 100 156, 130 142 L 132 148 Q 100 162, 68 148 Z" fill="#C5E86C"/>
  <circle cx="100" cy="154" r="4" fill="#1FB6B6"/>
</svg>
```

- [ ] **Step 3: Create the Tabby**

Create `src/components/illustrations/PetTabby.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="55" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="160" rx="40" ry="28" fill="#F4B860"/>
  <circle cx="100" cy="98" r="48" fill="#F4B860"/>
  <path d="M 70 78 Q 80 70, 90 78" stroke="#D88F3F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 110 78 Q 120 70, 130 78" stroke="#D88F3F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 100 62 L 100 76" stroke="#D88F3F" stroke-width="3" stroke-linecap="round"/>
  <path d="M 56 80 L 48 30 L 86 70 Z" fill="#F4B860"/>
  <path d="M 144 80 L 152 30 L 114 70 Z" fill="#F4B860"/>
  <path d="M 62 70 L 56 40 L 78 68 Z" fill="#F5A7B8"/>
  <path d="M 138 70 L 144 40 L 122 68 Z" fill="#F5A7B8"/>
  <ellipse cx="100" cy="108" rx="34" ry="28" fill="#FFD8A0"/>
  <ellipse cx="82" cy="98" rx="9" ry="12" fill="white"/>
  <ellipse cx="118" cy="98" rx="9" ry="12" fill="white"/>
  <ellipse cx="82" cy="98" rx="7" ry="10" fill="#1FB6B6"/>
  <ellipse cx="118" cy="98" rx="7" ry="10" fill="#1FB6B6"/>
  <ellipse cx="82" cy="98" rx="2" ry="9" fill="#0F2A3A"/>
  <ellipse cx="118" cy="98" rx="2" ry="9" fill="#0F2A3A"/>
  <circle cx="85" cy="93" r="1.6" fill="white"/>
  <circle cx="121" cy="93" r="1.6" fill="white"/>
  <path d="M 94 120 L 106 120 L 100 128 Z" fill="#E88BA3"/>
  <path d="M 100 128 L 100 134" stroke="#0F2A3A" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 100 134 Q 94 139, 90 137 M 100 134 Q 106 139, 110 137" stroke="#0F2A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="74" y1="124" x2="58" y2="120" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="74" y1="130" x2="58" y2="130" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="126" y1="124" x2="142" y2="120" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <line x1="126" y1="130" x2="142" y2="130" stroke="#0F2A3A" stroke-width="0.9" opacity="0.5"/>
  <path d="M 70 142 Q 100 156, 130 142 L 132 148 Q 100 162, 68 148 Z" fill="#1FB6B6"/>
  <circle cx="100" cy="154" r="4" fill="#C5E86C"/>
</svg>
```

- [ ] **Step 4: Create the Schnauzer**

Create `src/components/illustrations/PetSchnauzer.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="60" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="160" rx="44" ry="26" fill="#8B8E92"/>
  <ellipse cx="100" cy="100" rx="50" ry="48" fill="#8B8E92"/>
  <ellipse cx="56" cy="76" rx="14" ry="22" fill="#5C5F62"/>
  <ellipse cx="144" cy="76" rx="14" ry="22" fill="#5C5F62"/>
  <ellipse cx="78" cy="86" rx="11" ry="6" fill="#D8D6D2"/>
  <ellipse cx="122" cy="86" rx="11" ry="6" fill="#D8D6D2"/>
  <ellipse cx="80" cy="100" rx="5" ry="6" fill="#0F2A3A"/>
  <ellipse cx="120" cy="100" rx="5" ry="6" fill="#0F2A3A"/>
  <circle cx="82" cy="98" r="1.5" fill="white"/>
  <circle cx="122" cy="98" r="1.5" fill="white"/>
  <path d="M 70 120 Q 70 156, 100 152 Q 130 156, 130 120 Q 120 110, 100 110 Q 80 110, 70 120 Z" fill="#D8D6D2"/>
  <path d="M 92 122 Q 100 118, 108 122 Q 110 130, 100 132 Q 90 130, 92 122 Z" fill="#0F2A3A"/>
  <path d="M 100 132 L 100 138 Q 95 142, 92 140 M 100 138 Q 105 142, 108 140" stroke="#0F2A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M 65 142 Q 100 156, 135 142 L 137 150 Q 100 164, 63 150 Z" fill="#C5E86C"/>
  <circle cx="100" cy="156" r="5" fill="#1FB6B6"/>
</svg>
```

- [ ] **Step 5: Create the Poodle**

Create `src/components/illustrations/PetPoodle.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="55" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="158" rx="46" ry="28" fill="white"/>
  <ellipse cx="100" cy="158" rx="46" ry="28" fill="#0F2A3A" opacity="0.04"/>
  <circle cx="68" cy="155" r="13" fill="white"/>
  <circle cx="132" cy="155" r="13" fill="white"/>
  <circle cx="100" cy="100" r="48" fill="white"/>
  <circle cx="100" cy="56" r="22" fill="white"/>
  <circle cx="82" cy="62" r="14" fill="white"/>
  <circle cx="118" cy="62" r="14" fill="white"/>
  <ellipse cx="100" cy="100" rx="48" ry="48" fill="none" stroke="#E8E8E8" stroke-width="2"/>
  <circle cx="54" cy="106" r="22" fill="white"/>
  <circle cx="146" cy="106" r="22" fill="white"/>
  <circle cx="54" cy="106" r="22" fill="#0F2A3A" opacity="0.04"/>
  <circle cx="146" cy="106" r="22" fill="#0F2A3A" opacity="0.04"/>
  <ellipse cx="82" cy="98" rx="5" ry="7" fill="#0F2A3A"/>
  <ellipse cx="118" cy="98" rx="5" ry="7" fill="#0F2A3A"/>
  <circle cx="83" cy="95" r="1.6" fill="white"/>
  <circle cx="119" cy="95" r="1.6" fill="white"/>
  <ellipse cx="100" cy="116" rx="6" ry="5" fill="#0F2A3A"/>
  <path d="M 100 121 L 100 127 Q 95 132, 92 130 M 100 127 Q 105 132, 108 130" stroke="#0F2A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M 88 38 L 100 50 L 88 60 Z" fill="#F5A7B8"/>
  <path d="M 112 38 L 100 50 L 112 60 Z" fill="#F5A7B8"/>
  <circle cx="100" cy="50" r="4" fill="#E88BA3"/>
  <path d="M 65 142 Q 100 156, 135 142 L 137 150 Q 100 164, 63 150 Z" fill="#1FB6B6"/>
  <circle cx="100" cy="156" r="5" fill="#C5E86C"/>
</svg>
```

- [ ] **Step 6: Create the Rabbit**

Create `src/components/illustrations/PetRabbit.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<svg class={className} viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="180" rx="50" ry="6" fill="#0F2A3A" opacity="0.15"/>
  <ellipse cx="100" cy="158" rx="40" ry="26" fill="#D4A574"/>
  <ellipse cx="100" cy="165" rx="26" ry="16" fill="#F0D9B8"/>
  <circle cx="100" cy="100" r="46" fill="#D4A574"/>
  <ellipse cx="78" cy="40" rx="11" ry="40" fill="#D4A574"/>
  <ellipse cx="122" cy="40" rx="11" ry="40" fill="#D4A574"/>
  <ellipse cx="78" cy="44" rx="5" ry="32" fill="#F5A7B8"/>
  <ellipse cx="122" cy="44" rx="5" ry="32" fill="#F5A7B8"/>
  <ellipse cx="100" cy="108" rx="32" ry="28" fill="#F0D9B8"/>
  <ellipse cx="82" cy="98" rx="6" ry="8" fill="#0F2A3A"/>
  <ellipse cx="118" cy="98" rx="6" ry="8" fill="#0F2A3A"/>
  <circle cx="84" cy="95" r="2" fill="white"/>
  <circle cx="120" cy="95" r="2" fill="white"/>
  <path d="M 92 118 Q 100 114, 108 118 Q 108 124, 100 126 Q 92 124, 92 118 Z" fill="#F5A7B8"/>
  <path d="M 100 126 L 100 132" stroke="#0F2A3A" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M 100 132 Q 94 137, 90 134 M 100 132 Q 106 137, 110 134" stroke="#0F2A3A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <rect x="97" y="132" width="3" height="6" rx="0.5" fill="white" stroke="#0F2A3A" stroke-width="0.5"/>
  <rect x="100" y="132" width="3" height="6" rx="0.5" fill="white" stroke="#0F2A3A" stroke-width="0.5"/>
  <line x1="78" y1="122" x2="60" y2="118" stroke="#0F2A3A" stroke-width="0.8" opacity="0.5"/>
  <line x1="78" y1="128" x2="60" y2="130" stroke="#0F2A3A" stroke-width="0.8" opacity="0.5"/>
  <line x1="122" y1="122" x2="140" y2="118" stroke="#0F2A3A" stroke-width="0.8" opacity="0.5"/>
  <line x1="122" y1="128" x2="140" y2="130" stroke="#0F2A3A" stroke-width="0.8" opacity="0.5"/>
  <path d="M 75 142 Q 100 154, 125 142 L 127 150 Q 100 160, 73 150 Z" fill="#C5E86C"/>
  <circle cx="100" cy="154" r="4" fill="#1FB6B6"/>
</svg>
```

- [ ] **Step 7: Verify all six compile**

Run:
```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/illustrations/
git commit -m "feat: add six pet portrait illustrations for gallery"
```

---

## Task 17: Gallery section

**Files:**
- Create: `src/components/Gallery.astro`

- [ ] **Step 1: Write the Gallery**

Create `src/components/Gallery.astro`:

```astro
---
import PetFrenchie from './illustrations/PetFrenchie.astro';
import PetGrayCat from './illustrations/PetGrayCat.astro';
import PetTabby from './illustrations/PetTabby.astro';
import PetSchnauzer from './illustrations/PetSchnauzer.astro';
import PetPoodle from './illustrations/PetPoodle.astro';
import PetRabbit from './illustrations/PetRabbit.astro';

type Pet = {
  Component: typeof PetFrenchie;
  name: string;
  breed: string;
  bgClass: string;
};

// Note: we use `lime/40` style classes (custom token + alpha) instead of
// `lime-200` because defining `--color-lime` in @theme replaces the default
// lime-* palette. The other colors (amber, rose, slate, orange) aren't
// overridden, so their default shades still work.
const pets: Pet[] = [
  { Component: PetFrenchie, name: 'Lulú', breed: 'Bulldog Francés', bgClass: 'from-amber-200 to-amber-300' },
  { Component: PetGrayCat, name: 'Mishi', breed: 'Gato común', bgClass: 'from-teal/30 to-teal/10' },
  { Component: PetTabby, name: 'Naranja', breed: 'Gato atigrado', bgClass: 'from-rose-200 to-rose-100' },
  { Component: PetSchnauzer, name: 'Tito', breed: 'Schnauzer', bgClass: 'from-lime/50 to-lime/20' },
  { Component: PetPoodle, name: 'Bianca', breed: 'Poodle Toy', bgClass: 'from-slate-200 to-slate-100' },
  { Component: PetRabbit, name: 'Conejín', breed: 'Conejo', bgClass: 'from-orange-200 to-orange-100' },
];
---
<section id="galeria" class="py-16 md:py-20 bg-paper dark:bg-[color:var(--surface-card)]">
  <div class="max-w-6xl mx-auto px-5">
    <div class="text-center mb-10">
      <p class="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-teal-deep dark:text-teal mb-2">Galería</p>
      <h2 class="font-display font-black text-3xl md:text-5xl text-navy dark:text-cream tracking-tight">
        Nuestra <span class="inline-block bg-lime text-navy px-2 rounded-lg -rotate-1">familia</span> peluda.
      </h2>
      <p class="mt-3 text-navy-soft dark:text-cream/70 text-sm">Algunos de los amigos que han pasado por Petropolis</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
      {pets.map(({ Component, name, breed, bgClass }) => (
        <div class="bg-white dark:bg-navy/40 rounded-2xl p-3 md:p-4 text-center border border-navy/5 dark:border-cream/10 transition-transform hover:-translate-y-1">
          <div class={`aspect-square rounded-xl grid place-items-center bg-gradient-to-br ${bgClass} mb-3 overflow-hidden`}>
            <Component class="w-[78%] h-[78%]" />
          </div>
          <div class="font-display font-black text-sm md:text-base text-navy dark:text-cream">{name}</div>
          <div class="text-[11px] md:text-xs text-navy-soft/70 dark:text-cream/60 font-semibold">{breed}</div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add it to index**

Update `src/pages/index.astro` `<main>`:

```astro
<main>
  <Hero />
  <TwoPillars />
  <ServicesGrid />
  <Gallery />
</main>
```

Import Gallery at top.

- [ ] **Step 3: Verify**

Run `npm run dev`. Confirm all 6 portraits render in a grid (6 across on desktop, 2-3 across on smaller screens). Hover effect lifts the cards slightly.

- [ ] **Step 4: Commit**

```bash
git add src/components/Gallery.astro src/pages/index.astro
git commit -m "feat: add Gallery section with six pet portraits"
```

---

## Task 18: SocialProof section

**Files:**
- Create: `src/components/SocialProof.astro`

- [ ] **Step 1: Write the component**

Create `src/components/SocialProof.astro`:

```astro
---
import { site } from '../data/site';

const testimonials = [
  {
    name: 'María José R.',
    pet: 'dueña de Lulú',
    text: 'Excelente atención, mi Frenchie sale feliz cada vez. El trato es de verdad como si fuera suyo.',
  },
  {
    name: 'Carlos M.',
    pet: 'dueño de Mishi',
    text: 'Profesionales y cariñosos. Llevamos años con ellos y nunca nos han fallado.',
  },
  {
    name: 'Andrea L.',
    pet: 'dueña de Bianca',
    text: 'El grooming queda impecable y los precios son justos. 100% recomendados en la zona.',
  },
];
---
<section class="py-16 md:py-20">
  <div class="max-w-6xl mx-auto px-5">
    <div class="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
      <div class="text-center md:text-left">
        <div class="inline-flex items-baseline gap-1.5 font-display font-black text-5xl md:text-6xl text-navy dark:text-cream">
          {site.rating.value}
          <span class="text-amber-500 text-3xl">★</span>
        </div>
        <p class="text-sm font-semibold text-navy-soft dark:text-cream/70 mt-1">
          {site.rating.count} reseñas en Google
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <article class="bg-white dark:bg-navy/40 rounded-2xl p-5 border border-navy/5 dark:border-cream/10">
            <div class="text-amber-500 mb-2" aria-label={`${site.rating.value} estrellas`}>★★★★★</div>
            <p class="text-sm text-navy-soft dark:text-cream/80 mb-3 leading-relaxed">"{t.text}"</p>
            <div class="text-xs">
              <div class="font-bold text-navy dark:text-cream">{t.name}</div>
              <div class="text-navy-soft/60 dark:text-cream/50">{t.pet}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add to index**

Update `src/pages/index.astro` `<main>` to include `<SocialProof />` after `<Gallery />`. Import it at the top.

- [ ] **Step 3: Verify**

Run `npm run dev`. The 4.5★ block should display on the left (or stacked on mobile) and three testimonial cards on the right.

- [ ] **Step 4: Commit**

```bash
git add src/components/SocialProof.astro src/pages/index.astro
git commit -m "feat: add SocialProof section with rating and testimonials"
```

---

## Task 19: LocationMap component (Leaflet island)

**Files:**
- Create: `src/components/LocationMap.astro`

- [ ] **Step 1: Write the component**

Create `src/components/LocationMap.astro`:

```astro
---
import { site } from '../data/site';
---
<section id="ubicacion" class="py-16 md:py-20 bg-paper dark:bg-[color:var(--surface-card)]">
  <div class="max-w-6xl mx-auto px-5">
    <div class="text-center mb-8">
      <p class="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-teal-deep dark:text-teal mb-2">Ubicación</p>
      <h2 class="font-display font-black text-3xl md:text-5xl text-navy dark:text-cream tracking-tight">
        Estamos en {site.location.city}.
      </h2>
    </div>

    <div class="grid md:grid-cols-[1fr_1.3fr] gap-6 bg-white dark:bg-navy/40 rounded-3xl overflow-hidden border border-navy/5 dark:border-cream/10">
      <div class="p-7 md:p-8 space-y-4">
        <div class="flex gap-3">
          <div class="w-9 h-9 grid place-items-center rounded-xl bg-teal-50 dark:bg-teal/20 text-lg">📍</div>
          <div>
            <div class="font-bold text-navy dark:text-cream">{site.location.addressLine}</div>
            <div class="text-xs text-navy-soft dark:text-cream/70">{site.location.lat}°N, {Math.abs(site.location.lng)}°W</div>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-9 h-9 grid place-items-center rounded-xl bg-teal-50 dark:bg-teal/20 text-lg">🕐</div>
          <div>
            <div class="font-bold text-navy dark:text-cream">{site.hours.weekdays}</div>
            <div class="text-xs text-navy-soft dark:text-cream/70">Hasta las {site.hours.closing}</div>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-9 h-9 grid place-items-center rounded-xl bg-teal-50 dark:bg-teal/20 text-lg">💬</div>
          <div>
            <div class="font-bold text-navy dark:text-cream">{site.whatsapp.pretty}</div>
            <div class="text-xs text-navy-soft dark:text-cream/70">Vía WhatsApp</div>
          </div>
        </div>
        <a
          href={site.location.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-3 bg-teal text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform mt-2"
        >
          Cómo llegar <span aria-hidden="true">→</span>
        </a>
      </div>

      <div
        id="petropolis-map"
        class="aspect-[4/3] md:aspect-auto md:min-h-[360px] bg-teal-50 dark:bg-navy/60"
        data-lat={site.location.lat}
        data-lng={site.location.lng}
        data-pretty={site.location.addressLine}
        data-hours={`${site.hours.weekdays}, hasta las ${site.hours.closing}`}
      ></div>
    </div>
  </div>
</section>

<script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  const el = document.getElementById('petropolis-map') as HTMLDivElement | null;
  if (el && !el.dataset.hydrated) {
    el.dataset.hydrated = 'true';
    const lat = Number(el.dataset.lat);
    const lng = Number(el.dataset.lng);
    const pretty = el.dataset.pretty ?? '';
    const hours = el.dataset.hours ?? '';

    const map = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'petropolis-pin',
      html: `
        <span class="pulse"></span>
        <svg viewBox="0 0 40 48" width="40" height="48" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 47 Q 5 30, 5 18 A 15 15 0 1 1 35 18 Q 35 30, 20 47 Z" fill="#1FB6B6"/>
          <circle cx="20" cy="18" r="7" fill="white"/>
          <circle cx="20" cy="18" r="4" fill="#1FB6B6"/>
        </svg>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -42],
    });

    L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(
        `<strong>Veterinaria Petropolis</strong><br />${pretty}<br /><small>${hours}</small>`
      );
  }
</script>

<style is:global>
  .petropolis-pin {
    position: relative;
  }
  .petropolis-pin .pulse {
    position: absolute;
    left: 20px;
    top: 18px;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    background: rgba(31, 182, 182, 0.35);
    border-radius: 50%;
    transform-origin: center;
    animation: petropolis-pulse 2s infinite;
  }
  @keyframes petropolis-pulse {
    0%   { transform: scale(0.6); opacity: 0.7; }
    100% { transform: scale(3); opacity: 0; }
  }
</style>
```

- [ ] **Step 2: Add to index with client:visible**

Update `src/pages/index.astro` `<main>`. Add LocationMap after SocialProof:

```astro
<LocationMap client:visible />
```

Wait — `LocationMap.astro` doesn't export client logic in the React sense; its `<script>` block is the island. In Astro, **inline `<script>` tags in `.astro` files are already client-side and only load once globally per page**. So we do NOT use `client:visible` on it. Use it as:

```astro
<LocationMap />
```

Import it. The script inside hydrates automatically when the DOM is ready.

- [ ] **Step 3: Verify**

Run `npm run dev`. Confirm:
- Left column shows the info rows + "Cómo llegar" button
- Right column shows the Leaflet map with OSM tiles
- Custom turquoise pin at the right coordinates
- Pulsing ring around the pin
- Click pin → popup with address and hours
- "Cómo llegar" opens Google Maps directions in new tab

- [ ] **Step 4: Commit**

```bash
git add src/components/LocationMap.astro src/pages/index.astro
git commit -m "feat: add LocationMap with Leaflet and custom pulsing pin"
```

---

## Task 20: Footer

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write the Footer**

Create `src/components/Footer.astro`:

```astro
---
import Logo from './Logo.astro';
import { site } from '../data/site';
const year = new Date().getFullYear();
---
<footer class="bg-navy text-cream/80 pt-14 pb-8">
  <div class="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-10">
    <div>
      <Logo size="md" invert />
      <p class="mt-3 text-sm text-cream/60 max-w-xs">
        Veterinaria y centro de grooming en {site.location.city}.
      </p>
    </div>
    <div>
      <h3 class="font-display font-black text-cream text-base mb-3">Contacto</h3>
      <ul class="text-sm space-y-2">
        <li>
          <a class="hover:text-teal" href={`https://wa.me/${site.whatsapp.digits}`} target="_blank" rel="noopener">
            WhatsApp: {site.whatsapp.pretty}
          </a>
        </li>
        <li>{site.location.addressLine}</li>
      </ul>
    </div>
    <div>
      <h3 class="font-display font-black text-cream text-base mb-3">Horario</h3>
      <ul class="text-sm space-y-2">
        <li>{site.hours.weekdays}</li>
        <li>Hasta las {site.hours.closing}</li>
      </ul>
    </div>
  </div>
  <div class="max-w-6xl mx-auto px-5 mt-10 pt-6 border-t border-cream/10 text-xs text-cream/50 flex justify-between flex-wrap gap-2">
    <span>© {year} {site.name}</span>
    <span>Hecho con cariño 🐾</span>
  </div>
</footer>
```

- [ ] **Step 2: Add to index**

Add `<Footer />` after `<LocationMap />` (inside or outside `<main>` is fine; convention is outside, so move it below `</main>`).

```astro
<Layout>
  <Nav />
  <main>
    <Hero />
    <TwoPillars />
    <ServicesGrid />
    <Gallery />
    <SocialProof />
    <LocationMap />
  </main>
  <Footer />
</Layout>
```

Import Footer at top.

- [ ] **Step 3: Verify**

Run `npm run dev`. Footer should appear at the bottom on dark navy background with cream text. Logo on dark uses invert mode (the "olis" segment switches to cream).

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add Footer"
```

---

## Task 21: PawCursor

**Files:**
- Create: `src/components/PawCursor.astro`

- [ ] **Step 1: Write the cursor component**

Create `src/components/PawCursor.astro`:

```astro
---
// Pure script island. No visible markup, just attaches a mousemove listener
// that drops fading paw SVGs along the cursor trail on desktop.
---
<div id="paw-cursor-host" class="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block"></div>

<script>
  const host = document.getElementById('paw-cursor-host');
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (host && supportsHover && !prefersReducedMotion) {
    const POOL_SIZE = 12;
    const pool: HTMLSpanElement[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const span = document.createElement('span');
      span.className = 'paw-trail';
      span.innerHTML = `
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
          <ellipse cx="20" cy="26" rx="9" ry="8" fill="#1FB6B6"/>
          <ellipse cx="9" cy="14" rx="3.5" ry="4.5" fill="#1FB6B6"/>
          <ellipse cx="17" cy="9" rx="3.5" ry="4.5" fill="#1FB6B6"/>
          <ellipse cx="23" cy="9" rx="3.5" ry="4.5" fill="#1FB6B6"/>
          <ellipse cx="31" cy="14" rx="3.5" ry="4.5" fill="#1FB6B6"/>
        </svg>`;
      host.appendChild(span);
      pool.push(span);
    }

    let cursor = 0;
    let lastDrop = 0;
    const THROTTLE_MS = 60;
    const PIXEL_GAP = 40;
    let lastX = 0, lastY = 0;
    let leftStep = true;

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastDrop < THROTTLE_MS) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.hypot(dx, dy) < PIXEL_GAP) return;
      lastDrop = now;
      lastX = e.clientX; lastY = e.clientY;

      const span = pool[cursor];
      cursor = (cursor + 1) % POOL_SIZE;
      const offset = leftStep ? -6 : 6;
      const rotation = leftStep ? -18 + (Math.random() * 12 - 6) : 18 + (Math.random() * 12 - 6);
      leftStep = !leftStep;
      span.style.left = `${e.clientX + offset}px`;
      span.style.top = `${e.clientY + offset}px`;
      span.style.setProperty('--rot', `${rotation}deg`);
      span.classList.remove('drop');
      // Force reflow so the animation restarts each drop.
      void span.offsetWidth;
      span.classList.add('drop');
    });
  }
</script>

<style is:global>
  .paw-trail {
    position: absolute;
    transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(0.8);
    opacity: 0;
    will-change: opacity, transform;
  }
  .paw-trail.drop {
    animation: paw-fade 700ms ease-out forwards;
  }
  @keyframes paw-fade {
    0%   { opacity: 0; transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(0.5); }
    25%  { opacity: 0.75; transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(0.9); }
  }
</style>
```

- [ ] **Step 2: Add to Layout (so it appears on every page)**

Edit `src/layouts/Layout.astro`. Import the component at the top:

```astro
---
import '../styles/global.css';
import { site } from '../data/site';
import PawCursor from '../components/PawCursor.astro';
// rest unchanged
---
```

Add `<PawCursor />` right after the opening `<body>` tag.

- [ ] **Step 3: Verify**

Run `npm run dev`. On desktop, move the mouse — paw prints should drop along the trail, alternating left/right, fading out after ~700ms. On mobile / touch device (use DevTools emulation), nothing should render.

- [ ] **Step 4: Commit**

```bash
git add src/components/PawCursor.astro src/layouts/Layout.astro
git commit -m "feat: add paw-trail cursor for desktop"
```

---

## Task 22: Schema.org JSON-LD

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add structured data**

Inside `src/layouts/Layout.astro`'s `<head>`, just before the closing `</head>`, add:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'VeterinaryCare',
  name: site.name,
  description: site.description,
  url: canonical,
  telephone: site.whatsapp.raw,
  image: ogImage,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.city,
    addressCountry: 'GT',
    description: site.location.addressLine,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: site.location.lat,
    longitude: site.location.lng,
  },
  openingHours: 'Mo-Sa 09:00-18:00',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: site.rating.value,
    reviewCount: site.rating.count,
  },
})} />
```

- [ ] **Step 2: Verify the build**

Run:
```bash
npm run build
```

Check that `dist/index.html` contains a `<script type="application/ld+json">` block with the data.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Schema.org VeterinaryCare structured data"
```

---

## Task 23: Wire up the index page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Final index assembly**

Open `src/pages/index.astro` and confirm it matches this exact structure:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import TwoPillars from '../components/TwoPillars.astro';
import ServicesGrid from '../components/ServicesGrid.astro';
import Gallery from '../components/Gallery.astro';
import SocialProof from '../components/SocialProof.astro';
import LocationMap from '../components/LocationMap.astro';
import Footer from '../components/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
---
<Layout>
  <Nav />
  <main>
    <Hero />
    <TwoPillars />
    <ServicesGrid />
    <Gallery />
    <SocialProof />
    <LocationMap />
  </main>
  <Footer />
  <WhatsAppButton variant="floating" message="general" />
</Layout>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Scroll the whole page. Confirm every section renders in order: Nav → Hero → TwoPillars → ServicesGrid → Gallery → SocialProof → LocationMap → Footer, plus the floating WhatsApp button is fixed bottom-right.

Verify `#servicios`, `#galeria`, `#ubicacion` anchors all work from the Nav.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble full landing page"
```

---

## Task 24: Contacto page

**Files:**
- Create: `src/pages/contacto.astro`

- [ ] **Step 1: Build the contact page**

Create `src/pages/contacto.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import LocationMap from '../components/LocationMap.astro';
import Footer from '../components/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
import { site } from '../data/site';

const channels = [
  { icon: '✂️', title: 'Grooming', desc: 'Baño, corte, mimos', message: 'grooming' as const },
  { icon: '💉', title: 'Vacunas y consulta', desc: 'Atención médica veterinaria', message: 'vet' as const },
  { icon: '🍖', title: 'Productos', desc: 'Concentrados, pipetas, accesorios', message: 'products' as const },
  { icon: '🚨', title: 'Emergencia', desc: 'Algo urgente con tu mascota', message: 'emergency' as const },
];
---
<Layout title={`Contacto · ${site.name}`} description="Contactanos por WhatsApp para cualquier consulta sobre grooming, veterinaria o productos para tu mascota.">
  <Nav />
  <main>
    <section class="py-12 md:py-20">
      <div class="max-w-4xl mx-auto px-5 text-center">
        <p class="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-teal-deep dark:text-teal mb-2">Contacto</p>
        <h1 class="font-display font-black text-4xl md:text-6xl text-navy dark:text-cream tracking-tight mb-4">
          ¿Qué <span class="inline-block bg-lime text-navy px-2 rounded-xl -rotate-1">necesitás</span>?
        </h1>
        <p class="text-base md:text-lg text-navy-soft dark:text-cream/80 max-w-xl mx-auto">
          Toda comunicación va por WhatsApp. Llamadas y correo no siempre se contestan a tiempo — escribinos y te respondemos.
        </p>
      </div>
    </section>

    <section class="pb-12 md:pb-16">
      <div class="max-w-4xl mx-auto px-5 grid sm:grid-cols-2 gap-4">
        {channels.map((c) => (
          <a
            href={`https://wa.me/${site.whatsapp.digits}?text=${encodeURIComponent(site.messages[c.message])}`}
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white dark:bg-navy/40 border border-navy/5 dark:border-cream/10 rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-transform shadow-md shadow-navy/5"
          >
            <div class="w-14 h-14 grid place-items-center rounded-2xl bg-teal-50 dark:bg-teal/20 mb-4 text-3xl">{c.icon}</div>
            <div class="font-display font-black text-xl md:text-2xl text-navy dark:text-cream mb-1">{c.title}</div>
            <div class="text-sm text-navy-soft dark:text-cream/70 mb-4">{c.desc}</div>
            <span class="inline-flex items-center gap-2 text-wa font-bold text-sm">
              Escribir por WhatsApp <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </div>
    </section>

    <LocationMap />
  </main>
  <Footer />
  <WhatsAppButton variant="floating" message="general" />
</Layout>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Navigate to `/contacto`. Confirm:
- Page heading with green highlight on "necesitás"
- 2x2 grid of channel cards
- Each card opens WhatsApp with the correct pre-filled message when clicked
- Map shows below the grid
- Footer and floating button render

- [ ] **Step 3: Commit**

```bash
git add src/pages/contacto.astro
git commit -m "feat: add contacto page with channel grid"
```

---

## Task 25: Favicon (standalone ODog)

**Files:**
- Replace: `public/favicon.svg`

- [ ] **Step 1: Overwrite the favicon**

Replace `public/favicon.svg` with the standalone ODog (use the same path data as the component, but as a full SVG document):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1FB6B6"/>
  <circle cx="50" cy="55" r="34" fill="#0F2A3A"/>
  <path d="M 28 30 Q 24 10, 36 18 Q 42 24, 38 38 Z" fill="#0F2A3A"/>
  <path d="M 72 30 Q 76 10, 64 18 Q 58 24, 62 38 Z" fill="#0F2A3A"/>
  <ellipse cx="50" cy="60" rx="22" ry="18" fill="#FFF6E8"/>
  <circle cx="42" cy="56" r="2.5" fill="#0F2A3A"/>
  <circle cx="58" cy="56" r="2.5" fill="#0F2A3A"/>
  <path d="M 45 66 Q 50 62, 55 66 Q 56 72, 50 74 Q 44 72, 45 66 Z" fill="#0F2A3A"/>
</svg>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Check the browser tab — the favicon should be a turquoise rounded square with the Bulldog face inside.

- [ ] **Step 3: Commit**

```bash
git add public/favicon.svg
git commit -m "feat: add Petropolis favicon (ODog on teal)"
```

---

## Task 26: robots.txt

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Add robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://petropolis.example.com/sitemap-index.xml
```

- [ ] **Step 2: Verify**

Run `npm run build`. Check `dist/robots.txt` exists and `dist/sitemap-index.xml` is generated by the sitemap integration.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt and verify sitemap generation"
```

---

## Task 27: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

Create `README.md`:

```markdown
# Petropolis — Landing

Landing page para Veterinaria Petropolis (Ciudad de Guatemala). Astro 5 + Tailwind v4 + TypeScript.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve dist/ localmente
npm test         # corre los tests con Vitest
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
  - `ThemeToggle` — `<script>` inline (Astro lo dedupa por página)
  - `LocationMap` — `<script>` con `import` de Leaflet, carga al hidratar la página
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with dev instructions and architecture notes"
```

---

## Task 28: Final verification

- [ ] **Step 1: Run all checks**

```bash
npm test
npm run astro check
npm run build
```

Expected: all three pass with no errors. The build output should include `index.html`, `contacto/index.html`, `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`, `favicon.svg`, plus optimized CSS/JS bundles.

- [ ] **Step 2: Manual dev-server walkthrough**

Run `npm run dev`. Open `http://localhost:4321` and verify the following checklist:

- [ ] Logo renders with correct colors in nav and hero
- [ ] Theme toggle works and persists across reload
- [ ] No flash of wrong theme on page load
- [ ] Hero CTAs both work — primary opens WhatsApp, secondary scrolls to `#ubicacion`
- [ ] TwoPillars cards' WhatsApp buttons open with grooming/vet pre-filled messages
- [ ] ServicesGrid lists all 14 services
- [ ] Gallery shows all 6 pets (Lulú, Mishi, Naranja, Tito, Bianca, Conejín)
- [ ] SocialProof shows 4.5★ + 3 testimoniales
- [ ] Leaflet map loads with custom pulsing pin and clickable popup
- [ ] "Cómo llegar" button opens Google Maps in a new tab
- [ ] Footer shows on dark background
- [ ] Floating WhatsApp button appears bottom-right after ~0.8s
- [ ] PawCursor draws trail on desktop, hidden on mobile (Chrome DevTools device mode)
- [ ] `/contacto` page renders 4-card grid, all link to WhatsApp with correct messages
- [ ] Sticky nav remains visible on scroll
- [ ] Mobile menu toggles on hamburger click
- [ ] Resize from desktop to mobile — no horizontal scroll, layout reflows cleanly
- [ ] Dark mode preserves contrast on every section

- [ ] **Step 3: Final commit if any leftover changes**

```bash
git status
# if anything is dirty:
git add -A
git commit -m "chore: final verification fixes"
```

- [ ] **Step 4: Print summary for the user**

After all verifications pass, print a 5-line summary in the terminal so the user knows what to do next:

```
✓ Build passes, tests pass, all sections render.
✓ 28 commits total, ready to push.
Next:
  - Reemplazá public/og-image.png con un PNG 1200x630 real
  - Confirmá los horarios con el cliente y actualizá src/data/site.ts
  - Para subir a GitHub: gh repo create petropolis-astro --public --source . --push
```

---

## Spec coverage check

Every requirement from the spec maps to a task:

| Spec section | Task(s) |
|---|---|
| Astro 5 scaffold | 1, 2 |
| Tailwind v4 via Vite plugin + @theme | 2, 3 |
| TypeScript strict | 1 (built-in to scaffold) |
| Self-hosted variable fonts | 1 (install), 3 (import) |
| Site data file + types | 4 |
| WhatsApp helper + TDD | 5 |
| Layout with full SEO head + OG + Twitter | 6 |
| Logo with multi-color text + ODog | 7, 8 |
| PawIcon | 9 |
| WhatsAppButton (3 variants) | 10 |
| Theme toggle + anti-FOUC + light/dark tokens | 3, 11 |
| Nav with mobile menu | 12 |
| Hero (logo on pastel gradient + shapes) | 13 |
| TwoPillars | 14 |
| ServicesGrid | 15 |
| 6 pet illustrations | 16 |
| Gallery | 17 |
| SocialProof | 18 |
| LocationMap (Leaflet island) | 19 |
| Footer | 20 |
| PawCursor (desktop only, reduced motion respect) | 21 |
| Schema.org JSON-LD | 22 |
| `/` page assembly | 23 |
| `/contacto` page | 24 |
| Favicon | 25 |
| robots.txt + sitemap | 2 (sitemap), 26 (robots) |
| README with install instructions + placeholders list | 27 |
| Final QA pass | 28 |

No gaps.
