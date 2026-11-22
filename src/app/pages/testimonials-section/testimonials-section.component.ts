// src/app/pages/testimonials-section/testimonials-section.component.ts
import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';

type TKey =
  | 'alejandra' | 'milena' | 'carlos'
  | 'angelica' | 'brigitte' | 'john' | 'dayanna';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [NgFor, TranslatePipe, PageHeroComponent],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent {
  /** Opinión que se muestra en grande. */
  readonly featured: TKey = 'carlos';

  /** El resto, en el mosaico. */
  readonly others: TKey[] = ['alejandra', 'milena', 'angelica', 'brigitte', 'john', 'dayanna'];

  googleReviewsUrl =
    'https://www.google.com/search?q=sorany+diaz#lrd=0x8e3f9d99b2685377:0x53185353dff319a,1';

  trackByKey = (_: number, key: TKey) => key;
}
