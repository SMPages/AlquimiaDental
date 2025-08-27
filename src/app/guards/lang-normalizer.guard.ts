import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';

const SUPPORTED = ['es', 'en'] as const;

export const langNormalizerGuard: CanMatchFn = (_r: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const raw = segments[0]?.path ?? '';
  const lang = raw.toLowerCase();
  if (!lang) return true;
  if (raw !== lang) {
    const rest = segments.slice(1).map(s => s.path);
    return router.createUrlTree(['/', lang, ...rest]);
  }
  if (!SUPPORTED.includes(lang as any)) {
    const stored = (localStorage.getItem('preferredLang') || '').toLowerCase();
    const fallback = (SUPPORTED.includes(stored as any) ? stored : 'es') as 'es' | 'en';
    return router.createUrlTree(['/', fallback]);
  }
  return true;
};
