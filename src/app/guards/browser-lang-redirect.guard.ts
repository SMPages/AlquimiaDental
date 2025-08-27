import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const SUPPORTED = ['es', 'en'] as const;
const pickLang = (): 'es' | 'en' =>
  (navigator?.language || navigator?.languages?.[0] || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';

export const browserLangRedirectGuard: CanMatchFn = () => {
  const router = inject(Router);
  const stored = (localStorage.getItem('preferredLang') || '').toLowerCase();
  if (SUPPORTED.includes(stored as any)) return router.createUrlTree(['/', stored]);
  return router.createUrlTree(['/', pickLang()]);
};
