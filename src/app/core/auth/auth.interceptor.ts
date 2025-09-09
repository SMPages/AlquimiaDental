// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoginService } from './login.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

// Endpoints de auth que NO deben llevar Authorization
const isAuthEndpoint = (url: string) => /\/login\.php(\?|$)/.test(url) || /\/auth\.php(\?|$)/.test(url);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(LoginService);

  // Omitir si es endpoint de auth o si el caller lo pide
  if (isAuthEndpoint(req.url) || req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const token = auth.token; // getter del LoginService
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401 || err?.status === 403) {
        // Limpia sesión y redirige preservando idioma y returnUrl
        auth.logout();
        const current = router.url || '/es';
        const lang = (current.split('/').filter(Boolean)[0]) || 'es';
        router.navigate(['/', lang, 'auth', 'login'], { queryParams: { returnUrl: current } });
      }
      return throwError(() => err);
    })
  );
};
