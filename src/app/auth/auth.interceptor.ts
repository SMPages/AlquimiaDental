// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../backend/login.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

const isLoginRpc = (url: string) =>
  /\/rpc\/dental_login(\?|$)/.test(url) || url.endsWith('/rpc/dental_login');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(LoginService);

  // omitir si es login o si lo pide el contexto
  if (isLoginRpc(req.url) || req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const token = auth.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401 || err?.status === 403) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => err);
    })
  );
};
