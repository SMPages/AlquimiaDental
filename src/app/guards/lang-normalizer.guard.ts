import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SUPPORTED = ['es', 'en'] as const;

export const langNormalizerGuard: CanMatchFn = (_r: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const raw = segments[0]?.path ?? '';
  const lang = raw.toLowerCase();
  if (!lang) return true;

  // /ES -> /es (conserva el resto de la ruta)
  if (raw !== lang) {
    const rest = segments.slice(1).map(s => s.path);
    return router.createUrlTree(['/', lang, ...rest]);
  }

  // Idioma no soportado: usa el guardado (solo en navegador) o español
  if (!SUPPORTED.includes(lang as any)) {
    let stored = '';
    if (isPlatformBrowser(platformId)) {
      try { stored = (localStorage.getItem('preferredLang') || '').toLowerCase(); } catch { /* almacenamiento bloqueado */ }
    }
    const fallback = (SUPPORTED.includes(stored as any) ? stored : 'es') as 'es' | 'en';
    return router.createUrlTree(['/', fallback]);
  }
  return true;
};
