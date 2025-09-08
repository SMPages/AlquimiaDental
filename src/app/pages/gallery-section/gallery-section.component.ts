import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

type GalleryItem = {
  id: number;
  src: string;
  titleKey?: string;
  altKey: string;
  descKey?: string;
};

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GallerySectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reel', { static: true }) reelRef!: ElementRef<HTMLDivElement>;

  items: GalleryItem[] = [
    { id: 1, src: 'images/caso3.jpg', titleKey: 'gallery.items.case1.title', altKey: 'gallery.items.case1.alt', descKey: 'gallery.items.case1.desc' },
    { id: 2, src: 'images/caso1.jpg', titleKey: 'gallery.items.case2.title', altKey: 'gallery.items.case2.alt' },
    { id: 3, src: 'images/caso2.jpg', titleKey: 'gallery.items.case3.title', altKey: 'gallery.items.case3.alt', descKey: 'gallery.items.case3.desc' },
    // { id: 4, src: 'images/caso4.jpg', titleKey: 'gallery.items.case4.title', altKey: 'gallery.items.case4.alt' },
    // { id: 5, src: 'images/caso5.jpg', titleKey: 'gallery.items.case5.title', altKey: 'gallery.items.case5.alt' }
  ];

  trackById = (_: number, i: GalleryItem) => i.id;

  private autoplayId?: number;
  private stepPx = 0;
  private resizeHandler = () => this.computeStep();

  ngAfterViewInit() {
    this.computeStep();
    this.startAuto();
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  ngOnDestroy() {
    this.pause();
    window.removeEventListener('resize', this.resizeHandler);
  }

  /** Calcula el ancho de un ítem + gap para desplazar exactamente una tarjeta */
  private computeStep() {
    const reel = this.reelRef.nativeElement;
    const card = reel.querySelector<HTMLElement>('.shot');
    if (!card) return;

    // gap puede venir como column-gap o gap
    const styles = getComputedStyle(reel);
    const gap = parseFloat(styles.columnGap || styles.gap || '16');
    this.stepPx = card.clientWidth + gap;
  }

  /** Auto-scroll */
  private startAuto() {
    this.autoplayId = window.setInterval(() => this.scrollBy(1), 3800);
  }
  pause() { if (this.autoplayId) { clearInterval(this.autoplayId); this.autoplayId = undefined; } }
  resume() { if (!this.autoplayId) this.startAuto(); }

  /** Scroll helpers */
  private scrollBy(dir: number) {
    const reel = this.reelRef.nativeElement;
    reel.scrollBy({ left: dir * this.stepPx, behavior: 'smooth' });
  }
  nudge(dir: number) {
    this.pause();
    this.scrollBy(dir);
  }
}
