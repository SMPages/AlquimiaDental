import { Injectable, Inject, PLATFORM_ID, Renderer2, RendererFactory2, LOCALE_ID } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  private renderer: Renderer2;

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

  updateSeoTags(page = "home") {
    const currentLang = this.localeId.startsWith("en") ? "en" : "es";
    const seoData = this.getSeoData(page, currentLang);

    // Título
    this.title.setTitle(seoData.title);

    // Meta tags
    this.meta.updateTag({ name: "description", content: seoData.description });
    this.meta.updateTag({ name: "keywords", content: seoData.keywords });
    this.meta.updateTag({ name: "author", content: "Dra. Sorany Díaz P." });
    this.meta.updateTag({ name: "robots", content: "index, follow" });
    this.meta.updateTag({ name: "language", content: currentLang });
    this.meta.updateTag({ httpEquiv: "Content-Language", content: currentLang });

    // Open Graph
    this.meta.updateTag({ property: "og:title", content: seoData.title });
    this.meta.updateTag({ property: "og:description", content: seoData.description });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:url", content: `https://drasoranydiaz.com/${currentLang}` });
    this.meta.updateTag({ property: "og:image", content: "https://drasoranydiaz.com/assets/images/og-image.jpg" });
    this.meta.updateTag({ property: "og:locale", content: currentLang === "en" ? "en_US" : "es_ES" });
    this.meta.updateTag({ property: "og:site_name", content: "Dra. Sorany Díaz P." });

    // Twitter
    this.meta.updateTag({ name: "twitter:card", content: "summary_large_image" });
    this.meta.updateTag({ name: "twitter:title", content: seoData.title });
    this.meta.updateTag({ name: "twitter:description", content: seoData.description });
    this.meta.updateTag({ name: "twitter:image", content: "https://drasoranydiaz.com/assets/images/og-image.jpg" });

    // Links y structured data
    this.updateLinks(currentLang);

    if (isPlatformBrowser(this.platformId)) {
      this.addStructuredData(currentLang);
    }
  }

  private getSeoData(page: string, lang: string) {
    const seoData = {
      es: {
        home: {
          title: "Dra. Sorany Díaz P. - Especialista en Odontología Estética | República Dominicana",
          description: "Dra. Sorany Díaz P., especialista en odontología estética y rehabilitación oral en República Dominicana. Más de 15 años transformando sonrisas con técnicas avanzadas. Servicios para pacientes internacionales.",
          keywords: "dentista República Dominicana, odontología estética, rehabilitación oral, implantes dentales, carillas porcelana, blanqueamiento dental, turismo dental, dentista Santo Domingo, especialista dental, sonrisa perfecta",
        },
      },
      en: {
        home: {
          title: "Dr. Sorany Díaz P. - Aesthetic Dentistry Specialist | Dominican Republic",
          description: "Dr. Sorany Díaz P., specialist in aesthetic dentistry and oral rehabilitation in Dominican Republic. Over 15 years transforming smiles with advanced techniques. Services for international patients.",
          keywords: "dentist Dominican Republic, aesthetic dentistry, oral rehabilitation, dental implants, porcelain veneers, teeth whitening, dental tourism, Santo Domingo dentist, dental specialist, perfect smile",
        },
      },
    };
    return seoData[lang as keyof typeof seoData]?.[page as keyof typeof seoData.es] || seoData.es.home;
  }

  private updateLinks(lang: string) {
    const links = [
      { rel: "canonical", href: `https://drasoranydiaz.com/${lang}` },
      { rel: "alternate", href: "https://drasoranydiaz.com/es", hreflang: "es" },
      { rel: "alternate", href: "https://drasoranydiaz.com/en", hreflang: "en" },
      { rel: "alternate", href: "https://drasoranydiaz.com/es", hreflang: "x-default" },
    ];

    links.forEach(linkData => {
      let link: HTMLLinkElement | null;
      if (linkData.hreflang) {
        link = this.document.querySelector(`link[rel="${linkData.rel}"][hreflang="${linkData.hreflang}"]`);
      } else {
        link = this.document.querySelector(`link[rel="${linkData.rel}"]`);
      }

      if (!link) {
        link = this.renderer.createElement("link");
        this.renderer.setAttribute(link, "rel", linkData.rel);
        this.renderer.setAttribute(link, "href", linkData.href);
        if (linkData.hreflang) this.renderer.setAttribute(link, "hreflang", linkData.hreflang);
        this.renderer.appendChild(this.document.head, link);
      } else {
        this.renderer.setAttribute(link, "href", linkData.href);
      }
    });
  }

  private addStructuredData(lang: string) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Dentist",
      name: "Dra. Sorany Díaz P.",
      image: "https://drasoranydiaz.com/assets/images/doctor-profile.jpg",
      description: lang === "en"
        ? "Specialist in aesthetic dentistry and oral rehabilitation with over 15 years of experience"
        : "Especialista en odontología estética y rehabilitación oral con más de 15 años de experiencia",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Winston Churchill #47, Piantini",
        addressLocality: "Santo Domingo",
        addressCountry: "DO"
      },
      telephone: "+1-809-555-0123",
      email: "info@drasoranydiaz.com",
      url: "https://drasoranydiaz.com",
      sameAs: [
        "https://www.facebook.com/drasoranydiaz",
        "https://www.instagram.com/drasoranydiaz",
        "https://www.linkedin.com/in/soranydiaz"
      ],
      openingHours: ["Mo-Fr 08:00-18:00", "Sa 08:00-14:00"],
      priceRange: "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "150"
      },
      medicalSpecialty: ["Aesthetic Dentistry", "Oral Rehabilitation", "Dental Implants", "Orthodontics"],
    };

    let script = this.document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;

    if (!script) {
      script = this.renderer.createElement("script") as HTMLScriptElement;
      this.renderer.setAttribute(script, "type", "application/ld+json");
      this.renderer.appendChild(this.document.head, script);
    }

    if (script) {
      script.textContent = JSON.stringify(structuredData);
    }
  }
}
