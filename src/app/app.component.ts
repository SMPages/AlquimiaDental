import { Component, inject, Renderer2 } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "dental-website";
   private router = inject(Router);
  private renderer = inject(Renderer2);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const isAdmin = this.router.url.includes('/auth/dash-admin');
        this.renderer.setAttribute(document.body, 'data-admin', isAdmin ? 'true' : 'false');
      });
  }
}
