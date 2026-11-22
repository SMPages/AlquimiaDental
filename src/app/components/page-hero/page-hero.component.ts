import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

/** Encabezado oscuro compartido por las páginas interiores. */
@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="page-hero">
      <div class="inner">
        <span class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
        <p class="sub" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
    </header>
  `,
  styles: [`
    .page-hero {
      background:
        radial-gradient(900px 380px at 80% 0%, rgba(201, 163, 106, .18), transparent 65%),
        var(--ink);
      color: var(--ivory);
      padding: calc(var(--header-safe) + clamp(2.5rem, 6vw, 4.5rem)) 0 clamp(2.5rem, 6vw, 4.5rem);
      text-align: center;
      border-bottom: 1px solid rgba(201, 163, 106, .35);
    }
    .inner { width: 92%; max-width: 900px; margin: 0 auto; }
    .eyebrow {
      display: block;
      font-size: .78rem;
      font-weight: 600;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 1rem;
    }
    h1 {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: clamp(2.3rem, 6vw, 4.2rem);
      line-height: 1.05;
      letter-spacing: -.01em;
      color: var(--ivory);
      text-wrap: balance;
    }
    .sub {
      margin: 1.25rem auto 0;
      max-width: 62ch;
      color: rgba(246, 240, 230, .72);
      font-size: clamp(1rem, 2.2vw, 1.15rem);
      line-height: 1.65;
      text-wrap: pretty;
    }
  `]
})
export class PageHeroComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
}
