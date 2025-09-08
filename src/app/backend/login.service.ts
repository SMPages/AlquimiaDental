// src/app/core/auth/login.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { SUPABASE } from '../core/supabase.token';

export type AdminRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY  = 'auth_user';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private sb = inject(SUPABASE);

  private userSubject = new BehaviorSubject<AuthUser | null>(this.restoreUser());
  user$ = this.userSubject.asObservable();

  private isAuthSubject = new BehaviorSubject<boolean>(!!this.getToken());
  isAuthenticated$ = this.isAuthSubject.asObservable();

  /** LOGIN vía RPC dental_login (valida email/clave en dental.admins y retorna JWT propio) */
  async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.sb.schema('dental').rpc('dental_login', {
      p_email: email,
      p_password: password,
    });

    if (error) {
      const msg =
        (error as any)?.message ??
        (error as any)?.hint ??
        'No fue posible iniciar sesión. Verifica tus credenciales.';
      throw new Error(msg);
    }

    const res = data as LoginResponse;
    if (!res?.token || !res?.user) {
      throw new Error('Respuesta de autenticación inválida.');
    }

    this.setSession(res.token, res.user);
    return res.user;
  }

  /** LOGOUT local (borra token + perfil) */
  logout(): void {
    try {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    } finally {
      this.userSubject.next(null);
      this.isAuthSubject.next(false);
    }
  }

  /** Helpers de sesión */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  /** ¿El JWT está vencido? (si tiene 'exp') */
  isTokenExpired(token = this.getToken()): boolean {
    if (!token) return true;
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /** ¿El usuario tiene alguno de estos roles? */
  hasRole(roles: AdminRole[] | AdminRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const arr = Array.isArray(roles) ? roles : [roles];
    return arr.includes(user.role);
  }

  /** —— PRIVADOS —— */
  private setSession(token: string, user: AuthUser) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    this.isAuthSubject.next(true);
  }

  private restoreUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  /** Decodifica el payload del JWT (sin validar firma; solo lectura de 'exp', etc.) */
  private decodeJwtPayload(token: string | null): any | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      // decodeURIComponent(escape(...)) para soportar UTF-8 en navegadores legacy
      return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
      return null;
    }
  }
}
