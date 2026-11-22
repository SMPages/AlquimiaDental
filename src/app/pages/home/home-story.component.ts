import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-home-story',
  standalone: true,
  imports: [NgFor, RouterModule, TranslatePipe],
  templateUrl: './home-story.component.html',
  styleUrls: ['./home-story.component.scss']
})
export class HomeStoryComponent {
  private i18n = inject(TranslationService);
  private readonly whatsappPhone = '573147992217';

  readonly steps = [0, 1, 2, 3, 4];
  readonly instagram = 'https://www.instagram.com/drsoranyporcelainsmile/';

  readonly cases = [
    { img: 'images/caso3.jpg', key: 'case1' },
    { img: 'images/caso1.jpg', key: 'case2' },
    { img: 'images/caso2.jpg', key: 'case3' }
  ];

  get currentLang(): 'es' | 'en' {
    return (this.i18n.currentLang as 'es' | 'en') || 'es';
  }

  roman(i: number): string {
    return ['I', 'II', 'III', 'IV', 'V', 'VI'][i] ?? String(i + 1);
  }

  get whatsappHref(): string {
    const text = this.currentLang === 'es'
      ? 'Hola, quiero agendar una valoración en Alquimia Dental.'
      : 'Hi, I would like to book an appointment at Alquimia Dental.';
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(text)}`;
  }
}
