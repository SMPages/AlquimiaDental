import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  currentLang = 'es'; // idioma por defecto

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      if (params['lang']) {
        this.currentLang = params['lang'];
      }
    });
  }
}
