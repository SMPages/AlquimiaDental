import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type MediaKind = 'image' | 'video' | 'file';

export interface PostRecord {
  id: number;             // numérico
  title: string;
  slug: string;
  excerpt?: string | null;
  content_md?: string | null;
  cover_url?: string | null;
  media_url?: string | null;
  media_kind?: MediaKind | null;
  status: PublishStatus;
  published_at?: string | null; // ISO
  tags: string[];               // JSON en backend → array aquí
  is_featured: boolean;
  order_index: number;
  created_at: string;           // DATETIME(3) → ISO
  updated_at: string;
}

export interface PostCreateInput {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content_md?: string | null;
  cover_url?: string | null;
  media_url?: string | null;
  media_kind?: MediaKind | null;
  status?: PublishStatus;
  published_at?: string | null;
  tags?: string[];
  is_featured?: boolean;
  order_index?: number;
}

export interface PostUpdateInput extends Partial<PostCreateInput> {}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  get api(){ return environment.apiBase; }

  async listAdmin(opts?: {
    page?: number; pageSize?: number; search?: string; status?: PublishStatus | 'all';
  }): Promise<{ items: PostRecord[]; total: number; page: number; pageSize: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, opts?.page ?? 1)))
      .set('pageSize', String(Math.min(100, Math.max(1, opts?.pageSize ?? 20))));
    if (opts?.search) params = params.set('search', opts.search);
    if (opts?.status && opts.status !== 'all') params = params.set('status', opts.status);

    return await this.http
      .get<{items: PostRecord[]; total: number; page: number; pageSize: number}>(`${this.api}/posts.php`, { params })
      .toPromise()
      .then(r => ({ ...r!, items: (r!.items ?? []).map(normalize) }));
  }

  async getById(id: number) {
    const params = new HttpParams().set('id', String(id));
    const data = await this.http.get<PostRecord>(`${this.api}/posts.php`, { params }).toPromise();
    return normalize(data!);
  }

  async createPost(input: PostCreateInput) {
    const data = await this.http.post<PostRecord>(`${this.api}/posts.php`, input).toPromise();
    return normalize(data!);
  }

  async updatePost(id: number, patch: PostUpdateInput) {
    const params = new HttpParams().set('id', String(id));
    const data = await this.http.patch<PostRecord>(`${this.api}/posts.php`, { id, ...patch }, { params }).toPromise();
    return normalize(data!);
  }

  async publishPost(id: number, when: Date | null = new Date()) {
    return this.updatePost(id, { status: 'published', published_at: (when ?? new Date()).toISOString() });
  }

  async unpublishPost(id: number) {
    return this.updatePost(id, { status: 'draft', published_at: null });
  }

  async deletePost(id: number) {
    const params = new HttpParams().set('id', String(id));
    await this.http.delete<{ok: boolean}>(`${this.api}/posts.php`, { params }).toPromise();
    return true;
  }
}

/** Asegura que venga tags como array y normaliza tipos */
function normalize(r: PostRecord): PostRecord {
  return {
    ...r,
    tags: Array.isArray(r.tags) ? r.tags : [],
    is_featured: !!r.is_featured,
    order_index: Number(r.order_index ?? 0),
  };
}
