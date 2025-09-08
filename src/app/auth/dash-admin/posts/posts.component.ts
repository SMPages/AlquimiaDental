// src/auth/dash-admin/posts/posts-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ✅ Ruta correcta: desde /auth/dash-admin/posts → /app/services/posts.service
import {
  PostsService,
  PostRecord,
  PublishStatus,
} from '../../../backend/post.service';

@Component({
  standalone: true,
  selector: 'app-posts-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="toolbar">
      <h2>Posts</h2>
      <div class="actions">
        <input class="input" type="search" placeholder="Buscar por título…"
               [(ngModel)]="search" (input)="onSearch()" />
        <select class="input" [(ngModel)]="status" (change)="reload()">
          <option value="all">Todos</option>
          <option value="draft">Borrador</option>
          <option value="scheduled">Programado</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
        <button class="btn btn-primary" (click)="newPost()">Nuevo</button>
      </div>
    </div>

    <div class="state" *ngIf="loading()">Cargando…</div>
    <div class="state error" *ngIf="error()">{{ error() }}</div>

    <div class="table" *ngIf="!loading() && !error()">
      <div class="thead">
        <div>Título</div>
        <div class="hide-sm">Slug</div>
        <div class="hide-sm">Estado</div>
        <div class="hide-sm">Actualizado</div>
        <div>Acciones</div>
      </div>

      <ng-container *ngIf="items().length; else empty">
        <div class="row" *ngFor="let p of items()">
          <div class="ellipsis">{{ p.title }}</div>
          <div class="muted ellipsis hide-sm">{{ p.slug || '—' }}</div>
          <div class="hide-sm">
            <span class="badge" [class.pub]="p.status==='published'">{{ p.status }}</span>
          </div>
          <div class="muted hide-sm">
            {{ p.updated_at ? (p.updated_at | date:'short') : '—' }}
          </div>
          <div class="row-actions">
            <button class="btn sm" (click)="edit(p.id)">Editar</button>
            <button class="btn sm"
                    *ngIf="p.status!=='published'; else unpubTpl"
                    (click)="publish(p)">Publicar</button>
            <ng-template #unpubTpl>
              <button class="btn sm" (click)="unpublish(p)">Despublicar</button>
            </ng-template>
            <button class="btn sm danger" (click)="remove(p)">Eliminar</button>
          </div>
        </div>
      </ng-container>

      <ng-template #empty>
        <div class="empty">
          <p class="muted">No hay resultados.</p>
          <button class="btn" (click)="clearFilters()" *ngIf="search || status!=='all'">
            Limpiar filtros
          </button>
        </div>
      </ng-template>
    </div>

    <div class="footer" *ngIf="!loading() && total() > pageSize">
      <button class="btn" (click)="prev()" [disabled]="page()<=1">«</button>
      <span>Página {{ page() }}</span>
      <button class="btn" (click)="next()" [disabled]="page()>=maxPage()">»</button>
      <span class="muted count">• {{ total() }} total</span>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px}
    .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap}
    .actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .input{border:1px solid var(--border);border-radius:10px;padding:8px 10px;min-width:170px;background:#fff}
    .table{display:grid;gap:8px}
    .thead,.row{display:grid;grid-template-columns:1.3fr 1fr 140px 160px 260px;gap:12px;align-items:center}
    .thead{font-weight:600;color:var(--muted)}
    .row-actions{display:flex;gap:6px;flex-wrap:wrap}
    .btn{border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px 10px;cursor:pointer}
    .btn:hover{background:var(--bg-page)}
    .btn.sm{padding:4px 8px}
    .btn.danger{color:#b4231a;border-color:#ffd6d4}
    .btn.btn-primary{background:var(--accent);border-color:var(--accent);color:#fff}
    .btn.btn-primary:hover{background:var(--accent-600);border-color:var(--accent-600)}
    .muted{color:var(--muted)}
    .ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .badge{padding:2px 8px;border-radius:999px;border:1px solid var(--border);font-size:.85rem;text-transform:capitalize}
    .badge.pub{background:#eefbf1;border-color:#b6e7c2}
    .state{padding:16px}
    .state.error{color:#b4231a}
    .empty{padding:16px;border:1px dashed var(--border);border-radius:12px;text-align:center}
    .footer{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px}
    .count{margin-left:8px}
    @media (max-width: 920px){
      .thead,.row{grid-template-columns:1.2fr 120px 240px}
      .hide-sm{display:none}
      .row-actions{justify-content:flex-end}
    }
  `]
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

  async ngOnInit(){ await this.reload(); }

  maxPage(){ return Math.max(1, Math.ceil(this.total() / this.pageSize)); }

  async reload(){
    this.loading.set(true); this.error.set('');
    try{
      const res = await this.svc.listAdmin({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.search || undefined,
        status: this.status
      });
      this.items.set(res.items);
      this.total.set(res.total);
    }catch(e:any){
      this.error.set(e?.message ?? 'Error cargando posts');
    }finally{
      this.loading.set(false);
    }
  }

  onSearch(){ this.page.set(1); this.reload(); }
  clearFilters(){ this.search=''; this.status='all'; this.page.set(1); this.reload(); }
  next(){ if(this.page()<this.maxPage()){ this.page.update(p=>p+1); this.reload(); } }
  prev(){ if(this.page()>1){ this.page.update(p=>p-1); this.reload(); } }

  newPost(){ /* navega a editor/abre modal */ }
  edit(id: string){ /* navega a editor con id */ }

  async publish(p: PostRecord){
    try{
      const upd = await this.svc.publishPost(p.id);
      this.items.update(list => list.map(x => x.id===p.id ? upd : x));
    }catch(e:any){ alert(e?.message ?? 'No se pudo publicar'); }
  }

  async unpublish(p: PostRecord){
    try{
      const upd = await this.svc.unpublishPost(p.id);
      this.items.update(list => list.map(x => x.id===p.id ? upd : x));
    }catch(e:any){ alert(e?.message ?? 'No se pudo despublicar'); }
  }

  async remove(p: PostRecord){
    if(!confirm(`¿Eliminar el post "\${p.title}"?`)) return;
    try{
      await this.svc.deletePost(p.id);
      this.items.update(list => list.filter(x => x.id!==p.id));
      this.total.update(t => Math.max(0, t-1));
    }catch(e:any){ alert(e?.message ?? 'No se pudo eliminar'); }
  }
}
