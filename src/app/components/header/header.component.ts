// src/app/components/header/header.component.ts
import { Component, HostListener, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [NgFor, RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private i18n = inject(TranslationService);
  private router = inject(Router);

  readonly links = [
    { path: [] as string[], key: 'nav.home', exact: true },
    { path: ['about'], key: 'nav.about', exact: false },
    { path: ['services'], key: 'nav.services', exact: false },
    { path: ['gallery'], key: 'nav.gallery', exact: false },
    { path: ['blog'], key: 'nav.blog', exact: false },
    { path: ['opinions'], key: 'nav.opinions', exact: false }
  ];

  linkFor(path: string[]): string[] {
    return ['/', this.currentLang, ...path];
  }

  roman(i: number): string {
    return ['I', 'II', 'III', 'IV', 'V', 'VI'][i] ?? String(i + 1);
  }

  isMenuOpen = false;
  scrolled = false;

  private readonly whatsappPhone = '573147992217';

  get currentLang() { return this.i18n.currentLang as 'es' | 'en'; }

  get whatsappHref(): string {
    const text = this.currentLang === 'es'
      ? 'Hola, me gustaría agendar una cita en Alquimia Dental.'
      : 'Hi, I would like to book an appointment at Alquimia Dental.';
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(text)}`;
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; this.lockScroll(); }
  closeMenu() { this.isMenuOpen = false; this.lockScroll(); }

  /** Bloquea el scroll del fondo mientras el menú móvil está abierto. */
  private lockScroll() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
  }

  switchLang(lang: 'es' | 'en') {
    if (lang === this.currentLang) return;
    localStorage.setItem('preferredLang', lang);

    const url = this.router.url.split('?')[0].split('#')[0];
    const segments = url.split('/').filter(Boolean);
    if (segments[0] === 'es' || segments[0] === 'en') segments[0] = lang; else segments.unshift(lang);

    this.router.navigate(['/', ...segments], { queryParamsHandling: 'preserve', preserveFragment: true });
    this.i18n.use(lang);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = (window.scrollY || 0) > 8; // activa sombra y compactado
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeMenu(); }
  get whatsappAriaLabel(): string {
  return this.currentLang === 'es'
    ? 'Escribir por WhatsApp a Alquimia Dental'
    : 'Message Alquimia Dental on WhatsApp';
}
}
