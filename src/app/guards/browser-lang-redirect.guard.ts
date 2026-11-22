import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SUPPORTED = ['es', 'en'] as const;
type Lang = (typeof SUPPORTED)[number];

/** Entrada sin idioma: redirige a /es o /en según la preferencia guardada o el navegador. */
export const browserLangRedirectGuard: CanMatchFn =
  (_route: Route, _segments: UrlSegment[]) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    let lang: Lang = 'es';

    // localStorage y navigator solo existen en el navegador (no en SSR)
    if (isPlatformBrowser(platformId)) {
      let stored = '';
      try { stored = localStorage.getItem('preferredLang') || ''; } catch { /* almacenamiento bloqueado */ }

      const candidate = (stored || navigator.language || 'es').slice(0, 2).toLowerCase();
      if ((SUPPORTED as readonly string[]).includes(candidate)) lang = candidate as Lang;
    }

    return router.parseUrl('/' + lang);
  };
