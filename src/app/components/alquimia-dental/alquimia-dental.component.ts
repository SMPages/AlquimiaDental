// src/app/components/alquimia-dental/alquimia-dental.component.ts
import { Component, ElementRef, AfterViewInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } }; }
}

@Component({
  selector: 'app-alquimia-dental',
  standalone: true,
  imports: [RouterModule, NgIf, TranslatePipe],
  templateUrl: './alquimia-dental.component.html',
  styleUrl: './alquimia-dental.component.scss'
})
export class AlquimiaDentalComponent implements AfterViewInit {
  @ViewChild('igEmbed', { static: true }) igEmbed!: ElementRef<HTMLElement>;
  @ViewChild('igSentinel', { static: true }) igSentinel!: ElementRef<HTMLElement>;

  private i18n = inject(TranslationService);
  private destroyRef = inject(DestroyRef);

  igReady = false;

  // idioma actual para links como [routerLink]="['/', currentLang]"
  currentLang: 'es' | 'en' = this.i18n.currentLang as 'es' | 'en';

  constructor() {
    // reactivo al cambio de idioma desde el header
    this.i18n.lang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(l => this.currentLang = (l as 'es' | 'en'));
  }

  whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';

  ngAfterViewInit(): void {
    const target = this.igSentinel?.nativeElement ?? this.igEmbed.nativeElement;
    const io = new IntersectionObserver((entries, obs) => {
      if (!entries[0]?.isIntersecting) return;
      obs.disconnect();
      this.loadInstagramEmbed();
    }, { rootMargin: '200px 0px', threshold: 0.25 });
    io.observe(target);
  }

  private loadInstagramEmbed() {
    const process = () => {
      try {
        window.instgrm?.Embeds?.process();
        setTimeout(() => { this.igReady = true; }, 800);
      } catch {
        this.igReady = true;
      }
    };
    if (!document.querySelector('script[data-ig-embed]')) {
      const s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-ig-embed', 'true');
      s.onload = process;
      document.body.appendChild(s);
    } else {
      process();
    }
  }
}
