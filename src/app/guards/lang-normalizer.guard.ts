import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';

const isLang = (s?: string) => s === 'es' || s === 'en';

/** Colapsa prefijos de idioma repetidos: /es/en/opinions -> /en/opinions */
export const langNormalizerGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const router = inject(Router);

  // Extrae todos los prefijos de idioma consecutivos al principio
  let i = 0; let last: string | undefined;
  while (i < segments.length && isLang(segments[i].path)) {
    last = segments[i].path;
    i++;
  }

  // Si hay 0 o 1, no hay nada que normalizar
  if (i <= 1) return true;

  // Hay varios: usa el último y el resto de la ruta
  const rest = segments.slice(i).map(s => s.path);
  router.navigate(['/', last!, ...rest], { replaceUrl: true });
  return false;
};
