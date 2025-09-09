import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ajusta la ruta según tu proyecto
import {
  PostsService,
  PostRecord,
  PublishStatus,
} from '../../../backend/post.service';

@Component({
  standalone: true,
  selector: 'app-posts-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsAdminComponent {
  private svc = inject(PostsService);

  items = signal<PostRecord[]>([]);
  total = signal(0);
  page = signal(1);
  readonly pageSize = 20;

  loading = signal(false);
  error = signal('');

  search = '';
  status: PublishStatus | 'all' = 'all';

  async ngOnInit() {
    await this.reload();
  }

  maxPage() {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  async reload() {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await this.svc.listAdmin({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.search || undefined,
        status: this.status,
      });
      this.items.set(res.items);
      this.total.set(res.total);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Error cargando posts');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch() {
    this.page.set(1);
    this.reload();
  }

  clearFilters() {
    this.search = '';
    this.status = 'all';
    this.page.set(1);
    this.reload();
  }

  next() {
    if (this.page() < this.maxPage()) {
      this.page.update((p) => p + 1);
      this.reload();
    }
  }

  prev() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.reload();
    }
  }

  newPost() {
    // TODO: navega a editor o abre modal de creación
    // this.router.navigate(['/', lang, 'auth', 'posts', 'new']);
    alert('Crear nuevo post (pendiente de integrar editor).');
  }

  edit(id: string) {
    // TODO: navega al editor con el id
    // this.router.navigate(['/', lang, 'auth', 'posts', id, 'edit']);
    alert(`Editar post ${id} (pendiente de integrar editor).`);
  }

  async publish(p: PostRecord) {
    try {
      const upd = await this.svc.publishPost(p.id);
      this.items.update((list) => list.map((x) => (x.id === p.id ? upd : x)));
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo publicar');
    }
  }

  async unpublish(p: PostRecord) {
    try {
      const upd = await this.svc.unpublishPost(p.id);
      this.items.update((list) => list.map((x) => (x.id === p.id ? upd : x)));
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo despublicar');
    }
  }

  async remove(p: PostRecord) {
    if (!confirm(`¿Eliminar el post "${p.title}"?`)) return;
    try {
      await this.svc.deletePost(p.id);
      this.items.update((list) => list.filter((x) => x.id !== p.id));
      this.total.update((t) => Math.max(0, t - 1));
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo eliminar');
    }
  }
}
