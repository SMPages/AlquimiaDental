// src/auth/dash-admin/gallery/gallery-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService, GalleryItem } from '../../../backend/gallery.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-gallery-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="toolbar">
      <h2>Galería</h2>
      <div class="actions">
        <input class="input" placeholder="Filtrar por tag…" [(ngModel)]="tag" (input)="fetch()"/>
        <label class="switch">
          <input type="checkbox" [(ngModel)]="onlyVisible" (change)="fetch()"> <span>Solo visibles</span>
        </label>
        <label class="file">
          <input type="file" (change)="upload($event)"> <span class="btn btn-primary">Subir</span>
        </label>
      </div>
    </div>

    <div class="grid">
      <div class="tile" *ngFor="let it of items()">
        <img *ngIf="it.kind==='image'" [src]="it.url" [alt]="it.alt_text||it.title||''">
        <div class="meta">
          <div class="title ellipsis">{{ it.title || '(sin título)' }}</div>
          <div class="muted ellipsis">{{ it.tags.join(', ') || '—' }}</div>
        </div>
        <div class="row-actions">
          <button class="btn sm" (click)="toggle(it)">{{ it.is_visible ? 'Ocultar':'Mostrar' }}</button>
          <button class="btn sm" (click)="edit(it)">Editar</button>
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
    .actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .input{border:1px solid var(--border);border-radius:10px;padding:8px 10px;min-width:220px}
    .switch{display:flex;align-items:center;gap:8px;color:var(--muted)}
    .file input[type=file]{display:none}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
    .tile{border:1px solid var(--border);border-radius:12px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:8px}
    img{width:100%;height:160px;object-fit:cover;border-radius:8px;border:1px solid var(--border)}
    .meta{display:flex;flex-direction:column;gap:2px}
    .title{font-weight:600}
    .muted{color:var(--muted)}
    .row-actions{display:flex;gap:6px;flex-wrap:wrap}
    .btn{border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px 10px;cursor:pointer}
    .btn:hover{background:var(--bg-page)}
    .btn.sm{padding:4px 8px}
    .btn.danger{color:#b4231a;border-color:#ffd6d4}
    .btn.btn-primary{background:var(--accent);border-color:var(--accent);color:#fff}
    .btn.btn-primary:hover{background:var(--accent-600);border-color:var(--accent-600)}
    .ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .footer{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px}
  `]
})
export class GalleryAdminComponent {
  private gallery = inject(GalleryService);
  items = signal<GalleryItem[]>([]);
  page = signal(1);
  pageSize = 24;
  tag = '';
  onlyVisible = false;

  async ngOnInit(){ await this.fetch(); }

  async fetch(){
    // Para público tenemos listVisible; para admin usa listAdminItems (ya lo hicimos)
    const res = await this.gallery.listAdminItems({
      page: this.page(), pageSize: this.pageSize,
      search: this.tag || undefined,
      visible: this.onlyVisible ? true : 'all' as any
    } as any);
    this.items.set(res.items);
  }

  next(){ this.page.update(p=>p+1); this.fetch(); }
  prev(){ this.page.update(p=>Math.max(1,p-1)); this.fetch(); }

  async upload(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const created = await this.gallery.createItemFromFile(file, { kind: 'image', isVisible: true });
    this.items.update(arr => [created, ...arr]);
    input.value = '';
  }

  async toggle(it: GalleryItem){
    const updated = await this.gallery.setItemVisibility(it.id, !it.is_visible);
    this.items.update(list => list.map(x => x.id===it.id ? updated : x));
  }

  edit(it: GalleryItem){ /* abre modal con título, alt_text, tags [] y guarda con updateItem */ }
  async remove(it: GalleryItem){
    if (!confirm('¿Eliminar este ítem?')) return;
    await this.gallery.removeItem(it.id);
    this.items.update(list => list.filter(x=>x.id!==it.id));
  }
}
