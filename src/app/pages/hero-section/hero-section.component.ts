import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';
import { CommonModule } from '@angular/common';

type FeaturedService = {
  titleKey: string;   // Clave para título traducido
  slug: string;
  excerptKey: string; // Clave para descripción traducida
  img: string;
  altKey: string;     // Clave para atributo alt traducido
};

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterModule, TranslatePipe, CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  private i18n = inject(TranslationService);

  private readonly whatsappPhone = '573147992217';

  get currentLang(): 'es' | 'en' {
    return (this.i18n.currentLang as 'es' | 'en') || 'es';
  }

  // Arreglo con claves i18n para la sección servicios
  get featuredServices(): FeaturedService[] {
    return [
      {
        titleKey: 'services_hero.items.carillas.title',
        slug: 'carillas',
        excerptKey: 'services_hero.items.carillas.desc',
        img: 'servicios/carillas.png',
        altKey: 'services_hero.items.carillas.alt',
      },
      {
        titleKey: 'services_hero.items.protesis-total.title',
        slug: 'protesis-total',
        excerptKey: 'services_hero.items.protesis-total.desc',
        img: 'servicios/protesis.png',
        altKey: 'services_hero.items.protesis-total.alt',
      },
      {
        titleKey: 'services_hero.items.limpieza-dental.title',
        slug: 'limpieza-dental',
        excerptKey: 'services_hero.items.limpieza-dental.desc',
        img: 'servicios/rehabilitaciontotal.png',
        altKey: 'services_hero.items.limpieza-dental.alt',
      },
      {
        titleKey: 'services_hero.items.blanqueamiento.title',
        slug: 'blanqueamiento',
        excerptKey: 'services_hero.items.blanqueamiento.desc',
        img: 'servicios/blanqueamiento.png',
        altKey: 'services_hero.items.blanqueamiento.alt',
      }
    ];
  }

  get whatsappHref(): string {
    const text =
      this.currentLang === 'es'
        ? 'Hola, quiero agendar una valoración en Alquimia Dental.'
        : 'Hi, I would like to book an appointment at Alquimia Dental.';
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(text)}`;
  }
}
