import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';
import { CommonModule } from '@angular/common'; 


type FeaturedService = {
  title: string;
  slug: string;
  excerpt: string;
  img: string;
  alt: string;
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
   
get featuredServices(): FeaturedService[] {
  const es: FeaturedService[] = [
    {
      title: 'Diseño de sonrisa en resina de alta estética',
      slug: 'carillas',
      excerpt:
        'Son una alternativa estética y conservadora para transformar tu sonrisa sin tallar tus dientes naturales..',
      img: 'servicios/carillas.png',
      alt: 'Resinas directas sin desgaste',
    },
    {
      title: 'Prótesis total',
      slug: 'protesis-total',
      excerpt:
        'Es un dispositivo removible diseñado para reemplazar todos los dientes cuando se han perdido en una o ambas arcadas.',
      img: 'servicios/protesis.png',
      alt: 'Prótesis total',
    },
    {
      title: 'Limpieza dental',
      slug: 'limpieza-dental',
      excerpt:
        'Prevención y salud periodontal. Remueve placa y cálculo, pule superficies y fortalece la salud de encías y dientes.',
      img: 'servicios/carillas.png',
      alt: 'Limpieza dental',
    },
    {
      title: 'Blanqueamiento',
      slug: 'blanqueamiento',
      excerpt:
        'Blanqueamiento seguro y efectivo. Aclara varios tonos controlando la sensibilidad y cuidando el esmalte.',
      img: 'servicios/blanqueamiento.png',
      alt: 'Blanqueamiento dental',
    },
  ];

  const en: FeaturedService[] = [
    {
      title: 'Dental veneers',
      slug: 'veneers',
      excerpt:
        'Harmony, shape and color tailored to your smile. Refines size and edges and masks minor flaws with minimally invasive techniques.',
      img: 'servicios/carillas.png',
      alt: 'Dental veneers',
    },
    {
      title: 'Smile design',
      slug: 'smile-design',
      excerpt:
        'Personalized aesthetic planning for a balanced smile. Includes facial analysis, mock-up try-in and a tailored treatment plan.',
       img: 'servicios/carillas.png',
      alt: 'Smile design',
    },
    {
      title: 'Dental cleaning',
      slug: 'dental-cleaning',
      excerpt:
        'Prevention and periodontal health. Removes plaque and tartar, polishes surfaces and promotes healthier gums.',
       img: 'servicios/carillas.png',
      alt: 'Dental cleaning',
    },
    {
      title: 'Teeth whitening',
      slug: 'teeth-whitening',
      excerpt:
        'Safe, effective whitening. Brightens several shades while managing sensitivity and protecting enamel.',
       img: 'servicios/carillas.png',
      alt: 'Teeth whitening',
    },
  ];

  return this.currentLang === 'en' ? en : es;
}
  get whatsappHref(): string {
    const text =
      this.currentLang === 'es'
        ? 'Hola, quiero agendar una valoración en Alquimia Dental.'
        : 'Hi, I would like to book an appointment at Alquimia Dental.';
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(text)}`;
  }
}
