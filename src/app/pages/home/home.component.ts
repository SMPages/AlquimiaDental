import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
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
export class HomeComponent {}
