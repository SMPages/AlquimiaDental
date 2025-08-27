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
    { key: 'digital',      icon: 'images/digital.png' },
    { key: 'whitening',    icon: '/assets/images/icons/whitening.png' },
    { key: 'veneers',      icon: '/assets/images/icons/veneers.png' },
    { key: 'cleaning',     icon: '/assets/images/icons/cleaning.png' },
    { key: 'jewelry',      icon: '/assets/images/icons/dental-jewelry.png' },
    { key: 'smileDesign',  icon: '/assets/images/icons/smile-design.png' },
    { key: 'rehabImplant', icon: '/assets/images/icons/rehab-implant.png' },
    { key: 'prosthesis',   icon: '/assets/images/icons/prosthesis.png' }
  ];
}