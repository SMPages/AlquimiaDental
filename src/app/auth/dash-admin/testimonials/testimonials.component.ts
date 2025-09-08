// src/auth/dash-admin/testimonials/testimonials-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// TODO: cambia a tu servicio real de testimonios (dental o masterclass)
type Testimonio = {
  id: number|string; nombre: string; contenido: string;
  email?: string|null; foto_url?: string|null;
  aprobado: boolean; destacado: boolean; created_at?: string;
};

@Component({
  standalone: true,
  selector: 'app-testimonials-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="toolbar">
      <h2>Testimonios</h2>
      <div class="actions">
        <label class="switch">
          <input type="checkbox" [(ngModel)]="onlyApproved" (change)="fetch()"> <span>Solo aprobados</span>
        </label>
      </div>
    </div>

    <div class="table">
      <div class="thead"><div>Nombre</div><div>Contenido</div><div>Estado</div><div>Destacado</div><div>Acciones</div></div>
      <div class="row" *ngFor="let t of items()">
        <div class="ellipsis">{{ t.nombre }}</div>
        <div class="muted ellipsis" title="{{t.contenido}}">{{ t.contenido }}</div>
        <div>{{ t.aprobado ? 'Aprobado' : 'Pendiente' }}</div>
        <div>{{ t.destacado ? 'Sí' : 'No' }}</div>
        <div class="row-actions">
          <button class="btn sm" (click)="toggleApprove(t)">{{ t.aprobado ? 'Rechazar' : 'Aprobar' }}</button>
          <button class="btn sm" (click)="toggleFeatured(t)">{{ t.destacado ? 'Quitar dest.' : 'Destacar' }}</button>
          <button class="btn sm danger" (click)="remove(t)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px}
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .actions{display:flex;gap:8px;align-items:center}
    .switch{display:flex;align-items:center;gap:8px;color:var(--muted)}
    .table{display:grid;gap:8px}
    .thead,.row{display:grid;grid-template-columns:200px 1fr 140px 120px 260px;gap:12px;align-items:center}
    .thead{font-weight:600;color:var(--muted)}
    .row-actions{display:flex;gap:6px;flex-wrap:wrap}
    .btn{border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px 10px;cursor:pointer}
    .btn:hover{background:var(--bg-page)}
    .btn.sm{padding:4px 8px}
    .btn.danger{color:#b4231a;border-color:#ffd6d4}
    .muted{color:var(--muted)}
    .ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  `]
})
export class TestimonialsAdminComponent {
  // private svc = inject(TestimonialsService | MasterclassService);
  items = signal<Testimonio[]>([]);
  onlyApproved = false;

  async ngOnInit(){ await this.fetch(); }

  async fetch(){
    // TODO: conéctalo a tu servicio
    // const res = await this.svc.listAdmin({ approved: this.onlyApproved ? true : undefined });
    // this.items.set(res.items);
    this.items.set(Array.from({length:8},(_,i)=>({
      id:i+1, nombre:`Paciente ${i+1}`, contenido:'Excelente atención y resultados.',
      aprobado: !!(i%2), destacado: !(i%3)
    })));
  }

  toggleApprove(t: Testimonio){ t.aprobado=!t.aprobado; /* svc.update */ }
  toggleFeatured(t: Testimonio){ t.destacado=!t.destacado; /* svc.update */ }
  remove(t: Testimonio){ /* confirmar + svc.delete */ }
}
