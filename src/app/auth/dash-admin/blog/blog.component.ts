// src/auth/dash-admin/blog/blog-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// TODO: cambia al servicio que uses para Blog. Mientras, dejo un shape mínimo:
type BlogItem = { id: number|string; title: string; slug?: string; published?: boolean; updated_at?: string };

@Component({
  standalone: true,
  selector: 'app-blog-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="toolbar">
      <h2>Blog</h2>
      <div class="actions">
        <input class="input" placeholder="Buscar…" [(ngModel)]="search" (input)="fetch()" />
        <button class="btn btn-primary" (click)="create()">Nuevo</button>
      </div>
    </div>

    <div class="table">
      <div class="thead"><div>Título</div><div>Slug</div><div>Estado</div><div>Actualizado</div><div>Acciones</div></div>
      <div class="row" *ngFor="let it of items()">
        <div class="ellipsis">{{ it.title }}</div>
        <div class="muted ellipsis">{{ it.slug || '—' }}</div>
        <div>{{ it.published ? 'Publicado' : 'Borrador' }}</div>
        <div class="muted">{{ it.updated_at | date:'short' }}</div>
        <div class="row-actions">
          <button class="btn sm" (click)="edit(it)">Editar</button>
          <button class="btn sm" (click)="togglePublish(it)">{{ it.published ? 'Ocultar' : 'Publicar' }}</button>
          <button class="btn sm danger" (click)="remove(it)">Eliminar</button>
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="btn" (click)="prev()" [disabled]="page()<=1">«</button>
      <span>Página {{ page() }}</span>
      <button class="btn" (click)="next()">»</button>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px}
    .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
    .actions{display:flex;gap:8px;align-items:center}
    .input{border:1px solid var(--border);border-radius:10px;padding:8px 10px;min-width:220px}
    .table{display:grid;gap:8px}
    .thead,.row{display:grid;grid-template-columns:1.4fr 1fr 120px 160px 220px;gap:12px;align-items:center}
    .thead{font-weight:600;color:var(--muted)}
    .row-actions{display:flex;gap:6px}
    .btn{border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px 10px;cursor:pointer}
    .btn:hover{background:var(--bg-page)}
    .btn.sm{padding:4px 8px}
    .btn.danger{color:#b4231a;border-color:#ffd6d4}
    .btn.btn-primary{background:var(--accent);border-color:var(--accent);color:#fff}
    .btn.btn-primary:hover{background:var(--accent-600);border-color:var(--accent-600)}
    .muted{color:var(--muted)}
    .ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .footer{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px}
  `]
})
export class BlogAdminComponent {
  // private blog = inject(BlogService); // cuando tengas servicio real
  items = signal<BlogItem[]>([]);
  page = signal(1);
  pageSize = 20;
  search = '';

  async ngOnInit(){ await this.fetch(); }

  async fetch(){
    // TODO: reemplazar por tu servicio real
    // const res = await this.blog.list({ page:this.page(), pageSize:this.pageSize, search:this.search });
    // this.items.set(res.items);
    // MOCK:
    this.items.set(Array.from({length:8},(_,i)=>({id:i+1,title:`Post #${i+1}`,slug:`post-${i+1}`,published:!!(i%2),updated_at:new Date().toISOString()})));
  }

  next(){ this.page.update(p=>p+1); this.fetch(); }
  prev(){ this.page.update(p=>Math.max(1,p-1)); this.fetch(); }

  create(){ /* abrir modal o navegar a editor */ }
  edit(it: BlogItem){ /* navegar a editor con it.id */ }
  togglePublish(it: BlogItem){ it.published = !it.published; /* llamar servicio update */ }
  remove(it: BlogItem){ /* confirmar y borrar en servicio */ }
}
