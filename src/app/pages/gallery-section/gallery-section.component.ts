import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type CombinedItem = {
  id: number;
  titulo: string;
  src: string;      // una sola imagen (arriba=antes / abajo=después)
  alt: string;
  descripcion?: string;
};

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GallerySectionComponent implements OnDestroy {

  // Coloca tus imágenes en /public/images/...
  readonly items: CombinedItem[] = [
    {
      id: 1,
      titulo: 'Rehabilitación total sobre implantes',
      src: 'images/caso3.jpg',
      alt: 'Antes y después de rehabilitación total sobre implantes',
      descripcion: 'Función y estética recuperadas con prótesis sobre implantes.'
    },
    {
      id: 2,
      titulo: 'Diseño de sonrisa – Carillas cerámicas',
      src: 'images/caso2.jpg',
      alt: 'Antes y después con carillas cerámicas'
    },
    {
      id: 3,
      titulo: 'Blanqueamiento y resinas estéticas',
      src: 'images/caso3.jpg',
      alt: 'Comparación antes y después de blanqueamiento y resinas',
      descripcion: 'Función y estética recuperadas con prótesis sobre implantes.'
    }
    // …agrega hasta 10 casos
  ];

  // Lightbox
  abierto = false;
  indexActual = 0;

  // --- Helpers ---
  trackById = (_: number, item: CombinedItem) => item.id;

  private preload(src: string | undefined) {
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

  // Teclas rápidas en el lightbox
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.abierto) return;
    if (e.key === 'Escape') this.cerrarLightbox();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  // Si el componente se desmonta con el lightbox abierto, restaurar scroll
  ngOnDestroy() {
    document.body.style.overflow = '';
  }
}
