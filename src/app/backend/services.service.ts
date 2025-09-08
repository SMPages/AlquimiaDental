// src/app/services/servicios.service.ts
import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../core/supabase.token';

export type MediaKind = 'image' | 'video' | 'file';

export interface ServicioRecord {
  id: string;            // uuid
  name: string;
  slug: string;
  short_desc?: string | null;
  long_desc_md?: string | null;
  icon_url?: string | null;
  price_amount?: string | number | null;  // numeric -> string en JS del driver
  price_currency: string;                 // 'COP' default
  duration_min?: number | null;
  is_active: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ServicioCreateInput {
  name: string;
  slug?: string;
  short_desc?: string | null;
  long_desc_md?: string | null;
  icon_url?: string | null;
  price_amount?: number | null;
  price_currency?: string;
  duration_min?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  order_index?: number;
}

export interface ServicioUpdateInput extends Partial<ServicioCreateInput> {}

export interface ServicioMedia {
  id: string;         // uuid
  servicio_id: string;
  url: string;
  kind: MediaKind;
  alt_text?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private sb = inject(SUPABASE);

  // ======= Público =======
  async listActive(opts?: { tagSearch?: string; page?: number; pageSize?: number }) {
    // (no hay tags en servicios por ahora; orden default de la vista)
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 50));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.sb
      .schema('dental').from('v_servicios_activos')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return { items: (data ?? []) as ServicioRecord[], total: count ?? 0, page, pageSize };
  }

  async getBySlugPublic(slug: string) {
    const { data, error } = await this.sb
      .schema('dental').from('servicios')
      .select('*').eq('slug', slug).eq('is_active', true)
      .single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  // ======= Admin =======
  async listAdmin(opts?: {
    page?: number; pageSize?: number; search?: string;
    active?: boolean|'all'; featuredFirst?: boolean;
  }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.sb.schema('dental').from('servicios').select('*', { count: 'exact' });

    if (opts?.search) {
      q = q.or(`name.ilike.%${opts.search}%,short_desc.ilike.%${opts.search}%`);
    }
    if (typeof opts?.active === 'boolean') {
      q = q.eq('is_active', opts.active);
    }

    // Orden: featured desc, order_index asc, name asc
    q = q.order('is_featured', { ascending: false })
         .order('order_index', { ascending: true })
         .order('name', { ascending: true })
         .range(from, to);

    const { data, error, count } = await q;
    if (error) throw error;

    return { items: (data ?? []) as ServicioRecord[], total: count ?? 0, page, pageSize };
  }

  async getById(id: string) {
    const { data, error } = await this.sb.schema('dental')
      .from('servicios').select('*').eq('id', id).single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  async create(input: ServicioCreateInput) {
    const baseSlug = (input.slug?.trim()?.length ? input.slug! : input.name);
    const slug = await this.ensureUniqueSlug(this.slugify(baseSlug));

    const payload: Partial<ServicioRecord> = {
      name: input.name,
      slug,
      short_desc: input.short_desc ?? null,
      long_desc_md: input.long_desc_md ?? null,
      icon_url: input.icon_url ?? null,
      price_amount: input.price_amount ?? null,
      price_currency: input.price_currency ?? 'COP',
      duration_min: input.duration_min ?? null,
      is_active: input.is_active ?? true,
      is_featured: input.is_featured ?? false,
      order_index: input.order_index ?? 0,
    };

    const { data, error } = await this.sb.schema('dental')
      .from('servicios').insert([payload]).select('*').single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  async update(id: string, patch: ServicioUpdateInput) {
    const updates: any = { ...patch };
    if (typeof patch.slug === 'string') {
      const baseSlug = this.slugify(patch.slug);
      updates.slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const { data, error } = await this.sb.schema('dental')
      .from('servicios').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  async setActive(id: string, active: boolean) {
    const { data, error } = await this.sb.schema('dental')
      .from('servicios').update({ is_active: active }).eq('id', id)
      .select('*').single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  async setFeatured(id: string, featured: boolean) {
    const { data, error } = await this.sb.schema('dental')
      .from('servicios').update({ is_featured: featured }).eq('id', id)
      .select('*').single();
    if (error) throw error;
    return data as ServicioRecord;
  }

  async reorder(items: { id: string; order_index: number }[]) {
    const { error } = await this.sb.schema('dental')
      .from('servicios').upsert(items, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async remove(id: string) {
    const { error } = await this.sb.schema('dental')
      .from('servicios').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // ======= Media (servicio_media) =======
  async listMedia(servicioId: string) {
    const { data, error } = await this.sb.schema('dental')
      .from('servicio_media').select('*')
      .eq('servicio_id', servicioId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ServicioMedia[];
  }

  async addMediaFromUrl(servicioId: string, url: string, kind: MediaKind = 'image', altText?: string, orderIndex = 0) {
    const { data, error } = await this.sb.schema('dental')
      .from('servicio_media')
      .insert([{ servicio_id: servicioId, url, kind, alt_text: altText ?? null, order_index: orderIndex }])
      .select('*').single();
    if (error) throw error;
    return data as ServicioMedia;
  }

  async addMediaFromFile(servicioId: string, file: File, opts?: {
    kind?: MediaKind; altText?: string; orderIndex?: number; bucket?: string;
  }) {
    const bucket = opts?.bucket ?? 'dental';
    const kind = opts?.kind ?? 'image';
    const path = `servicios/${servicioId}/${Date.now()}_${sanitizeFilename(file.name)}`;

    const up = await this.sb.storage.from(bucket).upload(path, file, { upsert: false });
    if (up.error) throw up.error;

    const pub = this.sb.storage.from(bucket).getPublicUrl(path);
    const url = pub.data.publicUrl;

    return this.addMediaFromUrl(servicioId, url, kind, opts?.altText, opts?.orderIndex ?? 0);
  }

  async removeMedia(mediaId: string) {
    const { error } = await this.sb.schema('dental')
      .from('servicio_media').delete().eq('id', mediaId);
    if (error) throw error;
    return true;
  }

  async reorderMedia(servicioId: string, items: { id: string; order_index: number }[]) {
    const { error } = await this.sb.schema('dental')
      .from('servicio_media').upsert(items, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  // ======= Helpers =======
  private slugify(text: string): string {
    return (text || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let i = 1;

    while (true) {
      let q = this.sb.schema('dental').from('servicios').select('id').eq('slug', slug).limit(1);
      if (excludeId) q = q.neq('id', excludeId);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) return slug;
      i++; slug = `${baseSlug}-${i}`;
    }
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, '_');
}
