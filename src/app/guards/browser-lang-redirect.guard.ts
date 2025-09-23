import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';

export const browserLangRedirectGuard: CanMatchFn =
  (_route: Route, _segments: UrlSegment[]) => {
    const router = inject(Router);

    // si guardaste el idioma del usuario, respétalo
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || '';

    let lang = (stored || (navigator.language || 'es')).slice(0, 2).toLowerCase();
    if (lang !== 'en' && lang !== 'es') lang = 'es';

    return router.parseUrl('/' + lang);
  };
