// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// NOTE: Tailwind v4 is wired in via a Vite plugin, not the legacy
// @astrojs/tailwind integration. Tokens are declared inline in
// src/styles/global.css using @theme — there is no tailwind.config.js.
export default defineConfig({
  // `site` = el origen real donde está deployado el sitio. Lo usa el sitemap,
  // los canonical, y los meta tags de Open Graph para armar URLs absolutas.
  site: 'https://dan192596.github.io',
  // `base` = el path bajo el cual vive el sitio. En GitHub Pages "project pages"
  // siempre es /<repo-name>. Astro lo prepende a TODO link generado y a TODOS
  // los assets que importes via astro:assets. Para refs manuales en HTML
  // (favicon, anchors a href="/contacto") tenés que prependearlo vos —
  // usamos `import.meta.env.BASE_URL` (helper en src/lib/path.ts).
  base: '/petropolis-astro',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
