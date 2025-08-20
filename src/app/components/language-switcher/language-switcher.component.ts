import { Component, Inject, LOCALE_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./language-switcher.component.html",
  styleUrls: ["./language-switcher.component.scss"],
})
export class LanguageSwitcherComponent {
  currentLanguage: string;

  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.currentLanguage = this.locale.startsWith("en") ? "en" : "es";
  }

  getLanguageUrl(lang: string): string {
    // Si tu app está desplegada en dominio.com/
    // Angular normalmente genera: dominio.com/es/ y dominio.com/en/
    if (lang === "es") {
      return "/es/";
    } else {
      return "/en/";
    }
  }
}
