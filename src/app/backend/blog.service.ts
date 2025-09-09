// src/app/services/blog.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type MediaKind = 'image' | 'video' | 'file';
export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_url?: string | null;
  media_url?: string | null;
  media_kind?: MediaKind | null;
  published_at?: string | null;
  tags: string[];          // viene de JSON en la API → normalizado a array
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private get api() { return environment.apiBase; }

  /**
   * Lista posts publicados con paginación y filtros opcionales.
   */
  async listPublished(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;
    tag?: string;
    featuredFirst?: boolean; // (el ORDER lo maneja el backend, esto es solo semántico)
  }): Promise<{ items: BlogPost[]; total: number; page: number; pageSize: number }> {

    let params = new HttpParams()
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(50, Math.max(1, opts?.pageSize ?? 10))))
      .set('status', 'published'); // 👈 clave: solo publicados

    if (opts?.search) params = params.set('search', opts.search);
    if (opts?.tag)     params = params.set('tag', opts.tag);

    // posts.php ya ordena (destacados / fechas). El backend que te pasé lo soporta.
    const res = await this.http.get<{items: any[]; total: number; page: number; pageSize: number}>(
      `${this.api}/posts.php`, { params }
    ).toPromise();

    const items = (res?.items ?? []).map(normalizePost);
    return { items, total: res?.total ?? 0, page: res?.page ?? 1, pageSize: res?.pageSize ?? items.length };
  }

  /**
   * Obtiene un post publicado por slug.
   */
  async getBySlug(slug: string): Promise<BlogPost> {
    const params = new HttpParams().set('slug', slug).set('status', 'published');
    const data = await this.http.get<any>(`${this.api}/posts.php`, { params }).toPromise();
    if (!data) throw new Error('Post no encontrado');
    return normalizePost(data);
  }

  /**
   * Destacados (featured). Puedes variar el límite.
   */
  async listFeatured(limit = 3): Promise<BlogPost[]> {
    let params = new HttpParams()
      .set('page', '1')
      .set('pageSize', String(limit))
      .set('status', 'published')
      .set('featured', '1'); // el backend puede interpretar featured=1

    const res = await this.http.get<{items: any[]}>(
      `${this.api}/posts.php`, { params }
    ).toPromise();

    return (res?.items ?? []).map(normalizePost);
  }
}

/* ===== Helpers ===== */
function normalizePost(p: any): BlogPost {
  return {
    id: Number(p.id),
    slug: String(p.slug ?? ''),
    title: String(p.title ?? ''),
    excerpt: p.excerpt ?? null,
    cover_url: p.cover_url ?? null,
    media_url: p.media_url ?? null,
    media_kind: p.media_kind ?? null,
    published_at: p.published_at ?? null,
    tags: Array.isArray(p.tags) ? p.tags : safeParseTags(p.tags),
    is_featured: !!p.is_featured,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function safeParseTags(val: any): string[] {
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
