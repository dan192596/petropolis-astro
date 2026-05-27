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
