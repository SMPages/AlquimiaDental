import { Routes } from '@angular/router';
import { browserLangRedirectGuard } from './guards/browser-lang-redirect.guard';
import { langNormalizerGuard } from './guards/lang-normalizer.guard';

export const routes: Routes = [
  // Entrada sin lang: el guard devuelve UrlTree a /es o /en.
  {
    path: '',
    pathMatch: 'full',
    canMatch: [browserLangRedirectGuard],
    redirectTo: '' // Angular lo pide aunque no se use
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
          import('./pages/gallery-section/gallery-section.component').then(m => m.GallerySectionComponent)
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
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
      },
       {
      path: 'auth/dash-admin',
      loadComponent: () =>
        import('./auth/dash-admin/dash-admin.component').then(m => m.DashAdminComponent),
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'posts' },
        // CRUDs (carga perezosa de cada sección)
        { path: 'posts', loadComponent: () =>
          import('./auth/dash-admin/posts/posts.component').then(m => m.PostsAdminComponent) },

        { path: 'blog', loadComponent: () =>
          import('./auth/dash-admin/blog/blog.component').then(m => m.BlogAdminComponent) },

        { path: 'gallery', loadComponent: () =>
          import('./auth/dash-admin/gallery/gallery.component').then(m => m.GalleryAdminComponent) },

        { path: 'testimonials', loadComponent: () =>
          import('./auth/dash-admin/testimonials/testimonials.component').then(m => m.TestimonialsAdminComponent) },

        { path: 'services', loadComponent: () =>
          import('./auth/dash-admin/services/services.component').then(m => m.ServicesAdminComponent) },
      ]
    },
      { path: '**', redirectTo: '' }
    ]
  },

  { path: '**', redirectTo: '' }
];
