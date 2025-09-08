// src/app/services/gallery.service.ts
import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../core/supabase.token';

export type MediaKind = 'image' | 'video' | 'file';

export interface GalleryItem {
  id: string;              // uuid
  title?: string | null;
  description?: string | null;
  url: string;
  kind: MediaKind;
  alt_text?: string | null;
  tags: string[];
  is_visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemCreateInput {
  title?: string | null;
  description?: string | null;
  url?: string | null;           // si subes archivo, se ignora y se usa el generado
  kind?: MediaKind;              // default 'image'
  alt_text?: string | null;
  tags?: string[];
  is_visible?: boolean;          // default true
  order_index?: number;          // default 0
}

export interface GalleryItemUpdateInput extends Partial<GalleryItemCreateInput> {}

export interface GalleryAlbum {
  id: string;          // uuid
  name: string;
  slug: string;
  description?: string | null;
  cover_url?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbumCreateInput {
  name: string;
  slug?: string;
  description?: string | null;
  cover_url?: string | null;
  order_index?: number;
}

export interface GalleryAlbumUpdateInput extends Partial<GalleryAlbumCreateInput> {}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private sb = inject(SUPABASE);

  // ========== PÚBLICO ==========
  /** Lista ítems visibles (vista ya filtrada) */
  async listVisible(opts?: { page?: number; pageSize?: number; tag?: string }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 24));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.sb
      .schema('dental')
      .from('v_galeria_visible')
      .select('*', { count: 'exact' })
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (opts?.tag) q = q.contains('tags', [opts.tag]);

    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) throw error;

    return { items: (data ?? []) as GalleryItem[], total: count ?? 0, page, pageSize };
  }

  /** Lista álbumes públicos (no hay campo visible; se exponen todos, ordenados) */
  async listAlbumsPublic() {
    const { data, error } = await this.sb
      .schema('dental')
      .from('galeria_albums')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as GalleryAlbum[];
  }

  /** Ítems visibles pertenecientes a un álbum */
  async listVisibleByAlbumSlug(slug: string) {
    // 1) obtener álbum
    const { data: album, error: aErr } = await this.sb
      .schema('dental')
      .from('galeria_albums')
      .select('id, name, slug, description, cover_url')
      .eq('slug', slug)
      .single();
    if (aErr) throw aErr;

    // 2) obtener ítems vinculados y visibles
    const { data, error } = await this.sb
      .schema('dental')
      .from('galeria_album_items')
      .select(`
        order_index,
        galeria_items: item_id (
          id, title, description, url, kind, alt_text, tags, is_visible, order_index, created_at, updated_at
        )
      `)
      .eq('album_id', album.id)
      .order('order_index', { ascending: true });

    if (error) throw error;
    const items = (data ?? [])
      .map((x: any) => x.galeria_items as GalleryItem)
      .filter(i => i?.is_visible);

    return { album, items };
  }

  // ========== ADMIN: ÍTEMS ==========
  async listAdminItems(opts?: {
    page?: number; pageSize?: number; search?: string; visible?: boolean | 'all';
    orderBy?: 'order_index'|'created_at'|'updated_at';
    ascending?: boolean;
  }) {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, opts?.pageSize ?? 50));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.sb.schema('dental').from('galeria_items').select('*', { count: 'exact' });

    if (opts?.search) {
      q = q.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
    }
    if (typeof opts?.visible === 'boolean') {
      q = q.eq('is_visible', opts.visible);
    }

    const orderBy = opts?.orderBy ?? 'order_index';
    const ascending = !!opts?.ascending;
    q = q.order(orderBy, { ascending }).range(from, to);

    const { data, error, count } = await q;
    if (error) throw error;
    return { items: (data ?? []) as GalleryItem[], total: count ?? 0, page, pageSize };
  }

  async getItemById(id: string) {
    const { data, error } = await this.sb
      .schema('dental').from('galeria_items').select('*').eq('id', id).single();
    if (error) throw error;
    return data as GalleryItem;
  }

  /** Crea un ítem desde URL (sin archivo) */
  async createItem(input: GalleryItemCreateInput) {
    const payload: Partial<GalleryItem> = {
      title: input.title ?? null,
      description: input.description ?? null,
      url: input.url ?? '', // si subes archivo usar createItemFromFile
      kind: input.kind ?? 'image',
      alt_text: input.alt_text ?? null,
      tags: input.tags ?? [],
      is_visible: input.is_visible ?? true,
      order_index: input.order_index ?? 0,
    };

    const { data, error } = await this.sb
      .schema('dental').from('galeria_items')
      .insert([payload]).select('*').single();
    if (error) throw error;
    return data as GalleryItem;
  }

  /** Sube archivo a Storage y crea el ítem */
  async createItemFromFile(file: File, opts?: {
    title?: string; description?: string; altText?: string;
    kind?: MediaKind; tags?: string[]; isVisible?: boolean;
    orderIndex?: number; bucket?: string; albumId?: string;
  }) {
    const bucket = opts?.bucket ?? 'dental';
    const kind = opts?.kind ?? 'image';

    const path = `gallery/${Date.now()}_${sanitizeFilename(file.name)}`;
    const up = await this.sb.storage.from(bucket).upload(path, file, { upsert: false });
    if (up.error) throw up.error;

    const pub = this.sb.storage.from(bucket).getPublicUrl(path);
    const url = pub.data.publicUrl;

    // crear item
    const item = await this.createItem({
      title: opts?.title ?? null,
      description: opts?.description ?? null,
      url,
      kind,
      alt_text: opts?.altText ?? undefined,
      tags: opts?.tags ?? [],
      is_visible: opts?.isVisible ?? true,
      order_index: opts?.orderIndex ?? 0,
    });

    // si se especificó álbum, vincular
    if (opts?.albumId) {
      await this.addItemToAlbum(opts.albumId, item.id);
    }

    return item;
  }

  async updateItem(id: string, patch: GalleryItemUpdateInput) {
    const { data, error } = await this.sb
      .schema('dental').from('galeria_items')
      .update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return data as GalleryItem;
  }

  async setItemVisibility(id: string, visible: boolean) {
    const { data, error } = await this.sb
      .schema('dental').from('galeria_items')
      .update({ is_visible: visible }).eq('id', id).select('*').single();
    if (error) throw error;
    return data as GalleryItem;
  }

  async reorderItems(items: { id: string; order_index: number }[]) {
    const { error } = await this.sb
      .schema('dental').from('galeria_items')
      .upsert(items, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async removeItem(id: string) {
    const { error } = await this.sb
      .schema('dental').from('galeria_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // ========== ADMIN: ÁLBUMES ==========
  async listAdminAlbums() {
    const { data, error } = await this.sb
      .schema('dental').from('galeria_albums')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as GalleryAlbum[];
  }

  async getAlbumById(id: string) {
    const { data, error } = await this.sb
      .schema('dental').from('galeria_albums')
      .select('*').eq('id', id).single();
    if (error) throw error;
    return data as GalleryAlbum;
  }

  async createAlbum(input: GalleryAlbumCreateInput) {
    const baseSlug = (input.slug?.trim()?.length ? input.slug! : input.name);
    const slug = await this.ensureUniqueAlbumSlug(this.slugify(baseSlug));

    const payload: Partial<GalleryAlbum> = {
      name: input.name,
      slug,
      description: input.description ?? null,
      cover_url: input.cover_url ?? null,
      order_index: input.order_index ?? 0,
    };

    const { data, error } = await this.sb
      .schema('dental').from('galeria_albums')
      .insert([payload]).select('*').single();
    if (error) throw error;
    return data as GalleryAlbum;
  }

  async updateAlbum(id: string, patch: GalleryAlbumUpdateInput) {
    const updates: any = { ...patch };
    if (typeof patch.slug === 'string') {
      updates.slug = await this.ensureUniqueAlbumSlug(this.slugify(patch.slug), id);
    }

    const { data, error } = await this.sb
      .schema('dental').from('galeria_albums')
      .update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    return data as GalleryAlbum;
  }

  async reorderAlbums(items: { id: string; order_index: number }[]) {
    const { error } = await this.sb
      .schema('dental').from('galeria_albums')
      .upsert(items, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async removeAlbum(id: string) {
    const { error } = await this.sb
      .schema('dental').from('galeria_albums')
      .delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // ========== ADMIN: Relación Álbum ↔ Ítems ==========
  async listAlbumItems(albumId: string) {
    const { data, error } = await this.sb
      .schema('dental')
      .from('galeria_album_items')
      .select(`
        order_index,
        galeria_items: item_id (
          id, title, description, url, kind, alt_text, tags, is_visible, order_index, created_at, updated_at
        )
      `)
      .eq('album_id', albumId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((x: any) => x.galeria_items as GalleryItem);
  }

  async addItemToAlbum(albumId: string, itemId: string, orderIndex = 0) {
    const { error } = await this.sb
      .schema('dental')
      .from('galeria_album_items')
      .insert([{ album_id: albumId, item_id: itemId, order_index: orderIndex }]);
    if (error) throw error;
    return true;
  }

  async removeItemFromAlbum(albumId: string, itemId: string) {
    const { error } = await this.sb
      .schema('dental')
      .from('galeria_album_items')
      .delete()
      .eq('album_id', albumId)
      .eq('item_id', itemId);
    if (error) throw error;
    return true;
  }

  async reorderAlbumItems(albumId: string, items: { item_id: string; order_index: number }[]) {
    // upsert por (album_id, item_id) no es posible con .upsert de múltiples columnas,
    // así que hacemos UPSERT individualmente o usamos RPC; aquí lo hacemos en batch simple:
    const rows = items.map(r => ({ album_id: albumId, item_id: r.item_id, order_index: r.order_index }));
    const { error } = await this.sb
      .schema('dental')
      .from('galeria_album_items')
      .upsert(rows, { onConflict: 'album_id,item_id' as any }); // PostgREST acepta CSV
    if (error) throw error;
    return true;
  }

  // ========== Helpers ==========
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

  private async ensureUniqueAlbumSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let i = 1;

    while (true) {
      let q = this.sb.schema('dental').from('galeria_albums').select('id').eq('slug', slug).limit(1);
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
