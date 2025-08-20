import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface Translations {
  [key: string]: string | Translations
}

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<string>("es")
  private translations: { [lang: string]: Translations } = {}

  currentLanguage$ = this.currentLanguage.asObservable()

  constructor() {
    this.loadTranslations()
    this.detectLanguage()
  }

  private async loadTranslations() {
    try {
      const [es, en] = await Promise.all([import("../assets/i18n/es.json"), import("../assets/i18n/en.json")])

      this.translations["es"] = es.default
      this.translations["en"] = en.default
    } catch (error) {
      console.error("Error loading translations:", error)
    }
  }

  private detectLanguage() {
    // Check URL path first
    const path = window.location.pathname
    if (path.startsWith("/en")) {
      this.setLanguage("en")
      return
    }
    if (path.startsWith("/es")) {
      this.setLanguage("es")
      return
    }

    // Detect by geolocation/browser language
    const browserLang = navigator.language.split("-")[0]
    const supportedLangs = ["en", "es"]

    // Countries that should default to English
    const englishCountries = ["US", "CA", "GB", "AU", "NZ"]

    // Try to get country from timezone or other methods
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isEnglishCountry = englishCountries.some(
      (country) =>
        timezone.includes(country) || timezone.includes("America/New_York") || timezone.includes("America/Los_Angeles"),
    )

    if (isEnglishCountry || browserLang === "en") {
      this.setLanguage("en")
    } else {
      this.setLanguage("es")
    }
  }

  setLanguage(lang: string) {
    if (lang !== this.currentLanguage.value) {
      this.currentLanguage.next(lang)

      // Update URL without page reload
      const currentPath = window.location.pathname
      const newPath = currentPath.replace(/^\/(en|es)/, "") || "/"
      const finalPath = `/${lang}${newPath}`

      window.history.replaceState({}, "", finalPath)

      // Update HTML lang attribute
      document.documentElement.lang = lang
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage.value
    const keys = key.split(".")
    let translation: any = this.translations[lang]

    for (const k of keys) {
      if (translation && typeof translation === "object") {
        translation = translation[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof translation === "string" ? translation : key
  }

  getCurrentLanguage(): string {
    return this.currentLanguage.value
  }
}
