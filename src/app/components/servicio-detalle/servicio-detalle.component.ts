import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-servicio-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './servicio-detalle.component.html',
  styleUrls: ['./servicio-detalle.component.scss'],
   encapsulation: ViewEncapsulation.None 
})
export class ServicioDetalleComponent implements OnInit {
  servicio: any;
  whatsappHref = 'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';

  // 🖼️ Mapeo de imágenes coherente con hero-section
  private serviceImages: Record<string, string> = {
    'carillas': 'servicios/carillas.png',
    'protesis-total': 'servicios/protesis.png',
    'limpieza-dental': 'servicios/rehabilitaciontotal.png',
    'blanqueamiento': 'servicios/blanqueamiento.png'
  };

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;

      const items = this.translate.instant('services_hero.items');
      const base = items[slug];
      if (!base) {
        console.warn('Servicio no encontrado:', slug);
        return;
      }

      this.servicio = {
        ...base,
        image: this.serviceImages[slug] || null
      };
    });
  }
}
