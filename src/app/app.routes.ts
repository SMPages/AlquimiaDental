import type { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AboutSectionComponent } from "../app/pages/about-section/about-section.component";
 import { ContacSectionComponent } from "../app/pages/contac-section/contac-section.component";
 import { ServicesSectionComponent } from "../app/pages/services-section/services-section.component";
 import { TestimonialsSectionComponent } from "../app/pages/testimonials-section/testimonials-section.component";

export const routes: Routes = [
  {
    path: ":lang",
    children: [
      { path: "", component: HomeComponent },
      { path: "about", component: AboutSectionComponent },
      { path: "services", component: ServicesSectionComponent },
      { path: "gallery", component: TestimonialsSectionComponent },
      { path: "blog", component: TestimonialsSectionComponent },
      { path: "contact", component: ContacSectionComponent },
      { path: "**", redirectTo: "" }
    ]
  },
  { path: "", redirectTo: "es", pathMatch: "full" },
  { path: "**", redirectTo: "es" }
];
