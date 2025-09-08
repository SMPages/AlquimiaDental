// src/auth/dash-admin/services/services-admin.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ServiceItem = {
  id: number|string;
  name: string;
  slug?: string;
  price?: number|null;
  is_active: boolean;
  order_index?: number;
};

@Component({
  standalone: true,
  selector: 'app-services-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="toolbar">
      <h2>Servicios</h2>
      <div class="actions">
        <input class="input" placeholder="Buscar…" [(ngModel)]="search" (input)="fetch()" />
        <button class="btn btn-primary" (click)="create()">Nuevo</button>
      </div>
    </div>

    <div class="table">
      <div class="thead"><div>Nombre</div><div>Slug</div><div>Precio</div><div>Activo</div><div>Acciones</div></div>
      <div class="row" *ngFor="let s of items()">
        <div class="ellipsis">{{ s.name }}</div>
        <div class="muted ellipsis">{{ s.slug || '—' }}</div>
        <div>{{ s.price!=null ? ('$ ' + (s.price | number:'1.0-0')) : '—' }}</div>
        <div>{{ s.is_active ? 'Sí' : 'No' }}</div>
        <div class="row-actions">
          <button class="btn sm" (click)="edit(s)">Editar</button>
          <button class="btn sm" (click)="toggleActive(s)">{{ s.is_active ? 'Desactivar' : 'Activar' }}</button>
          <button class="btn sm danger" (click)="remove(s)">Eliminar</button>
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
    .thead,.row{display:grid;grid-template-columns:1.1fr 1fr 140px 120px 260px;gap:12px;align-items:center}
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
    .footer{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px}
  `]
})
export class ServicesAdminComponent {
  // private svc = inject(ServicesService);
  items = signal<ServiceItem[]>([]);
  page = signal(1);
  pageSize = 20;
  search = '';

  async ngOnInit(){ await this.fetch(); }

  async fetch(){
    // TODO: conecta a tu servicio real (dental.services)
    this.items.set(Array.from({length:8},(_,i)=>({
      id:i+1, name:`Servicio ${i+1}`, slug:`servicio-${i+1}`,
      price: i%2? 120000 : null, is_active: !(i%3)
    })));
  }

  next(){ this.page.update(p=>p+1); this.fetch(); }
  prev(){ this.page.update(p=>Math.max(1,p-1)); this.fetch(); }

  create(){ /* abrir modal crear servicio */ }
  edit(s: ServiceItem){ /* abrir modal editar */ }
  toggleActive(s: ServiceItem){ s.is_active = !s.is_active; /* svc.update */ }
  remove(s: ServiceItem){ /* confirmar + svc.delete */ }
}
