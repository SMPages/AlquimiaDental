import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SeoService } from "../../services/seo.service";
import { HeroSectionComponent } from "../hero-section/hero-section.component";
import { HomeStoryComponent } from "./home-story.component";
@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule,
    HeroSectionComponent,
    HomeStoryComponent
  ],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    // Ya no esperamos traducciones desde un servicio, solo actualizamos SEO
    this.seoService.updateSeoTags("home");
  }
}
