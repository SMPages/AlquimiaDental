// src/auth/dash-admin/gallery/gallery-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GalleryService,
  GalleryItem,
} from '../../../backend/gallery.service';

@Component({
  standalone: true,
  selector: 'app-gallery-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryAdminComponent {
  private gallery = inject(GalleryService);

  items = signal<GalleryItem[]>([]);
  page = signal(1);
  readonly pageSize = 24;

  tag = '';
  onlyVisible = false;
  loading = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    await this.fetch();
  }

  async fetch() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.gallery.listAdmin({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.tag || undefined,
        // visible: 1 | 0 | 'all' en el servicio: traducimos el boolean a 1 | 'all'
        visible: this.onlyVisible ? (1 as any) : ('all' as any),
      } as any);

      // Si quisieras filtrar por tag en cliente, puedes hacerlo aquí:
      const filtered = this.tag
        ? res.items.filter((x) => (x.tags ?? []).includes(this.tag))
        : res.items;

      this.items.set(filtered);
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo cargar la galería.');
    } finally {
      this.loading.set(false);
    }
  }

  next() {
    this.page.update((p) => p + 1);
    this.fetch();
  }

  prev() {
    this.page.update((p) => Math.max(1, p - 1));
    this.fetch();
  }

  async upload(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    // Preferimos un método nativo si lo tienes en tu GalleryService
    const anySvc = this.gallery as any;

    try {
      if (file && typeof anySvc.createItemFromFile === 'function') {
        const created: GalleryItem = await anySvc.createItemFromFile(file, {
          kind: 'image',
          is_visible: true,
          title: file.name,
        });
        this.items.update((arr) => [created, ...arr]);
      } else {
        // Fallback: pedir URL manual si aún no tienes endpoint de upload
        const url = prompt(
          'No hay endpoint de subida disponible.\nPega una URL pública de la imagen:'
        );
        if (!url) return;

        const created = await this.gallery.createItem({
          url,
          kind: 'image',
          is_visible: true,
          title: url.split('/').pop() ?? '(sin título)',
        } as any);

        this.items.update((arr) => [created, ...arr]);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo crear el ítem.');
    } finally {
      if (input) input.value = '';
    }
  }

  async toggle(it: GalleryItem) {
    try {
      const updated = await this.gallery.updateItem(it.id, {
        is_visible: !it.is_visible,
      } as any);
      this.items.update((list) => list.map((x) => (x.id === it.id ? updated : x)));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo cambiar la visibilidad.');
    }
  }

  edit(it: GalleryItem) {
    // Aquí abrirías tu modal; por ahora, ejemplo simple:
    const newTitle = prompt('Nuevo título:', it.title ?? '');
    if (newTitle === null) return;
    this.gallery
      .updateItem(it.id, { title: newTitle } as any)
      .then((u) =>
        this.items.update((list) => list.map((x) => (x.id === it.id ? u : x)))
      )
      .catch((e) => this.error.set(e?.message ?? 'No se pudo editar el ítem.'));
  }

  async remove(it: GalleryItem) {
    if (!confirm('¿Eliminar este ítem?')) return;
    try {
      await this.gallery.deleteItem(it.id);
      this.items.update((list) => list.filter((x) => x.id !== it.id));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo eliminar.');
    }
  }
}
