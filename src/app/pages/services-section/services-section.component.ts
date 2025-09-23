import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgFor } from '@angular/common';

type ServiceKey =
  | 'digital' | 'smileDesign' | 'whitening' | 'veneers' | 'cleaning'
  | 'jewelry'  | 'rehabImplant' | 'prosthesis' | 'Bordeincisal' | 'prosthesis2';

@Component({
  selector: 'app-services-section',
  imports: [NgFor, TranslatePipe],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss'
})

export class ServicesSectionComponent {
  items: Array<{key: ServiceKey; icon: string}> = [
    { key: 'digital',      icon: 'servicios/digital.png' },
    { key: 'smileDesign',  icon: 'servicios/carillas.png' },
    { key: 'prosthesis',   icon: 'servicios/protesis.png' },
    { key: 'prosthesis2',   icon: 'servicios/protesis2.png' },
    { key: 'whitening',    icon: 'servicios/blanqueamiento.png' },
    { key: 'veneers',      icon: 'servicios/carillasceramicas.png' },
    { key: 'cleaning',     icon: 'images/blanqueamiento2.jpeg' },
    { key: 'jewelry',      icon: 'servicios/joyas.png' },
    { key: 'Bordeincisal', icon: 'servicios/bordeincisal.png' },
    { key: 'rehabImplant', icon: 'servicios/rehabilitacion.png' }
  ];
    whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';
}