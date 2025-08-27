// src/app/components/header/header.component.ts
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] // si ya la tienes
})
export class HeaderComponent {
  private i18n = inject(TranslationService);
  private router = inject(Router);

  isMenuOpen = false;
  get currentLang() { return this.i18n.currentLang as 'es' | 'en'; }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  switchLang(lang: 'es' | 'en') {
    if (lang === this.currentLang) return;

    localStorage.setItem('preferredLang', lang);

    const url = this.router.url.split('?')[0].split('#')[0];
    const segments = url.split('/').filter(Boolean);
    if (segments[0] === 'es' || segments[0] === 'en') {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }

    this.router.navigate(['/', ...segments], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });

    // Aplicar de inmediato (por si la vista muestra texto antes de navegar)
    this.i18n.use(lang);
  }
}