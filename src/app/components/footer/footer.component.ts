import { Component, inject  } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from '../../i18n/translation.service';
@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private i18n = inject(TranslationService);
  currentYear = new Date().getFullYear();

  private readonly whatsappPhone = '573147992217';

  get whatsappHref(): string {
    const lang = (this.i18n?.currentLang as 'es' | 'en') || 'es';
    const text =
      lang === 'en'
        ? 'Hi! I would like to book a dental evaluation at Alquimia Dental.'
        : '¡Hola! Me gustaría agendar una valoración en Alquimia Dental.';
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(text)}`;
  }
}
