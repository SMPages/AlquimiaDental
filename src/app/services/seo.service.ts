import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export type Lang = 'es' | 'en';

/** Claves de las páginas que tienen SEO propio. */
type PageKey =
  | 'home' | 'about' | 'services' | 'gallery' | 'blog' | 'opinions' | 'alquimia'
  | 'servicio:carillas' | 'servicio:protesis-total' | 'servicio:limpieza-dental' | 'servicio:blanqueamiento';

interface PageSeo { title: string; description: string; crumb: string; }

/** Segmento de URL (sin idioma) -> clave de página. */
const ROUTES: Record<string, PageKey> = {
  '': 'home',
  'about': 'about',
  'services': 'services',
  'gallery': 'gallery',
  'blog': 'blog',
  'opinions': 'opinions',
  'alquimia-dental': 'alquimia',
  'servicio/carillas': 'servicio:carillas',
  'servicio/protesis-total': 'servicio:protesis-total',
  'servicio/limpieza-dental': 'servicio:limpieza-dental',
  'servicio/blanqueamiento': 'servicio:blanqueamiento'
};

/** Títulos <= ~60 caracteres y descripciones <= ~155, que es lo que Google muestra completo. */
const SEO: Record<PageKey, Record<Lang, PageSeo>> = {
  home: {
    es: {
      title: 'Odontología Estética en Bogotá – Diseño de Sonrisa | Dra. Sorany Díaz',
      description: 'Sonríe con confianza. La Dra. Sorany Díaz ofrece odontología estética, diseño de sonrisa, implantes y rehabilitación oral en Bogotá con un enfoque humano.',
      crumb: 'Inicio'
    },
    en: {
      title: 'Cosmetic Dentistry in Bogotá – Smile Design | Dr. Sorany Díaz',
      description: 'Feel confident. Dr. Sorany Díaz provides cosmetic dentistry, smile design, implants and oral rehabilitation in Bogotá with a human, high-quality approach.',
      crumb: 'Home'
    }
  },
  about: {
    es: {
      title: 'Dra. Sorany Díaz | Rehabilitación y Estética Oral en Bogotá',
      description: 'Conoce a la Dra. Sorany Díaz, especialista en rehabilitación y estética oral en Bogotá: su formación, su enfoque humano y el consultorio donde transforma sonrisas.',
      crumb: 'Acerca de mí'
    },
    en: {
      title: 'Dr. Sorany Díaz | Oral Rehabilitation & Aesthetics in Bogotá',
      description: 'Meet Dr. Sorany Díaz, a specialist in oral rehabilitation and aesthetics in Bogotá: her education, her human approach and the clinic where she transforms smiles.',
      crumb: 'About me'
    }
  },
  services: {
    es: {
      title: 'Tratamientos de Estética Dental y Rehabilitación en Bogotá',
      description: 'Diseño de sonrisa, carillas cerámicas, blanqueamiento, prótesis, rehabilitación oral y odontología digital con la Dra. Sorany Díaz en Bogotá.',
      crumb: 'Servicios'
    },
    en: {
      title: 'Cosmetic Dentistry & Oral Rehabilitation Treatments in Bogotá',
      description: 'Smile design, ceramic veneers, whitening, dentures, oral rehabilitation and digital dentistry with Dr. Sorany Díaz in Bogotá.',
      crumb: 'Services'
    }
  },
  gallery: {
    es: {
      title: 'Antes y Después: Casos de Sonrisa | Alquimia Dental',
      description: 'Mira casos reales de diseño de sonrisa, carillas, blanqueamiento y rehabilitación sobre implantes realizados por la Dra. Sorany Díaz en Bogotá.',
      crumb: 'Galería'
    },
    en: {
      title: 'Before & After: Smile Cases | Alquimia Dental',
      description: 'See real cases of smile design, veneers, whitening and implant rehabilitation by Dr. Sorany Díaz in Bogotá.',
      crumb: 'Gallery'
    }
  },
  blog: {
    es: {
      title: 'La Dra. Sorany Díaz en los Medios | Alquimia Dental',
      description: 'Menciones y artículos sobre el trabajo de la Dra. Sorany Díaz, incluido el reportaje «El arte de reinventar sonrisas» en Rolling Stone.',
      crumb: 'En los medios'
    },
    en: {
      title: 'Dr. Sorany Díaz in the Media | Alquimia Dental',
      description: 'Mentions and articles about the work of Dr. Sorany Díaz, including the Rolling Stone feature “The art of reinventing smiles”.',
      crumb: 'In the media'
    }
  },
  opinions: {
    es: {
      title: 'Opiniones de Pacientes | Alquimia Dental Bogotá',
      description: 'Lee experiencias reales de pacientes de la Dra. Sorany Díaz y de Alquimia Dental en Bogotá: confianza, resultados y trato humano.',
      crumb: 'Opiniones'
    },
    en: {
      title: 'Patient Reviews | Alquimia Dental Bogotá',
      description: 'Read real experiences from patients of Dr. Sorany Díaz and Alquimia Dental in Bogotá: confidence, results and a human approach.',
      crumb: 'Reviews'
    }
  },
  alquimia: {
    es: {
      title: 'Alquimia Dental®: la Odontología como Transformación',
      description: 'La filosofía de Alquimia Dental®: ciencia odontológica, arte estético y conexión emocional para transformar el dolor y la inseguridad en confianza.',
      crumb: 'Alquimia Dental'
    },
    en: {
      title: 'Alquimia Dental®: Dentistry as Transformation',
      description: 'The philosophy of Alquimia Dental®: dental science, aesthetic art and emotional connection to turn pain and insecurity into confidence.',
      crumb: 'Alquimia Dental'
    }
  },
  'servicio:carillas': {
    es: {
      title: 'Diseño de Sonrisa en Resina en Bogotá | Alquimia Dental',
      description: 'Carillas de resina de alta estética: una forma rápida y segura de transformar tu sonrisa sin desgastar tus dientes. Agenda tu valoración en Bogotá.',
      crumb: 'Diseño de sonrisa'
    },
    en: {
      title: 'Resin Smile Design in Bogotá | Alquimia Dental',
      description: 'High-aesthetic resin veneers: a fast, safe way to transform your smile without wearing down your teeth. Book your assessment in Bogotá.',
      crumb: 'Smile design'
    }
  },
  'servicio:protesis-total': {
    es: {
      title: 'Prótesis Total en Bogotá | Alquimia Dental',
      description: 'Recupera tu función masticatoria, tu estética y tu confianza con prótesis totales personalizadas de apariencia natural. Dra. Sorany Díaz, Bogotá.',
      crumb: 'Prótesis total'
    },
    en: {
      title: 'Complete Dentures in Bogotá | Alquimia Dental',
      description: 'Regain your chewing function, your aesthetics and your confidence with personalized, natural-looking complete dentures. Dr. Sorany Díaz, Bogotá.',
      crumb: 'Complete denture'
    }
  },
  'servicio:limpieza-dental': {
    es: {
      title: 'Rehabilitación con Coronas Cerámicas en Bogotá | Alquimia Dental',
      description: 'Restaura la salud, la función y la belleza de tu sonrisa con coronas cerámicas de máxima estética y resistencia. Valoración con la Dra. Sorany Díaz.',
      crumb: 'Coronas cerámicas'
    },
    en: {
      title: 'Ceramic Crown Rehabilitation in Bogotá | Alquimia Dental',
      description: 'Restore the health, function and beauty of your smile with ceramic crowns of maximum aesthetics and strength. Assessment with Dr. Sorany Díaz.',
      crumb: 'Ceramic crowns'
    }
  },
  'servicio:blanqueamiento': {
    es: {
      title: 'Blanqueamiento Dental Profesional en Bogotá | Alquimia Dental',
      description: 'Blanqueamiento dental seguro y personalizado: elimina manchas y logra una sonrisa más blanca en pocas sesiones. Dra. Sorany Díaz, Bogotá.',
      crumb: 'Blanqueamiento'
    },
    en: {
      title: 'Professional Teeth Whitening in Bogotá | Alquimia Dental',
      description: 'Safe, personalized teeth whitening: remove stains and get a whiter smile in just a few sessions. Dr. Sorany Díaz, Bogotá.',
      crumb: 'Whitening'
    }
  }
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  // === AJUSTES GLOBALES ===
  private readonly DOMAIN = 'https://alquimiadental.com';
  private readonly OG_IMAGE = `${this.DOMAIN}/images/elegant-dental-doctor.jpg`;
  private readonly LOGO = `${this.DOMAIN}/logo.png`;
  private readonly BUSINESS_NAME = 'Alquimia Dental®';
  private readonly DOCTOR_NAME = 'Dra. Sorany Díaz';

  // Contacto y dirección (Bogotá)
  private readonly PHONE = '+57 314 799 2217';
  private readonly EMAIL = 'Soranydiazrehabilitacionoral@gmail.com';
  private readonly ADDRESS = {
    street: 'Cl. 18 #77-51 Oficina 419, Fontibón',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postal: '110921',
    countryCode: 'CO'
  };
  // Coordenadas del mapa incrustado en el footer
  private readonly GEO = { lat: 4.653759, lng: -74.130109 };

  constructor(
    private meta: Meta,
    private title: Title,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Actualiza título, metadatos, canonical, hreflang y datos estructurados
   * según la URL actual (p. ej. "/es/servicio/carillas?x=1#y").
   * Funciona igual en el navegador y al prerenderizar.
   */
  update(url: string): void {
    const parsed = this.parse(url);
    if (!parsed) return;
    const { lang, path, key } = parsed;
    const seo = SEO[key][lang];

    this.title.setTitle(seo.title);

    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph / Twitter
    const pageUrl = this.urlFor(lang, path);
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.BUSINESS_NAME });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'en' ? 'en_US' : 'es_CO' });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:image', content: this.OG_IMAGE });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: this.OG_IMAGE });

    // Canonical + alternates en el idioma contrario de ESTA misma página
    this.upsertLink({ rel: 'canonical', href: pageUrl });
    this.upsertLink({ rel: 'alternate', href: this.urlFor('es', path), hreflang: 'es-CO' });
    this.upsertLink({ rel: 'alternate', href: this.urlFor('en', path), hreflang: 'en' });
    this.upsertLink({ rel: 'alternate', href: this.urlFor('es', path), hreflang: 'x-default' });

    // JSON-LD
    this.upsertJson('ld-json-dentist', this.dentistLd(lang));
    this.upsertJson('ld-json-website', this.websiteLd(lang));
    this.upsertJson('ld-json-breadcrumbs', key === 'home' ? null : this.breadcrumbsLd(lang, key, path));
  }

  // ================= Helpers =================

  /** "/es/servicio/carillas?x#y" -> { lang:'es', path:'servicio/carillas', key } (null si no es una página conocida). */
  private parse(url: string): { lang: Lang; path: string; key: PageKey } | null {
    const clean = (url || '').split('#')[0].split('?')[0];
    const segs = clean.split('/').filter(Boolean);
    const first = (segs[0] || '').toLowerCase();
    if (first !== 'es' && first !== 'en') return null;

    const path = segs.slice(1).join('/').toLowerCase();
    const key = ROUTES[path];
    return key ? { lang: first as Lang, path, key } : null;
  }

  private urlFor(lang: Lang, path: string): string {
    // Con barra final: Netlify sirve cada página prerenderizada como carpeta (/es/about/)
    return `${this.DOMAIN}/${lang}/${path ? path + '/' : ''}`;
  }

  private upsertLink(linkData: { rel: string; href: string; hreflang?: string }) {
    const selector = linkData.hreflang
      ? `link[rel="${linkData.rel}"][hreflang="${linkData.hreflang}"]`
      : `link[rel="${linkData.rel}"]`;
    let link = this.document.querySelector(selector);

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', linkData.rel);
      if (linkData.hreflang) this.renderer.setAttribute(link, 'hreflang', linkData.hreflang);
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'href', linkData.href);
  }

  // ===== JSON-LD =====

  private dentistLd(lang: Lang) {
    return {
      '@context': 'https://schema.org',
      '@type': ['Dentist', 'LocalBusiness'],
      '@id': `${this.DOMAIN}/#dentist`,
      name: this.DOCTOR_NAME,
      alternateName: this.BUSINESS_NAME,
      image: this.OG_IMAGE,
      logo: this.LOGO,
      url: this.urlFor(lang, ''),
      telephone: this.PHONE,
      email: this.EMAIL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: this.ADDRESS.street,
        addressLocality: this.ADDRESS.city,
        addressRegion: this.ADDRESS.region,
        postalCode: this.ADDRESS.postal,
        addressCountry: this.ADDRESS.countryCode
      },
      geo: { '@type': 'GeoCoordinates', latitude: this.GEO.lat, longitude: this.GEO.lng },
      hasMap: `https://www.google.com/maps/search/?api=1&query=${this.GEO.lat},${this.GEO.lng}`,
      areaServed: { '@type': 'City', name: 'Bogotá' },
      medicalSpecialty: 'https://schema.org/Dentistry',
      availableLanguage: ['Spanish', 'English'],
      knowsAbout: lang === 'en'
        ? ['Smile design', 'Ceramic veneers', 'Teeth whitening', 'Oral rehabilitation', 'Dentures', 'Digital dentistry']
        : ['Diseño de sonrisa', 'Carillas cerámicas', 'Blanqueamiento dental', 'Rehabilitación oral', 'Prótesis dentales', 'Odontología digital'],
      priceRange: '$$',
      sameAs: [
        'https://www.instagram.com/drsoranyporcelainsmile/',
        'https://www.facebook.com/share/1AvjaaG8po/?mibextid=wwXIfr'
      ]
    };
  }

  private websiteLd(lang: Lang) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.DOMAIN}/#website`,
      name: this.BUSINESS_NAME,
      url: `${this.DOMAIN}/`,
      inLanguage: lang === 'en' ? 'en' : 'es-CO',
      publisher: { '@id': `${this.DOMAIN}/#dentist` }
    };
  }

  private breadcrumbsLd(lang: Lang, key: PageKey, path: string) {
    const home = SEO.home[lang].crumb;
    const items: Array<{ name: string; url: string }> = [{ name: home, url: this.urlFor(lang, '') }];

    if (key.startsWith('servicio:')) {
      items.push({ name: SEO.services[lang].crumb, url: this.urlFor(lang, 'services') });
    }
    items.push({ name: SEO[key][lang].crumb, url: this.urlFor(lang, path) });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: it.url
      }))
    };
  }

  /** Crea/actualiza un <script type="application/ld+json"> o lo elimina si `data` es null. */
  private upsertJson(id: string, data: unknown | null) {
    const existing = this.document.getElementById(id);

    if (data === null) {
      if (existing) this.renderer.removeChild(this.document.head, existing);
      return;
    }

    let script: HTMLElement | null = existing;
    if (!script) {
      script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      this.renderer.setAttribute(script, 'id', id);
      this.renderer.appendChild(this.document.head, script);
    }
    script!.textContent = JSON.stringify(data);
  }
}
