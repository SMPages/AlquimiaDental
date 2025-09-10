// src/app/pages/testimonials-section/testimonials-section.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';  

type TKey =
  | 'alejandra' | 'milena' | 'carlos'
  | 'angelica' | 'brigitte' | 'john' | 'dayanna';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [NgFor, TranslatePipe, NgIf],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLDivElement>;

  items: TKey[] = ['alejandra', 'milena', 'carlos', 'angelica', 'brigitte', 'john', 'dayanna'];

  googleReviewsUrl =
    'https://www.google.com/search?q=sorany+diaz#lrd=0x8e3f9d99b2685377:0x53185353dff319a,1';

  idx = 0;
  private stepPx = 0;
  private autoplayId?: number;

  trackByKey = (_: number, key: TKey) => key;

  ngAfterViewInit() {
    this.computeStep();
    this.startAuto();
    addEventListener('resize', this.computeStep, { passive: true });
  }

  ngOnDestroy() {
    this.pause();
    removeEventListener('resize', this.computeStep as any);
  }

  // === Carrusel ===
  private computeStep = () => {
    const track = this.trackRef.nativeElement;
    const slide = track.querySelector<HTMLElement>('.t-slide');
    if (!slide) return;
    const cs = getComputedStyle(track);
    const gap = parseFloat((cs.columnGap || cs.gap || '16').toString());
    this.stepPx = slide.clientWidth + gap;
  };

  go(dir: -1 | 1) {
    const target = Math.max(0, Math.min(this.items.length - 1, this.idx + dir));
    this.to(target);
  }

  to(i: number) {
    const track = this.trackRef.nativeElement;
    this.idx = Math.max(0, Math.min(this.items.length - 1, i));
    track.scrollTo({ left: this.idx * this.stepPx, behavior: 'smooth' });
  }

  onScroll() {
    const track = this.trackRef.nativeElement;
    const raw = this.stepPx > 0 ? track.scrollLeft / this.stepPx : 0;
    const i = Math.round(raw);
    if (i !== this.idx) this.idx = Math.max(0, Math.min(this.items.length - 1, i));
  }

  // === Autoplay ===
  private startAuto() {
    if (this.autoplayId) return;
    this.autoplayId = window.setInterval(() => {
      const next = (this.idx + 1) % this.items.length;
      this.to(next);
    }, 5200);
  }
  pause() { if (this.autoplayId) { clearInterval(this.autoplayId); this.autoplayId = undefined; } }
  resume() { if (!this.autoplayId) this.startAuto(); }
}
