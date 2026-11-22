import { RenderMode, ServerRoute } from '@angular/ssr';

/** Idiomas y tratamientos con página propia: deben coincidir con app.routes.ts y SeoService. */
const LANGS = ['es', 'en'];
const SERVICE_SLUGS = ['carillas', 'protesis-total', 'limpieza-dental', 'blanqueamiento'];

const langParams = async () => LANGS.map(lang => ({ lang }));

/**
 * Cada página se genera como HTML estático en el build (prerender), para que
 * Google y las redes sociales reciban el contenido sin ejecutar JavaScript.
 */
export const serverRoutes: ServerRoute[] = [
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/about', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/services', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/gallery', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/blog', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/opinions', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  { path: ':lang/alquimia-dental', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  {
    path: ':lang/servicio/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      LANGS.flatMap(lang => SERVICE_SLUGS.map(slug => ({ lang, slug })))
  },
  // Raíz ("/") y cualquier otra ruta: se resuelven en el navegador (redirigen a /es o /en)
  { path: '**', renderMode: RenderMode.Client }
];
