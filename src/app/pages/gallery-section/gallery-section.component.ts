import { Component, OnDestroy, OnInit, signal, computed, HostListener } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

type Slide = {
  id: number;
  src: string;
  title?: string;
  subtitle?: string;
  titleKey?: string;
  subtitleKey?: string;
  alt?: string;
};

@Component({
  selector: 'app-gallery-carousel',
  standalone: true,
  imports: [NgFor, TranslatePipe],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GalleryCarouselComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    {
      id: 1,
      src: 'images/caso3.jpg',
      titleKey: 'gallery.items.case1.title',
      subtitleKey: 'gallery.items.case1.desc',
      alt: 'Rehabilitación total sobre implantes'
    },
    {
      id: 2,
      src: 'images/caso1.jpg',
      titleKey: 'gallery.items.case2.title',
      subtitleKey: 'gallery.items.case2.desc',
      alt: 'Diseño de sonrisa – Carillas cerámicas'
    },
    {
      id: 3,
      src: 'images/caso2.jpg',
      titleKey: 'gallery.items.case3.title',
      subtitleKey: 'gallery.items.case3.desc',
      alt: 'Blanqueamiento dental'
    }
  ];

  current = signal(0);                 // índice activo
  total   = computed(() => this.slides.length);

  private timer?: number;
  readonly intervalMs = 5000;          // autoplay: 5s
  isHovering = false;

  // gestos táctiles
  private touchStartX = 0;
  private touchDeltaX = 0;

  ngOnInit() { this.start(); }
  ngOnDestroy() { this.stop(); }

  start() {
    this.stop();
    this.timer = window.setInterval(() => {
      if (!this.isHovering) this.next();
    }, this.intervalMs);
  }
  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }

  go(i: number) {
    const n = this.total();
    this.current.set((i + n) % n);
  }
  prev() { this.go(this.current() - 1); }
  next() { this.go(this.current() + 1); }

  onMouseEnter() { this.isHovering = true; }
  onMouseLeave() { this.isHovering = false; }

  // Accesibilidad: teclado
  @HostListener('document:keydown.arrowLeft', ['$event'])
  onArrowLeft(e: KeyboardEvent) { e.preventDefault(); this.prev(); }
  @HostListener('document:keydown.arrowRight', ['$event'])
  onArrowRight(e: KeyboardEvent) { e.preventDefault(); this.next(); }

  // Swipe táctil básico
  onTouchStart(ev: TouchEvent) {
    this.touchStartX = ev.touches[0].clientX;
    this.touchDeltaX = 0;
  }
  onTouchMove(ev: TouchEvent) {
    this.touchDeltaX = ev.touches[0].clientX - this.touchStartX;
  }
  onTouchEnd() {
    const THRESHOLD = 40; // px
    if (this.touchDeltaX > THRESHOLD) this.prev();
    else if (this.touchDeltaX < -THRESHOLD) this.next();
    this.touchStartX = this.touchDeltaX = 0;
  }
}
