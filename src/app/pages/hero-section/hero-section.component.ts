import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  private i18n = inject(TranslationService);

  get currentLang() {
    return this.i18n.currentLang;
  }
}
