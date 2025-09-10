import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } }; }
}

@Component({
  selector: 'app-alquimia-dental',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './alquimia-dental.component.html',
  styleUrl: './alquimia-dental.component.scss'
})
export class AlquimiaDentalComponent implements AfterViewInit {
  private router = inject(Router);

  @ViewChild('igEmbed',    { static: true }) igEmbed!: ElementRef<HTMLElement>;
  @ViewChild('igSentinel', { static: true }) igSentinel!: ElementRef<HTMLElement>;

  /** controla el skeleton/visibilidad del embed */
  igReady = false;

  /** idioma actual deducido de la URL (/es|/en) */
  get lang(): 'es' | 'en' {
    const seg = this.router.url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0];
    return (seg === 'en' ? 'en' : 'es') as 'es' | 'en';
  }

  /** CTA WhatsApp */
  whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';

  ngAfterViewInit(): void {
    // Observa el bloque; solo cuando sea visible cargamos el script de IG
    const target = this.igSentinel?.nativeElement ?? this.igEmbed.nativeElement;

    const io = new IntersectionObserver((entries, obs) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      obs.disconnect();
      this.loadInstagramEmbed();
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0.25 });

    io.observe(target);
  }

  /** Carga perezosa del script de Instagram y procesa el embed */
  private loadInstagramEmbed() {
    const process = () => {
      try {
        window.instgrm?.Embeds?.process();
        // pequeño margen para que IG pinte su iframe antes de mostrar
        setTimeout(() => { this.igReady = true; }, 800);
      } catch {
        // si algo falla, igual quitamos el skeleton para no bloquear
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
