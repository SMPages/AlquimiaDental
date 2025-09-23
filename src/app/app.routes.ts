import { Routes } from '@angular/router';
import { browserLangRedirectGuard } from './guards/browser-lang-redirect.guard';
import { langNormalizerGuard } from './guards/lang-normalizer.guard';

export const routes: Routes = [
  // Entrada sin lang: el guard devuelve UrlTree a /es o /en.
  {
    path: '',
    pathMatch: 'full',
    canMatch: [browserLangRedirectGuard],
    redirectTo: 'es' // Angular lo pide aunque no se use
  },

  {
    path: ':lang',
    canMatch: [langNormalizerGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about-section/about-section.component').then(m => m.AboutSectionComponent)
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services-section/services-section.component').then(m => m.ServicesSectionComponent)
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./pages/gallery-section/gallery-section.component').then(m => m.GalleryCarouselComponent)
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./pages/blog-section/blog-section.component').then(m => m.BlogSectionComponent)
      },
      {
        path: 'opinions',
        loadComponent: () =>
          import('./pages/testimonials-section/testimonials-section.component').then(m => m.TestimonialsSectionComponent)
      },
      {
        path: 'alquimia-dental',
        loadComponent: () =>
          import('./components/alquimia-dental/alquimia-dental.component').then(m => m.AlquimiaDentalComponent)
      },
      { path: '**', redirectTo: '' }
    ]
  },
  { path: '**', redirectTo: 'es' }
];
