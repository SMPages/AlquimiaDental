import type { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AboutSectionComponent } from "../app/pages/about-section/about-section.component";
 import { GallerySectionComponent } from "../app/pages/gallery-section/gallery-section.component";
 import { ServicesSectionComponent } from "../app/pages/services-section/services-section.component";
 import { TestimonialsSectionComponent } from "../app/pages/testimonials-section/testimonials-section.component";
  import { BlogSectionComponent } from "../app/pages/blog-section/blog-section.component";


export const routes: Routes = [
  {
    path: ":lang",
    children: [
      { path: "", component: HomeComponent },
      { path: "about", component: AboutSectionComponent },
      { path: "services", component: ServicesSectionComponent },
      { path: "gallery", component: GallerySectionComponent },
      { path: "blog", component: BlogSectionComponent },
      { path: "opinions", component: TestimonialsSectionComponent },
      { path: "**", redirectTo: "" }
    ]
  },
  { path: "", redirectTo: "es", pathMatch: "full" },
  { path: "**", redirectTo: "es" }
];
