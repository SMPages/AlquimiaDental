import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgFor } from '@angular/common';

type ServiceKey =
  | 'digital' | 'whitening' | 'veneers' | 'cleaning'
  | 'jewelry' | 'smileDesign' | 'rehabImplant' | 'prosthesis';

@Component({
  selector: 'app-services-section',
  imports: [NgFor, TranslatePipe],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss'
})

export class ServicesSectionComponent {
  items: Array<{key: ServiceKey; icon: string}> = [
    { key: 'digital',      icon: 'servicios/digital.png' },
    { key: 'whitening',    icon: 'images/blanqueamiento.jpeg' },
    { key: 'veneers',      icon: 'images/carillas.jpeg' },
    { key: 'cleaning',     icon: 'images/blanqueamiento2.jpeg' },
    { key: 'jewelry',      icon: 'images/joyas.jpg' },
    { key: 'smileDesign',  icon: 'images/diseno.jpeg' },
    { key: 'rehabImplant', icon: 'images/protesis.jpeg' },
    { key: 'prosthesis',   icon: 'images/protesis1.jpeg' }
  ];
    whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';
}