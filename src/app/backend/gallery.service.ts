// src/app/backend/gallery.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type MediaKind = 'image' | 'video' | 'file';

export interface GalleryItem {
  id: number;                 // AUTO_INCREMENT
  title?: string | null;
  description?: string | null;
  url: string;
  kind: MediaKind;
  alt_text?: string | null;
  tags: string[];             // JSON en backend -> array aquí
  is_visible: boolean;
  order_index: number;
  created_at: string;         // ISO
  updated_at: string;         // ISO
}

export interface GalleryItemCreate {
  title?: string | null;
  description?: string | null;
  url: string;
  kind?: MediaKind;
  alt_text?: string | null;
  tags?: string[];
  is_visible?: boolean;
  order_index?: number;
}

export interface GalleryItemUpdate extends Partial<GalleryItemCreate> {}

export interface GalleryAlbum {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_url?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbumCreate {
  name: string;
  slug?: string; // si no lo mandas, el backend lo genera a partir de name
  description?: string | null;
  cover_url?: string | null;
  order_index?: number;
}

export interface GalleryAlbumUpdate extends Partial<GalleryAlbumCreate> {}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  private get api() { return environment.apiBase; }

  // ========== ITEMS (Público / Admin) ==========

  /** Público: lista elementos visibles con paginación y filtros */
  async listVisible(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;       // título/descr
    kind?: MediaKind;      // 'image' | 'video' | 'file'
    tag?: string;          // busca dentro de JSON tags
    albumId?: number;      // si quieres filtrar por un álbum concreto
  }): Promise<{ items: GalleryItem[]; total: number; page: number; pageSize: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(100, Math.max(1, opts?.pageSize ?? 20))))
      .set('visible', '1');

    if (opts?.search)  params = params.set('search', opts.search);
    if (opts?.kind)    params = params.set('kind', opts.kind);
    if (opts?.tag)     params = params.set('tag', opts.tag);
    if (opts?.albumId) params = params.set('albumId', String(opts.albumId));

    const res = await this.http.get<{items:any[]; total:number; page:number; pageSize:number}>(
      `${this.api}/gallery.php`, { params }
    ).toPromise();

    const items = (res?.items ?? []).map(normalizeItem);
    return { items, total: res?.total ?? 0, page: res?.page ?? 1, pageSize: res?.pageSize ?? items.length };
  }

  /** Admin: lista general (incluye no visibles) */
  async listAdmin(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;
    kind?: MediaKind;
    tag?: string;
    visible?: 0 | 1 | 'all'; // por defecto 'all'
    albumId?: number;
    orderBy?: 'order_index' | 'created_at' | 'updated_at'; // el backend define el ORDER final
    ascending?: boolean;
  }): Promise<{ items: GalleryItem[]; total: number; page: number; pageSize: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(100, Math.max(1, opts?.pageSize ?? 20))));

    if (opts?.search)   params = params.set('search', opts.search);
    if (opts?.kind)     params = params.set('kind', opts.kind);
    if (opts?.tag)      params = params.set('tag', opts.tag);
    if (opts?.albumId)  params = params.set('albumId', String(opts.albumId));
    if (opts?.visible && opts.visible !== 'all') params = params.set('visible', String(opts.visible));
    if (opts?.orderBy)  params = params.set('orderBy', opts.orderBy);
    if (typeof opts?.ascending === 'boolean') params = params.set('asc', opts.ascending ? '1' : '0');

    const res = await this.http.get<{items:any[]; total:number; page:number; pageSize:number}>(
      `${this.api}/gallery.php`, { params }
    ).toPromise();

    const items = (res?.items ?? []).map(normalizeItem);
    return { items, total: res?.total ?? 0, page: res?.page ?? 1, pageSize: res?.pageSize ?? items.length };
  }

  async getItem(id: number): Promise<GalleryItem> {
    const params = new HttpParams().set('id', String(id));
    const data = await this.http.get<any>(`${this.api}/gallery.php`, { params }).toPromise();
    if (!data) throw new Error('Ítem no encontrado');
    return normalizeItem(data);
  }

  async createItem(input: GalleryItemCreate): Promise<GalleryItem> {
    const data = await this.http.post<any>(`${this.api}/gallery.php`, input).toPromise();
    return normalizeItem(data!);
  }

  async updateItem(id: number, patch: GalleryItemUpdate): Promise<GalleryItem> {
    const params = new HttpParams().set('id', String(id));
    const data = await this.http.patch<any>(`${this.api}/gallery.php`, { id, ...patch }, { params }).toPromise();
    return normalizeItem(data!);
  }

  async deleteItem(id: number): Promise<boolean> {
    const params = new HttpParams().set('id', String(id));
    await this.http.delete(`${this.api}/gallery.php`, { params }).toPromise();
    return true;
  }

  // ========== ÁLBUMES ==========

  async listAlbums(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<{ items: GalleryAlbum[]; total: number; page: number; pageSize: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(100, Math.max(1, opts?.pageSize ?? 20))));
    if (opts?.search) params = params.set('search', opts.search);

    const res = await this.http.get<{items:any[]; total:number; page:number; pageSize:number}>(
      `${this.api}/albums.php`, { params }
    ).toPromise();

    const items = (res?.items ?? []).map(normalizeAlbum);
    return { items, total: res?.total ?? 0, page: res?.page ?? 1, pageSize: res?.pageSize ?? items.length };
  }

  async getAlbum(idOrSlug: number | string): Promise<GalleryAlbum> {
    const params = typeof idOrSlug === 'number'
      ? new HttpParams().set('id', String(idOrSlug))
      : new HttpParams().set('slug', idOrSlug);

    const data = await this.http.get<any>(`${this.api}/albums.php`, { params }).toPromise();
    if (!data) throw new Error('Álbum no encontrado');
    return normalizeAlbum(data);
  }

  async createAlbum(input: GalleryAlbumCreate): Promise<GalleryAlbum> {
    const data = await this.http.post<any>(`${this.api}/albums.php`, input).toPromise();
    return normalizeAlbum(data!);
  }

  async updateAlbum(id: number, patch: GalleryAlbumUpdate): Promise<GalleryAlbum> {
    const params = new HttpParams().set('id', String(id));
    const data = await this.http.patch<any>(`${this.api}/albums.php`, { id, ...patch }, { params }).toPromise();
    return normalizeAlbum(data!);
  }

  async deleteAlbum(id: number): Promise<boolean> {
    const params = new HttpParams().set('id', String(id));
    await this.http.delete(`${this.api}/albums.php`, { params }).toPromise();
    return true;
  }

  // ========== Relación Álbum <-> Ítems ==========

  /** Lista ítems de un álbum (público: solo visibles; admin: all) */
  async listAlbumItems(albumId: number, opts?: {
    page?: number; pageSize?: number; visible?: 0 | 1 | 'all';
  }): Promise<{ items: GalleryItem[]; total: number; page: number; pageSize: number }> {
    let params = new HttpParams()
      .set('albumId', String(albumId))
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(100, Math.max(1, opts?.pageSize ?? 20))));
    if (opts?.visible && opts.visible !== 'all') params = params.set('visible', String(opts.visible));

    const res = await this.http.get<{items:any[]; total:number; page:number; pageSize:number}>(
      `${this.api}/albums.php`, { params }
    ).toPromise();

    const items = (res?.items ?? []).map(normalizeItem);
    return { items, total: res?.total ?? 0, page: res?.page ?? 1, pageSize: res?.pageSize ?? items.length };
  }

  /** Añade un ítem al álbum, con order_index opcional */
  async addItemToAlbum(albumId: number, itemId: number, orderIndex = 0): Promise<boolean> {
    await this.http.post(`${this.api}/albums.php?action=addItem`, { albumId, itemId, order_index: orderIndex }).toPromise();
    return true;
  }

  /** Quita un ítem del álbum */
  async removeItemFromAlbum(albumId: number, itemId: number): Promise<boolean> {
    const params = new HttpParams()
      .set('albumId', String(albumId))
      .set('itemId', String(itemId));
    await this.http.delete(`${this.api}/albums.php`, { params }).toPromise();
    return true;
  }

  /** Reordena ítems dentro de un álbum: [{itemId, order_index}] */
  async reorderAlbumItems(albumId: number, items: { itemId: number; order_index: number }[]): Promise<boolean> {
    await this.http.patch(`${this.api}/albums.php?action=reorder`, { albumId, items }).toPromise();
    return true;
  }
}

/* ===== Helpers ===== */
function normalizeItem(r: any): GalleryItem {
  return {
    id: Number(r.id),
    title: r.title ?? null,
    description: r.description ?? null,
    url: r.url,
    kind: r.kind as MediaKind,
    alt_text: r.alt_text ?? null,
    tags: Array.isArray(r.tags) ? r.tags : safeParseTags(r.tags),
    is_visible: !!r.is_visible,
    order_index: Number(r.order_index ?? 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function normalizeAlbum(a: any): GalleryAlbum {
  return {
    id: Number(a.id),
    name: String(a.name ?? ''),
    slug: String(a.slug ?? ''),
    description: a.description ?? null,
    cover_url: a.cover_url ?? null,
    order_index: Number(a.order_index ?? 0),
    created_at: a.created_at,
    updated_at: a.updated_at,
  };
}

function safeParseTags(val: any): string[] {
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
