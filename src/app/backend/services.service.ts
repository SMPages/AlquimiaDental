// src/app/services/services.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceItem {
  id?: number | string;
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceQuery {
  q?: string;
  page?: number;      // 1-based
  pageSize?: number;
  isActive?: boolean;
  sort?: 'recent' | 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc';
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private http = inject(HttpClient);
  /** Igual que en gallery.service.ts */
  private get api() { return environment.apiBase; }

  /** REST puro */
  private base = `${this.api}/services`;
  /** Si usas PHP file: */
  // private base = `${this.api}/services.php`;

  //#region Helpers
  private handleError(err: HttpErrorResponse) {
    const message =
      err.error?.message ??
      (typeof err.error === 'string' ? err.error : null) ??
      err.message ??
      'Request error';
    if (!environment.production) {
      console.error('[ServicesService] Error:', err);
    }
    return throwError(() => new Error(message));
  }

  private buildParams(query?: ServiceQuery) {
    let params = new HttpParams();
    if (!query) return params;

    if (query.q) params = params.set('q', query.q);
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (typeof query.isActive === 'boolean') params = params.set('isActive', String(query.isActive));
    if (query.sort) params = params.set('sort', query.sort);
    return params;
  }
  //#endregion

  //#region Queries
  /** Lista paginada (GET /services?q=&page=&pageSize=&isActive=&sort=) */
  getServices(query?: ServiceQuery): Observable<PagedResult<ServiceItem>> {
    const params = this.buildParams(query);
    return this.http.get<PagedResult<ServiceItem>>(this.base, { params }).pipe(
      map(res => ({
        items: res.items ?? [],
        total: Number(res.total ?? 0),
        page: Number(res.page ?? query?.page ?? 1),
        pageSize: Number(res.pageSize ?? query?.pageSize ?? 10),
      })),
      catchError(this.handleError.bind(this))
    );
  }

  /** Todos (sin paginar) – útil para menús o secciones públicas */
  getAllActive(): Observable<ServiceItem[]> {
    const params = new HttpParams().set('isActive', 'true').set('pageSize', '9999');
    return this.http.get<PagedResult<ServiceItem>>(this.base, { params }).pipe(
      map(r => r.items ?? []),
      catchError(this.handleError.bind(this))
    );
  }

  /** Detalle (GET /services/:id) */
  getById(id: number | string): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${this.base}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  //#endregion

  //#region Commands
  /** Crear (POST /services) */
  create(payload: ServiceItem): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(this.base, payload, jsonHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /** Actualizar (PUT /services/:id) */
  update(id: number | string, payload: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.base}/${id}`, payload, jsonHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /** Eliminar (DELETE /services/:id) */
  delete(id: number | string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /** Activar/Desactivar (PATCH /services/:id/toggle) */
  toggleActive(id: number | string, isActive: boolean): Observable<ServiceItem> {
    return this.http.patch<ServiceItem>(`${this.base}/${id}/toggle`, { isActive }, jsonHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /** Subir imagen (POST /services/:id/image) con FormData */
  uploadImage(id: number | string, file: File): Observable<ServiceItem> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<ServiceItem>(`${this.base}/${id}/image`, form).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  //#endregion
}

/** Headers JSON (PHP debe aceptar application/json en php://input) */
function jsonHeaders() {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return { headers };
}
