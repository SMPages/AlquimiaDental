// src/app/services/testimonios.service.ts
import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../core/supabase.token';

export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface TestimonioRecord {
  id: string;                 // uuid
  author_name: string;
  author_role?: string | null;
  avatar_url?: string | null;
  rating?: number | null;     // 1..5
  content: string;
  source_url?: string | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  status: PublishStatus;      // en nuestra tabla default 'published'
}

export interface TestimonioCreateInput {
  author_name: string;
  content: string;
  author_role?: string | null;
  avatar_url?: string | null;
  rating?: number | null;
  source_url?: string | null;
  is_featured?: boolean;
  order_index?: number;
  status?: PublishStatus;     // default published
  published_at?: string | null;
}

export interface TestimonioUpdateInput extends Partial<TestimonioCreateInput> {}

@Injectable({ providedIn: 'root' })
export class TestimoniosService {
  private sb = inject(SUPABASE);

  // ======= Público (vista ya filtrada por publicados) =======
  async listPublic(opts?: { limit?: number }) {
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 20));
    const { data, error } = await this.sb
      .schema('dental')
      .from('v_testimonios_publicados')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as TestimonioRecord[];
  }

  /** Envío abierto de testimonio (público). Por RLS sólo inserta campos permitidos. */
  async submitPublic(author_name: string, content: string, opts?: {
    rating?: number; author_role?: string; avatar_url?: string; source_url?: string;
  }) {
    const payload: Partial<TestimonioRecord> = {
      author_name,
      content,
      rating: opts?.rating ?? null,
      author_role: opts?.author_role ?? null,
      avatar_url: opts?.avatar_url ?? null,
      source_url: opts?.source_url ?? null,
      // el estado/featured lo controla el admin o las policies
    };

    const { error } = await this.sb.schema('dental').from('testimonios').insert([payload]);
    if (error) throw error;
    return true;
  }

  // ======= Admin =======
  async listAdmin(opts?: {
    page?: number; pageSize?: number; search?: string;
    status?: PublishStatus | 'all';
    orderBy?: 'created_at'|'updated_at'|'published_at'|'order_index';
    ascending?: boolean;
  }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.sb.schema('dental').from('testimonios').select('*', { count: 'exact' });

    if (opts?.search) {
      q = q.or(`author_name.ilike.%${opts.search}%,content.ilike.%${opts.search}%`);
    }
    if (opts?.status && opts.status !== 'all') q = q.eq('status', opts.status);

    const orderBy = opts?.orderBy ?? 'created_at';
    const ascending = !!opts?.ascending;
    q = q.order(orderBy, { ascending }).range(from, to);

    const { data, error, count } = await q;
    if (error) throw error;

    return { items: (data ?? []) as TestimonioRecord[], total: count ?? 0, page, pageSize };
  }

  async create(input: TestimonioCreateInput) {
    const payload: Partial<TestimonioRecord> = {
      author_name: input.author_name,
      content: input.content,
      author_role: input.author_role ?? null,
      avatar_url: input.avatar_url ?? null,
      rating: input.rating ?? null,
      source_url: input.source_url ?? null,
      is_featured: !!input.is_featured,
      order_index: input.order_index ?? 0,
      status: input.status ?? 'published',
      published_at: input.published_at ?? new Date().toISOString(),
    };

    const { data, error } = await this.sb.schema('dental')
      .from('testimonios').insert([payload]).select('*').single();
    if (error) throw error;
    return data as TestimonioRecord;
  }

  async update(id: string, patch: TestimonioUpdateInput) {
    const { data, error } = await this.sb.schema('dental')
      .from('testimonios').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return data as TestimonioRecord;
  }

  async publish(id: string, when: Date | null = new Date()) {
    const { data, error } = await this.sb.schema('dental')
      .from('testimonios')
      .update({ status: 'published', published_at: (when ?? new Date()).toISOString() })
      .eq('id', id).select('*').single();
    if (error) throw error;
    return data as TestimonioRecord;
  }

  async unpublish(id: string) {
    const { data, error } = await this.sb.schema('dental')
      .from('testimonios').update({ status: 'draft', published_at: null })
      .eq('id', id).select('*').single();
    if (error) throw error;
    return data as TestimonioRecord;
  }

  async setFeatured(id: string, featured: boolean) {
    const { data, error } = await this.sb.schema('dental')
      .from('testimonios').update({ is_featured: featured }).eq('id', id)
      .select('*').single();
    if (error) throw error;
    return data as TestimonioRecord;
  }

  async reorder(items: { id: string; order_index: number }[]) {
    const { error } = await this.sb.schema('dental')
      .from('testimonios').upsert(items, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async remove(id: string) {
    const { error } = await this.sb.schema('dental')
      .from('testimonios').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
