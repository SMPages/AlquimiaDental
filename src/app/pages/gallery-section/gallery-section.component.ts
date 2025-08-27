// src/app/pages/gallery-section/gallery-section.component.ts
import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

type GalleryItem = {
  id: number;
  src: string;           // una sola imagen (arriba=antes / abajo=después)
  titleKey: string;      // e.g. gallery.items.case1.title
  altKey: string;        // e.g. gallery.items.case1.alt
  descKey?: string;      // e.g. gallery.items.case1.desc (opcional)
};

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GallerySectionComponent implements OnDestroy {

  readonly items: GalleryItem[] = [
    {
      id: 1,
      src: 'images/caso3.jpg',
      titleKey: 'gallery.items.case1.title',
      altKey:   'gallery.items.case1.alt',
      descKey:  'gallery.items.case1.desc'
    },
    {
      id: 2,
      src: 'images/caso2.jpg',
      titleKey: 'gallery.items.case2.title',
      altKey:   'gallery.items.case2.alt'
    },
    {
      id: 3,
      src: 'images/caso3.jpg',
      titleKey: 'gallery.items.case3.title',
      altKey:   'gallery.items.case3.alt',
      descKey:  'gallery.items.case3.desc'
    }
  ];

  // Lightbox
  abierto = false;
  indexActual = 0;

  // Helpers
  trackById = (_: number, item: GalleryItem) => item.id;

  private preload(src?: string) {
    if (!src) return;
    const img = new Image();
    img.src = src;
  }
  private preloadNeighbors() {
    const prev = this.items[(this.indexActual - 1 + this.items.length) % this.items.length]?.src;
    const next = this.items[(this.indexActual + 1) % this.items.length]?.src;
    this.preload(this.items[this.indexActual]?.src);
    this.preload(prev);
    this.preload(next);
  }

  abrirLightbox(idx: number) {
    this.indexActual = idx;
    this.abierto = true;
    document.body.style.overflow = 'hidden';
    this.preloadNeighbors();
  }
  cerrarLightbox() {
    this.abierto = false;
    document.body.style.overflow = '';
  }
  prev() {
    this.indexActual = (this.indexActual - 1 + this.items.length) % this.items.length;
    this.preloadNeighbors();
  }
  next() {
    this.indexActual = (this.indexActual + 1) % this.items.length;
    this.preloadNeighbors();
  }

  // Teclas rápidas
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.abierto) return;
    if (e.key === 'Escape') this.cerrarLightbox();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }
}
