// src/app/components/language-switcher/language-switcher.component.ts
import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

type Lang = 'es' | 'en';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  currentLang: Lang = 'es';

  constructor(@Inject(DOCUMENT) private doc: Document) {
    // Detecta idioma actual desde la URL solo en navegador
    if (this.isBrowser) {
      const pathname = this.doc.location?.pathname ?? '/';
      const firstSeg = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
      if (firstSeg === 'en' || firstSeg === 'es') {
        this.currentLang = firstSeg as Lang;
      }
    }
  }

  /** Lee <base href> de forma segura para SSR */
  private getBasePath(): string {
    if (!this.isBrowser) return '/';
    const base = this.doc?.querySelector('base')?.getAttribute('href') ?? '/';
    return base.endsWith('/') ? base : base + '/';
  }

  /** Construye el href hacia el home del idioma sin duplicar /es o /en */
  computeHref(lang: Lang): string {
    const base = this.getBasePath();                 // ej: "/AlquimiaDental/es/"
    const root = base.replace(/\/(es|en)\/$/i, '/'); // queda "/AlquimiaDental/"
    return `${root}${lang}/`;                        // ej: "/AlquimiaDental/es/"
  }

  /** Cambia de idioma conservando la ruta actual */
  switchTo(lang: Lang): void {
    if (!this.isBrowser) return;

    const loc = this.doc.location!;
    const base = this.getBasePath();                  // ej: "/AlquimiaDental/es/"
    const root = base.replace(/\/(es|en)\/$/i, '/');  // queda "/AlquimiaDental/"

    // Path relativo al root
    const pathRel = (loc.pathname || '/').slice(root.length);
    const segs = pathRel.split('/').filter(Boolean);

    // Si el primer segmento es idioma, quitarlo
    if (segs[0] === 'es' || segs[0] === 'en') segs.shift();

    const rest = segs.length ? `/${segs.join('/')}/` : '/';
    const url = `${root}${lang}${rest}${loc.search || ''}${loc.hash || ''}`.replace(/\/+/g, '/');
    loc.assign(url);
  }
}
