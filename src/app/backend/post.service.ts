// src/app/services/posts.service.ts
import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../core/supabase.token';

export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type MediaKind = 'image' | 'video' | 'file';

export interface PostRecord {
  id: string;              // uuid
  title: string;
  slug: string;
  excerpt?: string | null;
  content_md?: string | null;
  cover_url?: string | null;
  media_url?: string | null;
  media_kind?: MediaKind | null;
  status: PublishStatus;
  published_at?: string | null; // ISO
  tags: string[];               // text[]
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PostCreateInput {
  title: string;
  slug?: string; // si no viene, se genera desde title
  excerpt?: string | null;
  content_md?: string | null;
  cover_url?: string | null;
  media_url?: string | null;
  media_kind?: MediaKind | null;
  status?: PublishStatus;       // default: 'draft'
  published_at?: string | null; // si status = 'published' y quieres fecha fija
  tags?: string[];
  is_featured?: boolean;
  order_index?: number;
}

export interface PostUpdateInput extends Partial<PostCreateInput> {}

export interface PostMedia {
  id: string;            // uuid
  post_id: string;       // uuid
  url: string;
  kind: MediaKind;
  alt_text?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private sb = inject(SUPABASE);

  // ========= PUBLIC: lista de posts publicados =========
  async listPublished(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;
    tag?: string;
    featuredFirst?: boolean; // true por defecto
  }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, opts?.pageSize ?? 10));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Vista ya filtrada por published y ordenada (is_featured, published_at desc, created_at desc)
    let q = this.sb
      .schema('dental')
      .from('v_posts_publicados')
      .select('id, slug, title, excerpt, cover_url, published_at, tags, is_featured', { count: 'exact' });

    if (opts?.search) {
      q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
    }
    if (opts?.tag) {
      // filtro por tag dentro del arreglo text[]
      q = q.contains('tags', [opts.tag]);
    }

    // La vista ya viene ordenada; si quisieras forzarlo, podrías re-ordenar acá.
    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) throw error;

    return {
      items: (data ?? []) as PostRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  // ========= PUBLIC: obtener por slug publicado =========
  async getPublishedBySlug(slug: string) {
    // Para evitar condiciones de carrera con fechas, validamos published y fecha en la tabla
    const nowIso = new Date().toISOString();
    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  // ========= ADMIN: listado general (cualquier estado) =========
  async listAdmin(opts?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: PublishStatus | 'all';
    orderBy?: 'created_at' | 'updated_at' | 'published_at' | 'order_index';
    ascending?: boolean;
  }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.sb
      .schema('dental')
      .from('posts')
      .select('*', { count: 'exact' });

    if (opts?.search) {
      q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
    }
    if (opts?.status && opts.status !== 'all') {
      q = q.eq('status', opts.status);
    }

    const orderBy = opts?.orderBy ?? 'created_at';
    const ascending = !!opts?.ascending;

    q = q.order(orderBy, { ascending }).range(from, to);

    const { data, error, count } = await q;
    if (error) throw error;

    return {
      items: (data ?? []) as PostRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  // ========= ADMIN: obtener por id =========
  async getById(id: string) {
    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  // ========= ADMIN: crear post =========
  async createPost(input: PostCreateInput) {
    // slug
    const baseSlug = (input.slug && input.slug.trim().length > 0)
      ? this.slugify(input.slug)
      : this.slugify(input.title);

    const finalSlug = await this.ensureUniqueSlug(baseSlug);

    const payload: Partial<PostRecord> = {
      title: input.title,
      slug: finalSlug,
      excerpt: input.excerpt ?? null,
      content_md: input.content_md ?? null,
      cover_url: input.cover_url ?? null,
      media_url: input.media_url ?? null,
      media_kind: input.media_kind ?? null,
      status: input.status ?? 'draft',
      published_at: input.published_at ?? null,
      tags: input.tags ?? [],
      is_featured: !!input.is_featured,
      order_index: input.order_index ?? 0,
    };

    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  // ========= ADMIN: actualizar post =========
  async updatePost(id: string, patch: PostUpdateInput) {
    const updates: any = { ...patch };

    // si viene slug, normalizar y garantizar unicidad
    if (typeof patch.slug === 'string') {
      const baseSlug = this.slugify(patch.slug);
      updates.slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  // ========= ADMIN: publicar / despublicar =========
  async publishPost(id: string, when: Date | null = new Date()) {
    const payload: Partial<PostRecord> = {
      status: 'published',
      published_at: when ? when.toISOString() : new Date().toISOString(),
    };
    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  async unpublishPost(id: string) {
    const payload: Partial<PostRecord> = {
      status: 'draft',
      published_at: null,
    };
    const { data, error } = await this.sb
      .schema('dental')
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as PostRecord;
  }

  // ========= ADMIN: eliminar post (borra media por FK on delete cascade) =========
  async deletePost(id: string) {
    const { error } = await this.sb
      .schema('dental')
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // ========= MEDIA: listar / agregar / eliminar / reordenar =========
  async listMedia(postId: string) {
    const { data, error } = await this.sb
      .schema('dental')
      .from('post_media')
      .select('*')
      .eq('post_id', postId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data ?? []) as PostMedia[];
  }

  async addMediaFromUrl(postId: string, url: string, kind: MediaKind = 'image', altText?: string, orderIndex = 0) {
    const { data, error } = await this.sb
      .schema('dental')
      .from('post_media')
      .insert([{ post_id: postId, url, kind, alt_text: altText ?? null, order_index: orderIndex }])
      .select('*')
      .single();

    if (error) throw error;
    return data as PostMedia;
  }

  /** Sube archivo al bucket y crea registro en post_media. */
  async addMediaFromFile(postId: string, file: File, opts?: {
    kind?: MediaKind; altText?: string; orderIndex?: number; bucket?: string;
  }) {
    const bucket = opts?.bucket ?? 'dental';
    const kind = opts?.kind ?? 'image';

    const path = `posts/${postId}/${Date.now()}_${sanitizeFilename(file.name)}`;
    const up = await this.sb.storage.from(bucket).upload(path, file, { upsert: false });

    if (up.error) throw up.error;

    const pub = this.sb.storage.from(bucket).getPublicUrl(path);
    const url = pub.data.publicUrl;

    return this.addMediaFromUrl(postId, url, kind, opts?.altText, opts?.orderIndex ?? 0);
  }

  async removeMedia(mediaId: string) {
    const { error } = await this.sb
      .schema('dental')
      .from('post_media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
    return true;
  }

  async reorderMedia(postId: string, items: { id: string; order_index: number }[]) {
    // upsert por id para actualizar order_index
    const { error } = await this.sb
      .schema('dental')
      .from('post_media')
      .upsert(items, { onConflict: 'id' });

    if (error) throw error;
    return true;
  }

  // ========= Helpers =========
  private slugify(text: string): string {
    return (text || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin acentos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')                     // solo alfanum y espacios
      .trim()
      .replace(/\s+/g, '-')                             // espacios a guion
      .replace(/-+/g, '-');                             // guiones múltiples → uno
  }

  /** Garantiza que el slug sea único. Si existe, añade sufijos -2, -3, ... */
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let i = 1;

    while (true) {
      let q = this.sb.schema('dental').from('posts').select('id').eq('slug', slug).limit(1);
      if (excludeId) q = q.neq('id', excludeId);

      const { data, error } = await q;
      if (error) throw error;

      if (!data || data.length === 0) return slug;

      i++;
      slug = `${baseSlug}-${i}`;
    }
  }
}

/** Quita caracteres problemáticos en nombres de archivo */
function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, '_');
}
