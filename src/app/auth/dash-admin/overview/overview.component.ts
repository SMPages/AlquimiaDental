import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  template: `
    <div class="card">
      <h2 class="h2">Overview</h2>
      <p class="muted">Bienvenido al panel de administración.</p>
      <ul class="grid">
        <li class="tile">Posts</li>
        <li class="tile">Blog</li>
        <li class="tile">Galería</li>
        <li class="tile">Testimonios</li>
        <li class="tile">Servicios</li>
      </ul>
    </div>
  `,
  styles: [`
    .card{ background:#fff; border:1px solid var(--border); border-radius:14px; padding:16px; }
    .h2{ margin:0 0 6px; }
    .muted{ color:var(--muted); margin-bottom:12px; }
    .grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:10px; }
    .tile{ background:var(--bg-page); border:1px solid var(--border); border-radius:12px; padding:12px; }
  `]
})
export class OverviewComponent {}
