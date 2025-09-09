// src/app/core/auth/login.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'editor' | 'user' | string;
  avatarUrl?: string | null;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  data?: {
    token?: string;
    access_token?: string;
    jwt?: string;
    // Otras propiedades que pueda traer el backend
    [k: string]: any;
  };
  user?: any;
}

const LS_TOKEN = 'auth.token';
const LS_USER = 'auth.user';
const LS_PERSIST = 'auth.remember';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  private _token = signal<string | null>(null);
  private _user  = signal<AuthUser | null>(null);
  isAuthenticated = computed(() => !!this._token());

  constructor() {
    this.restoreFromStorage();
  }

  get token() { return this._token(); }
  get user()  { return this._user(); }
  getToken()  { return this._token(); } // compat con interceptor previo

  async login(email: string, password: string, remember: boolean = true): Promise<void> {
    const body = { email, password };

    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api}/login.php`, body, jsonHeaders())
    );

    // ✅ usar ['prop'] cuando proviene de index signature
    const token =
      res?.token ??
      res?.access_token ??
      res?.jwt ??
      res?.data?.['token'] ??
      res?.data?.['access_token'] ??
      res?.data?.['jwt'] ??
      null;

    if (!token) {
      console.warn('[LoginService] Respuesta de login sin token:', res);
      throw new Error('Token inválido');
    }

    // Puede venir en res.user o anidado en data.user
    const rawUser = res?.user ?? res?.data?.['user'] ?? null;

    const user: AuthUser | null = rawUser
      ? {
          id: Number(rawUser.id),
          email: String(rawUser.email ?? ''),
          name: String(rawUser.display_name ?? rawUser.name ?? ''),
          role: rawUser.role ?? 'admin',
          avatarUrl: rawUser.avatarUrl ?? rawUser.avatar_url ?? null,
        }
      : null;

    this._token.set(token);
    this._user.set(user);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(LS_TOKEN, token);
    if (user) storage.setItem(LS_USER, JSON.stringify(user));
    localStorage.setItem(LS_PERSIST, remember ? '1' : '0');

    const other = remember ? sessionStorage : localStorage;
    other.removeItem(LS_TOKEN);
    other.removeItem(LS_USER);
  }

  async me(): Promise<AuthUser | null> {
    if (!this.token) return null;
    try {
      const res = await firstValueFrom(
        this.http.get<{ user: any }>(`${this.api}/auth.php?action=me`)
      );
      const raw = res.user;
      const user: AuthUser = {
        id: Number(raw.id),
        email: String(raw.email ?? ''),
        name: String(raw.display_name ?? raw.name ?? ''),
        role: raw.role ?? 'admin',
        avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
      };
      this._user.set(user);

      const useLocal = (localStorage.getItem(LS_PERSIST) ?? '1') === '1';
      (useLocal ? localStorage : sessionStorage).setItem(LS_USER, JSON.stringify(user));
      return user;
    } catch {
      this.clearAuth();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.api}/auth.php?action=logout`, {}));
    } catch { /* noop */ }
    this.clearAuth();
  }

  private clearAuth() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    sessionStorage.removeItem(LS_TOKEN);
    sessionStorage.removeItem(LS_USER);
  }

  private restoreFromStorage() {
    const useLocal = (localStorage.getItem(LS_PERSIST) ?? '1') === '1';
    const storage = useLocal ? localStorage : sessionStorage;

    const t = storage.getItem(LS_TOKEN);
    const u = storage.getItem(LS_USER);
    if (t) this._token.set(t);
    if (u) {
      try { this._user.set(JSON.parse(u)); } catch { /* noop */ }
    }
  }
}

function jsonHeaders() {
  return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
}
