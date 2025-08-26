// src/app/components/header/header.component.ts
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, NavigationEnd, UrlTree } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";

type Lang = 'es' | 'en';
const isLang = (s?: string): s is Lang => s === 'es' || s === 'en';

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  private router = inject(Router);

  isMenuOpen = false;
  currentLang: Lang = 'es';

  constructor() {
    // Recalcular idioma en cada navegación (y una vez al iniciar)
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.getLangFromUrl(this.router.url))
    ).subscribe(lang => this.currentLang = lang);
  }

  private getLangFromUrl(url: string): Lang {
    const tree: UrlTree = this.router.parseUrl(url);
    const segs = tree.root.children['primary']?.segments ?? [];
    // Tomar TODOS los prefijos consecutivos de idioma y quedarnos con el ÚLTIMO
    let last: Lang | null = null;
    for (const s of segs.map(s => s.path)) {
      if (isLang(s)) last = s;
      else break;
    }
    return last ?? 'es';
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }
}
