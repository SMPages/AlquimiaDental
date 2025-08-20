import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
