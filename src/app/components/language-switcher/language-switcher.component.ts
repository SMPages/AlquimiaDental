import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter, Subscription } from "rxjs";

type Lang = "es" | "en";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./language-switcher.component.html",
  styleUrls: ["./language-switcher.component.scss"],
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  // ✅ Ahora acepta string y valida internamente
  @Input() set lang(value: string | undefined) {
    if (value === "es" || value === "en") {
      this.currentLanguage = value;
    }
    // Si viene otro valor, se ignora y se mantiene el valor actual (o el de la URL)
  }

  currentLanguage: Lang = "es";
  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.syncFromUrl(); // primer valor desde la URL
    // Reaccionar a cambios de ruta para mantener el switch sincronizado
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncFromUrl());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Lee el primer segmento de la URL cuando no viene un @Input válido */
  private syncFromUrl(): void {
    const url = this.router.url || "/";
    const first = url.split("?")[0].split("#")[0].split("/").filter(Boolean)[0];
    // Cae a 'es' por defecto si no hay 'en' como primer segmento
    this.currentLanguage = (first === "en" ? "en" : "es");
  }

  /** Cambia entre ES/EN y navega reemplazando solo el primer segmento */
  toggleLanguage(): void {
    const next: Lang = this.currentLanguage === "es" ? "en" : "es";

    // Tomar segmentos actuales y reemplazar el 1er segmento por 'es' o 'en'
    const tree = this.router.parseUrl(this.router.url);
    const segments = tree.root.children["primary"]?.segments ?? [];
    const fragment = tree.fragment ?? undefined; // ✅ Normaliza null -> undefined

    if (segments.length === 0) {
      // Estás en '/', navega a '/next' preservando query/fragment
      this.router.navigate(["/", next], {
        queryParams: tree.queryParams,
        fragment,
      });
      return;
    }

    // Reemplaza el primer segmento (idioma) conservando el resto de la ruta
    const rest = segments.slice(1).map(s => s.path);
    this.router.navigate(["/", next, ...rest], {
      queryParams: tree.queryParams,
      fragment,
    });
  }
}
