import { Component, HostListener } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';

type Category = 'aesthetic' | 'rehab';
type Filter = 'all' | Category;

interface GalleryItem {
  src: string;
  cat: Category;
  /** Claves i18n del título, la descripción (opcional) y el texto alternativo. */
  title: string;
  desc?: string;
  alt: string;
}

const caso = (src: string, n: 1 | 2 | 3, cat: Category): GalleryItem => ({
  src, cat,
  title: `gallery.items.case${n}.title`,
  desc: `gallery.items.case${n}.desc`,
  alt: `gallery.items.case${n}.alt`
});

const servicio = (src: string, key: string, cat: Category): GalleryItem => ({
  src, cat,
  title: `services.items.${key}.title`,
  alt: `services.items.${key}.alt`
});

@Component({
  selector: 'app-gallery-carousel',
  standalone: true,
  imports: [NgFor, NgIf, TranslatePipe, PageHeroComponent],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GalleryCarouselComponent {
  readonly items: GalleryItem[] = [
    caso('images/caso3.jpg', 1, 'rehab'),
    caso('images/caso1.jpg', 2, 'aesthetic'),
    caso('images/caso2.jpg', 3, 'aesthetic'),
    servicio('servicios/carillasceramicas.webp', 'veneers', 'aesthetic'),
    servicio('servicios/protesis.webp', 'prosthesis', 'rehab'),
    servicio('servicios/blanqueamiento.webp', 'whitening', 'aesthetic'),
    servicio('servicios/rehabilitacion.webp', 'rehabImplant', 'rehab'),
    servicio('servicios/carillas.webp', 'smileDesign', 'aesthetic'),
    servicio('servicios/protesis2.webp', 'prosthesis2', 'rehab'),
    servicio('servicios/bordeincisal.webp', 'Bordeincisal', 'aesthetic'),
    servicio('servicios/joyas.webp', 'jewelry', 'aesthetic')
  ];

  readonly filters: Filter[] = ['all', 'aesthetic', 'rehab'];
  readonly instagram = 'https://www.instagram.com/drsoranyporcelainsmile/';

  filter: Filter = 'all';
  /** Índice (dentro de `visible`) de la imagen abierta en el visor. */
  openIndex: number | null = null;

  get visible(): GalleryItem[] {
    return this.items.filter(i => this.filter === 'all' || i.cat === this.filter);
  }

  get current(): GalleryItem | null {
    return this.openIndex === null ? null : this.visible[this.openIndex] ?? null;
  }

  setFilter(f: Filter) { this.filter = f; }

  open(i: number) {
    this.openIndex = i;
    this.lockScroll(true);
  }

  close() {
    this.openIndex = null;
    this.lockScroll(false);
  }

  step(delta: number) {
    if (this.openIndex === null) return;
    const n = this.visible.length;
    this.openIndex = (this.openIndex + delta + n) % n;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.openIndex === null) return;
    if (e.key === 'Escape') this.close();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); this.step(1); }
  }

  trackBySrc = (_: number, i: GalleryItem) => i.src;

  private lockScroll(lock: boolean) {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = lock ? 'hidden' : '';
    }
  }
}
