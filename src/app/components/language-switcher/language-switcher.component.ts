import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./language-switcher.component.html",
  styleUrls: ["./language-switcher.component.scss"],
})
export class LanguageSwitcherComponent {
  currentLanguage = "es";

  constructor(private languageService: LanguageService) {
    this.languageService.currentLanguage$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  setLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }
}
