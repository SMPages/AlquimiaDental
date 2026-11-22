// src/app/pages/about-section/about-section.component.ts
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TranslatePipe, PageHeroComponent],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss']
})
export class AboutSectionComponent {

    whatsappHref =
    'https://wa.me/573147992217?text=Hola%20Dra.%20Sorany,%20quisiera%20agendar%20una%20valoraci%C3%B3n.';
}
