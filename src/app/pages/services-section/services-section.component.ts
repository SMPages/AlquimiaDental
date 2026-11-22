import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';

type ServiceKey =
  | 'digital' | 'smileDesign' | 'whitening' | 'veneers' | 'cleaning'
  | 'jewelry'  | 'rehabImplant' | 'prosthesis' | 'Bordeincisal' | 'prosthesis2';

type Category = 'aesthetic' | 'rehab' | 'tech';
type Filter = 'all' | Category;

interface ServiceItem { key: ServiceKey; icon: string; cat: Category; }

@Component({
  selector: 'app-services-section',
  imports: [NgFor, TranslatePipe, PageHeroComponent],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss'
})
export class ServicesSectionComponent {
  readonly items: ServiceItem[] = [
    { key: 'digital',      icon: 'servicios/digital.png',          cat: 'tech' },
    { key: 'smileDesign',  icon: 'servicios/carillas.png',         cat: 'aesthetic' },
    { key: 'prosthesis',   icon: 'servicios/protesis.png',         cat: 'rehab' },
    { key: 'prosthesis2',  icon: 'servicios/protesis2.png',        cat: 'rehab' },
    { key: 'whitening',    icon: 'servicios/blanqueamiento.png',   cat: 'aesthetic' },
    { key: 'veneers',      icon: 'servicios/carillasceramicas.png', cat: 'aesthetic' },
    { key: 'cleaning',     icon: 'images/blanqueamiento2.jpeg',    cat: 'tech' },
    { key: 'jewelry',      icon: 'servicios/joyas.png',            cat: 'aesthetic' },
    { key: 'Bordeincisal', icon: 'servicios/bordeincisal.png',     cat: 'aesthetic' },
    { key: 'rehabImplant', icon: 'servicios/rehabilitacion.png',   cat: 'rehab' }
  ];

  readonly filters: Filter[] = ['all', 'aesthetic', 'rehab', 'tech'];

  filter: Filter = 'all';
  /** Tarjetas con la descripción completa desplegada. */
  expanded = new Set<ServiceKey>();

  get visible(): Array<ServiceItem & { index: number }> {
    return this.items
      .map((s, index) => ({ ...s, index }))
      .filter(s => this.filter === 'all' || s.cat === this.filter);
  }

  setFilter(f: Filter) { this.filter = f; }

  toggle(key: ServiceKey) {
    this.expanded.has(key) ? this.expanded.delete(key) : this.expanded.add(key);
  }

  trackByKey = (_: number, s: ServiceItem) => s.key;

  roman(i: number): string {
    return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i] ?? String(i + 1);
  }

  whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';
}
