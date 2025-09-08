// src/app/pages/testimonials-section/testimonials-section.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

type TKey =
  | 'alejandra' | 'milena' | 'carlos'
  | 'angelica' | 'brigitte' | 'john' | 'dayanna';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [NgFor, TranslatePipe],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent {
  @ViewChild('reel', { static: true }) reelRef!: ElementRef<HTMLDivElement>;

  // Claves de i18n de tus testimonios
  items: TKey[] = ['alejandra', 'milena', 'carlos', 'angelica', 'brigitte', 'john', 'dayanna'];

  // Enlace a reseñas de Google (puedes dejar tu búsqueda,
  // o idealmente usar Place ID: https://www.google.com/maps/place/?q=place_id:TU_PLACE_ID)
  googleReviewsUrl =
    'https://www.google.com/search?q=sorany+diaz&rlz=1C1GCEU_esCO1165CO1165&oq=sora&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIRCAEQRRg5GEMYsQMYgAQYigUyBggCEEUYQDIMCAMQABhDGIAEGIoFMgYIBBBFGD0yBggFEEUYPTIGCAYQRRhBMgYIBxBFGDzSAQgzNzU3ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#lrd=0x8e3f9d99b2685377:0x53185353dff319a,1,,,,';

  trackByKey = (_: number, key: TKey) => key;

  /** Desplaza el carrusel 1 tarjeta (dir = -1 izquierda, +1 derecha) */
  scrollBy(dir: -1 | 1) {
    const reel = this.reelRef.nativeElement;
    const card = reel.querySelector<HTMLElement>('.testimonial-card');
    if (!card) return;

    const cs = getComputedStyle(reel);
    const gap = parseFloat((cs.columnGap || cs.gap || '24').toString());
    const delta = (card.clientWidth + gap) * dir;

    reel.scrollBy({ left: delta, behavior: 'smooth' });
  }
}
