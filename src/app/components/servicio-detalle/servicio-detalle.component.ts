import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { PageHeroComponent } from '../page-hero/page-hero.component';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-servicio-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, PageHeroComponent],
  templateUrl: './servicio-detalle.component.html',
  styleUrls: ['./servicio-detalle.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicioDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private i18n = inject(TranslationService);

  servicio: any;
  slug = '';
  whatsappHref = 'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';

  // 🖼️ Mapeo de imágenes coherente con hero-section
  readonly serviceImages: Record<string, string> = {
    'carillas': 'servicios/carillas.webp',
    'protesis-total': 'servicios/protesis.webp',
    'limpieza-dental': 'servicios/rehabilitaciontotal.webp',
    'blanqueamiento': 'servicios/blanqueamiento.webp'
  };

  /** Slugs de todas las páginas de detalle. */
  private readonly allSlugs = Object.keys(this.serviceImages);

  get currentLang(): 'es' | 'en' {
    return (this.i18n.currentLang as 'es' | 'en') || 'es';
  }

  /** Los demás tratamientos con página de detalle. */
  get others(): string[] {
    return this.allSlugs.filter(s => s !== this.slug);
  }

  ngOnInit(): void {
    // stream() vuelve a emitir cuando carga o cambia el idioma
    combineLatest([
      this.route.paramMap,
      this.translate.stream('services_hero.items')
    ]).subscribe(([params, items]) => {
      const slug = params.get('slug');
      if (!slug) return;
      this.slug = slug;

      // Mientras las traducciones no cargan, stream() devuelve la clave (texto)
      if (!items || typeof items !== 'object') return;

      const base = items[slug];
      if (!base) {
        // Slug inexistente: vuelve a la lista en lugar de dejar una página vacía
        this.servicio = null;
        this.router.navigate(['/', this.currentLang, 'services'], { replaceUrl: true });
        return;
      }

      this.servicio = {
        ...base,
        image: this.serviceImages[slug] || null
      };
    });
  }
}
