// src/app/pages/testimonials-section/testimonials-section.component.ts
import { Component } from '@angular/core';
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
  items: TKey[] = ['alejandra', 'milena', 'carlos', 'angelica', 'brigitte', 'john', 'dayanna'];
}
