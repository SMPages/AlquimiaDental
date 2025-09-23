import {
  Injectable, Inject, PLATFORM_ID, Renderer2, RendererFactory2, LOCALE_ID
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

type Lang = 'es' | 'en';
type Page = 'home';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  // === AJUSTES GLOBALES ===
  private readonly DOMAIN = 'https://alquimiadental.com';
  private readonly OG_IMAGE = `${this.DOMAIN}/assets/images/og-image.jpg`;
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

  constructor(
    private meta: Meta,
    private title: Title,
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /** Llama esto en cada page component (p.ej. Home) */
  updateSeoTags(page: Page = 'home') {
    const lang = this.detectLang();
    const seo = this.getSeoData(page, lang);

    // Title
    this.title.setTitle(seo.title);

    // Meta base
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    // Evita keywords/Content-Language (Google no las usa). Si igual las quieres, agrega aquí.

    // Open Graph / Twitter
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.BUSINESS_NAME });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'en' ? 'en_US' : 'es_CO' });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: this.urlFor(lang) });
    this.meta.updateTag({ property: 'og:image', content: this.OG_IMAGE });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: this.OG_IMAGE });

    // Canonical & alternates
    this.updateLinks(lang);

    // JSON-LD
    if (isPlatformBrowser(this.platformId)) {
      this.upsertDentistStructuredData(lang);
      this.upsertWebsiteStructuredData(lang);
    }
  }

  // ================= Helpers =================

  private detectLang(): Lang {
    // Prioriza LOCALE_ID, sino mira la ruta
    const fromLocale = this.localeId?.startsWith('en') ? 'en' : 'es';
    if (isPlatformBrowser(this.platformId)) {
      const p = (window.location?.pathname || '').toLowerCase();
      if (p.startsWith('/en')) return 'en';
      if (p.startsWith('/es')) return 'es';
    }
    return fromLocale as Lang;
  }

  private urlFor(lang: Lang) {
    return `${this.DOMAIN}/${lang}/`;
  }

  private getSeoData(page: Page, lang: Lang) {
    const data = {
      es: {
        home: {
          title: 'Odontología Estética en Bogotá – Diseño de Sonrisa | Dra. Sorany Díaz',
          description:
            'Sonríe con confianza. La Dra. Sorany Díaz ofrece odontología estética, diseño de sonrisa, implantes y rehabilitación oral en Bogotá con un enfoque humano y de alta calidad.'
        }
      },
      en: {
        home: {
          title: 'Cosmetic Dentistry in Bogotá – Smile Design | Dr. Sorany Díaz',
          description:
            'Feel confident. Dr. Sorany Díaz provides cosmetic dentistry, smile design, implants and oral rehabilitation in Bogotá with a human, high-quality approach.'
        }
      }
    } as const;

    return data[lang][page];
  }

  private updateLinks(lang: Lang) {
    // canonical + alternates (x-default → ES si es tu principal)
    const links: Array<{ rel: string; href: string; hreflang?: string }> = [
      { rel: 'canonical', href: this.urlFor(lang) },
      { rel: 'alternate', href: this.urlFor('es'), hreflang: 'es-CO' },
      { rel: 'alternate', href: this.urlFor('en'), hreflang: 'en' },
      { rel: 'alternate', href: this.urlFor('es'), hreflang: 'x-default' }
    ];

    links.forEach(l => this.upsertLink(l));
  }

  private upsertLink(linkData: { rel: string; href: string; hreflang?: string }) {
    let link: HTMLLinkElement | null;

    if (linkData.hreflang) {
      link = this.document.querySelector(
        `link[rel="${linkData.rel}"][hreflang="${linkData.hreflang}"]`
      );
    } else {
      link = this.document.querySelector(`link[rel="${linkData.rel}"]`);
    }

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', linkData.rel);
      if (linkData.hreflang) this.renderer.setAttribute(link, 'hreflang', linkData.hreflang);
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'href', linkData.href);
  }

  // ===== JSON-LD =====

  private upsertDentistStructuredData(lang: Lang) {
    const scriptId = 'ld-json-dentist';
    const node = this.ensureJsonLdNode(scriptId);

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Dentist',
      '@id': `${this.DOMAIN}/#dentist`,
      name: this.DOCTOR_NAME,
      image: this.OG_IMAGE,
      url: this.urlFor(lang),
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
      areaServed: { '@type': 'City', name: 'Bogotá' },
      priceRange: '$$',
      sameAs: [
        'https://www.instagram.com/drsoranyporcelainsmile/',
        'https://www.facebook.com/share/1AvjaaG8po/?mibextid=wwXIfr'
      ]
    };

    node.textContent = JSON.stringify(ld);
  }

  private upsertWebsiteStructuredData(lang: Lang) {
    const scriptId = 'ld-json-website';
    const node = this.ensureJsonLdNode(scriptId);

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.BUSINESS_NAME,
      url: `${this.DOMAIN}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.DOMAIN}/${lang}?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    node.textContent = JSON.stringify(ld);
  }

  private ensureJsonLdNode(id: string): HTMLScriptElement {
    let script = this.document.getElementById(id);
    if (!(script instanceof HTMLScriptElement)) {
      script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      this.renderer.setAttribute(script, 'id', id);
      this.renderer.appendChild(this.document.head, script);
    }
    return script as HTMLScriptElement;
  }
}
