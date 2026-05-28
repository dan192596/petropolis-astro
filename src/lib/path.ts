/**
 * Path helper for handling Astro's `base` config.
 *
 * GitHub Pages serves project sites under a subpath (/<repo>/). When we set
 * `base: '/petropolis-astro'` in astro.config.mjs, Astro automatically
 * prefixes asset imports — but plain HTML links like `<a href="/contacto">`
 * are not transformed. This helper builds correct paths in both cases.
 *
 * Examples (with base = '/petropolis-astro/'):
 *   withBase('contacto')      → '/petropolis-astro/contacto'
 *   withBase('/contacto')     → '/petropolis-astro/contacto'
 *   withBase('favicon.svg')   → '/petropolis-astro/favicon.svg'
 *   withBase('')              → '/petropolis-astro/'
 */
export function withBase(path: string): string {
  // Normalize: BASE_URL may or may not end with '/' depending on how
  // `base` was configured. Force a trailing slash so concatenation is safe.
  let base = import.meta.env.BASE_URL;
  if (!base.endsWith('/')) base = `${base}/`;
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return base + trimmed;
}
