import { Component, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { SeoService } from './services/seo.service';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "dental-website";

  constructor() {
    const router = inject(Router);
    const seo = inject(SeoService);

    // SEO por ruta: título, descripción, canonical, hreflang y datos estructurados.
    // Se ejecuta en el navegador y también al prerenderizar cada página.
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => seo.update(e.urlAfterRedirects));
  }
}
