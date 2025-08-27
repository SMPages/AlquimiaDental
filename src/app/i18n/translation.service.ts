import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private _lang$ = new BehaviorSubject(this.translate.currentLang || this.translate.getDefaultLang() || 'es');
  lang$ = this._lang$.asObservable();

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const maybeLang = (this.router.url.split('/')[1] || '').toLowerCase();
      const supported = this.translate.getLangs();
      const lang = supported.includes(maybeLang) ? maybeLang : (this.translate.getDefaultLang() || 'es');
      if (lang !== this.translate.currentLang) {
        this.translate.use(lang);
        this._lang$.next(lang);
      }
    });
  }

  get currentLang() { return this._lang$.value; }
  use(lang: 'es' | 'en') { this.translate.use(lang); this._lang$.next(lang); }
  t(key: string, params?: any) { return this.translate.instant(key, params); }
  stream(key: string, params?: any) { return this.translate.stream(key, params); }
}
