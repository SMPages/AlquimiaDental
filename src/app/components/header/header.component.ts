import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  isMenuOpen = false;
  currentLang = "es"; // idioma por defecto

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      if (params["lang"]) {
        this.currentLang = params["lang"];
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
