import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { TranslatePipe } from "../../pipes/translate.pipe"
import type { SeoService } from "../../services/seo.service"
import type { LanguageService } from "../../services/language.service"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- ... existing template ... -->
  `,
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {
    this.seoService.updateSeoTags("home")

    // Update SEO when language changes
    this.languageService.currentLanguage$.subscribe(() => {
      this.seoService.updateSeoTags("home")
    })
  }
}
