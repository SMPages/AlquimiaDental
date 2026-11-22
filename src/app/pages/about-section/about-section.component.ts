// src/app/pages/about-section/about-section.component.ts
import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [NgFor, RouterModule, TranslatePipe, PageHeroComponent],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss']
})
export class AboutSectionComponent {
  private i18n = inject(TranslationService);

  /** Claves de services.items.* que se muestran como enlaces. */
  readonly serviceKeys = [
    'digital', 'smileDesign', 'veneers', 'whitening',
    'cleaning', 'jewelry', 'rehabImplant', 'prosthesis'
  ];

  get currentLang(): 'es' | 'en' {
    return (this.i18n.currentLang as 'es' | 'en') || 'es';
  }

  whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';
}
