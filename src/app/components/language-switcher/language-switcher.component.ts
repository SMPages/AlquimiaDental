import { Component } from '@angular/core';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { CommonModule } from '@angular/common';

type Lang = 'es' | 'en';
const SUPPORTED: ReadonlyArray<Lang> = ['es', 'en'] as const;
const isLang = (v?: string): v is Lang => !!v && (v === 'es' || v === 'en');

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent {
  constructor(private router: Router) {}

  private pathSegments(): string[] {
    const tree: UrlTree = this.router.parseUrl(this.router.url);
    const segs = tree.root.children['primary']?.segments ?? [];
    return segs.map(s => s.path);
  }

  /** Idioma actual: toma el ÚLTIMO prefijo de idioma consecutivo al inicio (si hay varios) */
  get currentLang(): Lang {
    const segs = this.pathSegments();
    let last: Lang | null = null;
    for (const s of segs) {
      if (isLang(s)) last = s;
      else break;
    }
    return last ?? 'es';
  }

  /** Quita TODOS los prefijos de idioma consecutivos y devuelve el resto de la ruta */
  private stripLeadingLangs(segs: string[]): string[] {
    let i = 0;
    while (i < segs.length && isLang(segs[i])) i++;
    return segs.slice(i);
  }

  switchTo(lang: Lang) {
    if (this.currentLang === lang) return;

    const tree = this.router.parseUrl(this.router.url);
    const segs = this.pathSegments();
    const rest = this.stripLeadingLangs(segs);

    this.router.navigate(['/', lang, ...rest], {
      replaceUrl: true,
      queryParams: tree.queryParams,
      fragment: tree.fragment ?? undefined,
    });
  }

  toggle() {
    this.switchTo(this.currentLang === 'es' ? 'en' : 'es');
  }
}
